import { Options } from './Options';
import { namespace, catMemberType } from '../global-types';
import { NAMESPACES } from '../constants';

export class GetCatMembersOptions extends Options {
	cmtitle: string;
	cmlimit: number | 'max' = 'max';
	cmnamespace? = '0';
	cmtype?: catMemberType;
	cmprop = 'title';
	list = 'categorymembers';
	cmcontinue: string = '';

	constructor (category: string, type?: catMemberType, ns?: namespace[]) {
		super('query');
		this.cmtitle = category;
		if (type !== undefined) {
			delete this.cmnamespace;
			this.cmtype = type;
		}

		if (ns !== undefined) {
			this.setNamespaces(ns);
		}
	}

	setNamespaces (ns: namespace[]) {
		let nsIdentifier = ns[0];
		if (isNaN(Number(ns[0]))) {
			nsIdentifier = NAMESPACES[ns[0]];
		}

		this.cmnamespace = String(nsIdentifier);
		
		for (let i = 1; i < ns.length; i++) {
			let nsIdentifier = ns[i];
			if (isNaN(Number(ns[i]))) {
				nsIdentifier = NAMESPACES[ns[i]];
			}
			this.cmnamespace += '|' + nsIdentifier;
		}
	}

	setLimit (limit: number | 'max') {
		this.cmlimit = limit;
	}

	setContinue (key: string) {
		this.cmcontinue = key;
	}
}