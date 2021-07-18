import BotAction from "./BotAction";
import UploadOptions from "../Options/UploadOptions";
import BotActionReturn from "../BotActionReturn";
import RequestHandler from "../RequestHandler";
import LogEntry from "../LogEntry";

export default class Upload extends BotAction {
	opt: UploadOptions;
	constructor (opt: UploadOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const res = await RequestHandler.post(this.opt);
		const logEntry = new LogEntry('upload', res);
		return new BotActionReturn(logEntry, '');
	}
}