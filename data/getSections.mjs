import { get } from '../getpost.mjs';

export async function _getSections (page, url) {
    let params = {
        action: 'parse',
        prop: 'sections',
        format: 'json'
    }

    if (Number(page)) params.pageid = String(page);
    else params.page = String(page);

    let sections;
    try {
        sections = await get(url, params);
    } catch (error) {
        throw 'error in getting the page sections: ' + error;
    }

    return JSON.parse(sections).parse.sections;
    //todo maybe the same error as in getWikitext can appear here
}