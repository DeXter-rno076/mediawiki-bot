import BotActionReturn from "../BotActionReturn";
import LogEntry from "../../LogEntry";
import { UndoOptions } from "./UndoOptions";
import RequestHandler from "../../RequestHandler";
import BotAction from "../BotAction";
import { ErrorResponse } from "../../global-types";

import { BadTokenException } from '../..';
import { UnsolvableProblemException } from '../..';
import { NoRevIdException } from "../..";
import { UndoFailureException } from "../..";

export default class Undo extends BotAction {
	readonly MAX_RETRYS = 5;
	opt: UndoOptions;

	constructor (opt: UndoOptions) {
		super();
		this.opt = opt;
	}
	
	async exc (): Promise<BotActionReturn> {
		let res = await RequestHandler.post(this.opt);

		const parsedResult = JSON.parse(res);
		if (parsedResult.error !== undefined) {
			res = await this.handleError(parsedResult as ErrorResponse);
		}

		const logEntry = new LogEntry('revert', res);
		return new BotActionReturn(logEntry, '');
	}

	async handleError (parsedRes: ErrorResponse): Promise<string> {
		const eCode = parsedRes.error.code;
		switch (eCode) {
			case 'badtoken':
				for (let i = 0; i < this.MAX_RETRYS; i++) {
					const res = await RequestHandler.post(this.opt);
					const parsedRes = JSON.parse(res);
					if (parsedRes.error === undefined) {
						return res;
					}
				}
				throw new BadTokenException();
			case 'nosuchrevid':
				throw new NoRevIdException(parsedRes.error.info, this.opt.title);
			case 'undofailure':
				throw new UndoFailureException(this.opt.title);
		}
		throw new UnsolvableProblemException(eCode);
	}
}