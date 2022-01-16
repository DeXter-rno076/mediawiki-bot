import BotActionReturn from '../BotActionReturn';
import { Section } from "../../global-types";

import { Bot, SectionNotFoundException } from "../..";
import { APIAction } from "../APIAction";
import { GetSectionsQuery } from "./GetSectionsQuery";

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

export class GetSections extends APIAction {
	page: string;

    constructor (bot: Bot, page: string) {
		super(bot);
        this.page = page;
    }

	async exc (): Promise<BotActionReturn> {
        const getSectionsQuery = this.createQuery();
		const res = JSON.parse(await this.bot.getRequestSender().get(getSectionsQuery));
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
		throw new SectionNotFoundException(sectionName, this.page);
	}

    createQuery (): GetSectionsQuery {
        const query: GetSectionsQuery = {
            action: 'parse',
            prop: 'sections',
            page: this.page,
            format: 'json'
        };
        return query;
    }
}