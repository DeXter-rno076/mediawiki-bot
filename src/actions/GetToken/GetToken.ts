import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";

import { Bot, CantGetTokenException, tokenType } from "../..";
import { GetTokenQuery } from "./GetTokenQuery";
import { mwActionType } from "../../global-types";

export class GetToken extends APIAction {
	readonly MAX_RETRYS = 5;
    tokenType: tokenType;

	constructor (bot: Bot, tokenType: tokenType) {
		super(bot);
        this.tokenType = tokenType;
    }

	async exc (): Promise<BotActionReturn> {
        const query = this.createQuery();
		const response = await this.bot.getRequestSender().get(query);
		let serverData;
		try {
			serverData = JSON.parse(response);
		} catch (e) {
			console.error('error in getting token. Trying again');
			serverData = await this.retry();
		}
		//last property can be logintoken and csrftoken depending on type
		const token = serverData.query.tokens[this.tokenType + 'token'] as string;
		const res = new BotActionReturn(undefined, token);
		return res;
	}

	async retry (): Promise<Object> {
        const getTokenQuery = this.createQuery();
		for (let i = 0; i < this.MAX_RETRYS; i++) {
			const resp = await this.bot.getRequestSender().get(getTokenQuery);
			try {
				const parsedRes = JSON.parse(resp);
				return parsedRes;
			} catch (e) {
				console.error('error in getting token. Retry ' + i);
			}
		}
		throw new CantGetTokenException();
	}

    static getTokenType (action: mwActionType): tokenType {
		if (action === 'clientlogin') {
			return 'login';
		}
		return 'csrf';
	}

    createQuery (): GetTokenQuery {
        const query: GetTokenQuery = {
            action: 'query',
            meta: 'tokens',
            type: this.tokenType,
            format: 'json'
        };

        return query;
    }
}