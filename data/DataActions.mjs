import { post } from '../getpost.mjs';

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
            let body = await post('getToken', this.url, params, '');
            let token = JSON.parse(body).query.tokens[type + 'token'];

            return token;
        } catch (error) {
            throw error;
        }
    }
}