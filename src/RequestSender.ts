import { Bot } from './Bot';
import * as req from 'request';
import { mwActionType } from './global-types';
import { GetToken } from './actions/GetToken/GetToken';
import { Query } from './actions/Query';
//todo feels unclean
const request = req.defaults({jar: true})

export class RequestSender {
    private bot: Bot;
	private skipAssertBot = [
		'clientlogin',
		'expandtemplates'
	];
    private skipToken = [
		'expandtemplates'
	];

    public constructor (bot: Bot) {
        this.bot = bot;
    }

	public async get (query: Query): Promise<string> {
		this.prepare(query);

		return this.rawGet({
			url: this.bot.getUrl(),
			qs: query
		});
	}

	public async post (query: Query): Promise<string> {
		if (!this.skipAssertBot.includes(query.action)) {
			query.assert = 'bot';
		}
		this.prepare(query);

		if (!this.skipToken.includes(query.action)) {
			await this.setToken(query);
		}

		return this.rawPost({
			url: this.bot.getUrl(),
			form: query
		});
	}

	public async rawGet (opts: any): Promise<string> {
		return new Promise ((resolve, reject) => {
			request.get(opts, (error, response, body) => {
				if (error) {
					reject(error);
				}

				resolve(body);
			});
		});
	}

	public async rawPost (opts: any): Promise<string> {
		return new Promise ((resolve, reject) => {
			request.post(opts, (error, response, body) => {
				if (error) {
					reject(error);
				}

				resolve(body);
			});
		});
	}

    private async setToken (query: Query) {
        const token = await this.getToken(query.action);
        if (query.action === 'clientlogin') {
            query.logintoken = token;
        } else {
            query.token = token;
        }
    }

	private async getToken (action: mwActionType): Promise<string> {
		const tokenType = GetToken.getTokenType(action);
		const getToken = new GetToken(this.bot, tokenType);
		const res = await getToken.exc();
		return res.getData() as string;
	}

	private prepare (query: Query) {
		for (const [k, v] of Object.entries(query)) {
			if (typeof v === 'boolean') {
                //in mediawiki true means parameter is set, false means parameter is not set
				if (v === false) {
					delete query[k];
				} else {
                    query[k] = '1';
                }
			} else if (typeof v !== 'string') {
                query[k] = String(v);
            }
		}
	}
}