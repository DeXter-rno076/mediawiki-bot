import LogEntry from './LogEntry';
import { actionReturnType } from './global-types';

export default class BotActionReturn {
	status?: LogEntry;
	data?: actionReturnType;

	constructor (status?: LogEntry, data?: actionReturnType) {
		if (status !== undefined) {
			this.status = status;
		}
		if (data !== undefined) {
			this.data = data;
		}
	}
}