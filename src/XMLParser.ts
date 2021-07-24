interface TagContent {
	text: string;
	tags: Tag[]
}

abstract class Tag {
	title: string;
	index: number;
	attributes: Map<string, string> = new Map();

	constructor (title: string, index: number) {
		this.title = title;
		this.index = index;
	}
}

export class NormalTag extends Tag {
	singleTag = false;
	content: TagContent = {
		text: '',
		tags: []
	};
}

class SingleTag extends Tag {
	singleTag = true;
}

export class XMLParser {
	xmlCode: string;

	constructor (xml: string) {
		this.xmlCode = xml.replace(/\\"/g, '"');
	}

	parse (): NormalTag {
		const xml = this.xmlCode;
		const root = new NormalTag('root', 0);
		this.handleAttributes(root, xml);
		this.parseTagCode(root, xml.substring(xml.indexOf('>') + 1));
		this.replaceUnicodeAndHTMLEntities(root);
		return root;
	}

	parseTagCode (curRoot: NormalTag, xml: string): number {
		let indexPointer = 0;

		//end of xml string probably wont be reached because of the return condition
		while (indexPointer < xml.length) {
			const nextTag = xml.indexOf('<', indexPointer);
			const pureText = xml.substring(indexPointer, nextTag);
			curRoot.content.text += pureText;

			if (xml.charAt(nextTag + 1) === '/') {
				//closing tag reached
				const closingTagEnd = xml.indexOf('>', nextTag);
				return closingTagEnd + 1;
			}

			if (this.isSingleTag(xml.substring(nextTag))) {
				this.handleSingleTag(curRoot, xml.substring(nextTag));
				const nestedTagEnd = xml.indexOf('/>', indexPointer);
				indexPointer = nestedTagEnd + 2;
			} else {
				const nestedTagLength = this.handleNormalTag(curRoot, xml.substring(nextTag));
				indexPointer += pureText.length + nestedTagLength;
			}
		}
		return xml.length;
	}

	handleNormalTag (root: NormalTag, xml: string): number {
		const rootContent = root.content;

		const tagName = this.getNormalTagName(xml);
		const tagIndex = rootContent.tags.length;
		const tag = new NormalTag(tagName, tagIndex);

		rootContent.tags.push(tag);
		rootContent.text += '##TAG:' + tagIndex + '##';

		this.handleAttributes(tag, xml);

		const openingTagEnd = xml.indexOf('>');
		const openingTagLength = openingTagEnd + 1;
		const contentPlusEndLength = this.parseTagCode(tag, xml.substring(openingTagEnd + 1));
		return openingTagLength + contentPlusEndLength;
	}

	handleSingleTag (root: NormalTag, xml: string) {
		const rootContent = root.content;
		
		const tagName = this.getSingleTagName(xml);
		const tagIndex = rootContent.tags.length;
		const tag = new SingleTag(tagName, tagIndex);

		rootContent.tags.push(tag);
		rootContent.text += '##TAG:' + tagIndex + '##';

		this.handleAttributes(tag, xml);
	}

	handleAttributes (tag: Tag, xml: string) {
		const openingTagCode = xml.substring(1, xml.indexOf('>'));
		const attributes = openingTagCode.split(' ');
		if (attributes.length === 1) {
			//no attributes
			return;
		}

		const attrRegex = /(.+?)="(.+?)"/;
		for (let i = 1; i < attributes.length; i++) {
			if (i + 1 === attributes.length && attributes[i] === '/') {
				//break if a single tag has a form of <tagName a="b" /> with space before last /
				break;
			}

			const regexRes = attrRegex.exec(attributes[i]);
			if (regexRes === null) {
				console.error('unexpected string in opening tag code: ' + attributes[i]);
				continue;
			}

			const attrName = regexRes[1];
			const attrValue = regexRes[2];
			tag.attributes.set(attrName, attrValue);
		}
	}

	getNormalTagName (xml: string): string {
		const nextSpace = xml.indexOf(' ');
		const nextGt = xml.indexOf('>');

		if (nextSpace !== -1 && nextSpace < nextGt) {
			return xml.substring(1, nextSpace);
		} else {
			return xml.substring(1, nextGt);
		}
	}

	getSingleTagName (xml: string): string {
		const nextSpace = xml.indexOf(' ');
		const nextSlash = xml.indexOf('/');

		if (nextSpace !== -1 && nextSpace < nextSlash) {
			return xml.substring(1, nextSpace);
		} else {
			return xml.substring(1, nextSlash);
		}
	}

	isSingleTag (xml: string): boolean {
		if (xml.indexOf('/>') === -1) {
			return false;
		}
		return xml.indexOf('/>') < xml.indexOf('>');
	}

	replaceUnicodeAndHTMLEntities (root: NormalTag) {
		if (root.content === undefined) {
			return;
		}

		const rootContent = root.content;
		rootContent.text = rootContent.text.normalize();
	}
}