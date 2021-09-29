import { Bot } from '../Bot';
import { RevertOptions } from "../Options/RevertOptions";
import BotAction from "./BotAction";
import fs from 'fs';
import RequestHandler from '../RequestHandler';
import { GetRevisionsOptions } from "../Options/GetRevisionsOptions";
import { UndoOptions } from '../Options/UndoOptions';
import Undo from './Undo';
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
	revisions: Revision[] = [];

	constructor (opt: RevertOptions) {
		super();
		this.opt = opt;
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
			const res = await undo.exc();
			if (res.status !== undefined) {
				Bot.logger.save(res.status);
			}
		}
	}
}