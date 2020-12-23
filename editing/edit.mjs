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
export async function _edit (title, text, summary, options, url, dataActions) {
    checkMustHaveParams(title, text);
    
    let token;
    try {
        token = await dataActions.getToken();
    } catch (error) {
        throw 'error in getting csrf token for editing: ' + error;
    }

    let params = {};
    setParams(params, token, title, text, summary, options);

    return post('edit', url, params, '');
}

function setParams (obj, token, title, text, summary, options) {
    if (options !== undefined) {
        if (typeof options !== 'Object') {
            throw 'unallowed data type of options parameter in edit function, options must be of type object';
        }
        for (let prop in options) {
            //the mediawiki api treats non empty value as true and empty value as false
            if (options[prop] == false) {
                continue;
            }
            obj[prop] = String(options[prop]);
        }
    }

    obj.title = String(title);
    obj.text = String(text);
    
    if (summary !== '') {
        obj.summary = String(summary);
    }

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
}

function checkMustHaveParams (title, text) {
    if (title === undefined || title === '' || text === undefined) {
        throw 'title and text parameters must be set for editing';
    }
}