import BotActionReturn from "../BotActionReturn";
import LogEntry from "../LogEntry";
import { UndoOptions } from "../Options/UndoOptions";
import RequestHandler from "../RequestHandler";
import BotAction from "./BotAction";

export default class Undo extends BotAction {
	opt: UndoOptions;

	constructor (opt: UndoOptions) {
		super();
		this.opt = opt;
	}
	
	async exc (): Promise<BotActionReturn> {
		const res = await RequestHandler.post(this.opt);
		const logEntry = new LogEntry('revert', res);
		return new BotActionReturn(logEntry, '');
	}
}