import BotAction from "./BotAction";
import { GetWikitextOptions } from "../Options/GetWikitextOptions";
import RequestHandler from "../RequestHandler";
import BotActionReturn from "../BotActionReturn";
import GetSections from "./GetSections";
import { GetSectionsOptions } from "../Options/GetSectionsOptions";
import { ErrorResponse } from "../global-types";

import { PageDoesNotExistException } from "..";
import { UnsolvableProblemException } from "..";

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

		let response = await RequestHandler.get(this.opt);
		let res;
		try {
			res = JSON.parse(response);
		} catch (e) {
			console.log(response);
		}
		
		if (res.error !== undefined) {
			res = await this.handleError(res as ErrorResponse);
		}

		const wikitext = res.parse.wikitext['*'] as string;
		return new BotActionReturn(undefined, wikitext);
	}

	async setSectionIndex () {
		const gSectionsOpts = new GetSectionsOptions(this.opt.page);
		const gSections = new GetSections(gSectionsOpts);
		const index = await gSections.getIndex(this.opt.section as string) as number;
		this.opt.section = index;
	}

	async handleError (res: ErrorResponse): Promise<string> {
		const eCode = res.error.code;
		if (eCode === 'missingtitle') {
			throw new PageDoesNotExistException(this.opt.page, 'getWikitext');
		}
		throw new UnsolvableProblemException(eCode);
	}
}