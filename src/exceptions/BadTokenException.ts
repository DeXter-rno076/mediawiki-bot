export class BadTokenException extends Error {
	constructor () {
		super('cant get a valid token (5 retrys failed)');
	
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BadTokenException);
		}
	}
}