import { Options } from './Options';

export class RevertOptions extends Options {
	user = 'self';
	start?: Date;

	constructor (user: string, start?: Date) {
		//this class is not used for the post request, so the attributes dont have to be in a particular form
		super('revert');
		if (user !== undefined) {
			this.user = user;
		}
		if (start !== undefined) {
			this.start = start;
		}
	}
}