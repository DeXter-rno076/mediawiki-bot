import { post } from '../getpost.mjs';

export async function _move (from, to, summary, movetalk, movesubpages, noredirect, url, callerObj) {
    const dataActions = callerObj.dataActions;

    checkMustHaveParams(from, to);

    let token;
    try {
        token = await dataActions.getToken();
    } catch (error) {
        throw 'error in getting csrf token for moving: ' + error;
    }

    let params = {};
    setParams(params, arguments);

    return post('move', url, {token}, params, callerObj.taskId);
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

function checkMustHaveParams (from, to) {
    if (from === undefined || from === '' || to === undefined || to === '') {
        throw 'from and to parameters must be set for moving pages';
    }
}