import Options from "./Options";
import { mwActionType, tokenType } from "../global-types";

export default class GetTokenOptions extends Options {
	meta = 'tokens';
	type: tokenType;

	constructor (type: tokenType) {
		super('query');
		this.type = type;
	}

	static getTokenType (action: mwActionType): tokenType {
		if (action === 'clientlogin') {
			return 'login';
		}
		return 'csrf';
	}
}