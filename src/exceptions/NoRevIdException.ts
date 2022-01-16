export class NoRevIdException extends Error {
	public constructor (info: string, title: string) {
		let unfoundID = 'id not found';
		const idregex = /There is no revision with ID (.*)\./;
		const regexRes = idregex.exec(info);
		if (regexRes !== null) {
			unfoundID = regexRes[1];
		}

		if (unfoundID === '') {
			super(`couldnt revert edit on ${title}. Selected revision is the only edit of the given page.`)
		} else {
			super(`couldnt find revision id "${unfoundID}" on page ${title}`);
		}

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NoRevIdException);
		}
	}
}