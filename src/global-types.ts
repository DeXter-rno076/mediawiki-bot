import { Template } from './BotActions/GetTemplates';

type editAction = 'edit' | 'move' | 'revert' | 'upload' | 'clientlogin';
type dataAction = 'getCatMembers' | 'getTemplates' | 'getToken' | 'getWikitext' | 'getSections' | 'getRevisions';
type mwDataAction = 'parse' | 'query' | 'expandtemplates';

export type mwActionType = editAction | mwDataAction;

export type logActionType = editAction | dataAction;

export type actionReturnType = string | string[] | undefined 
	| Section | Section[] | CatMember | CatMember[] | Template | Template[];

//export type pageIdentifier = string | number;

export type namespace = number | 'Main' | 'Talk' | 'User' | 'User talk' | 'Project talk'
	| 'File' | 'File talk' | 'MediaWiki' | 'MediaWiki talk' | 'Template' | 'Template talk'
	| 'Help' | 'Help talk' | 'Category' | 'Category talk';

export type tokenType = 'csrf' | 'login';

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

export interface CatMember {
	ns: number;
	title: string;
}

export interface ErrorResponse {
	error: {
		code: string,
		info: string
	}
}

export type catMemberType = 'file' | 'page' | 'subcat';