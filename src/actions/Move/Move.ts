import BotAction from "../BotAction";
import { MoveOptions } from "./MoveOptions";
import BotActionReturn from "../BotActionReturn";
import RequestHandler from "../../RequestHandler";
import LogEntry from "../../LogEntry";

export default class Move extends BotAction {
	opt: MoveOptions;

	constructor (opt: MoveOptions) {
		super();

		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const res = await RequestHandler.post(this.opt);
		const logEntry = new LogEntry('move', res);
		return new BotActionReturn(logEntry, '');
	}
}