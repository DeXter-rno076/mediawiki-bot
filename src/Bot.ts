import Logger from './Logger';
import { actionReturnType, CatMember, Section } from './global-types';
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
import GetTemplates, { Template } from './BotActions/GetTemplates';
import GetWikitextOptions from './Options/GetWikitextOptions';
import GetWikitext from './BotActions/GetWikitext';
import GetSectionsOptions from './Options/GetSectionsOptions';
import GetSections from './BotActions/GetSections';

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

	login (): Promise<''> {
		const loginOpt = new LoginOptions(Bot.username, Bot.password);
		const login = new Login(loginOpt);
		return this.action(login) as Promise<''>;
	}

	edit (opt: EditOptions): Promise<''> {
		const edit = new Edit(opt);
		return this.action(edit) as Promise<''>;
	}

	move (opt: MoveOptions): Promise<''> {
		const move = new Move(opt);
		return this.action(move) as Promise<''>;
	}

	revert (opt: RevertOptions): Promise<''> {
		const revert = new Revert(opt);
		return this.action(revert) as Promise<''>;
	}

	upload (opt: UploadOptions): Promise<''> {
		const upload = new Upload(opt);
		return this.action(upload) as Promise<''>;
	}

	getCatMembers (opt: GetCatMembersOptions): Promise<CatMember[]> {
		const getCatMembers = new GetCatMembers(opt);
		return this.action(getCatMembers) as Promise<CatMember[]>;
	}

	getTemplates (opt: GetTemplatesOptions): Promise<Template[]> {
		const getTemplates = new GetTemplates(opt);
		return this.action(getTemplates) as Promise<Template[]>;
	}

	getWikitext (opt: GetWikitextOptions): Promise<string> {
		const getWikitext = new GetWikitext(opt);
		return this.action(getWikitext) as Promise<string>;
	}

	getSections (opt: GetSectionsOptions): Promise<Section[]> {
		const getSections = new GetSections(opt);
		return this.action(getSections) as Promise<Section[]>;
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