import Bot from './Bot';
import Options from './Options/Options';
import * as req from 'request';
import { mwActionType } from './global-types';
import GetTokenOptions from './Options/GetTokenOptions';
import GetToken from './BotActions/GetToken';
//todo feels unclean
const request = req.defaults({jar: true})

export default class RequestHandler {
	static get (opt: Options): Promise<string> {
		RequestHandler.prepare(opt);
		return new Promise((resolve, reject) => {
			request.get({
				url: Bot.url,
				qs: opt
			}, (error, response, body) => {
				if (error) {
					reject(error);
				}
				resolve(body);
			});
		});
	}

	//todo split this up
	static async post (opt: Options): Promise<string> {
		if (opt.action !== 'clientlogin') {
			opt.setAssert('bot');
		}
		RequestHandler.prepare(opt);

		const token = await RequestHandler.getToken(opt.action);
		opt.setToken(token);
		if (opt.action !== 'clientlogin') {
			opt.setAssert('bot');
		}

		return new Promise ((resolve, reject) => {
			request.post({
				url: Bot.url,
				form: opt
			}, (error, response, body) => {
				if (error) {
					reject(error);
				}

				//todo retry stuff

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
			'uploadType'
		];

		let k: keyof Options;
		for (k in opt) {
			if (attributeBlacklist.includes(k)) {
				delete opt[k];
				continue;
			}

			if (typeof opt[k] === 'boolean') {
				//@ts-ignore
				//some subclasses of Options have boolean attributes
				if (opt[k] === false) {
					delete opt[k];
				}
			}
		}
	}
}