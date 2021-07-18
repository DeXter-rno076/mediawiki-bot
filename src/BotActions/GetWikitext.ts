import BotAction from "./BotAction";
import GetWikitextOptions from "../Options/GetWikitextOptions";
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";

export default class GetWikitext extends BotAction {
	opt: GetWikitextOptions;

	constructor (opt: GetWikitextOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const res = JSON.parse(await RequestHandler.get(this.opt));
		const wikitext = res.parse.wikitext['*'] as string;
		return new BotActionReturn(undefined, wikitext);
	}
}