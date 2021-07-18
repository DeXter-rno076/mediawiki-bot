import Options from "./Options";

export default class UndoOptions extends Options {
	title: string;
	undo: number;

	constructor (title: string, revid: number) {
		super('edit', 'revert');
		this.title = title;
		this.undo = revid;
	} 
}