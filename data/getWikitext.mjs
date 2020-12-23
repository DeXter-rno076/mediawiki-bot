import { get } from '../getpost.mjs';

export async function _getWikitext (page, section, url) {
    let params = {};
    setParams(params, page, section);

    let content;
    try {
        content = await get(url, params);
    } catch (error) {
        throw 'TODO (do this text better): error in get request for getting the page content: ' + error;
    }

    try {
        return JSON.parse(content).parse.wikitext['*'];
    } catch (error) {
        throw 'TODO what\'s exactly going wrong when this error is thrown? I have no idea';
    }
}

function setParams (obj, page, section) {
    obj.action = "parse";
    obj.prop = "wikitext";
    obj.page = String(page);
    obj.format = 'json';
}