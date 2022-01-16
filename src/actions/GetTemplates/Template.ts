import { Parameter } from "./Parameter";

export class Template {
	_title: string;
	index: number;
	params: Parameter[] = [];

	constructor (title: string, index: number) {
		this._title = title;
		this.index = index;
	}

	get title (): string {
		return this._title.trim();
	}

	//supposed to be called by the user
	//every parameter name should be unique (no need to optionally return arrays)
	//for indexed params just use their number (keep in mind: PARAM INDICES START AT 1)
	getParam (name: string): Parameter | null {
		const param = this.params.find((item) => {
			return item.title === name;
		});
		if (param === undefined) {
			return null;
		}
		return param;
	}

	addParam (param: Parameter) {
		this.params.push(param);
	}

	toWikitext (removeWhitespace: boolean) {
        let templateCode = '{{' + this._title;
		if (removeWhitespace) {
			templateCode = templateCode.trim();
		}

        for (let param of this.params) {
            templateCode += '|';
            if (param.indexed) {
				if (removeWhitespace) {
					templateCode += String(param).trim();
				} else {
					templateCode += String(param);
				}
            } else {
                if (removeWhitespace) {
                    templateCode += param.title.trim() + '=' + param.toWikitext(true).trim();
                } else {
                    templateCode += param.title + '=' + String(param);
                }
            }
        }

        templateCode += '}}';
        return templateCode;
    }

	toString (): string {
		return this.toWikitext(false);
	}
}