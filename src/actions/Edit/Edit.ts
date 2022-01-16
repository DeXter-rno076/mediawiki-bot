import BotActionReturn from '../BotActionReturn';
import LogEntry from '../../LogEntry';
import { GetSections } from '../GetSections/GetSections';
import { ErrorResponse } from '../../global-types';

import { BadTokenException, Bot } from '../..';
import { PageDoesNotExistException } from '../..';
import { UnsolvableProblemException } from '../..';
import { ProtectedPageException } from '../..';
import { APIAction } from '../APIAction';
import { isNum } from '../../utils';
import { EditQuery } from './EditQuery';

export class Edit extends APIAction {
	private readonly MAX_RETRYS = 5;

    private pageTitle: string;
    private newPageText: string;
    private editSummary: string;
    private pageSection?: string | number;
    private sectionIndex?: number;
    private nocreate = true;

	public constructor (
        bot: Bot,
        title: string,
        text: string,
        summary: string,
        section?: string | number,
        nocreate?: boolean
    ) {
		super(bot);
		this.pageTitle = title;
        this.newPageText = text;
        this.editSummary = summary;
        if (section !== undefined) {
            this.pageSection = section;
        }
        if (nocreate !== undefined) {
            this.nocreate = nocreate;
        }
	}

	public async exc (): Promise<BotActionReturn> {
        await this.setSectionIndex();
        const editQuery = this.createQuery();
		let res = await this.bot.getRequestSender().post(editQuery);

		const parsedResult = JSON.parse(res);
		if (parsedResult.error !== undefined) {
			res = await this.handleError(parsedResult as ErrorResponse);
		}

		const logEntry = new LogEntry('edit', res);
		return new BotActionReturn(logEntry, '');
	}

    private async setSectionIndex () {
        if (this.pageSection === undefined) {
            return;
        }
        if (isNum(this.pageSection)) {
            this.sectionIndex = this.pageSection as number;
            return;
        }
        this.sectionIndex = await this.getSectionIndex();
    }

	private async getSectionIndex (): Promise<number> {
		const getSections = new GetSections(this.bot, this.pageTitle);
		const sectionIndex = await getSections.getIndex(this.pageSection as string) as number;
		return sectionIndex;
	}

	private async handleError (parsedRes: ErrorResponse): Promise<string> {
		const eCode = parsedRes.error.code;
		switch (eCode) {
			case 'badtoken':
                const editQuery = this.createQuery();
				for (let i = 0; i < this.MAX_RETRYS; i++) {
					const res = await this.bot.getRequestSender().post(editQuery);
					const parsedRes = JSON.parse(res);
					if (parsedRes.error === undefined) {
						return res;
					}
				}
				throw new BadTokenException();
			case 'missingtitle':
				throw new PageDoesNotExistException(this.pageTitle, 'edit');
			case 'protectedpage':
				throw new ProtectedPageException(this.pageTitle);
		}
		throw new UnsolvableProblemException(eCode);
	}

    protected createQuery (): EditQuery {
        const query: EditQuery = {
            action: 'edit',
            title: this.pageTitle,
            text: this.newPageText,
            summary: this.editSummary,
            nocreate: this.nocreate,
            bot: true,
            format: 'json'
        }
        if (this.sectionIndex !== undefined) {
            query.section = String(this.sectionIndex);
        }
        return query;
    }
}