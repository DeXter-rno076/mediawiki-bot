import fs from 'fs';
import { Logger } from './Logger';
import { actionReturnType, CatMember, namespace, Section, catMemberType } from './global-types';
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

export class Bot {
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

	/**
	 * @returns Promise<''>
	 */
	login (): Promise<''> {
		const loginOpt = new LoginOptions(Bot.username, Bot.password);
		const login = new Login(loginOpt);
		return this.action(login) as Promise<''>;
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
	edit (title: string, text: string, summary: string, nocreate?: boolean, section?: string | number): Promise<''> {
		const eOpts = new EditOptions(title, text, summary, section);
		if (nocreate !== undefined) {
			eOpts.setNoCreate(nocreate);
		}
		const edit = new Edit(eOpts);
		return this.action(edit) as Promise<''>;
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
	): Promise<''> {
		const moveOpts = new MoveOptions(from, to, summary);
		if (!moveTalk || !moveSubpgabes || !noredirect) {
			moveOpts.setAdvancedSettings(moveTalk, moveSubpgabes, noredirect);
		}
		const move = new Move(moveOpts);
		return this.action(move) as Promise<''>;
	}

	/**
	 * @param user (string) whose edits to revert (if set to 'self', the starting time is selected via bot logs)
	 * @param start (Date, not needed if user is set to 'self')
	 * 
	 * @returns Promise<''>
	 */
	revert (user: string, start?: Date): Promise<''> {
		const revOpts = new RevertOptions(user, start);
		const revert = new Revert(revOpts);
		return this.action(revert) as Promise<''>;
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
		ignoreWarnings?: boolean
	): Promise<''> {
		const uploadOpts = new UploadOptions(uploadType, wantedName, comment);
		uploadOpts.setFileUrl(url);
		if (ignoreWarnings !== undefined) {
			uploadOpts.setIgnoreWarnings(ignoreWarnings);
		}
		const upload = new Upload(uploadOpts);
		return this.action(upload) as Promise<''>;
	}

	/**
	 * @param category (string) category name ('Category:' at the beginning is needed)
	 * @param ns (namespace[]; optional) array of namespaces that shall exclusevely be in the result
	 * @param type (catMemberType; optional) which kind of pages shall be in the result (default: 'page')
	 * 
	 * @returns Promise<CatMember[]>
	 */
	getCatMembers (
		category: string,
		ns?: namespace[],
		type?: catMemberType
	): Promise<CatMember[]> {
		const getCatMembersOpts = new GetCatMembersOptions(category, ns);
		if (type !== undefined)  {
			getCatMembersOpts.setType(type);
		}
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
		const mainlogFile = Bot.logger.mainlogFileName;
		const mainlog = JSON.parse(fs.readFileSync(mainlogFile, {encoding: 'utf8'}));
		if (mainlog.length === 0) {
			return;
		}

		for (let i = 0; i < mainlog.length; i++) {
			const taskId = mainlog[i].id;
			const taskFilePath = Bot.logger.DIR_PATH + '/' + taskId + '.txt';
			const logFile = fs.readFileSync(taskFilePath, {encoding: 'utf8'});

			if (logFile.split('\n').length <= 2) {
				//if only one or none lines were written to the log file it gets deleted
				fs.unlinkSync(taskFilePath);
				mainlog.splice(i, 1);
				i--;
			}
		}
		fs.writeFileSync(Bot.logger.DIR_PATH + '/mainlog.json', JSON.stringify(mainlog));
	}

	private async action (task: BotAction): Promise<actionReturnType> {
		const result = await task.exc();
		if (!Bot.noLogs && result.status !== undefined) {
			Bot.logger.save(result.status);
		}
		return result.data;
	}
}