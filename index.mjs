import fs from 'fs';
import { EditActions } from './editing/EditActions.mjs';
import { DataActions } from './data/DataActions.mjs';
import { reqInit, post } from './getpost.mjs';
import { logInit, saveConsoleOutput } from './logapi.mjs';

export class Bot {
    //TODO: BIG TODO: check every single user input and/or parse it into the wanted data type
    //TODO: do all the default values at one layer, not split like now
    //TODO: some method names could be better
    //TODO: rethink exception handling (maybe involving saveMsg())
    //TODO: put summary params further behind
    //ideas for more functions: build something similar to getTemplates for wiki tables
    constructor (parameters) {
        setAttributes(this, parameters);
        logInit(this);
    }

    async login (url = this.url) {
        let token;
        try {
            token = await this.dataActions.getToken('login');
        } catch (error) {
            throw 'error in getting login token: ' + error;
        }
        
        let params = {
            action: 'clientlogin',
            username: this.username,
            password: this.password,
            logintoken: token,
            loginreturnurl: url,
            //assert: 'bot',//login gets blocked if user does not have bot rights
            format: 'json'
        }
        const loginResponse = JSON.parse(await post('login', this.url, params, {}, this.taskId));
        if (loginResponse.clientlogin !== undefined && loginResponse.clientlogin.status !== 'PASS') {
            throw 'error in logging in: login status is not "PASS"';
        }
    }

    /**
     * used for logging out
     * be cautios with this if you're not waiting for the server to handle your editing requests (the logout request could get handled before some edit requests which would lead to assertbotfailed errors)
    */
    async logout () {
        let token;
        try {
            token = await this.dataActions.getToken();
        } catch (error) {
            throw 'error in getting csrf token for logout: ' + error;
        }

        let params = {
            action: 'logout',
            token,
            format: 'json'
        }
        return post('logout', this.url, params, '', this.taskId);
    }

    //======================= editing stuff

    /**
     * @param title page title
     * @param text new page content
     * @param summary edit summary (default value is summary given to Bot constructor)
     * @param options other options for editing (optional) (if you're editing one section don't forget the section heading, otherwise it will be removed by the edit)
     * @param url url the edit request is sent to (default: url given to Bot constructor)
     * 
     * always have at least one bot action with waiting (i. e. using await or promise handling) between each edit call if you are editing without waiting (i. e. using edit without await or promise handling)
     * 
     * todo switch places of summary and options (summary will often be empty because of global summary)
     */
    edit (title, text, summary = '', options, url) {
        if (summary === '') {
            summary = this.summary;
        }
        return this.editActions.edit(title, text, summary, options, url);
    }

    /**
     * @param {Object} options gives info about which edits to revert
     * {
     *      botTask: "^n/$n/n", which one of the previous bot task logged in botlogs/mainlog.json (^ starts counting from 0, $ starts counting from the last index of mainlog.json; thus: ^0 refers to the first bot task that didn't got removed from the logs, $0 refers to the last bot task THAT WON'T GET REMOVED (the logs are cleaned up at the beginning of the program execution => the newest bot task might get removed before the revert function gets called), just a number selects the bot task with the corresponding id that won't get removed)
     * 
     *      start and end must always be used together
     *      start: "time", starting point (must be in ISO format) (if set to null or '' the user's first edit until end is selected)
     *      end: "time", ending point (must be in ISO format) (if set to null or '' the user's edit at start until his/hers/its most recent one)
     * 
     *      summary: "sum", selects all edits with the given summary (with no other selection property set this will check every edit of the user)
     *
     *      GIDNMWH: "anything except of undefined" (short for "get it done no matter what happens") instead of reverting, the bot sets the pages to the version before the selected edit (avoids reverting getting blocked by more recent edits at a page but of course this might revert other edits that weren't selected)
     * }
     * all of these can be combined (however if botTask is set, start and end will be ignored)
     * @param {String} summary summary of the reverts
     * @param {String} user whose edits shall be reverted (default value: the bot's username)
     * @param {String} url 
     */
    revert (options, summary = '', user = this.username, url = this.url) {
        //in testing
        return this.editActions.revert(options, summary, user, url);
    }

    /**
     * @param from old name of the targeted page
     * @param to new name of the targeted page
     * @param summary edit summary (optional, default: summary given to Bot constructor)
     * @param movetalk whether the corresponding talk page shall get moved too (default: true)
     * @param movesubpages whether the corresponding subpages shall get moved too (default: true)
     * @param noredirect whether a redirect from old name to new name shall be created (default: true)
     * @param url url the move request is sent to (default: url given to Bot constructor)
     */
    move (from, to, summary = '', movetalk = 'true', movesubpages = 'true', noredirect = 'true', url) {
        if (summary === '') {
            summary = this.summary;
        }
        return this.editActions.move(from, to, summary, movetalk, movesubpages, noredirect, url);
    }
    
    //====================== data stuff
    /**returns the members of a category
     * 
     * @param {String} category name of the targeted category (the namespace prefix MUST be set, e. g. 'Category:Test')
     * TODO rename data param
     * @param {Array} data which types of data shall be included in the objects that are returned (default: ['title'], allowed element values: 'ids', 'title', 'sortkey', 'sortkeyprefix', 'type', 'timestamp', 'ns')
     * @param {Object} ns pages from which namespaces shall be included, object with the attribute includeonly (only the given namespaces) or excludeonly (all but the given namespaces) with an array containing the namespace names as value (default: {includeonly: ['Main']})
     * @param {Integer, String} limit maximum number of returned pages per request (default: 'max' (equivalent to 500))
     * @param {String} url url the requests are sent to (default: url given to Bot constructor)
     * 
     * @return {Object} array of objects or strings that contain data about the targeted category members (objects if multiple types of data are wanted, strings if only one type)
     * if multiple types are selected the objects in the array have an attribute for every type
     * if the titles are given the toString methods of the objects return the title
     */
    getCatMembers (category, data = ['title'], ns = {includeonly: ['Main']}, limit = 'max', url) {
        return this.dataActions.getCatMembers(category, data, limit, ns, url);
    }

    /**returns the sourcetext of a page
     * 
     * @param {String} title title of the targeted page
     * @param {String} section name of the targeted section (optional)
     * 
     * @return page content as a string
     */
    getWikitext (title, section, url) {
        return this.dataActions.getWikitext(title, section, url);
    }

    /**returns data about templates
     * 
     * @param {String} page title of the targeted page
     * @param {String} section name of the targeted section (optional)
     * 
     * @return TODO
     */
    getTemplates (page, section, url) {
        return this.dataActions.getTemplates(page, section, url);
    }

    /**returns the sections of a page
     * 
     * @param {String} page title of the targeted page
     * 
     * @return array containing data about the sections
     *  the returned array consists of objects that are build up like this:
     * {
     *     toclevel: 1,
     *     level: '2',
     *     line: 'Trivia',
     *     number: '2',
     *     index: '2',
     *     fromtitle: 'Test_Article',
     *     byteoffset: 47,
     *     anchor: 'Trivia'
     * }
     * this corresponds to the section "Trivia" in the article "Test Article"
     * that is the second section in the page and has level 2 (means "== section name ==")
     * todo explain the other parameters
     */
    getSections (page, url) {
        return this.dataActions.getSections(page, url);
    }

    /**saves msg to the log file and writes msg on the console if doConsoleOutputs is set to true
     * useful for fixing errors after big bot tasks
     * @param msg
     */
    saveMsg (msg) {
        if (this.doConsoleOutputs) {
            console.log(msg);
        }
        saveConsoleOutput(msg, this.taskId);
    }
}

/**sets the attributes of obj
 * 
 * @param {Bot} obj bot object
 * @param {*} parameters parameters given to the constructor ob obj
 */
function setAttributes (obj, parameters) {
    if (parameters.username === undefined ||
        parameters.password === undefined) {
            throw 'username and password must be set';
        }

    obj.username = String(parameters.username);
    obj.password = String(parameters.password);
    
    if (parameters.url !== undefined) {
        obj.url = String(parameters.url);
    } else {
        console.warn('No url given to constructor');
    }
    if (parameters.summary !== undefined) {
        obj.summary = String(parameters.summary);
    } else {
        obj.summary = '';
    }
    if (parameters.doConsoleOutputs === false) {
        reqInit(false);//TODO not happy with that
    } else {
        obj.doConsoleOutputs = true;
    }

    obj.dataActions = new DataActions(obj.url);
    obj.editActions = new EditActions(obj.url, obj.dataActions);
}