import { Bot } from '../../Bot';
import { RevertOptions } from "./RevertOptions";
import BotAction from "../BotAction";
import fs from 'fs';
import RequestHandler from '../../RequestHandler';
import { GetRevisionsOptions } from "../GetRevisions/GetRevisionsOptions";
import { UndoOptions } from '../Undo/UndoOptions';
import Undo from '../Undo/Undo';
import BotActionReturn from '../BotActionReturn';

interface Revision {
	userid: number,
	user: string,
	pageid: number,
	revid: number,
	parentid: number,
	ns: number,
	title: string
}

export default class Revert extends BotAction {
	opt: RevertOptions;
	bot: Bot;
	revisions: Revision[] = [];

	constructor (opt: RevertOptions, bot: Bot) {
		super();
		this.opt = opt;
		this.bot = bot;
	}

	async exc (): Promise<BotActionReturn> {
		if (this.opt.user === 'self') {
			const botTasks = JSON.parse(fs.readFileSync(Bot.logger.MAINLOG_PATH, {encoding: 'utf8'}));
			const lastBotTask = botTasks[botTasks.length - 2];
			const timestamp = lastBotTask.timestamp as string;
			const timestampDate = new Date(timestamp);
			const revOpts = new GetRevisionsOptions(Bot.username, timestampDate);
			await this.getRevisions(revOpts);
		} else {
			const opts = this.opt;
			const revOpts = new GetRevisionsOptions(opts.user, opts.start, opts.end);
			await this.getRevisions(revOpts);
		}
		await this.revert();

		return new BotActionReturn(undefined, '');
	}

	async getRevisions (revOpts: GetRevisionsOptions) {
		let continueKey = '';
		do {
			continueKey = await this.getRevisionsPart(revOpts);
			revOpts.setContinue(continueKey);
		} while (continueKey !== '');
	}

	async getRevisionsPart (revOpts: GetRevisionsOptions): Promise<string> {
		const res = JSON.parse(await RequestHandler.get(revOpts));
		this.revisions = this.revisions.concat(res.query.usercontribs);
		if (res.continue !== undefined) {
			return res.continue.uccontinue as string;
		}
		return '';
	}

	async revert () {
		for (let rev of this.revisions) {
			const undoOptions = new UndoOptions(rev.title, rev.revid);
			const undo = new Undo(undoOptions);
			try {
				await this.bot.action(undo);
			} catch (e) {
				if (e instanceof Error) {
					const eMsg = 'Error in revert edit: ' + e.message;
					console.error(eMsg);
					Bot.logger.saveMsg(eMsg)
				} else {
					console.error('for some reason e in try catch clause in Revert.ts wasnt an error');
				}
			}
		}
	}
}