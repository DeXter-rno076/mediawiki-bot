import { logActionType } from './global-types';

export default class LogEntry {
	private type: logActionType;
	private msg: string;

	public constructor (type: logActionType, msg: string) {
		this.type = type;
		this.msg = msg;
	}

	public print (): string {
		return `${this.type}: ${this.msg}`;
	}
}