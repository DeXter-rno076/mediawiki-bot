import Logger from './Logger';
import { actionReturnType } from './global-types';
import BotAction from './BotActions/BotAction';
import LoginOptions from './Options/LoginOptions';
import Login from './BotActions/Login';
import EditOptions from './Options/EditOptions';
import Edit from './BotActions/Edit';
import MoveOptions from './Options/MoveOptions';
import Move from './BotActions/Move';
import RevertOptions from './Options/RevertOptions';
import Revert from './BotActions/Revert';
import UploadOptions from './Options/UploadOptions';
import Upload from './BotActions/Upload';
import GetCatMembersOptions from './Options/GetCatMembersOptions';
import GetCatMembers from './BotActions/GetCatMembers';
import GetTemplatesOptions from './Options/GetTemplatesOptions';
import GetTemplates from './BotActions/GetTemplates';
import GetWikitextOptions from './Options/GetWikitextOptions';
import GetWikitext from './BotActions/GetWikitext';

export default class Bot {
	static username: string;
	static password: string;
	static url: string;
	static logger: Logger;
	static taskId = -1;
	static noLogs = false;

	constructor (username: string, password: string, url: string, noLogs?: boolean) {
		Bot.username = username;
		Bot.password = password;
		Bot.url = url;
		if (noLogs !== undefined) {
			Bot.noLogs = noLogs;
		}
		if (!Bot.noLogs) {
			Bot.logger = new Logger();
		}
	}

	//todo adjust return types like in getWikitext

	login (): Promise<actionReturnType> {
		const loginOpt = new LoginOptions(Bot.username, Bot.password);
		const login = new Login(loginOpt);
		return this.action(login);
	}

	edit (opt: EditOptions): Promise<actionReturnType> {
		const edit = new Edit(opt);
		return this.action(edit);
	}

	move (opt: MoveOptions): Promise<actionReturnType> {
		const move = new Move(opt);
		return this.action(move);
	}

	revert (opt: RevertOptions): Promise<actionReturnType> {
		const revert = new Revert(opt);
		return this.action(revert);
	}

	upload (opt: UploadOptions): Promise<actionReturnType> {
		const upload = new Upload(opt);
		return this.action(upload);
	}

	getCatMembers (opt: GetCatMembersOptions): Promise<actionReturnType> {
		const getCatMembers = new GetCatMembers(opt);
		return this.action(getCatMembers);
	}

	getTemplates (opt: GetTemplatesOptions): Promise<actionReturnType> {
		const getTemplates = new GetTemplates(opt);
		return this.action(getTemplates);
	}

	getWikitext (opt: GetWikitextOptions): Promise<actionReturnType> {
		const getWikitext = new GetWikitext(opt);
		return this.action(getWikitext);
	}

	getLogger (): Logger | null {
		//for logger.saveMsg(txt) that's supposed to be called by the user if wanted
		if (Bot.noLogs) {
			return null;
		}
		return Bot.logger;
	}

	private async action (task: BotAction): Promise<actionReturnType> {
		const result = await task.exc();
		if (!Bot.noLogs && result.status !== undefined) {
			Bot.logger.save(result.status);
		}
		return result.data;
	}
}