import BotAction from './BotAction';
import BotActionReturn from '../BotActionReturn';
import RequestHandler from '../RequestHandler';
import LogEntry from '../LogEntry';
import EditOptions from '../Options/EditOptions';
import GetSectionsOptions from '../Options/GetSectionsOptions';
import GetSections from '../BotActions/GetSections';

export default class Edit extends BotAction {
	opt: EditOptions;

	constructor (opt: EditOptions) {
		super();
		this.opt = opt;
	}

	async exc (): Promise<BotActionReturn> {
		if (this.opt.section !== undefined && isNaN(Number(this.opt.section))) {
			await this.setSectionIndex();
		}

		const res = await RequestHandler.post(this.opt);

		//todo error handling

		const logEntry = new LogEntry('edit', res);
		return new BotActionReturn(logEntry, '');
	}

	async setSectionIndex () {
		const getSectionsOpt = new GetSectionsOptions(this.opt.title);
		const getSections = new GetSections(getSectionsOpt);
		const sectionIndex = await getSections.getIndex(this.opt.section as string);
		this.opt.section = sectionIndex;
	}
}