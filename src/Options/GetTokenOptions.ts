import Options from "./Options";
import { mwActionType, tokenType } from "../global-types";

export default class GetTokenOptions extends Options {
	meta = 'tokens';
	type: tokenType;

	constructor (type: tokenType) {
		super('query', 'getToken');
		this.type = type;
	}

	static getTokenType (action: mwActionType): tokenType {
		if (action === 'login') {
			return 'login';
		}
		return 'csrf';
	}
}