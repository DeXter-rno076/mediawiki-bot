import { get } from '../getpost.mjs';

export async function _getSections (page, url) {
    let params = {
        action: 'parse',
        prop: 'sections',
        page,
        format: 'json'
    }

    let sections;
    try {
        sections = await get(url, params);
    } catch (error) {
        throw 'TODO (do this text better): error in get request for getting the page sections: ' + error;
    }

    return JSON.parse(sections).parse.sections;
    //todo maybe the same error as in getWikitext can appear here
}