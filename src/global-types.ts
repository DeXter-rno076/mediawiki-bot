import { Template } from './BotActions/GetTemplates';

type editAction = 'edit' | 'move' | 'revert' | 'upload' | 'clientlogin';
type dataAction = 'getCatMembers' | 'getTemplates' | 'getToken' | 'getWikitext' | 'getSections' | 'getRevisions';
type mwDataAction = 'parse' | 'query' | 'expandtemplates';

export type mwActionType = editAction | mwDataAction;

export type logActionType = editAction | dataAction;

export type actionReturnType = string | string[] | undefined 
	| Section | Section[] | Page | Page[] | Template | Template[];

//export type pageIdentifier = string | number;

export type namespace = number | 'Main' | 'Talk' | 'User' | 'User talk' | 'Project talk'
	| 'File' | 'File talk' | 'MediaWiki' | 'MediaWiki talk' | 'Template' | 'Template talk'
	| 'Help' | 'Help talk' | 'Category' | 'Category talk';
export type pageType = 'file' | 'page' | 'subcat' | 'template';
export type pageListFilter = (namespace | pageType)[];

export type tokenType = 'csrf' | 'login' | 'createaccount' | 'patrol' | 'rollback' | 'userrights' | 'watch';
export type categoryName = string;

export interface Section {
	toclevel: number;
	level: string;
	line: string;
	number: string;
	index: string;
	fromtitle: string;
	byteoffset: number;
	anchor: string;
}

export class Page {
	ns: number;
	title: string;

	constructor (ns: number, title: string) {
		this.ns = ns;
		this.title = title;
	}

	toString (): string {
		return this.title;
	}
}

export interface ErrorResponse {
	error: {
		code: string,
		info: string
	}
}