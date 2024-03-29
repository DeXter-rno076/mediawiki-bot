import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";
import LogEntry from "../../LogEntry";
import { Bot } from "../..";
import { UploadQuery } from "./UploadQuery";

export class Upload extends APIAction {
	private uploadType: 'local' | 'remote';
    private fileName: string;
    private comment: string;
    private fileLocator: string;
    private ignoreWarnings: boolean;
    
    private cutServerResponse: boolean;

	public constructor (
        bot: Bot,
        uploadType: 'local' | 'remote',
        fileName: string,
        comment: string,
        fileLocator: string,
        ignorewarnings = false,
        cutServerResponse = true
    ) {
		super(bot);

        this.uploadType = uploadType;
        this.fileName = fileName;
        this.comment = comment;
        this.fileLocator = fileLocator;
        this.ignoreWarnings = ignorewarnings;
        this.cutServerResponse = cutServerResponse;
	}

	public async exc (): Promise<BotActionReturn> {
        const query = this.createQuery();
		let res = await this.bot.getRequestSender().post(query);

		if (this.cutServerResponse) {
			const parsedRes = JSON.parse(res);
			delete parsedRes.upload.imageinfo;
			res = JSON.stringify(parsedRes);
		}

		const logEntry = new LogEntry('upload', res);
		return new BotActionReturn(logEntry, '');
	}

    protected createQuery (): UploadQuery {
        const query: UploadQuery = {
            action: 'upload',
            filename: this.fileName,
            comment: this.comment,
            ignorewarnings: this.ignoreWarnings,
            format: 'json'
        };

        if (this.uploadType === 'remote') {
            query.url = this.fileLocator;
        }

        return query;
    }
}