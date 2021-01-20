import { post } from '../getpost.mjs';

export async function _edit (title, text, summary, options, url, bot, setSectionIndex) {
    let token;
    try {
        token = await bot.getToken();
    } catch (error) {
        throw 'error in getting csrf token for editing: ' + error;
    }

    let params = {};
    setParams(params, token, title, text, summary, options);
    if (options !== undefined && options.section !== undefined) {
        await setSectionIndex(bot, params, options.section);
    }

    //todo maybe retry this if a badtoken error occurs (this could be done for edit/move/revert in post function)
    //or maybe something like function saveEdit() that retries it a couple of times if necessary but that is therefore slower for move/edit (for revert standard)
    return post('edit', url, params, {}, bot.taskId);
}

function setParams (obj, token, title, text, summary, options) {
    if (options !== undefined) {
        setOptions(obj, options);
    } else {
        obj.nocreate = 'true';//default to prevent accidently creating pages
    }

    if (title !== undefined) {
        obj.title = String(title);
    } else if (options.pageid) {
        obj.pageid = String(options.pageid);
    } else {
        throw 'either title or pageid must be given for editing';
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

function setOptions (obj, options) {
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
}