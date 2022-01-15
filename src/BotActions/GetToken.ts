import BotAction from "./BotAction";
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";
import { GetTokenOptions } from '../Options/GetTokenOptions';

import { CantGetTokenException } from "..";

export default class GetToken extends BotAction {
	readonly MAX_RETRYS = 5;

	opt: GetTokenOptions;
	constructor (opt: GetTokenOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const response = await RequestHandler.get(this.opt);
		let serverData;
		try {
			serverData = JSON.parse(response);
		} catch (e) {
			console.error('error in getting token. Trying again');
			serverData = await this.retry();
		}
		//last property can be logintoken and csrftoken depending on type
		const token = serverData.query.tokens[this.opt.type + 'token'] as string;
		const res = new BotActionReturn(undefined, token);
		return res;
	}

	async retry (): Promise<Object> {
		for (let i = 0; i < this.MAX_RETRYS; i++) {
			const resp = await RequestHandler.get(this.opt);
			try {
				const parsedRes = JSON.parse(resp);
				return parsedRes;
			} catch (e) {
				console.error('error in getting token. Retry ' + i);
			}
		}
		throw new CantGetTokenException();
	}
}