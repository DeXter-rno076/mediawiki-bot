import req from 'request';
const request = req.defaults({jar: true});//cookie handling

let doConsoleOutputs = true;

export function reqInit (input) {//todo not happy with this
    doConsoleOutputs = input;
}

/**
 * 
 * @param url 
 * @param qs 
 */
export async function get (url, qs) {
    return new Promise ((resolve, reject) => {
        request.get({
            url,
            qs,
        }, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(body);
        });
    });
}

/**
 * 
 * @param action 
 * @param url 
 * @param postBody 
 * @param qs 
 */
export async function post (action, url, postBody, qs) {
    return new Promise ((resolve, reject) => {
        request.post({
            url,
            qs,
            form: postBody
        }, (error, response, body) => {
            if (error) {
                reject(error);
            }
            if (doConsoleOutputs && action !== 'getToken') {
                console.log(action + ': ' + body);
            }
            resolve(body);
        });
    });
}