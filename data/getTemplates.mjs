import { post } from '../getpost.mjs';

export async function _getTemplates (title, section, url, getWikitext, taskId) {
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
        reqBody = JSON.parse(await post('expandtemplates', url, params, {}, taskId));
    } catch (error) {
        throw 'error in getting xml parse tree: ' + error;
    }

    let parsedXML = parseToObjectTree(reqBody.expandtemplates.parsetree);

    return createTemplateStructure(parsedXML);
}

class TemplateObj {
    constructor(title, index) {
        this.title = title.trim();
        this.paramList = [];

        if (index !== undefined) {
            this.index = index;
        }
    }

    addParam (paramName, paramObj) {
        this[paramName] = paramObj;
        this.paramList.push(paramName);
    }

    //does not set any whitespace itself
    toWikitext (removeWhitespace) {
        let templateCode = '{{' + this.title;
        
        for (let param of this.paramList) {
            templateCode += '|';
            if (this[param].indexed) {
                templateCode += this[param];
            } else {
                if (removeWhitespace) {
                    templateCode += param.trim() + '=' + this[param].toWikitext(true).trim();
                } else {
                    templateCode += param + '=' + this[param];
                }
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
        this.templates = [];
    }

    addTempl (templObj) {
        this.templates.push(templObj);
    }

    toWikitext (removeWhitespace) {
        let wikitext = this.text;

        for (let template of this.templates) {
            let templateCode = template.toWikitext(removeWhitespace);
            wikitext = wikitext.replace('##TEMPLATE:' + template.index + '##', templateCode);
        }

        return wikitext;
    }

    toString () {
        return this.toWikitext();
    }
}

function createTemplateStructure (objectTree) {
    const templArr = [];

    if (objectTree.content.tags.length === 0) {
        return templArr;
    }

    for (let template of objectTree.content.tags) {
        if (template.title !== 'template') {
            //skip non templates
            //console.warn('unwanted tag type in root tag array (only \'template\' allowed): ' + template.title);
            continue;
        }
        let templObj = parseTemplate(template);
        templArr.push(templObj);
    }

    return templArr;
}

function parseTemplate (templCode) {
    let templObject = new TemplateObj(getTemplTitle(templCode), templCode.index);

    const paramArr = templCode.content.tags.filter((item) => {
        return item.title === 'part';
    });

    for (let param of paramArr) {
        setParam(templObject, param);
    }

    return templObject;
}

function setParam (obj, paramCode) {
    let { name, isIndexed } = getParamName(paramCode);
    
    let paramObj = new ParamObj(name, isIndexed);
    const valueObj = paramCode.content.tags.find((item) => {
        return item.title === 'value';
    });

    if (valueObj.content !== undefined) {
        paramObj.text = valueObj.content.text;

        for (let tag of valueObj.content.tags) {
            if (tag.title !== 'template') {
                //TODO remove this after testing
                console.warn('unknown tag type in param value: ' + tag.title);
                continue;
            }
            paramObj.addTempl(parseTemplate(tag));
        }
    } else {
        //template parameters are sometimes set without a value
        paramObj.text = '';
    }

    obj.addParam(paramObj.title, paramObj);
}

function getTemplTitle (code) {
    let nameObj = code.content.tags.find((item) => {
        return item.title === 'title';
    })

    return nameObj.content.text;
}

function getParamName (paramCode) {
    let nameObj = paramCode.content.tags.find((item) => {
        return item.title === 'name';
    });

    if (nameObj.attr !== undefined && nameObj.attr.index !== undefined){
        //checks if the param name is an index
        return {
            name: nameObj.attr.index,
            isIndexed: true
        };
    }

    return {
        name: nameObj.content.text,
        isIndexed: false
    };
}

//======================================================================
//kinda general xml parser (some aspects are specialised for this use case)
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

    parseTagCode(rootObj, xmlCode.substring(xmlCode.indexOf('>') + 1));
    
    replaceUnicodeAndHTMLEntities(rootObj);//replace &gt; &lt; &quot; and unicode

    return rootObj;
}

function parseTagCode (curRoot, code) {
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
    rootContent.text += '##TEMPLATE:' + tagIndex + '##';

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
    rootContent.text += '##TEMPLATE:' + tagIndex + '##';

    //if tag has attributes, attr = {} tagObj is set and the attributes get added with their values
    handleAttributes(tagObj, code);//< and > at start and end shouldn't cause problems

    let openingTagLength = code.indexOf('>');
    let tagCode = code.substring(openingTagLength + 1);
    //returns something because the i var of the loop in the calling function must be increased by the length of the handled tag
    //otherwise it would handle the tag when it finds the < and then it would just continue with the character after the <
    return openingTagLength + parseTagCode(tagObj, tagCode);//handle the content inside the currently targeted tag
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

function replaceUnicodeAndHTMLEntities (rootObj) {
    if (rootObj.content === undefined) {
        return;
    }
    const rootContent = rootObj.content;
    
    //replacing unicode
    rootContent.text = rootContent.text.normalize();
    //replacinc common HTML entities
    //TODO doesn't work properly
    rootContent.text = rootContent.text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    for (let tag in rootObj.content.tags) {
        replaceUnicodeAndHTMLEntities(tag);
    }
}