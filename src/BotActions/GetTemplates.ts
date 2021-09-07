import BotAction from "./BotAction";
import { GetTemplatesOptions } from "../Options/GetTemplatesOptions";
import { XMLParser, NormalTag, Tag, TagContent } from '../XMLParser';
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";

export class Template {
	_title: string;
	index: number;
	params: Parameter[] = [];

	constructor (title: string, index: number) {
		this._title = title;
		this.index = index;
	}

	get title (): string {
		return this._title.trim();
	}

	//supposed to be called by the user
	//every parameter name should be unique (no need to optionally return arrays)
	//for indexed params just use their number (keep in mind: PARAM INDICES START AT 1)
	getParam (name: string): Parameter | null {
		const param = this.params.find((item) => {
			return item.title === name;
		});
		if (param === undefined) {
			return null;
		}
		return param;
	}

	addParam (param: Parameter) {
		this.params.push(param);
	}

	toWikitext (removeWhitespace: boolean) {
        let templateCode = '{{' + this._title;
		if (removeWhitespace) {
			templateCode = templateCode.trim();
		}

        for (let param of this.params) {
            templateCode += '|';
            if (param.indexed) {
				if (removeWhitespace) {
					templateCode += String(param).trim();
				} else {
					templateCode += String(param);
				}
            } else {
                if (removeWhitespace) {
                    templateCode += param.title.trim() + '=' + param.toWikitext(true).trim();
                } else {
                    templateCode += param.title + '=' + String(param);
                }
            }
        }

        templateCode += '}}';
        return templateCode;
    }

	toString (): string {
		return this.toWikitext(false);
	}
}

export class Parameter {
	title: string;
	indexed: boolean;
	text: string = '';
	templates: Template[] = [];

	constructor (title: string, indexed: boolean) {
		this.title = title;
		this.indexed = indexed;
	}

	addTemplate (templ: Template) {
		this.templates.push(templ);
	}

	setText (text: string) {
		this.text = text;
	}

	toWikitext (removeWhitespace: boolean): string {
		let wikitext = this.text;
		if (removeWhitespace) {
			wikitext = wikitext.trim();
		}

        for (let template of this.templates) {
            let templateCode = template.toWikitext(removeWhitespace);
            wikitext = wikitext.replace('##TEMPLATE:' + template.index + '##', templateCode);
        }

        return wikitext;
	}

	toString (): string {
		return this.toWikitext(false);
	}
}

export default class GetTemplates extends BotAction {
	opt: GetTemplatesOptions;
	
	constructor (opt: GetTemplatesOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		await this.opt.setText();
		const res = JSON.parse(await RequestHandler.get(this.opt));
		const xmlData = res.expandtemplates.parsetree;
		const xmlParser = new XMLParser(xmlData);
		const jsonCode =  xmlParser.parse();
		const templates = this.parseTags(jsonCode);
		return new BotActionReturn(undefined, templates);
	}

	parseTags (root: NormalTag): Template[] {
		const templList: Template[] = []
		const tags = root.content.tags;
		for (let tag of tags) {
			if (tag.title === 'template') {
				const templ = this.parseTemplate(tag as NormalTag);
				if (templ !== undefined) {
					templList.push(templ);
				}
			}
		}
		return templList;
	}

	parseTemplate (template: NormalTag): Template | undefined {
		const templateContent = template.content;
		const nameObj = templateContent.tags.find((item) => {
			return item.title === 'title';
		}) as NormalTag;
		if (nameObj === undefined) {
			console.error('couldnt find name of template: ' + template);
			return;
		}
		const name = nameObj.content.text;
		const templObj = new Template(name, template.index);
		for (let tag of template.content.tags) {
			if (tag.title === 'part') {
				const param = this.parseParameter(tag as NormalTag);
				templObj.addParam(param);
			}
		}
		return templObj;
	}

	parseParameter (param: NormalTag): Parameter {
		const tags = param.content.tags;
		const nameObj = tags.find((item) => {
			return item.title === 'name';
		});
		const valueObj = tags.find((item) => {
			return item.title === 'value';
		});
		if (nameObj === undefined || valueObj === undefined) {
			console.error('couldnt find name and value of parameter');
			return new Parameter('ERROR', false);
		}

		let name = this.getParamName(nameObj);;

		const paramObj = new Parameter(name, nameObj.singleTag);

		if (valueObj.singleTag) {
			paramObj.setText('');
		} else {
			const value = (valueObj as NormalTag).content;
			this.addParamContentTemplates(paramObj, value);
		}
		return paramObj;
	}

	getParamName (nameObj: Tag): string {
		if (!nameObj.singleTag) {
			return (nameObj as NormalTag).content.text;
		}
		const index = nameObj.attributes.get('index');
		if (index === undefined) {
			console.error('couldn find index of single tag: ' + JSON.stringify(nameObj));
			return 'ERROR';
		}
		return index;
	}

	addParamContentTemplates (param: Parameter, value: TagContent) {
		let text = value.text;
		const tags = value.tags;

		for (let tag of tags) {
			const index = tag.index;
			if (tag.title === 'template') {
				text = text.replace(`##TAG:${index}##`, `##TEMPLATE:${index}##`);
				const template = this.parseTemplate(tag as NormalTag);
				if (template !== undefined) {
					param.addTemplate(template);
				}
			} else {
				text.replace(`##TAG:${index}##`, '');
			}
		}
		param.setText(text);
	}
}