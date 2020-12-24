import { _edit } from './edit.mjs';
import { _move } from './move.mjs';

export class EditActions {
    constructor (url, dataActions) {
        this.url = url;
        this.dataActions = dataActions;
    }

    edit (title, text, summary, options, url = this.url) {
        checkSum(summary);
        return _edit(title, text, summary, options, url, this.dataActions);
    }

    async revert () {

    }

    move (from, to, summary, movetalk, movesubpages, noredirect, url = this.url) {
        checkSum(summary);
        return _move(from, to, summary, movetalk,
            movesubpages, noredirect, url, this.dataActions);
    }
}

function checkSum (summary) {
    if (summary == '') {
        console.warn('no summary set, it is highly encouraged to use a summary for bot edits');
    }
}