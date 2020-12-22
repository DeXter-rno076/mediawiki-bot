import { EditActions } from './editing/EditActions.mjs';
import { DataActions } from './data/DataActions.mjs';
import { reqInit, post } from './getpost.mjs';

export class Bot {
    constructor (parameters) {
        setAttributes(this, parameters);
    }

    async login () {
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
            loginreturnurl: this.url,
            format: 'json'
        }
        return post('login', this.url, params);
    }

    async logout () {
        //TODO
    }

    //======================= editing stuff
    edit (TODO) {
        this.editActions.edit(TODO);
    }

    revert (TODO) {
        this.editActions.revert(TODO);
    }

    move (TODO) {
        this.editActions.move(TODO);
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
    getCatMembers (category, type = 'page', limit = 'max', noTemplates = true) {
        return this.dataActions.getCatMembers(category, type, limit, noTemplates);
    }

    /**returns the source text of a page
     * 
     * @param {String} title title of the targeted page
     * @param {String} section name of the targeted section (optional)
     * 
     * @return page content as a string
     */
    getWikitext (title, section) {
        return this.dataActions.getWikitext(title, section);
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
     *  TODO how is the array build up?
     */
    getSections (page) {
        return this.dataActions.getSectins(page);
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
    }
    if (parameters.doConsoleOutputs === false) {
        reqInit(false);//TODO not happy with that
    } //else {
        //obj.doConsoleOutputs = false;
    //}

    obj.dataActions = new DataActions(obj.url);
    obj.editActions = new EditActions(obj.url, obj.dataActions);
}