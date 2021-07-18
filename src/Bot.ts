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

export class Bot {
	username: string;
	password: string;
	url: string;
	logger: Logger;

	constructor (username: string, password: string, url: string) {
		this.username = username;
		this.password = password;
		this.url = url;
		
		this.logger = new Logger();
	}

	login (): Promise<actionReturnType> {
		const loginOpt = new LoginOptions(this.username, this.password);
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

	getLogger (): Logger {
		//for logger.saveMsg(txt) that's supposed to be called by the user if wanted
		return this.logger;
	}

	private async action (task: BotAction): Promise<actionReturnType> {
		const result = await task.exc();
		if (result.status !== undefined) {
			this.logger.save(result.status);
		}
		return result.data;
	}
}