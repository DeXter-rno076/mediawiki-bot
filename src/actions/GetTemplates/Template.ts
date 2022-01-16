import { Parameter } from "./Parameter";

export class Template {
	private _title: string;
	private index: number;
	private params: Parameter[] = [];

	public constructor (title: string, index: number) {
		this._title = title;
		this.index = index;
	}

	public get title (): string {
		return this._title.trim();
	}

    public getIndex (): number {
        return this.index;
    }

    public getParams (): Parameter[] {
        return this.params;
    }

	//supposed to be called by the user
	//every parameter name should be unique (no need to optionally return arrays)
	//for indexed params just use their number (keep in mind: PARAM INDICES START AT 1)
	public getParam (name: string): Parameter | null {
		const param = this.params.find((item) => {
			return item.getTitle() === name;
		});
		if (param === undefined) {
			return null;
		}
		return param;
	}

	public addParam (param: Parameter) {
		this.params.push(param);
	}

	public toWikitext (removeWhitespace: boolean) {
        let templateCode = '{{' + this._title;
		if (removeWhitespace) {
			templateCode = templateCode.trim();
		}

        for (let param of this.params) {
            templateCode += '|';
            if (param.getIndexed()) {
				if (removeWhitespace) {
					templateCode += String(param).trim();
				} else {
					templateCode += String(param);
				}
            } else {
                if (removeWhitespace) {
                    templateCode += param.getTitle().trim() + '=' + param.toWikitext(true).trim();
                } else {
                    templateCode += param.getTitle() + '=' + String(param);
                }
            }
        }

        templateCode += '}}';
        return templateCode;
    }

	public toString (): string {
		return this.toWikitext(false);
	}
}