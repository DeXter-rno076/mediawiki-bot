import request from 'request';
//cookie handling
request = request.defaults({jar: true});

let doConsoleOutputs = true;

export function reqInit (input) {
    doConsoleOutputs = input;
}

export async function get () {

}

export async function post (action, url, params) {
    request.post({
        url: url,
        form: params 
    }, (error, response, body) => {
        if (error) {
            throw error;
        }
        if (this.doConsoleOutputs) {
            console.log(action + ': ' + body);
        }
        return Promise.resolve();
    });
}