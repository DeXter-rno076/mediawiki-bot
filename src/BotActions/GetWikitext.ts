import BotAction from "./BotAction";
import GetWikitextOptions from "../Options/GetWikitextOptions";
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";
import GetSections from "./GetSections";
import GetSectionsOptions from "../Options/GetSectionsOptions";

export default class GetWikitext extends BotAction {
	opt: GetWikitextOptions;

	constructor (opt: GetWikitextOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		if (this.opt.section !== undefined && isNaN(Number(this.opt.section))) {
			await this.setSectionIndex();
		}

		const res = JSON.parse(await RequestHandler.get(this.opt));
		const wikitext = res.parse.wikitext['*'] as string;
		return new BotActionReturn(undefined, wikitext);
	}

	async setSectionIndex () {
		const gSectionsOpts = new GetSectionsOptions(this.opt.page);
		const gSections = new GetSections(gSectionsOpts);
		const index = await gSections.getIndex(this.opt.section as string) as number;
		this.opt.section = index;
	}
}