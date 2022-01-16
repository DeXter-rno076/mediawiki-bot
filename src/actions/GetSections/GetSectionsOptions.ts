import { Options } from '../Options';

export class GetSectionsOptions extends Options {
	prop = 'sections';
	page: string;
	
	constructor (page: string) {
		super('parse');
		this.page = page;
	}
}