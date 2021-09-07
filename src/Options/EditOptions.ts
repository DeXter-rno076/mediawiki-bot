import { Options } from './Options';

export class EditOptions extends Options {
	title: string;
	text: string;
	summary: string;
	nocreate = true;
	section?: string | number;
	bot = true;

	constructor (title: string, text: string, summary: string, section?: string | number) {
		super('edit');
		
		this.title = title;
		this.text = text;
		this.summary = summary;
		if (section !== undefined) {
			this.section = section;
		}
	}

	setNoCreate (input: boolean) {
		this.nocreate = input;
	}
}