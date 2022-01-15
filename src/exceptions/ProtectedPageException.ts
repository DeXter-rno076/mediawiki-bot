export class ProtectedPageException extends Error {
	constructor (page: string) {
		super(`cant edit page ${page} because it is protected.`);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ProtectedPageException);
		}
	}
}