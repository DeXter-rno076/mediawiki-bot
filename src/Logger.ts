import { Bot } from './Bot';
import * as fs from 'fs';
import LogEntry from './LogEntry';
import { LOG_DIR, LOG_URL_LIST_PATH } from './constants';

interface MainlogEntry {
	id: number;
	timestamp: string;
}

export class Logger {
    private bot: Bot;

	private URL_INDEX = -1;
	private URL_DIR_PATH = '';
	private MAINLOG_PATH = '';
	private LOG_FILE_PATH = '';

	public constructor (bot: Bot) {
        this.bot = bot;
    }

    public getMainlogPath (): string {
        return this.MAINLOG_PATH;
    }

	public initDirStructure () {
		try {
			//accesSync throws an error if it cant reach the targeted path
			fs.accessSync(LOG_DIR, fs.constants.F_OK);
			this.setUrlDirPaths();

			try {
				fs.accessSync(this.URL_DIR_PATH, fs.constants.F_OK);

				//url directory already exists
				this.retrieveTaskId();
			} catch (e) {
				this.createUrlDirectory();
			}
		} catch (e) {
			this.createEntireDirStructure();
		} finally {
			this.createLogFile();
		}

		if (this.bot.getTaskId() === -1) {
            //todo
			throw 'something went wrong in logger initialization. Task id still has starting value';
		}
	}

	//=====================================================

	private createEntireDirStructure () {
		this.createLogDirectory();
		this.setUrlDirPaths();
		this.createUrlDirectory();
	}

	private setUrlDirPaths () {
		this.URL_INDEX = this.getUrlIndex();
		this.URL_DIR_PATH = LOG_DIR + '/' + this.URL_INDEX;
		this.MAINLOG_PATH = this.URL_DIR_PATH + '/mainlog.json';
	}

	private retrieveTaskId () {
		const mainLogData = JSON.parse(fs.readFileSync(
			this.MAINLOG_PATH, {encoding: 'utf8'}
		)) as MainlogEntry[];

		const lastTaskId = mainLogData[mainLogData.length - 1].id as number;

		this.bot.setTaskId(lastTaskId + 1);
	}

	//=====================================================

	private createLogDirectory () {
		fs.mkdirSync(LOG_DIR);
		fs.writeFileSync(LOG_URL_LIST_PATH, '{}');
	}

	private createUrlDirectory () {
		fs.mkdirSync(this.URL_DIR_PATH);

		const urlList = JSON.parse(fs.readFileSync(LOG_URL_LIST_PATH, {encoding: 'utf-8'}));
		urlList[this.bot.getUrl()] = this.URL_INDEX;
		fs.writeFileSync(LOG_URL_LIST_PATH, JSON.stringify(urlList));

		fs.writeFileSync(this.MAINLOG_PATH, '[]');

		this.bot.setTaskId(0);
	}

	//=====================================================

	private createLogFile () {
		this.LOG_FILE_PATH = `${this.URL_DIR_PATH}/${this.bot.getTaskId()}.txt`;
		fs.writeFileSync(this.LOG_FILE_PATH, '');

		this.addNewMainLogEntry();
	}

	private addNewMainLogEntry () {
		const mainLogData = JSON.parse(fs.readFileSync(this.MAINLOG_PATH, {encoding: 'utf-8'})) as MainlogEntry[];

		const time = new Date();
		const taskLog: MainlogEntry = {
			id: this.bot.getTaskId(),
			timestamp: time.toISOString()
		}

		mainLogData.push(taskLog);
		fs.writeFileSync(this.MAINLOG_PATH, JSON.stringify(mainLogData));
	}

	//=====================================================

	private getUrlIndex (): number {
		const urlList = JSON.parse(fs.readFileSync(LOG_URL_LIST_PATH, {encoding: 'utf-8'}));
		const urlIndex = urlList[this.bot.getUrl()] as number | undefined;

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
	public save (msg?: LogEntry) {
		if (msg === undefined) {
			return;
		}

		const txt = msg.print();
		console.log(txt);
		if (!this.bot.getNoLogs()) {
			fs.appendFileSync(this.LOG_FILE_PATH, txt + '\n');
		}
	}

	//supposed to be called by the user
	public saveMsg (msg: string) {
		if (this.bot.getNoLogs()) {
			console.error('cant save custom messages when noLogs is set to true');
			return;
		}
		fs.appendFileSync(this.LOG_FILE_PATH, msg + '\n');
	}
}