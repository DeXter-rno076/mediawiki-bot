import { mwActionType } from '../global-types';

export default abstract class Options {
	action: mwActionType;
	format = 'json';
	token?: string;
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