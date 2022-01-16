import { Template } from "./Template";

export class Parameter {
	private title: string;
	private indexed: boolean;
	private text: string = '';
	private templates: Template[] = [];

	public constructor (title: string, indexed: boolean) {
		this.title = title;
		this.indexed = indexed;
	}

    public getTitle (): string {
        return this.title;
    }

    public getIndexed (): boolean {
        return this.indexed;
    }

    public getText (): string {
        return this.text;
    }

    public getTemplates (): Template[] {
        return this.templates;
    }

	public addTemplate (templ: Template) {
		this.templates.push(templ);
	}

	public setText (text: string) {
		this.text = text;
	}

	public toWikitext (removeWhitespace: boolean): string {
		let wikitext = this.text;
		if (removeWhitespace) {
			wikitext = wikitext.trim();
		}

        for (let template of this.templates) {
            let templateCode = template.toWikitext(removeWhitespace);
            wikitext = wikitext.replace('##TEMPLATE:' + template.getIndex() + '##', templateCode);
        }

        return wikitext;
	}

	public toString (): string {
		return this.toWikitext(false);
	}
}