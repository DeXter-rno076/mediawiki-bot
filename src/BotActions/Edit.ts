import BotAction from './BotAction';
import BotActionReturn from '../BotActionReturn';
import RequestHandler from '../RequestHandler';
import LogEntry from '../LogEntry';
import EditOptions from '../Options/EditOptions';
import GetSectionsOptions from '../Options/GetSectionsOptions';
import GetSections from '../BotActions/GetSections';
import { ErrorResponse } from '../global-types';
import { BadTokenError, PageDoesNotExistError, UnsolvableErrorError, ProtectedPageError } from '../errors';

export default class Edit extends BotAction {
	opt: EditOptions;
	readonly MAX_RETRYS = 5;

	constructor (opt: EditOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		if (this.opt.section !== undefined && isNaN(Number(this.opt.section))) {
			await this.setSectionIndex();
		}

		let res = await RequestHandler.post(this.opt);

		const parsedResult = JSON.parse(res);
		if (parsedResult.error !== undefined) {
			res = await this.handleError(parsedResult as ErrorResponse);
		}

		const logEntry = new LogEntry('edit', res);
		return new BotActionReturn(logEntry, '');
	}

	async setSectionIndex () {
		const getSectionsOpt = new GetSectionsOptions(this.opt.title);
		const getSections = new GetSections(getSectionsOpt);
		const sectionIndex = await getSections.getIndex(this.opt.section as string) as number;
		this.opt.section = sectionIndex;
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
				throw new BadTokenError();
			case 'missingtitle':
				throw new PageDoesNotExistError(this.opt.title, 'edit');
			case 'protectedpage':
				throw new ProtectedPageError(this.opt.title);
		}
		throw new UnsolvableErrorError(eCode);
	}
}