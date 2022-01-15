import { logActionType } from "../global-types";

export class PageDoesNotExistException extends Error {
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
			Error.captureStackTrace(this, PageDoesNotExistException);
		}
	}
}