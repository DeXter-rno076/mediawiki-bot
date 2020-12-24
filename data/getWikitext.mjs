import { get } from '../getpost.mjs';

export async function _getWikitext (page, section, url, dataActions) {
    let params = {};
    setParams(params, page);
    await dataActions.setSectionIndex(params, section);

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

async function handleSection (obj, section, dataActions) {
    if (Number(section)) {
        //section contains a number => is handled as a section index
        obj.section = String(section);
    } else {
        let pageSections = await dataActions.getSections(obj.page);
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