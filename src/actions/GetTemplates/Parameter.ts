import { Template } from "./Template";

export class Parameter {
	title: string;
	indexed: boolean;
	text: string = '';
	templates: Template[] = [];

	constructor (title: string, indexed: boolean) {
		this.title = title;
		this.indexed = indexed;
	}

	addTemplate (templ: Template) {
		this.templates.push(templ);
	}

	setText (text: string) {
		this.text = text;
	}

	toWikitext (removeWhitespace: boolean): string {
		let wikitext = this.text;
		if (removeWhitespace) {
			wikitext = wikitext.trim();
		}

        for (let template of this.templates) {
            let templateCode = template.toWikitext(removeWhitespace);
            wikitext = wikitext.replace('##TEMPLATE:' + template.index + '##', templateCode);
        }

        return wikitext;
	}

	toString (): string {
		return this.toWikitext(false);
	}
}