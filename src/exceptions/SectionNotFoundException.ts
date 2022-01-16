export class SectionNotFoundException extends Error {
	public constructor (section: string, page: string) {
		super(`couldnt find section ${section} in page ${page}`);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SectionNotFoundException);
		}
	}
}