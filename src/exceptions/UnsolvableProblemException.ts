export class UnsolvableProblemException extends Error {
	eType: string;

	constructor(eCode: string) {
		super('uncommon problem or a problem the Bot cant solve occured: ' + eCode);

		this.eType = eCode;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnsolvableProblemException);
		}
	}
}