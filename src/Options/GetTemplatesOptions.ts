import Options from './Options';
import GetWikitextOptions from './GetWikitextOptions';
import GetWikitext from '../BotActions/GetWikitext';

export default class GetTemplatesOptions extends Options {
	title: string;
	prop = 'parsetree';
	text?: string;
	section?: string | number;

	constructor (title: string, section?: string | number) {
		super('expandtemplates', 'getTemplates');
		this.title = title;
		this.section = section;
	}

	async setText () {
		const gWOpt = new GetWikitextOptions(this.title, this.section);
		const gw = new GetWikitext(gWOpt);
		const res = gw.exc();
		this.text = res.data;
	}
}