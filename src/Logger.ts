import { Bot } from './Bot';
import * as fs from 'fs';
import LogEntry from './LogEntry';

interface MainlogEntry {
	id: number;
	timestamp: string;
}

export class Logger {
	readonly DIR_PATH = './logs';
	readonly mainlogFileName = `${this.DIR_PATH}/mainlog.json`;
	//depends on Bot.taskId => cant be readonly
	logFileName = '';

	constructor () {}

	initDirStructure () {
		let logData: MainlogEntry[] = [];
		try {
			//accesSync throws an error if it cant reach the targeted path
			fs.accessSync(this.DIR_PATH, fs.constants.F_OK);

			logData = JSON.parse(fs.readFileSync(
				this.mainlogFileName, {encoding: 'utf8'}
			)) as MainlogEntry[];
			const lastTaskId = logData[logData.length - 1].id as number;
			Bot.taskId = lastTaskId + 1;
		} catch (e) {
			fs.mkdirSync(this.DIR_PATH);
			fs.writeFileSync(this.mainlogFileName, '[]');
			Bot.taskId = 0;
			logData = [];
		} finally {
			this.logFileName = `${this.DIR_PATH}/${Bot.taskId}.txt`;
			fs.writeFileSync(this.logFileName, '');
			this.addNewMainLogEntry(logData);
		}

		if (Bot.taskId === -1) {
			throw 'something went wrong in logger initialization. Task id still has starting value';
		}
	}

	addNewMainLogEntry (logData: MainlogEntry[]) {
		const time = new Date();
		const taskLog: MainlogEntry = {
			id: Bot.taskId,
			timestamp: time.toISOString()
		}
		logData.push(taskLog);
		fs.writeFileSync(this.mainlogFileName, JSON.stringify(logData));
	}

	//is called from one central place in class Bot
	save (msg?: LogEntry) {
		if (msg === undefined) {
			return;
		}

		const txt = msg.print();
		console.log(txt);
		if (!Bot.noLogs) {
			fs.appendFileSync(this.logFileName, txt + '\n');
		}
	}

	//supposed to be called by the user
	saveMsg (msg: string) {
		if (Bot.noLogs) {
			console.error('cant save custom messages when noLogs is set to true');
			return;
		}
		fs.appendFileSync(this.logFileName, msg + '\n');
	}
}