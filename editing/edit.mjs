import { post } from '../getpost.mjs';

/**
 * 
 * @param title 
 * @param text 
 * @param summary 
 * @param options 
 * @param dataActions 
 * @param url 
 */
export async function _edit (title, text, summary, options, dataActions, url) {
    let token = await dataActions.getToken();

    let params = {};
    setParams(params, token, title, text, summary, options);

    return post('edit', url, params, '');
}

function setParams (obj, token, title, text, summary, options) {
    if (options !== undefined) {
        for (let prop in options) {
            //the mediawiki api treats non empty value as true and empty value as false
            if (options[prop] == false) {
                continue;
            }
            obj[prop] = options[prop];
        }
    }

    obj.title = title;
    obj.text = text;
    obj.summary = summary;

    //default propertys
    obj.action = 'edit';
    obj.bot = 'true';
    obj.format = 'json';
    obj.token = token;

    if (options.nocreate === undefined || options.nocreate == true) {
        //default to prevent accidently creating pages
        //nocreate = false doesn't need extra handling because the nocreate value
        //doesn't get copied from options over to obj
        obj.nocreate = 'true';
    }
    if (obj.summary === undefined) {
        console.warn('no summary set: it is highly encouraged to set a summary for bot edits');
    }
}