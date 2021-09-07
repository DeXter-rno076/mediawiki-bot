import { Options } from "./Options";

export class UndoOptions extends Options {
	title: string;
	undo: number;
	bot = true;

	constructor (title: string, revid: number) {
		super('edit');
		this.title = title;
		this.undo = revid;
	}
}