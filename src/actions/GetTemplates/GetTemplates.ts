import { XMLParser, NormalTag, Tag, TagContent } from '../../XMLParser';
import BotActionReturn from "../BotActionReturn";
import { APIAction } from "../APIAction";
import { Bot } from "../..";
import { GetWikitext } from "../GetWikitext/GetWikitext";

import { Template } from './Template';
import { Parameter } from './Parameter';
import { GetTemplatesQuery } from './GetTemplatesQuery';

export class GetTemplates extends APIAction {
    private pageTitle: string;
    private pageSection?: string | number;
    private pageContent?: string;

    public constructor (bot: Bot, title: string, section?: string | number) {
		super(bot);

        this.pageTitle = title;
        this.pageSection = section;
	}

	public async exc (): Promise<BotActionReturn> {
		await this.setText();
        const query = this.createQuery();
		const res = JSON.parse(await this.bot.getRequestSender().post(query));
		const xmlData = res.expandtemplates.parsetree;
		const xmlParser = new XMLParser(xmlData);
		const jsonCode =  xmlParser.parse();
		const templates = this.parseTags(jsonCode);
		return new BotActionReturn(undefined, templates);
	}

    public async setText () {
		const gw = new GetWikitext(this.bot, this.pageTitle, this.pageSection);
		const res = await gw.exc();
		this.pageContent = res.getData() as string;
    }

	public parseTags (root: NormalTag): Template[] {
		const templList: Template[] = []
		const tags = root.getContent().tags;
		for (let tag of tags) {
			if (tag.getTitle() === 'template') {
				const templ = this.parseTemplate(tag as NormalTag);
				if (templ !== undefined) {
					templList.push(templ);
				}
			}
		}
		return templList;
	}

	public parseTemplate (template: NormalTag): Template | undefined {
		const templateContent = template.getContent();
		const nameObj = templateContent.tags.find((item) => {
			return item.getTitle() === 'title';
		}) as NormalTag;
		if (nameObj === undefined) {
			console.error('couldnt find name of template: ' + template);
			return;
		}
		const name = nameObj.getContent().text;
		const templObj = new Template(name, template.getIndex());
		for (let tag of template.getContent().tags) {
			if (tag.getTitle() === 'part') {
				const param = this.parseParameter(tag as NormalTag);
				templObj.addParam(param);
			}
		}
		return templObj;
	}

	public parseParameter (param: NormalTag): Parameter {
		const tags = param.getContent().tags;
		const nameObj = tags.find((item) => {
			return item.getTitle() === 'name';
		});
		const valueObj = tags.find((item) => {
			return item.getTitle() === 'value';
		});
		if (nameObj === undefined || valueObj === undefined) {
			console.error('couldnt find name and value of parameter');
			return new Parameter('ERROR', false);
		}

		let name = this.getParamName(nameObj);;

		const paramObj = new Parameter(name, nameObj.getSingleTag());

		if (valueObj.getSingleTag()) {
			paramObj.setText('');
		} else {
			const value = (valueObj as NormalTag).getContent();
			this.addParamContentTemplates(paramObj, value);
		}
		return paramObj;
	}

	public getParamName (nameObj: Tag): string {
		if (!nameObj.getSingleTag()) {
			return (nameObj as NormalTag).getContent().text;
		}
		const index = nameObj.getAttributes().get('index');
		if (index === undefined) {
			console.error('couldn find index of single tag: ' + JSON.stringify(nameObj));
			return 'ERROR';
		}
		return index;
	}

	public addParamContentTemplates (param: Parameter, value: TagContent) {
		let text = value.text;
		const tags = value.tags;

		for (let tag of tags) {
			const index = tag.getIndex();
			if (tag.getTitle() === 'template') {
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

    protected createQuery (): GetTemplatesQuery {
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