export class UnsolvableProblemException extends Error {
	private eType: string;

	public constructor(eCode: string) {
		super('uncommon problem or a problem the Bot cant solve occured: ' + eCode);

		this.eType = eCode;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnsolvableProblemException);
		}
	}

    public getEType (): string {
        return this.eType;
    }
}