import { _edit } from './edit.mjs';

export class EditActions {
    constructor (url, dataActions) {
        this.url = url;
        this.dataActions = dataActions;
    }

    edit (title, text, summary, options) {
        return _edit(title, text, summary, options, this.dataActions, this.url);
    }

    async revert () {

    }

    async move () {

    }
}