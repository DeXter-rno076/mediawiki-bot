import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";
import { GetSections } from "../GetSections/GetSections";
import { ErrorResponse } from "../../global-types";

import { Bot, PageDoesNotExistException } from "../..";
import { UnsolvableProblemException } from "../..";
import { isNum } from "../../utils";
import { GetWikitextQuery } from "./GetWikitextQuery";

export class GetWikitext extends APIAction {
    private pageTitle: string;
    private pageSection?: string | number;
    private pageSectionIndex?: number;

	public constructor (bot: Bot, pageTitle: string, pageSection?: string | number) {
		super(bot);
        this.pageTitle = pageTitle;
        this.pageSection = pageSection
    }

	public async exc (): Promise<BotActionReturn> {
		if (this.pageSection !== undefined && !isNum(this.pageSection)) {
			await this.setSectionIndex();
		}

        const query = this.createQuery();
		let response = await this.bot.getRequestSender().get(query);
		let res;
		try {
			res = JSON.parse(response);
		} catch (e) {
            //todo
			console.log(response);
		}
		
		if (res.error !== undefined) {
			res = await this.handleError(res as ErrorResponse);
		}

		const wikitext = res.parse.wikitext['*'] as string;
		return new BotActionReturn(undefined, wikitext);
	}

	private async setSectionIndex () {
		const gSections = new GetSections(this.bot, this.pageTitle);
		const index = await gSections.getIndex(this.pageSection as string) as number;
		this.pageSectionIndex = index;
	}

	private async handleError (res: ErrorResponse): Promise<string> {
		const eCode = res.error.code;
		if (eCode === 'missingtitle') {
			throw new PageDoesNotExistException(this.pageTitle, 'getWikitext');
		}
		throw new UnsolvableProblemException(eCode);
	}

    protected createQuery (): GetWikitextQuery {
        const query: GetWikitextQuery = {
            action: 'parse',
            page: this.pageTitle,
            prop: 'wikitext',
            format: 'json'
        };
        if (this.pageSection !== undefined) {
            query.section = String(this.pageSectionIndex);
        }
        return query;
    }
}