import { get } from '../getpost.mjs';

/*
Notes: 
returns Array of template objects (use some kind of class to create this)
[
    {
        title: <TemplateName>
        <param1>: {
            text: 'blablabla some text ##TEMPLATE1## blablabla',
            TEMPLATE1: {
                title: ...
                ...
            }
            toString: function () {
                return this.text;
            }
        }
        toWikitext: () => {
            transfer this template into valid wikitext
        }
    }
]
*/

export async function _getTemplates (title, section, url, getWikitext) {
    const articleText = await getWikitext(title, section, url);

    let params = {
        action: 'expandtemplates',
        title: String(title),
        text: articleText,
        prop: 'parsetree',
        format: 'json'
    };

    let reqBody;
    try {
        reqBody = await get(url, params);
    } catch (error) {
        throw 'error in getting xml parse tree: ' + error;
    }

    return parseXMLtoJSON(reqBody);
}

function parseXMLtoJSON (reqBody) {
    const xmlParsetree = reqBody.expandtemplates.parsetree;
    let content = /<root>(.+)<\/root>/.exec(xmlParsetree)['1'];

    const returnArr = [];

    //TODO won't work with regex
    let templRegex = /<template>(.+?)<\/template>/;//TODO handle <template linestart="x">
    while (templRegex.test(content)) {
        returnArr.push(parseTemplate(templRegex.exec(content)['1']));

        content = content.replace(templRegex, '');
    }

    return returnArr;
}

function parseTemplate (templCode) {
    let returnObj = new TemplateObj(getTemplTitle(templCode));

    //TODO won't work with regex
    let paramRegex = /<part>(.+?)<\/part>/;
    while (paramRegex.test(templCode)) {
        parseParam(returnObj, paramRegex.exec(templCode)['1']);
        templCode = templCode.replace(paramRegex, '');
    }

    return returnObj;
}

function parseParam (obj, paramCode) {
    //TODO
    //don't forgat to set text parameter
    //don't forget to replace templates in text with ##TEMPLATE<n>##

    obj.addParam(paramName, paramObj);
}

class TemplateObj {
    constructor(title) {
        this.title = title;
        this.paramList = [];
    }

    addParam (paramName, paramObj) {
        this[paramName] = paramObj;
        this.paramList.push(paramName);
    }

    toWikitext () {
        let templateCode = '{{' + this.title;
        
        for (let param of this.paramList) {
            templateCode += '|';
            if (param.indexed) {
                templateCode += this[param];
            } else {
                templateCode += param + '=' + this[param];
            }
        }

        templateCode += '}}';
        return templateCode;
    }

    toString () {
        return this.toWikitext();
    }
}

class ParamObj {
    constructor (title, indexed) {
        this.title = title;
        this.indexed = indexed;
        this.text = '';
    }

    toWikitext () {
        //TODO
        //return this.text with the template placeholders replaced with the templates in wikitext format 
    }

    toString () {
        return this.text;
    }
}


//======================================================================
//general xml parser
//todo: completely understand the index stuff and comment it (instead of only changing something because it'll probably fix it without completely understanding why)

function parseToObjectTree (xmlCode) {
    let rootObj = {
        title: 'root',
        content: {
            text: '',
            tags: []
        }
    };
    handleAttributes(rootObj, xmlCode);//set attributes of the root tag if there are any

    doStuff(rootObj, xmlCode.substring(xmlCode.indexOf('>') + 1));
    
    return rootObj;
}

function doStuff (curRoot, code) {
    for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) !== '<') {
            curRoot.content.text += code.charAt(i);
        } else {//start of a tag reached
            if (code.charAt(i + 1) === '/') {//closing tag reached
                let closingTagEndIndex = code.indexOf('>', i);
                return closingTagEndIndex + 1;
            }

            const followingCode = code.substring(i);
            if (checkSingleTag(followingCode)) {//tag without closing counterpart found
                i += handleSingleTag(curRoot, followingCode);
            } else {
                i += handleNormalTag(curRoot, followingCode);
                //set i to index of character after the handled tag in order to skip the characters of the handled tag
            }
        }
    }
}

//mostly like handleNormalTag() except of the non existing tag content is left out
function handleSingleTag (curRoot, code) {
    const rootContent = curRoot.content;
    let tagName = getSingleTagName(code);
    let tagIndex = rootContent.tags.length;

    let tagObj = {
        title: tagName,
        index: tagIndex,
    }

    rootContent.tags.push(tagObj);
    rootContent.text += '##PLACEHOLDER:' + tagIndex + '##';

    handleAttributes(tagObj, code);
    return code.indexOf('>');
}

function handleNormalTag (curRoot, code, tagCounter) {
    const rootContent = curRoot.content;
    let tagName = getNormalTagName(code);
    let tagIndex = rootContent.tags.length;//gets the index of the current tag and increments the counter

    let tagObj = {
        title: tagName,
        index: tagIndex,
        content: {
            text: '',
            tags: []
        }
    };

    rootContent.tags.push(tagObj);
    rootContent.text += '##PLACEHOLDER:' + tagIndex + '##';

    //if tag has attributes, attr = {} tagObj is set and the attributes get added with their values
    handleAttributes(tagObj, code);//< and > at start and end shouldn't cause problems

    let openingTagLength = code.indexOf('>');
    let tagCode = code.substring(openingTagLength + 1);
    //returns something because the i var of the loop in the calling function must be increased by the length of the handled tag
    //otherwise it would handle the tag when it finds the < and then it would just continue with the character after the <
    return openingTagLength + doStuff(tagObj, tagCode);//handle the content inside the currently targeted tag
}

function handleAttributes (obj, code) {
    let openingTagCode = code.substring(1, code.indexOf('>'));
    let arr = openingTagCode.split(' ');
    if (arr.length === 1) {
        return;//no attributes
    }
    obj.attr = {};
    let regex = /(.+?)="(.+?)"/;

    for (let i = 1; i < arr.length; i++) {
        let regexObj = regex.exec(arr[i]);
        let attrName = regexObj['1'];
        let attrValue = regexObj['2'];
        obj.attr[attrName] = attrValue;
    }
}

function getNormalTagName (str) {
    let nextSpace = str.indexOf(' ');
    let nextidontknow = str.indexOf('>');

    //substring starts at 1 in order to skip the <
    if (nextSpace !== -1 && nextSpace < nextidontknow) {
        return str.substring(1, nextSpace);
    } else {
        return str.substring(1, nextidontknow);
    }
}

//mostly like getNormalTagName()
function getSingleTagName (str) {
    let nextSpace = str.indexOf(' ');
    let nextSlash = str.indexOf('/');

    if (nextSpace !== -1 && nextSpace < nextSlash) {
        return str.substring(1, nextSpace);
    } else {
        return str.substring(1, nextSlash);
    }
}

function checkSingleTag (str) {
    let nextSlash = str.indexOf('/');
    let nextIdontknow = str.indexOf('>');

    if (nextSlash !== -1 && nextSlash < nextIdontknow) {
        return true;
    } else {
        return false;
    }
}