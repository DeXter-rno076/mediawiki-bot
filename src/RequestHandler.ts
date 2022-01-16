import { Bot } from './Bot';
import { Options } from './actions/Options';
import * as req from 'request';
import { mwActionType } from './global-types';
import { GetTokenOptions } from './actions/GetToken/GetTokenOptions';
import GetToken from './actions/GetToken/GetToken';
//todo feels unclean
const request = req.defaults({jar: true})

export default class RequestHandler {
	static skipAssertBot = [
		'clientlogin',
		'expandtemplates'
	];
	static skipToken = [
		'expandtemplates'
	];

	static get (opt: Options): Promise<string> {
		RequestHandler.prepare(opt);
		return this.rawGet({
			url: Bot.url,
			qs: opt
		});
	}

	static async post (opt: Options): Promise<string> {
		if (!RequestHandler.skipAssertBot.includes(opt.action)) {
			opt.setAssert('bot');
		}
		RequestHandler.prepare(opt);

		if (!RequestHandler.skipToken.includes(opt.action)) {
			const token = await RequestHandler.getToken(opt.action);
			opt.setToken(token);
		}

		return this.rawPost({
			url: Bot.url,
			form: opt
		});
	}

	static async rawGet (opt: any): Promise<string> {
		return new Promise ((resolve, reject) => {
			request.get(opt, (error, response, body) => {
				if (error) {
					reject(error);
				}

				resolve(body);
			});
		});
	}

	static async rawPost (opt: any): Promise<string> {
		return new Promise ((resolve, reject) => {
			request.post(opt, (error, response, body) => {
				if (error) {
					reject(error);
				}

				resolve(body);
			});
		});
	}

	static async getToken (action: mwActionType): Promise<string> {
		const tokenType = GetTokenOptions.getTokenType(action);
		const getTokenOpt = new GetTokenOptions(tokenType);
		const getToken = new GetToken(getTokenOpt);
		const res = await getToken.exc();
		return res.data as string;
	}

	static prepare (opt: Options) {
		//list of attributes that arent meant for the wiki server
		const attributeBlacklist = [
			'uploadType',
			'cutServerResponse'
		];

		let k: keyof Options;
		for (k in opt) {
			if (attributeBlacklist.includes(k)) {
				delete opt[k];
				continue;
			}

			if (typeof opt[k] === 'boolean') {
				//some subclasses of Options have boolean attributes
				//@ts-expect-error
				if (opt[k] === false) {
					delete opt[k];
				}
			}
		}
	}
}