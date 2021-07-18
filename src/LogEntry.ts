import { logActionType } from './global-types';

export default class LogEntry {
	type: logActionType;
	msg: string;

	constructor (type: logActionType, msg: string) {
		this.type = type;
		this.msg = msg;
	}

	print (): string {
		return `${this.type}: ${this.msg}`;
	}
}