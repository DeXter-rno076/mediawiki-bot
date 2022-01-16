import { GetSectionsOptions } from "./GetSectionsOptions";
import BotAction from "../BotAction";
import RequestHandler from "../../RequestHandler";
import BotActionReturn from '../BotActionReturn';
import { Section } from "../../global-types";

import { SectionNotFoundException } from "../..";

/**
 * results have the form of
 * {
 *    "toclevel": <toc level in MediaWiki (1 is == ... ==)>,
        "level": <toc level in amount of = >,
        "line": <section title>,
        "number": <index including inner sections (e. g. 1.2.3 is possible)>,
        "index": <index counting all sections>,
        "fromtitle": <page title>,
        "byteoffset": <probably irelevant>,
        "anchor": <link>
    }
 */

export default class GetSections extends BotAction {
	opt: GetSectionsOptions;
	constructor (opt: GetSectionsOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		const res = JSON.parse(await RequestHandler.get(this.opt));
		const sections = res.parse.sections as Section[];
		return new BotActionReturn(undefined, sections);
	}

	async getIndex (sectionName: string): Promise<number> {
		const data = await this.exc();
		const sections = data.data as Section[];

		for (let section of sections) {
			if (section.line.trim() === sectionName.trim()) {
				return Number(section.index);
			}
		}
		throw new SectionNotFoundException(sectionName, this.opt.page);
	}
}