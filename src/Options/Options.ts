import { mwActionType } from '../global-types';

export abstract class Options {
	action: mwActionType;
	format = 'json';
	token?: string;
	//must be optional because of login
	assert?: string;

	constructor (action: mwActionType) {
		this.action = action;
	}

	//gets called from RequestHandler
	setToken (token: string) {
		this.token = token;
	}

	setAssert (assertType: string) {
		this.assert = assertType;
	}
}