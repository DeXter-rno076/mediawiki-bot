import { logActionType, mwActionType } from '../global-types';

export default abstract class Options {
	action: mwActionType;
	logAction: logActionType;
	format = 'json';
	token?: string;
	assert?: string;

	constructor (action: mwActionType, logAction: logActionType) {
		this.action = action;
		this.logAction = logAction;
	}

	//gets called from RequestHandler
	setToken (token: string) {
		this.token = token;
	}

	setAssert (assertType: string) {
		this.assert = assertType;
	}
}