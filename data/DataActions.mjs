import { get } from '../getpost.mjs';
import { _getWikitext } from './getWikitext.mjs';
import { _getSections } from './getSections.mjs';

export class DataActions {
    constructor (url) {
        this.url = url;
    }

    async getToken (type = 'csrf', url = this.url) {
        let params = {
            action: 'query',
            meta: 'tokens',
            type,
            format: 'json'
        };

        try {
            let body = await get(url, params);
            let token = JSON.parse(body).query.tokens[type + 'token'];

            return token;
        } catch (error) {
            throw error;
        }
    }

    getWikitext (page, section, url = this.url) {
        return _getWikitext(page, section, url, this);
    }

    getSections (page, url = this.url) {
        return _getSections(page, url);
    }

    async setSectionIndex (obj, section) {
        if (Number(section)) {
            //section contains a number => is handled as a section index
            obj.section = String(section);
        } else {
            //edit uses title, parse (e. g. getWikitext) uses page
            let pageTitle = obj.page || obj.title;
            let pageSections = await this.getSections(pageTitle);
            let index = -1;
            for (let element of pageSections) {
                if (element.line === section) {
                    index = element.index;
                    break;
                }
            }
            if (index === -1) {
                throw 'error in getting wikitext of a section: section ' + section + 'does not exist in page ' + obj.page;
            } else {
                obj.section = String(index);
            }
        }
    }
}