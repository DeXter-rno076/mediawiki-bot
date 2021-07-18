import Options from "./Options";

export default class LoginOptions extends Options {
	lgname: string;
	lgpassword: string;
	lgtoken?: string;

	constructor (name: string, password: string) {
		super('login', 'login');
		this.lgname = name;
		this.lgpassword = password;
	}

	//called by RequestHandler
	setToken (token: string) {
		this.lgtoken = token;
	}
}