import fs from 'fs';
import { Logger } from './Logger';
import { actionReturnType, CatMember, namespace, Section, catMemberType, tokenType } from './global-types';
import BotAction from './BotActions/BotAction';
import { LoginOptions } from './Options/LoginOptions';
import Login from './BotActions/Login';
import { EditOptions } from './Options/EditOptions';
import Edit from './BotActions/Edit';
import { MoveOptions } from './Options/MoveOptions';
import Move from './BotActions/Move';
import { RevertOptions } from './Options/RevertOptions';
import Revert from './BotActions/Revert';
import { UploadOptions } from './Options/UploadOptions';
import Upload from './BotActions/Upload';
import { GetCatMembersOptions } from './Options/GetCatMembersOptions';
import GetCatMembers from './BotActions/GetCatMembers';
import { GetTemplatesOptions } from './Options/GetTemplatesOptions';
import GetTemplates, { Template } from './BotActions/GetTemplates';
import { GetWikitextOptions } from './Options/GetWikitextOptions';
import GetWikitext from './BotActions/GetWikitext';
import { GetSectionsOptions } from './Options/GetSectionsOptions';
import GetSections from './BotActions/GetSections';
import { GetTokenOptions } from './Options/GetTokenOptions';
import GetToken from './BotActions/GetToken';
import RequestHandler from './RequestHandler';
import { UnsolvableErrorError } from '.';

export class Bot {
	static username: string;
	static password: string;
	static url: string;
	static logger: Logger;
	static taskId = -1;
	static noLogs = false;
	static reLogin = true;

	constructor (username: string, password: string, url: string, noLogs?: boolean, reLogin = true) {
		Bot.username = username;
		Bot.password = password;
		Bot.url = url;
		if (noLogs !== undefined) {
			Bot.noLogs = noLogs;
		}
		Bot.logger = new Logger();
		if (!Bot.noLogs) {
			Bot.logger.initDirStructure();
		}
		Bot.reLogin = reLogin;
	}

	/**
	 * @returns Promise<''>
	 */
	login (): Promise<string> {
		const loginOpt = new LoginOptions(Bot.username, Bot.password);
		const login = new Login(loginOpt);
		return this.action(login) as Promise<string>;
	}

	/**
	 * @param title (string) page that you want to edit
	 * @param text (string) new text of the page
	 * @param summary (string) edit summary
	 * @param nocreate (boolean; optional) if set to false, it's possible to create pages
	 * @param section (string | number; optional) only edit content of this section
	 * 
	 * @returns Promise<''>
	 * 
	 * @throws BadTokenError, PageDoesNotExistError, ProtectedPageError, SectionNotFoundError, UnsolvableErrorError
	 */
	edit (title: string, text: string, summary: string, nocreate?: boolean, section?: string | number): Promise<string> {
		const eOpts = new EditOptions(title, text, summary, section);
		if (nocreate !== undefined) {
			eOpts.setNoCreate(nocreate);
		}
		const edit = new Edit(eOpts);
		return this.action(edit) as Promise<string>;
	}

	/**
	 * @param from (string) old name
	 * @param to (string) new name
	 * @param summary (string) move summary
	 * @param moveTalk (boolean; optional) if set to false, the talk page won't be moved
	 * @param moveSubpages (boolean; optoinal) if set to false, potential subpages won't be moved
	 * @param noredirect (boolean; optional) if set to false, a redirect from old name to new name will be created
	 * 
	 * @returns Promise<''>
	*/
	move (
		from: string,
		to: string,
		summary: string,
		moveTalk = true,
		moveSubpgabes = true,
		noredirect = true
	): Promise<string> {
		const moveOpts = new MoveOptions(from, to, summary);
		if (!moveTalk || !moveSubpgabes || !noredirect) {
			moveOpts.setAdvancedSettings(moveTalk, moveSubpgabes, noredirect);
		}
		const move = new Move(moveOpts);
		return this.action(move) as Promise<string>;
	}

	/**
	 * @param user (string) whose edits to revert (if set to 'self', the starting time is selected via bot logs)
	 * @param start (Date, not needed if user is set to 'self')
	 * 
	 * @returns Promise<''>
	 */
	revert (user: string, start?: Date): Promise<string> {
		const revOpts = new RevertOptions(user, start);
		const revert = new Revert(revOpts);
		return this.action(revert) as Promise<string>;
	}

	/**
	 * @param uploadType ('local' | 'remote') currently only 'remote' is possible
	 * @param wantedName (string) name of the file ('File:' at the beginning is NOT needed)
	 * @param comment (string) upload comment and initial file page content
	 * @param url (string) url of file origin
	 * @param ignoreWarnings (boolean; optional) if set to true, potential warnings by the wiki will be ignored
	 * 
	 * @returns Promise<''>
	 */
	upload (
		uploadType: 'local' | 'remote',
		wantedName: string,
		comment: string,
		url: string,
		ignoreWarnings?: boolean,
		cutServerResponse?: boolean
	): Promise<string> {
		const uploadOpts = new UploadOptions(uploadType, wantedName, comment);
		uploadOpts.setFileUrl(url);
		if (ignoreWarnings !== undefined) {
			uploadOpts.setIgnoreWarnings(ignoreWarnings);
		}
		if (cutServerResponse !== undefined) {
			uploadOpts.setCutServerResponse(cutServerResponse);
		}
		const upload = new Upload(uploadOpts);
		return this.action(upload) as Promise<string>;
	}

	/**
	 * @param category (string) category name ('Category:' at the beginning is needed)
	 * @param type (catMemberType; optional) which kind of pages shall be in the result (default: 'page')
	 * @param ns (namespace[]; optional) array of namespaces that shall exclusevely be in the result
	 * 
	 * @returns Promise<CatMember[]>
	 */
	getCatMembers (
		category: string,
		type?: catMemberType,
		ns?: namespace[]
	): Promise<CatMember[]> {
		if (type !== undefined && typeof type !== 'string') {
			throw 'argument "type" must be a string. Places of params "type" and ns got switched, maybe thats the problem.';
		}

		const getCatMembersOpts = new GetCatMembersOptions(category, type, ns);
		const getCatMembers = new GetCatMembers(getCatMembersOpts);
		return this.action(getCatMembers) as Promise<CatMember[]>;
	}

	/**
	 * @param title (string) page name
	 * @param section (string | number; optional) section whose templates shall be returned
	 * 
	 * @returns Promise<Template[]>
	 * 
	 * @throws SectionNotFoundError
	 */
	getTemplates (title: string, section?: string | number): Promise<Template[]> {
		const getTemplatesOpts = new GetTemplatesOptions(title, section);
		const getTemplates = new GetTemplates(getTemplatesOpts);
		return this.action(getTemplates) as Promise<Template[]>;
	}

	/**
	 * @param page (string) page name
	 * @param section (string | number; optional) section whose contents to return
	 * 
	 * @returns Promise<string>
	 * 
	 * @throws PageDoesNotExistError, SectionNotFoundError, UnsolvableErrorError
	 */
	getWikitext (page: string, section?: string | number): Promise<string> {
		const getWikitextOpts = new GetWikitextOptions(page, section);
		const getWikitext = new GetWikitext(getWikitextOpts);
		return this.action(getWikitext) as Promise<string>;
	}

	/**
	 * @param page (string) page name
	 * 
	 * @returns Promise<Section[]>
	 * 
	 * @throws SectionNotFoundError
	 */
	getSections (page: string): Promise<Section[]> {
		const getSectionsOpts = new GetSectionsOptions(page);
		const getSections = new GetSections(getSectionsOpts);
		return this.action(getSections) as Promise<Section[]>;
	}

	/**
	 * @param type (string) token type (most common types: csrf, login)
	 * @returns Promise<string>
	 * @throws CantGetTokenError
	 */
	getToken (type: tokenType): Promise<string> {
		const getTokenOpts = new GetTokenOptions(type);
		const getToken = new GetToken(getTokenOpts);
		return this.action(getToken) as Promise<string>;
	}

	/**
	 * 
	 * @param opts (Object) options object used for the custom request
	 * @returns Promise<string>
	 */
	get (opts: any): Promise<string> {
		return RequestHandler.rawGet(opts);
	}

	/**
	 * 
	 * @param opts (Object) options object used for the custom request
	 * @returns Promise<string>
	 */
	post (opts: any): Promise<string> {
		return RequestHandler.rawPost(opts);
	}

	/**
	 * @returns Logger
	 */
	getLogger (): Logger | null {
		//for logger.saveMsg(txt) that's supposed to be called by the user if wanted
		if (Bot.noLogs) {
			return null;
		}
		return Bot.logger;
	}

	//removes log files that only have the login logged
	cleanUpLogfiles () {
		const urlListPath = Bot.logger.URL_LIST_PATH;
		const urlList = JSON.parse(fs.readFileSync(urlListPath, {encoding: 'utf-8'}));
		for (let url in urlList) {
			this.cleanUpLogDir(urlList[url]);
		}
	}

	cleanUpLogDir (dir: string) {
		const mainlogFilePath = `${Bot.logger.DIR_PATH}/${dir}/mainlog.json`;
		const mainlog = JSON.parse(fs.readFileSync(mainlogFilePath, {encoding: 'utf8'}));
		if (mainlog.length === 0) {
			return;
		}

		for (let i = 0; i < mainlog.length; i++) {
			const taskId = mainlog[i].id;
			const taskFilePath = `${Bot.logger.DIR_PATH}/${dir}/${taskId}.txt`;
			const logFile = fs.readFileSync(taskFilePath, {encoding: 'utf8'});

			if (logFile.split('\n').length <= 2) {
				//if only one or none lines were written to the log file it gets deleted
				fs.unlinkSync(taskFilePath);
				mainlog.splice(i, 1);
				i--;
			}
		}
		fs.writeFileSync(mainlogFilePath, JSON.stringify(mainlog));
	}

	private async action (task: BotAction): Promise<actionReturnType> {
		let result;
		try {
			result = await task.exc();
		} catch (e) {
			if (!Bot.reLogin) {
				throw e;
			}

			if (e instanceof UnsolvableErrorError && e.eType === 'assertbotfailed') {
				console.log('bot got logged out, logging in and trying again');
				await this.login();
				result = await task.exc();
			} else {
				throw e;
			}
		}

		Bot.logger.save(result.status);
		if (result.data !== '') {
			return result.data;
		} else {
			if (result.status === undefined) {
				console.error('error in getting status msg of ' + JSON.stringify(result));
				return;
			}
			return result.status.msg;
		}
	}
}