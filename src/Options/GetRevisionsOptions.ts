import { Options } from "./Options";

export class GetRevisionsOptions extends Options {
	list = 'usercontribs';
	uclimit = 'max';
	ucend?: string;
	ucuser: string;
	ucprop = 'ids|title';
	uccontinue?: string;

	constructor (user: string, start?: Date) {
		super('query');
		this.ucuser = user;
		if (start !== undefined) {
			this.ucend = start.toISOString();
		}
	}

	setContinue (key: string) {
		this.uccontinue = key;
	}
}