import Options from './Options';

export default class GetWikitextOptions extends Options {
	page: string;
	prop = 'wikitext';
	section?: string | number;

	constructor (page: string, section?: string | number) {
		super('parse', 'getWikitext');
		this.page = page;
		if (section !== undefined) {
			this.section = section;
		}
	}
}