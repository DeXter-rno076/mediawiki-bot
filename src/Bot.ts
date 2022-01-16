import fs from 'fs';
import { Logger } from './Logger';
import { actionReturnType, Page, Section, tokenType, pageType, pageListFilter } from './global-types';
import { BotAction } from './actions/BotAction';
import { Login } from './actions/Login/Login';
import { Edit } from './actions/Edit/Edit';
import { Move } from './actions/Move/Move';
import { Revert } from './actions/Revert/Revert';
import { Upload } from './actions/Upload/Upload';
import { GetCatMembers } from './actions/GetCatMembers/GetCatMembers';
import { GetTemplates } from './actions/GetTemplates/GetTemplates';
import { GetWikitext } from './actions/GetWikitext/GetWikitext';
import { GetSections } from './actions/GetSections/GetSections';
import { GetToken } from './actions/GetToken/GetToken';
import { RequestSender } from './RequestSender';
import { UnsolvableProblemException } from './exceptions/UnsolvableProblemException';
import { LOG_DIR, LOG_URL_LIST_PATH } from './constants';
import { GetPagesOptions } from './actions/GetPages/GetPagesOptions';
import { Template } from '.';

export class Bot {
	username: string;
	password: string;
	url: string;
	taskId = -1;
	noLogs = false;
	reLogin = true;

    logger: Logger;
    requestSender: RequestSender;

	constructor (username: string, password: string, url: string, noLogs?: boolean, reLogin = true) {
		this.username = username;
		this.password = password;
		this.url = url;
		if (noLogs !== undefined) {
			this.noLogs = noLogs;
		}
		this.logger = new Logger(this);
		if (!this.noLogs) {
			this.logger.initDirStructure();
		}
		this.reLogin = reLogin;

        this.requestSender = new RequestSender(this);
	}

    getUrl (): string {
        return this.url;
    }

    getUsername (): string {
        return this.username;
    }

    getTaskId (): number {
        return this.taskId;
    }

    getNoLogs (): boolean {
        return this.noLogs;
    }

    getReLogin (): boolean {
        return this.reLogin;
    }

    /**
	 * @returns Logger
	 */
	getLogger (): Logger {
		//for logger.saveMsg(txt) that's supposed to be called by the user if wanted
		return this.logger
	}

    getRequestSender (): RequestSender {
        return this.requestSender;
    }

	/**
	 * @returns Promise<''>
	 */
	login (): Promise<string> {
		const login = new Login(this, this.password);
		return this.action(login) as Promise<string>;
	}

	/**
	 * @param title (string | CatMember) page that you want to edit
	 * @param text (string) new text of the page
	 * @param summary (string) edit summary
	 * @param nocreate (boolean; optional) if set to false, it's possible to create pages
	 * @param section (string | number; optional) only edit content of this section
	 * 
	 * @returns Promise<''>
	 * 
	 * @throws BadTokenError, PageDoesNotExistError, ProtectedPageError, SectionNotFoundError, UnsolvableErrorError
	 */
	edit (title: string | Page, text: string, summary: string, section?: string | number, nocreate?: boolean): Promise<string> {
		const edit = new Edit(this, String(title), text, summary, section, nocreate);
		return this.action(edit) as Promise<string>;
	}

	/**
	 * @param from (string | CatMember) old name
	 * @param to (string | CatMember) new name
	 * @param summary (string) move summary
	 * @param moveTalk (boolean; optional) if set to false, the talk page won't be moved
	 * @param moveSubpages (boolean; optoinal) if set to false, potential subpages won't be moved
	 * @param noredirect (boolean; optional) if set to false, a redirect from old name to new name will be created
	 * 
	 * @returns Promise<''>
	*/
	move (
		from: string | Page,
		to: string | Page,
		summary: string,
		moveTalk = true,
		moveSubpgabes = true,
		noredirect = true
	): Promise<string> {
		const move = new Move(this, String(from), String(to), summary, moveTalk, moveSubpgabes, noredirect);
		return this.action(move) as Promise<string>;
	}

	/**
	 * @param user (string) whose edits to revert (if set to 'self', the starting time is selected via bot logs)
	 * @param start (Date, not needed if user is set to 'self') older timestamp (start of the time span, included)
	 * @param end (Date; optional) newer timestamp (end of the time span, not included)
	 * 
	 * @returns Promise<''>
	 */
	revert (user: string, start?: Date, end?: Date): Promise<string> {
		const revert = new Revert(this, user, start, end);
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
		fileLocator: string,
		ignoreWarnings?: boolean,
		cutServerResponse?: boolean
	): Promise<string> {
		const upload = new Upload(this, uploadType, wantedName, comment, fileLocator, ignoreWarnings, cutServerResponse);
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
        types?: pageType | pageListFilter
	): Promise<Page[]> {
		const getCatMembers = new GetCatMembers(this, category, types);
		return this.action(getCatMembers) as Promise<Page[]>;
	}

    /* getNamespaceMembers ( ns: namespace ): Promise<Page[]> {
		const getNamespaceMembersOpts = new GetNamespaceMembersOptions( ns );
		const getNamespaceMembers = new GetNamespaceMembers( getNamespaceMembersOpts );
		return this.action( getNamespaceMembers ) as Promise<Page[]>;
	} */

    // /**
    //  */
    // public getPages (
    //     groupIdentifier: 'all' | namespace | categoryName | (namespace | categoryName)[],
    //     types?: pageType | namespace | (pageType | namespace)[]
    // ) {
    //     const getPagesOptions = new GetPagesOptions(groupIdentifier, types);
    //     const getPages = new GetPages(getPagesOptions);
    //     return this.action(getPages) as Promise<Page[]>;
    // }

	/**
	 * @param title (string | CatMember) page name
	 * @param section (string | number; optional) section whose templates shall be returned
	 * 
	 * @returns Promise<Template[]>
	 * 
	 * @throws SectionNotFoundError
	 */
	getTemplates (title: string | Page, section?: string | number): Promise<Template[]> {
		const getTemplates = new GetTemplates(this, String(title), section);
		return this.action(getTemplates) as Promise<Template[]>;
	}

	/**
	 * @param page (string | CatMember) page name
	 * @param section (string | number; optional) section whose contents to return
	 * 
	 * @returns Promise<string>
	 * 
	 * @throws PageDoesNotExistError, SectionNotFoundError, UnsolvableErrorError
	 */
	getWikitext (page: string | Page, section?: string | number): Promise<string> {
		const getWikitext = new GetWikitext(this, String(page), section);
		return this.action(getWikitext) as Promise<string>;
	}

	/**
	 * @param page (string | CatMember) page name
	 * 
	 * @returns Promise<Section[]>
	 * 
	 * @throws SectionNotFoundError
	 */
	getSections (page: string | Page): Promise<Section[]> {
		const getSections = new GetSections(this, String(page));
		return this.action(getSections) as Promise<Section[]>;
	}

	/**
	 * @param type (string) token type (most common types: csrf, login)
	 * @returns Promise<string>
	 * @throws CantGetTokenError
	 */
	getToken (type: tokenType): Promise<string> {
		const getToken = new GetToken(this, type);
		return this.action(getToken) as Promise<string>;
	}

	/**
	 * 
	 * @param opts (Object) options object used for the custom request
	 * @returns Promise<string>
	 */
	get (opts: any): Promise<string> {
		return this.requestSender.rawGet(opts);
	}

	/**
	 * 
	 * @param opts (Object) options object used for the custom request
	 * @returns Promise<string>
	 */
	post (opts: any): Promise<string> {
		return this.requestSender.rawPost(opts);
	}

	//removes log files that only have the login logged
	cleanUpLogfiles () {
		const urlListPath = LOG_URL_LIST_PATH;
		const urlList = JSON.parse(fs.readFileSync(urlListPath, {encoding: 'utf-8'}));
		for (let url in urlList) {
			this.cleanUpLogDir(urlList[url]);
		}
	}

	cleanUpLogDir (dir: string) {
		const mainlogFilePath = `${LOG_DIR}/${dir}/mainlog.json`;
		const mainlog = JSON.parse(fs.readFileSync(mainlogFilePath, {encoding: 'utf8'}));
		if (mainlog.length === 0) {
			return;
		}

		for (let i = 0; i < mainlog.length; i++) {
			const taskId = mainlog[i].id;
			const taskFilePath = `${LOG_DIR}/${dir}/${taskId}.txt`;
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

	async action (task: BotAction): Promise<actionReturnType> {
		let result;
		try {
			result = await task.exc();
		} catch (e) {
			if (!this.reLogin) {
				throw e;
			}

			if (e instanceof UnsolvableProblemException && e.getEType() === 'assertbotfailed') {
				console.log('bot got logged out, logging in and trying again');
				await this.login();
				result = await task.exc();
			} else {
				throw e;
			}
		}

		this.logger.save(result.status);
		if (result.data !== '') {
			return result.data;
		} else {
			return result.status?.msg;
		}
	}
}