export class CantGetTokenException extends Error {
	constructor () {
		super('cant get token (tried multiple times). This can be caused by internal errors of the wiki. Maybe you sent a bit too much requests at once? (if so, chill a bit down)');
		
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CantGetTokenException);
		}
	}
}