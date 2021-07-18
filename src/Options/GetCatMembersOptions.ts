import Options from './Options';
import { namespace } from '../global-types';

const namespaces = {
	'Main': 0,
	'Talk': 1,
	'User': 2,
	'User talk': 3,
	'Project': 4,
	'Project talk': 5,
	'File': 6,
	'File talk': 7,
	'MediaWiki': 8,
	'MediaWiki talk': 9,
	'Template': 10,
	'Template talk': 11,
	'Help': 12,
	'Help talk': 13,
	'Category': 14,
	'Category talk': 15
};

type catMemberType = 'file' | 'page' | 'subcat';

export default class GetCatMembersOptions extends Options {
	cmtitle: string;
	cmlimit: number | 'max' = 'max';
	cmnamespace?: string;
	cmtype?: catMemberType = 'page';
	cmprop = 'title';
	list = 'categorymembers';
	cmcontinue: string = '';

	constructor (category: string, ns?: namespace[]) {
		super('query', 'getCatMembers');
		this.cmtitle = category;
		if (ns !== undefined) {
			this.cmnamespace = '';
			for (let item of ns) {
				this.cmnamespace += ',' + namespaces[item];
			}
		}
	}

	setLimit (limit: number | 'max') {
		this.cmlimit = limit;
	}

	setType (type: catMemberType) {
		this.cmtype = type;
	}

	setContinue (key: string) {
		this.cmcontinue = key;
	}
}