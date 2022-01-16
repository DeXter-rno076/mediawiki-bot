import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";
import LogEntry from "../../LogEntry";
import { Bot } from "../..";
import { LoginQuery } from "./LoginQuery";

export class Login extends APIAction {
	username: string;
    password: string;
    loginreturnurl: string;

	constructor (bot: Bot, password: string) {
		super(bot);
        this.username = bot.getUsername();
        this.password = password;
        this.loginreturnurl = bot.getUrl();
    }

	async exc (): Promise<BotActionReturn> {
        const query = this.createQuery();
		const res = await this.bot.getRequestSender().post(query);
		const logEntry = new LogEntry('clientlogin', res);
		return new BotActionReturn(logEntry, '');
	}

    createQuery (): LoginQuery {
        const query: LoginQuery = {
            action: 'clientlogin',
            username: this.username,
            password: this.password,
            loginreturnurl: this.loginreturnurl,
            format: 'json'
        };

        return query;
    }
}