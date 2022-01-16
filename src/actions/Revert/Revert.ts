import { Bot } from '../../Bot';
import { BotAction } from '../BotAction';
import fs from 'fs';
import { Undo } from '../Undo/Undo';
import BotActionReturn from '../BotActionReturn';
import { GetRevisionsQuery } from '../GetRevisions/GetRevisionsQuery';

interface Revision {
	userid: number,
	user: string,
	pageid: number,
	revid: number,
	parentid: number,
	ns: number,
	title: string
}

export class Revert extends BotAction {
    user: string;
    start?: Date;
    end?: Date;

    revisionsContinueKey = '';
	revisions: Revision[] = [];

	constructor (bot: Bot, user: string, start?: Date, end?: Date) {
		super(bot);
        if (user === 'self') {
            this.user = this.bot.getUsername();
        } else {
            this.user = user;
        }
        if (start !== undefined) {
            this.start = start;
        }
        if (end !== undefined) {
            this.end = end;
        }
    }

	async exc (): Promise<BotActionReturn> {
		if (this.user === this.bot.getUsername()) {
			const botTasks = JSON.parse(fs.readFileSync(this.bot.getLogger().MAINLOG_PATH, {encoding: 'utf8'}));
			const lastBotTask = botTasks[botTasks.length - 2];
			const lastBotTaskTimestamp = lastBotTask.timestamp as string;
			const lastBotTaskStartingPoint = new Date(lastBotTaskTimestamp);
            this.start = lastBotTaskStartingPoint;
			await this.getRevisions();
		} else {
			await this.getRevisions();
		}
		await this.revert();

		return new BotActionReturn(undefined, '');
	}

	async getRevisions () {
		do {
			await this.getRevisionsPart();
		} while (this.revisionsContinueKey !== '');
	}

	async getRevisionsPart () {
        const query = this.createGetRevisionsQuery();
        if (this.revisionsContinueKey !== '') {
            query.uccontinue = this.revisionsContinueKey;
        }
		const res = JSON.parse(await this.bot.getRequestSender().get(query));
		this.revisions = this.revisions.concat(res.query.usercontribs);
		if (res.continue !== undefined) {
			this.revisionsContinueKey = res.continue.uccontinue as string;
		} else {
            this.revisionsContinueKey = '';
        }
	}

	async revert () {
		for (let rev of this.revisions) {
			const undo = new Undo(this.bot, rev.title, rev.revid);
			try {
				await this.bot.action(undo);
			} catch (e) {
				if (e instanceof Error) {
					const eMsg = 'Error in revert edit: ' + e.message;
					console.error(eMsg);
					this.bot.getLogger().saveMsg(eMsg)
				} else {
					console.error('for some reason e in try catch clause in Revert.ts wasnt an error');
				}
			}
		}
	}

    createGetRevisionsQuery (): GetRevisionsQuery {
        const query: GetRevisionsQuery = {
            action: 'query',
            list: 'usercontribs',
            uclimit: 'max',
            ucuser: this.user,
            ucprop: 'ids|title',
            format: 'json'
        };

        //it's intended that start and end are switched because mediawiki's scheme of start and end time is imo. unintuitive
        if (this.start !== undefined) {
            query.ucend = this.start.toISOString();
        }
        if (this.end !== undefined) {
            query.ucstart = this.end.toISOString();
        }

        return query;
    }
}