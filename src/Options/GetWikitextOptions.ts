import Options from './Options';
import { pageIdentifier } from '../global-types';

export default class GetWikitextOptions extends Options {
	page: pageIdentifier;
	prop = 'wikitext';
	section?: string | number;

	constructor (page: pageIdentifier, section?: string | number) {
		super('parse', 'getWikitext');
		this.page = page;
		if (section !== undefined) {
			this.section = section;
		}
	}
}