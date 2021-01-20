import { get } from '../getpost.mjs';

export async function _getWikitext (page, section, url, bot, setSectionIndex) {
    let params = {};
    setParams(params, page);

    if (section !== undefined) {
        await setSectionIndex(bot, params, section);
    }

    let content;
    try {
        content = await get(url, params);
    } catch (error) {
        throw 'error in getting the page content of '+ params.page +': ' + error;
    }

    try {
        return JSON.parse(content).parse.wikitext['*'];
    } catch (error) {
        throw 'error in parsing server response containing wikitext, targeted wiki page ' + params.page + ' probably doesn\'t extist';
    }
}

function setParams (obj, page, section) {
    obj.action = "parse";
    obj.prop = "wikitext";
    obj.page = String(page);
    obj.format = 'json';
}