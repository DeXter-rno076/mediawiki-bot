import { Options } from "../Options";

export class GetRevisionsOptions extends Options {
	list = 'usercontribs';
	uclimit = 'max';
	ucend?: string;
	ucstart?: string;
	ucuser: string;
	ucprop = 'ids|title';
	uccontinue?: string;

	constructor (user: string, start?: Date, end?: Date) {
		super('query');
		this.ucuser = user;

		//it's intended that start and end are switched because mediawiki's scheme of start and end time is imo. unintuitive
		if (start !== undefined) {
			this.ucend = start.toISOString();
		}
		if (end !== undefined) {
			this.ucstart = end.toISOString();
		}
	}

	setContinue (key: string) {
		this.uccontinue = key;
	}
}