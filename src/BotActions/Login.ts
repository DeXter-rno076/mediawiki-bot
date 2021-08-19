import BotAction from "./BotAction";
import LoginOptions from "../Options/LoginOptions";
import BotActionReturn from "../BotActionReturn";
import RequestHandler from "../RequestHandler";
import LogEntry from "../LogEntry";

export default class Login extends BotAction {
	opt: LoginOptions;

	constructor (opt: LoginOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const res = await RequestHandler.post(this.opt);
		const logEntry = new LogEntry('clientlogin', res);
		return new BotActionReturn(logEntry, '');
	}
}