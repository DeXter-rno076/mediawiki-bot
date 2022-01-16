import BotActionReturn from "../BotActionReturn";
import LogEntry from "../../LogEntry";
import { ErrorResponse } from "../../global-types";

import { BadTokenException, Bot } from '../..';
import { UnsolvableProblemException } from '../..';
import { NoRevIdException } from "../..";
import { UndoFailureException } from "../..";
import { APIAction } from "../APIAction";
import { UndoQuery } from "./UndoQuery";

export class Undo extends APIAction {
    private title: string;
    private revid: number;

    readonly MAX_RETRYS = 5;

	public constructor (bot: Bot, title: string, revid: number) {
		super(bot);
        this.title = title;
        this.revid = revid;
	}

	public async exc (): Promise<BotActionReturn> {
        const query = this.createQuery();
		let res = await this.bot.getRequestSender().post(query);

		const parsedResult = JSON.parse(res);
		if (parsedResult.error !== undefined) {
			res = await this.handleError(parsedResult as ErrorResponse);
		}

		const logEntry = new LogEntry('revert', res);
		return new BotActionReturn(logEntry, '');
	}

	private async handleError (parsedRes: ErrorResponse): Promise<string> {
		const eCode = parsedRes.error.code;
		switch (eCode) {
			case 'badtoken':
				for (let i = 0; i < this.MAX_RETRYS; i++) {
                    const query = this.createQuery();
					const res = await this.bot.getRequestSender().post(query);
					const parsedRes = JSON.parse(res);
					if (parsedRes.error === undefined) {
						return res;
					}
				}
				throw new BadTokenException();
			case 'nosuchrevid':
				throw new NoRevIdException(parsedRes.error.info, this.title);
			case 'undofailure':
				throw new UndoFailureException(this.title);
		}
		throw new UnsolvableProblemException(eCode);
	}

    protected createQuery (): UndoQuery {
        const query: UndoQuery = {
            action: 'edit',
            title: this.title,
            undo: this.revid,
            bot: true,
            format: 'json',
        };
        return query;
    }
}