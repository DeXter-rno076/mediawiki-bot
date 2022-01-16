import { Bot } from './Bot';
import * as fs from 'fs';
import LogEntry from './LogEntry';
import { LOG_DIR, LOG_URL_LIST_PATH } from './constants';

interface MainlogEntry {
	id: number;
	timestamp: string;
}

export class Logger {
    bot: Bot;

	URL_INDEX = -1;
	URL_DIR_PATH = '';
	MAINLOG_PATH = '';
	LOG_FILE_PATH = '';

	constructor (bot: Bot) {
        this.bot = bot;
    }

	initDirStructure () {
		try {
			//accesSync throws an error if it cant reach the targeted path
			fs.accessSync(LOG_DIR, fs.constants.F_OK);
			this.setUrlDirPaths();

			try {
				fs.accessSync(this.URL_DIR_PATH, fs.constants.F_OK);

				//url directory already exists
				this.getTaskId();
			} catch (e) {
				this.createUrlDirectory();
			}
		} catch (e) {
			this.createEntireDirStructure();
		} finally {
			this.createLogFile();
		}

		if (this.bot.taskId === -1) {
            //todo
			throw 'something went wrong in logger initialization. Task id still has starting value';
		}
	}

	//=====================================================

	createEntireDirStructure () {
		this.createLogDirectory();
		this.setUrlDirPaths();
		this.createUrlDirectory();
	}

	setUrlDirPaths () {
		this.URL_INDEX = this.getUrlIndex();
		this.URL_DIR_PATH = LOG_DIR + '/' + this.URL_INDEX;
		this.MAINLOG_PATH = this.URL_DIR_PATH + '/mainlog.json';
	}

	getTaskId () {
		const mainLogData = JSON.parse(fs.readFileSync(
			this.MAINLOG_PATH, {encoding: 'utf8'}
		)) as MainlogEntry[];

		const lastTaskId = mainLogData[mainLogData.length - 1].id as number;

		this.bot.taskId = lastTaskId + 1;
	}

	//=====================================================

	createLogDirectory () {
		fs.mkdirSync(LOG_DIR);
		fs.writeFileSync(LOG_URL_LIST_PATH, '{}');
	}

	createUrlDirectory () {
		fs.mkdirSync(this.URL_DIR_PATH);

		const urlList = JSON.parse(fs.readFileSync(LOG_URL_LIST_PATH, {encoding: 'utf-8'}));
		urlList[this.bot.url] = this.URL_INDEX;
		fs.writeFileSync(LOG_URL_LIST_PATH, JSON.stringify(urlList));

		fs.writeFileSync(this.MAINLOG_PATH, '[]');

		this.bot.taskId = 0;
	}

	//=====================================================

	createLogFile () {
		this.LOG_FILE_PATH = `${this.URL_DIR_PATH}/${this.bot.taskId}.txt`;
		fs.writeFileSync(this.LOG_FILE_PATH, '');

		this.addNewMainLogEntry();
	}

	addNewMainLogEntry () {
		const mainLogData = JSON.parse(fs.readFileSync(this.MAINLOG_PATH, {encoding: 'utf-8'})) as MainlogEntry[];

		const time = new Date();
		const taskLog: MainlogEntry = {
			id: this.bot.taskId,
			timestamp: time.toISOString()
		}

		mainLogData.push(taskLog);
		fs.writeFileSync(this.MAINLOG_PATH, JSON.stringify(mainLogData));
	}

	//=====================================================

	getUrlIndex (): number {
		const urlList = JSON.parse(fs.readFileSync(LOG_URL_LIST_PATH, {encoding: 'utf-8'}));
		const urlIndex = urlList[this.bot.url] as number | undefined;

		if (urlIndex === undefined) {
			const keys = Object.keys(urlList);
			if (keys.length === 0) {
				//urlList is empty
				return 0;
			}
			const lastKey = keys[keys.length - 1];
			return urlList[lastKey] + 1;
		}
		return urlIndex;
	}

	//is called from one central place in class Bot
	save (msg?: LogEntry) {
		if (msg === undefined) {
			return;
		}

		const txt = msg.print();
		console.log(txt);
		if (!this.bot.noLogs) {
			fs.appendFileSync(this.LOG_FILE_PATH, txt + '\n');
		}
	}

	//supposed to be called by the user
	saveMsg (msg: string) {
		if (this.bot.noLogs) {
			console.error('cant save custom messages when noLogs is set to true');
			return;
		}
		fs.appendFileSync(this.LOG_FILE_PATH, msg + '\n');
	}
}