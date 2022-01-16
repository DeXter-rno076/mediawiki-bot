import { XMLParser, NormalTag, Tag, TagContent } from '../../XMLParser';
import BotActionReturn from "../BotActionReturn";
import { APIAction } from "../APIAction";
import { Bot } from "../..";
import { GetWikitext } from "../GetWikitext/GetWikitext";

import { Template } from './Template';
import { Parameter } from './Parameter';
import { GetTemplatesQuery } from './GetTemplatesQuery';

export class GetTemplates extends APIAction {
    pageTitle: string;
    pageSection?: string | number;
    pageContent?: string;

    constructor (bot: Bot, title: string, section?: string | number) {
		super(bot);

        this.pageTitle = title;
        this.pageSection = section;
	}

	async exc (): Promise<BotActionReturn> {
		await this.setText();
        const query = this.createQuery();
		const res = JSON.parse(await this.bot.getRequestSender().post(query));
		const xmlData = res.expandtemplates.parsetree;
		const xmlParser = new XMLParser(xmlData);
		const jsonCode =  xmlParser.parse();
		const templates = this.parseTags(jsonCode);
		return new BotActionReturn(undefined, templates);
	}

    async setText () {
		const gw = new GetWikitext(this.bot, this.pageTitle, this.pageSection);
		const res = await gw.exc();
		this.pageContent = res.data as string;
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

    createQuery (): GetTemplatesQuery {
        const query: GetTemplatesQuery = {
            action: 'expandtemplates',
            prop: 'parsetree',
            title: this.pageTitle,
            text: this.pageContent || '',
            format: 'json'
        };
        if (this.pageContent === undefined) {
            //todo log error
        }
        return query;
    }
}