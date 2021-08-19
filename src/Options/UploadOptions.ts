import Options from "./Options";

export default class UploadOptions extends Options {
	uploadType: 'local' | 'remote';
	filename: string;
	comment: string;
	url?: string
	ignorewarnings = false;

	//todo a lot of stuff is missing for upload of local files

	constructor (uploadType: 'local' | 'remote', wantedName: string, comment: string) {
		super('upload');
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