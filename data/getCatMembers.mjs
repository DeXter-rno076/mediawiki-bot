import { get } from '../getpost.mjs';

const namespaces = {
    "Main": "0",
    "Talk": "1",
    "User": "2",
    "User talk": "3",
    "Project": "4",
    "Project talk": "5",
    "File": "6",
    "File talk": "7",
    "MediaWiki": "8",
    "MediaWiki talk": "9",
    "Template": "10",
    "Template talk": "11",
    "Help": "12",
    "Help talk": "13",
    "Category": "14",
    "Category talk": "15"
};

export async function _getCatMembers (cat, data, limit, ns, url) {
    let nsStr = buildNamespaceStr(ns);
    let dataStr = buildDataStr(data);
    let pages = await addPages(cat, dataStr, limit, nsStr, url);
    
    if (!data.includes('ns')) {
        removeNamespaceAttr(pages, data);
    }

    return pages;
}

async function addPages (cat, dataStr, limit, nsStr, url) {
    let pages = [];

    let cont;
    do {
        const body = await getCatMembersPart(cat, dataStr, limit, nsStr, url, cont);
        pages = pages.concat(body.query.categorymembers);
        cont = body.continue;
    } while (cont !== undefined);

    return pages;
}

async function getCatMembersPart (cat, dataStr, limit, nsStr, url, cont) {
	let params = {
        action: 'query',
        list: 'categorymembers',
        cmtitle: String(cat),
        cmlimit: String(limit),
        format: 'json'
    };

    if (nsStr !== '') {
        params.cmnamespace = nsStr;
    }
    if (dataStr !== '') {
        params.cmprop = dataStr;
    }
    if (cont !== undefined) {
        params.cmcontinue = cont;
    }

    try {
        const body = await get(url, params);
        return JSON.parse(body);
    } catch (error) {
        throw 'error in getting categorymembers: ' + error;
    }
}

function buildNamespaceStr (ns) {
    if (ns === undefined) {
        return null;
    }
    
    let output = '';

    if (ns.includeonly !== undefined) {
        if (!Array.isArray(ns.includeonly)) {
            throw 'includeonly attribute must be an array';
        }
        for (let namespace of ns.includeonly) {
            if (namespaces[namespace] === undefined) {
                throw 'invalid namespace name: ' + namespace + ' given';
            }
            output += namespaces[namespace] + '|';
        }
    } else if (ns.excludeonly !== undefined) {
        if (!Array.isArray(ns.excludeonly)) {
            throw 'excludeonly attribute must be an array';
        }
        output = '0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|';
        for (let namespace of ns.excludeonly) {
            if (namespaces[namespace] === undefined) {
                throw 'invalid namespace name: ' + namespace + ' given';
            }
            output.repclace(namespaces[namespace] + '|', '');
        }
    }

    output = output.replace(/\|$/, '');
    return output;
}

function buildDataStr (data) {
    let output = '';
    const validInputs = ['ids', 'title', 'sortkey', 'sortkeyprefix', 'type', 'timestamp'];
    for (let type of data) {
        if (type === 'ns') {
            continue;//ns info is always set by the server and removed by the bot script if wanted
        }
        if (!validInputs.includes(type)) {
            throw 'invalid type of data wanted from getCatMembers; ' + item + 
            ' is an invalid option; allowed are: \'ids\', \'title\', \'sortkey\', \'sortkeyprefix\', \'type\', \'timestamp\', \'ns\'';
        }
        output += String(type) + '|';
    }

    output = output.replace(/\|$/, '');
    return output;
}

function removeNamespaceAttr (pagesArr, data) {
    if (data.length === 1) {
        let type = data[0];
        for (let i = 0; i < pagesArr.length; i++) {
            pagesArr[i] = pagesArr[i][type];
        }
    } else {
        for (let i = 0; i < pagesArr.length; i++) {
            delete pagesArr[i].ns;
        }
    }
}