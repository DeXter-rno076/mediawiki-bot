export class UndoFailureException extends Error {
	public constructor (page: string) {
		super(`couldnt revert edit on ${page} because of conflicting newer edit`);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UndoFailureException);
		}
	}
}