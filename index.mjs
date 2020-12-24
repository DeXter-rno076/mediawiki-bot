import { EditActions } from './editing/EditActions.mjs';
import { DataActions } from './data/DataActions.mjs';
import { reqInit, post } from './getpost.mjs';

export class Bot {
    constructor (parameters) {
        setAttributes(this, parameters);
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
            format: 'json'
        }
        return post('login', this.url, params, '');
    }

    async logout () {
        //TODO
    }

    //======================= editing stuff

    /**
     * @param title page title
     * @param text new page content
     * @param summary edit summary (default value is summary given to Bot constructor)
     * @param options other options for editing (optional) (if you're editing one section don't forget the section heading, otherwise it will be removed by the edit)
     * @param url url the edit request is sent to (default: url given to Bot constructor)
     */
    edit (title, text, summary = this.summary, options, url) {
        return this.editActions.edit(title, text, summary, options, url);
    }

    revert (TODO) {
        this.editActions.revert(TODO);
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
    move (from, to, summary = this.summary, movetalk = 'true', movesubpages = 'true', noredirect = 'true', url) {
        return this.editActions.move(from, to, summary, movetalk, movesubpages, noredirect, url);
    }
    
    //====================== data stuff
    /**returns the members of a category
     * 
     * @param {String} category name of the targeted category
     * @param {String} type type of the returned pages ('page', 'subcat' or 'file')
     * @param {Integer, String} limit maximum number of returned pages per request (default: 'max')
     * @param {Boolean} noTemplates whether templates should be ignored
     * 
     * @return {Object} array of objects that contain data about the targeted category members
     *  TODO show how the objects are build up
     */
    getCatMembers (category, type = 'page', limit = 'max', noTemplates = true, url) {
        return this.dataActions.getCatMembers(category, type, limit, noTemplates, url);
    }

    /**returns the source text of a page
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
    getTemplates (page, section) {
        return this.dataActions.getTemplates(page, section);
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
    } //else {
        //obj.doConsoleOutputs = false;
    //}

    obj.dataActions = new DataActions(obj.url);
    obj.editActions = new EditActions(obj.url, obj.dataActions);
}