import { post } from '../getpost.mjs';

export async function _move (from, to, summary, movetalk, movesubpages, noredirect, url, bot) {
    let token;
    try {
        token = await bot.getToken();
    } catch (error) {
        throw 'error in getting csrf token for moving: ' + error;
    }

    let params = {};
    setParams(params, arguments);

    return post('move', url, {token}, params, bot.taskId);
}

function setParams (obj, args) {
    obj.action = 'move';
    obj.from = String(args[0]);
    obj.to = String(args[1]);
    
    if (args[2] !== '') {
        obj.reason = String(args[2]);
    }
    if (args[3] === true || args[3] === 'true') {
        obj.movetalk = 'true';
    }
    if (args[4] === true || args[4] === 'true') {
        obj.movesubpages = 'true';
    }
    if (args[5] === true || args[5] === 'true') {
        obj.noredirect = 'true';
    }

    obj.format = 'json';
}