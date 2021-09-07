import { Bot } from "../Bot";
import { Options } from "./Options";

export class LoginOptions extends Options {
	username: string;
	password: string;
	logintoken?: string;
	loginreturnurl = Bot.url;

	constructor (name: string, password: string) {
		super('clientlogin');
		this.username = name;
		this.password = password;
	}

	//called by RequestHandler
	setToken (token: string) {
		this.logintoken = token;
	}
}