import Options from './Options';

export default class RevertOptions extends Options {
	user = 'self';
	start?: Date;

	constructor (start?: Date) {
		//this class is not used for the post request, so the attributes dont have to be in a particular form
		super('revert', 'revert');
		if (start !== undefined) {
			this.start = start;
		}
	}
}