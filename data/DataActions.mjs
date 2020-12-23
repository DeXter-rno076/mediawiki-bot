import { get } from '../getpost.mjs';
import { _getWikitext } from './getWikitext.mjs';

export class DataActions {
    constructor (url) {
        this.url = url;
    }

    async getToken (type = 'csrf') {
        let params = {
            action: 'query',
            meta: 'tokens',
            type,
            format: 'json'
        };

        try {
            let body = await get(this.url, params);
            let token = JSON.parse(body).query.tokens[type + 'token'];

            return token;
        } catch (error) {
            throw error;
        }
    }

    getWikitext (page, section, url) {
        return _getWikitext(page, section, url);
    }
}