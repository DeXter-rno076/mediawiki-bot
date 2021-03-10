import fs from 'fs';
import { get, post } from '../getpost.mjs';

export async function _revert (options, summary, user, url, bot) {
    const editRevisions = await getRevisions(options, user, url);

    //console.log(editRevisions);

    await doStuff(editRevisions, options, summary, url, bot);

    return;
}

// function for getting the revisions =====================================================

async function getRevisions (options, user, url) {
    let revisions = [];
    if (options.botTask !== undefined) {
        await getBotTaskEdits(options.botTask, revisions, user, url);
    } else {
        let optionsObj = {
            user
        };
        if (options.start) optionsObj.startingPoint = options.start;
        if (options.end) optionsObj.endingPoint = options.end;

        await setRevisions(revisions, optionsObj, url);
    }
    if (options.summary) {
        checkForSummary(options.summary, revisions);
    }

    return revisions;
}

//todo split this up
async function getBotTaskEdits (taskIdentifier, revisions, user, url) {
    const botTasks = JSON.parse(fs.readFileSync('./botlogs/mainlog.json', {encoding: 'utf8'}));
    let taskIndex;

    if (/\^\d+/.test(taskIdentifier)) {
        const identifierNumber = Number(/\^(\d+)/.exec(taskIdentifier)['1']);
        taskIndex = identifierNumber;
    } else if (/\$\d+/.test(taskIdentifier)) {
        const identifierNumber = Number(/\$(\d+)/.exec(taskIdentifier)['1']) + 1;
        taskIndex = (botTasks.length - 1) - identifierNumber;//the length is decreased in order to skip the newly created log file
    } else if (/\d+/.test(taskIdentifier)) {
        const identifierNumber = Number(/(\d+)/.exec(taskIdentifier)['1']);
        taskIndex = -1;
        for (let i = 0; i < botTasks.length; i++) {
            if (Number(botTasks[i].id) === identifierNumber) {
                taskIndex = i;
                break;
            }
        }
        if (taskIndex === -1) {
            throw 'no bot task for the given id: ' + identifierNumber + ' found';
        }
    } else {
        throw 'unallowed characters in the bot task identifier: ' + taskIdentifier;
    }

    const targetedTask = botTasks[taskIndex];

    if (targetedTask === undefined) {
        throw 'error in revert function: no bot task for the given identifier found';
    }

    if (taskIndex === botTasks.length - 2) {//-2 in order to ignore the newly created bot task
        let options = {
            startingPoint: targetedTask.timestamp,
            user
        }
        await setRevisions(revisions, options, url);
    } else {
        const startingPoint = targetedTask.timestamp;
        const endingPoint = botTasks[taskIndex + 1].timestamp;

        let options = {
            startingPoint,
            endingPoint,
            user
        };

        await setRevisions(revisions, options, url);
    }
}

//not happy with this name
async function setRevisions (revisions, options, url, cont) {
    const revsPart = await getRevsRequest(options, url, cont);

    const contributions = revsPart.query.usercontribs;
    for (let revision of contributions) {
        revisions.push(revision);
    }

    if (revsPart.continue !== undefined) {
        await setRevisions(revisions, options, url, revsPart.continue);
    }
}

async function getRevsRequest(options, url, cont) {
    let params = {
        action: 'query',
        prop: 'revisions',
        list: 'usercontribs',
        uclimit: '500',
        ucuser: String(options.user),
        format: 'json'
    };

    let tstart = options.startingPoint;
    let tend = options.endingPoint;
    //the order of tstart and tend is correct (imo how mediawiki handles start and end is not intuitive)
    if (tstart !== undefined && tstart !== null && tstart !== '') params.ucend = String(tstart);
    if (tend !== undefined && tend !== null && tend !== '') params.ucstart = String(tend);

    if (cont !== undefined) params.uccontinue = cont.uccontinue;

    try {
        return JSON.parse(await get(url, params));
    } catch (error) {
        throw 'error in getting revisions for reverting: ' + error;
    }
}

function checkForSummary (summary, revisions) {
    for (let i = 0; i < revisions.length; i++) {
        const revSummary = revisions[i].comment;
        if (revSummary !== summary) {
            revisions.splice(i, 1);
            i--;
        }
    }        
}

//final functions that send the requests ====================================================================

async function doStuff (revisions, options, summary, url, bot) {
    for (let revision of revisions) {
        let token;
        try {
            token = await bot.getToken();
        } catch (error) {
            throw 'error in getting csrf token for reverting: ' + error;
        }

        let params = {
            action: 'edit',
            pageid: revision.pageid,
            undo: revision.revid,
            bot: 'true',
            format: 'json'
        };
        if (summary) params.summary = summary;

        let postBody = {
            token
        };

        try {
            if (options.GIDNMWH) {
                await rollbackExtreme(revision, params, postBody, url, bot);
            } else {
                await revertEdits(params, postBody, url, bot);
            }
        } catch (error) {
            throw 'error in sending revert request: ' + error;
        }
    }
}


async function revertEdits (params, postBody, url, bot) {
    let resBody = await post('revert', url, postBody, params, bot.taskId);

    let counter = 0;
    while (resBody.error !== undefined && resBody.error.code === 'badtoken' && counter < 5) {
        console.log('badtoken error occured in reverting, trying again');

        try {
            postBody.token = await bot.getToken();
        } catch (error) {
            throw 'error in getting csrf token for reverting: ' + error;
        }

        resBody = JSON.pars(await post('revert', url, postBody, params, bot.taskId));

        counter++;
    }

    return resBody;
}

async function rollbackExtreme (revision, params, postBody, url, bot) {
    const newestRevOnPage = await getNewestRevision(params.pageid, url);
    if (newestRevOnPage > params.undo) {
        params.undoafter = newestRevOnPage;

        //set undo to the revision one older than the oldest revision that gets reverted (thats how undoafter works)
        params.undo = revision.parentid;
    }

    let resBody = await post('almighty revert', url, postBody, params, bot.taskId);

    let counter = 0;
    while (resBody.error !== undefined && resBody.error.code === 'badtoken' && counter < 5) {
        console.log('badtoken error occured in almighty reverting, trying again');

        try {
            postBody.token = await bot.getToken();
        } catch (error) {
            throw 'error in getting csrf token for almighty reverting: ' + error;
        }

        resBody = JSON.pars(await post('almighty revert', url, postBody, params, bot.taskId));

        counter++;
    }

    return resBody;
}

async function getNewestRevision (pageid, url) {
    let params = {
        action: 'query',
        pageids: pageid,
        prop: 'revisions',
        rvlimit: '1',
        format: 'json'
    };

    const body = JSON.parse(await get(url, params));
    return body.query.pages[pageid].revisions[0].revid;
}