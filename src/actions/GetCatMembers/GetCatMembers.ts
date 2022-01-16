import BotActionReturn from "../BotActionReturn";
import { namespace, Page, pageListFilter } from "../../global-types";
import { APIAction } from "../APIAction";
import { Bot, pageType } from "../..";
import { NAMESPACES } from "../../constants";
import { isNum, isPageType, pageTypeToNS } from "../../utils";
import { GetCatMembersQuery } from "./GetCatMembersQuery";

export class GetCatMembers extends APIAction {
    private categoryName: string;
    private namespacesList = '0';

	private catMembers: Page[] = [];

    private currentContinueKey = '';

	public constructor (bot: Bot, category: string, types?: pageType | pageListFilter) {
		super(bot);
        this.categoryName = category;
        if (types !== undefined) {
            this.setNamespacesList(types);
        }
	}

	public async exc (): Promise<BotActionReturn> {
		do {
			await this.getCatMembersPart();
		} while (this.currentContinueKey !== '');

		return new BotActionReturn(undefined, this.catMembers);
	}

	private async getCatMembersPart () {
        const getCatMembersQuery = this.createQuery();
        if (this.currentContinueKey !== '') {
            getCatMembersQuery.cmcontinue = this.currentContinueKey;
        }

		const res = JSON.parse(await this.bot.getRequestSender().get(getCatMembersQuery));
		if (res.error !== undefined && res.error.code === 'invalidcategory') {
            //todo outsource this into own exception
			throw `invalid category name given: ${this.categoryName}. Maybe you forgot the namespace prefix?`
		}

		this.addCatMembers(res.query.categorymembers);

		if (res.continue !== undefined) {
			this.currentContinueKey = res.continue.cmcontinue;
		} else {
            this.currentContinueKey = '';
        }
	}

	private addCatMembers (catMembersPart) {
		for (let obj of catMembersPart) {
			const catMember = new Page(obj.ns, obj.title);
			this.catMembers.push(catMember);
		}
	}

    private setNamespacesList (types: pageType | pageListFilter) {
        if (Array.isArray(types)) {
            this.setPageListFilterAsNamespaceList(types as pageListFilter);
        } else {
            const nsNumber = pageTypeToNS(types);
            if (nsNumber === null) {
                console.error('GetCatMembersOptions: page type ' + types + ' has invalid value');
            } else {
                this.namespacesList = String(nsNumber);
            }
        }
    }

    private setPageListFilterAsNamespaceList (types: pageListFilter) {
        if (types.length === 0) {
            return;
        }
        this.namespacesList = '';

        //to prevent a | prefix (unwanted and would create a mediawiki warning)
        const firstNSNumber = this.nsIdentifierToNSNumber(types[0]);
        if (firstNSNumber !== null) {
            this.namespacesList = String(firstNSNumber);
        }

		for (let i = 1; i < types.length; i++) {
			const nsIdentifier = types[i];
            const nsNumber = this.nsIdentifierToNSNumber(nsIdentifier);
            if (nsNumber === null) {
                continue;
            }

			this.namespacesList += '|' + nsNumber;
		}
	}

    private nsIdentifierToNSNumber (nsIdentifier: pageType | namespace): number | null {
        if (isPageType(nsIdentifier)) {
            const nsValue = pageTypeToNS(nsIdentifier as pageType);
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

    protected createQuery (): GetCatMembersQuery {
        const query: GetCatMembersQuery = {
            action: 'query',
            cmtitle: this.categoryName,
            cmlimit: 'max',
            cmprop: 'title',
            list: 'categorymembers',
            cmnamespace: this.namespacesList,
            format: 'json'
        }
        return query;
    }
}