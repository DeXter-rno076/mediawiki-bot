import { Options } from '../Options';
import { namespace, pageListFilter, pageType } from '../../global-types';
import { NAMESPACES } from '../../constants';
import { isNum, isPageType } from '../../utils';

export class GetCatMembersOptions extends Options {
	cmtitle: string;

	cmnamespace = '0';
	cmcontinue: string = '';
    readonly cmlimit = 'max';
	readonly cmprop = 'title';
	readonly list = 'categorymembers';

	constructor (category: string, types?: pageType | pageListFilter) {
		super('query');
		this.cmtitle = category;

        if (types !== undefined) {
            if (Array.isArray(types)) {
                this.setNamespaces(types as pageListFilter);
            } else {
                const nsNumber = this.pageTypeToNS(types);
                if (nsNumber === null) {
                    console.error('GetCatMembersOptions: page type ' + types + ' has invalid value');
                } else {
                    this.cmnamespace = String(nsNumber);
                }
            }
        }
	}

    private pageTypeToNS (type: pageType): number | null {
        switch (type) {
            case 'file':
                return NAMESPACES['File'];
            case 'page':
                return NAMESPACES['Main'];
            case 'subcat':
                return NAMESPACES['Category'];
            case 'template':
                return NAMESPACES['Template'];
            default:
                return null;
        }
    }

	private setNamespaces (types: pageListFilter) {
        if (types.length === 0) {
            return;
        }
        this.cmnamespace = '';

        //to prevent a | prefix (unwanted and would create a mediawiki warning)
        const firstNSNumber = this.nsIdentifierToNSNumber(types[0]);
        if (firstNSNumber !== null) {
            this.cmnamespace = String(firstNSNumber);
        }

		for (let i = 1; i < types.length; i++) {
			const nsIdentifier = types[i];
            const nsNumber = this.nsIdentifierToNSNumber(nsIdentifier);
            if (nsNumber === null) {
                continue;
            }

			this.cmnamespace += '|' + nsNumber;
		}
	}

    private nsIdentifierToNSNumber (nsIdentifier: pageType | namespace): number | null {
        if (isPageType(nsIdentifier)) {
            const nsValue = this.pageTypeToNS(nsIdentifier as pageType);
            if (nsValue === null) {
                console.error('setNamespaces: page type ' + nsIdentifier + ' has invalid value');
                return null;
            }
            return nsValue;
        }
        if (!isNum(nsIdentifier)) {
            return NAMESPACES[nsIdentifier];
        }
        return nsIdentifier as number;
    }

	public setContinue (key: string) {
		this.cmcontinue = key;
	}
}