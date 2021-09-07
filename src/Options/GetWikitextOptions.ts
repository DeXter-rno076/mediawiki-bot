import { Options } from './Options';

export class GetWikitextOptions extends Options {
	page: string;
	prop = 'wikitext';
	section?: string | number;

	constructor (page: string, section?: string | number) {
		super('parse');
		this.page = page;
		if (section !== undefined) {
			this.section = section;
		}
	}
}