import { post } from '../getpost.mjs';

/**
 * todo badtoken error appears very often when using edit asynchronisly very fast (when waiting for each edit, it appears very rarely)
 * 
 * @param title 
 * @param text 
 * @param summary 
 * @param options 
 * @param dataActions 
 * @param url 
 */
export async function _edit (title, text, summary, options, url, callerObj) {
    const dataActions = callerObj.dataActions;
    
    checkMustHaveParams(title, text);
    
    let token;
    try {
        token = await dataActions.getToken();
    } catch (error) {
        throw 'error in getting csrf token for editing: ' + error;
    }

    let params = {};
    setParams(params, token, title, text, summary, options);
    if (options !== undefined && options.section !== undefined) {
        await dataActions.setSectionIndex(params, options.section);
    }

    //todo maybe retry this if a badtoken error occurs (this could be done for edit/move/revert in post function)
    //or maybe something like function saveEdit() that retries it a couple of times if necessary but that is therefore slower for move/edit (for revert standard)
    return post('edit', url, params, {}, callerObj.taskId);
}

function setParams (obj, token, title, text, summary, options) {
    if (options !== undefined) {
        if (typeof options !== 'object') {
            throw 'unallowed data type of options parameter in edit function, options must be of type object';
        }
        for (let prop in options) {
            //the mediawiki api treats non empty value as true and empty value as false
            if (options[prop] === false || options[prop] === 'false' || prop === 'section') {
                //section parameter gets handled seperatly
                continue;
            }
            obj[prop] = String(options[prop]);
        }

        if (options.nocreate === undefined || options.nocreate == true) {
            //default to prevent accidently creating pages
            //nocreate = false doesn't need extra handling because the nocreate value
            //doesn't get copied from options over to obj
            obj.nocreate = 'true';
        }
    } else {
        obj.nocreate = 'true';//default to prevent accidently creating pages
    }

    if (title) {
        obj.title = String(title);
    } else if (options.pageId) {
        obj.pageid = String(options.pageId);
    } else {
        throw 'either title or pageId must be given for editing';
    }
    
    obj.text = String(text);
    
    if (summary !== '') {
        obj.summary = String(summary);
    }

    //default propertys
    obj.action = 'edit';
    obj.bot = 'true';
    obj.format = 'json';
    obj.token = token;
}

function checkMustHaveParams (title, text) {
    if (title === undefined || title === '' || text === undefined) {
        throw 'title and text parameters must be set for editing';
    }
}