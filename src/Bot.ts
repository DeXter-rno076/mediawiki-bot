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

	login (): Promise<''> {
		const loginOpt = new LoginOptions(Bot.username, Bot.password);
		const login = new Login(loginOpt);
		return this.action(login) as Promise<''>;
	}

	edit (title: string, text: string, summary: string, nocreate?: boolean, section?: string | number): Promise<''> {
		const eOpts = new EditOptions(title, text, summary, section);
		if (nocreate !== undefined) {
			eOpts.setNoCreate(nocreate);
		}
		const edit = new Edit(eOpts);
		return this.action(edit) as Promise<''>;
	}

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

	revert (user: string, start?: Date): Promise<''> {
		const revOpts = new RevertOptions(user, start);
		const revert = new Revert(revOpts);
		return this.action(revert) as Promise<''>;
	}

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

	getTemplates (title: string, section?: string | number): Promise<Template[]> {
		const getTemplatesOpts = new GetTemplatesOptions(title, section);
		const getTemplates = new GetTemplates(getTemplatesOpts);
		return this.action(getTemplates) as Promise<Template[]>;
	}

	getWikitext (page: string, section?: string | number): Promise<string> {
		const getWikitextOpts = new GetWikitextOptions(page, section);
		const getWikitext = new GetWikitext(getWikitextOpts);
		return this.action(getWikitext) as Promise<string>;
	}

	getSections (page: string): Promise<Section[]> {
		const getSectionsOpts = new GetSectionsOptions(page);
		const getSections = new GetSections(getSectionsOpts);
		return this.action(getSections) as Promise<Section[]>;
	}

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