import BotAction from "./BotAction";
import { GetCatMembersOptions } from "../Options/GetCatMembersOptions";
import BotActionReturn from "../BotActionReturn";
import RequestHandler from "../RequestHandler";
import { CatMember } from "../global-types";

export default class GetCatMembers extends BotAction {
	opt: GetCatMembersOptions;
	catMembers: CatMember[] = [];

	constructor (opt: GetCatMembersOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		let continueKey = '';
		do {
			continueKey = await this.getCatMembersPart(continueKey);
		} while (continueKey !== '');

		return new BotActionReturn(undefined, this.catMembers);
	}

	async getCatMembersPart (continueKey: string): Promise<string> {
		this.opt.setContinue(continueKey);

		const res = JSON.parse(await RequestHandler.get(this.opt));
		if (res.error !== undefined && res.error.code === 'invalidcategory') {
			throw `invalid category name given: ${this.opt.cmtitle}. Maybe you forgot the namespace prefix?`
		}

		this.addCatMembers(res.query.categorymembers);

		if (res.continue !== undefined) {
			return res.continue.cmcontinue;
		}
		return '';
	}

	addCatMembers (catMembersPart) {
		for (let obj of catMembersPart) {
			const catMember = new CatMember(obj.ns, obj.title);
			this.catMembers.push(catMember);
		}
	}
}