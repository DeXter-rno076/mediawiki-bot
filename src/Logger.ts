import Bot from './Bot';
import * as fs from 'fs';
import LogEntry from './LogEntry';

interface MainlogEntry {
	id: number;
	timestamp: string;
}

export default class Logger {
	readonly DIR_PATH = './logs';
	logFileName = `${this.DIR_PATH}/${Bot.taskId}.txt`;
	mainlogFileName = `${this.DIR_PATH}/mainlog.json`;

	constructor () {
		this.initDirStructure();
		if (Bot.taskId === -1) {
			console.error('something went wrong in Logger initialization. Task id still has starting value');
		}
	}

	initDirStructure () {
		try {
			fs.accessSync(this.DIR_PATH, fs.constants.F_OK);
			//accesSync throws an error if it cant reach the targeted path
			const logData = JSON.parse(fs.readFileSync(
				this.mainlogFileName, {encoding: 'utf8'}
			)) as MainlogEntry[];
			const lastTaskId = logData[logData.length - 1].id as number;
			Bot.taskId = lastTaskId + 1;

			this.addNewMainLogEntry(logData);

		} catch (e) {
			fs.mkdirSync(this.DIR_PATH);
			fs.writeFileSync(this.mainlogFileName, '[]');
			Bot.taskId = 0;
		} finally {
			fs.writeFileSync(this.logFileName, '');
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
	save (msg: LogEntry) {
		const txt = msg.print() + '\n';
		fs.appendFileSync(this.logFileName, txt);
	}

	saveMsg (msg: string) {
		fs.appendFileSync(this.logFileName, msg + '\n');
	}
}