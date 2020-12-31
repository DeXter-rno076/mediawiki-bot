import { get } from '../getpost.mjs';

export async function _getWikitext (page, section, url, dataActions) {
    let params = {};
    setParams(params, page);

    if (section !== undefined) {
        await dataActions.setSectionIndex(params, section);
    }

    let content;
    try {
        content = await get(url, params);
    } catch (error) {
        throw 'TODO (do this text better): error in get request for getting the page content: ' + error;
    }

    try {
        return JSON.parse(content).parse.wikitext['*'];
    } catch (error) {
        throw 'error in getting wikitext from server response, targeted wiki page probably doesn\'t extist';
    }
}

function setParams (obj, page, section) {
    obj.action = "parse";
    obj.prop = "wikitext";
    obj.page = String(page);
    obj.format = 'json';
}