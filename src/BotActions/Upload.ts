import BotAction from "./BotAction";
import { UploadOptions } from "../Options/UploadOptions";
import BotActionReturn from "../BotActionReturn";
import RequestHandler from "../RequestHandler";
import LogEntry from "../LogEntry";

export default class Upload extends BotAction {
	cutServerResponse = true;
	opt: UploadOptions;

	constructor (opt: UploadOptions) {
		super();
		this.opt = opt;

		//this.opt.cutServerResponse get deleted shortly before sending the request, but the value is needed afterwards => needs to get saved 
		this.cutServerResponse = opt.cutServerResponse;
	}

	async exc (): Promise<BotActionReturn> {
		let res = await RequestHandler.post(this.opt);

		if (this.cutServerResponse) {
			const parsedRes = JSON.parse(res);
			delete parsedRes.upload.imageinfo;
			res = JSON.stringify(parsedRes);
		}

		const logEntry = new LogEntry('upload', res);
		return new BotActionReturn(logEntry, '');
	}
}