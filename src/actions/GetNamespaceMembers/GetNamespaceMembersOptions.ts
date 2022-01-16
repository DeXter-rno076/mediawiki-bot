import { Options } from '../Options';
import { NAMESPACES } from '../../constants';
import { isNum } from '../../utils';
import { namespace } from '../../global-types';

export class GetNamespaceMembersOptions extends Options {
	list = 'allpages';
	apcontinue?: string;
	apnamespace = 0;
	aplimit = 'max';

	constructor ( ns: namespace ) {
		super( 'query' );
		
		if ( isNum( ns ) ) {
			this.apnamespace = ns as number;
		} else {
			this.apnamespace = NAMESPACES[ ns ];
		}
	}

	setContinue ( continueKey: string ) {
		this.apcontinue = continueKey;
	}
}