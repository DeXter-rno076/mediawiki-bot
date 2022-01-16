import LogEntry from '../LogEntry';
import { actionReturnType } from '../global-types';

export default class BotActionReturn {
	private status?: LogEntry;
	private data?: actionReturnType;

	public constructor (status?: LogEntry, data?: actionReturnType) {
		if (status !== undefined) {
			this.status = status;
		}
		if (data !== undefined) {
			this.data = data;
		}
	}

    public getStatus (): LogEntry | undefined {
        return this.status;
    }

    public getData (): actionReturnType | undefined {
        return this.data;
    }
}