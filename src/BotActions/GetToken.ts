import BotAction from "./BotAction";
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";
import GetTokenOptions from '../Options/GetTokenOptions';

export default class GetToken extends BotAction {
	opt: GetTokenOptions;
	constructor (opt: GetTokenOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const serverData = JSON.parse(await RequestHandler.get(this.opt));
		//last property can be logintoken and csrftoken depending on type
		const token = serverData.query.tokens[this.opt.type + 'token'] as string;
		const res = new BotActionReturn(undefined, token);
		return res;
	}
}
