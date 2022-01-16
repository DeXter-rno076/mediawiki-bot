import { Options } from '../Options';
import { GetWikitextOptions } from '../GetWikitext/GetWikitextOptions';
import GetWikitext from '../GetWikitext/GetWikitext';

export class GetTemplatesOptions extends Options {
	title: string;
	prop = 'parsetree';
	text?: string;
	section?: string | number;

	constructor (title: string, section?: string | number) {
		super('expandtemplates');
		this.title = title;
		this.section = section;
	}

	async setText () {
		const gWOpt = new GetWikitextOptions(this.title, this.section);
		const gw = new GetWikitext(gWOpt);
		const res = await gw.exc();
		this.text = res.data as string;
	}
}