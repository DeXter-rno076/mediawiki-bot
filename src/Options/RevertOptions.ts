import { Options } from './Options';

export class RevertOptions extends Options {
	user = 'self';
	start?: Date;
	end?: Date;

	constructor (user: string, start?: Date, end?: Date) {
		//this class is not used for the post request, so the attributes dont have to be in a particular form
		super('revert');
		if (user !== undefined) {
			this.user = user;
		}
		if (start !== undefined) {
			this.start = start;
		}
		if (end !== undefined) {
			this.end = end;
		}
	}
}