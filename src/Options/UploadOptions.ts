import Options from "./Options";

export default class UploadOptions extends Options {
	uploadType: 'local' | 'url';
	filename: string;
	comment: string;
	url?: string
	ignorewarnings = false;

	constructor (uploadType: 'local' | 'url', wantedName: string, comment: string) {
		super('upload', 'upload');
		this.uploadType = uploadType;
		this.filename = wantedName;
		this.comment = comment;
	}

	setFileUrl (url: string) {
		this.url = url;
	}

	setIgnoreWarnings (input: boolean) {
		this.ignorewarnings = input;
	}
}