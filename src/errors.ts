//Mozilla doc says captureStackTrace stuff is needed

import { logActionType } from "./global-types";

//NAME IS CORRECT (it's an error that the current error cant be handled)
export class UnsolvableErrorError extends Error {
	constructor(eCode: string) {
		super('uncommon problem or a problem the Bot cant solve occured: ' + eCode);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnsolvableErrorError);
		}
	}
}

export class BadTokenError extends Error {
	constructor () {
		super('cant get a valid token (5 retrys failed)');
	
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BadTokenError);
		}
	}
}

export class PageDoesNotExistError extends Error {
	constructor (page: string, actionType: logActionType) {
		let eMessage = '';
		switch (actionType) {
			case 'edit':
				eMessage = `page ${page} does not exist. Maybe you forgot to set nocreate to false?`
				break;
			default:
				eMessage = `page ${page} does not exist.`
		}
		super(eMessage);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, PageDoesNotExistError);
		}
	}
}

export class CantGetTokenError extends Error {
	constructor () {
		super('cant get token (tried multiple times). This can be caused by internal errors of the wiki. Maybe you sent a bit too much requests at once? (if so, chill a bit down)');
		
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CantGetTokenError);
		}
	}
}

export class ProtectedPageError extends Error {
	constructor (page: string) {
		super(`cant edit page ${page} because it is protected.`);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ProtectedPageError);
		}
	}
}