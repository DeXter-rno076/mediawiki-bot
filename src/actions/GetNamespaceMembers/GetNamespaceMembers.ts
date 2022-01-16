import { Bot, Page } from "../..";
import { NAMESPACES } from "../../constants";
import { namespace } from "../../global-types";
import { isNum } from "../../utils";
import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";
import { GetNamespaceMembersQuery } from "./GetNamespaceMembersQuery";

export class GetNamspaceMembers extends APIAction {
    private namespaceIndex: number;
    
    private currentContinueKey = '';

    private namespaceMembers: Page[] = [];

    public constructor (bot: Bot, ns: namespace) {
        super(bot);
        //todo check for invalid ns values
        if (isNum(ns)) {
			this.namespaceIndex = ns as number;
		} else {
			this.namespaceIndex = NAMESPACES[ns];
		}
    }

    public async exc (): Promise<BotActionReturn> {
        do {
            await this.getNamespaceMembersPart();
        } while (this.currentContinueKey !== '');

        return new BotActionReturn(undefined, this.namespaceMembers);
    }

    private async getNamespaceMembersPart () {
        const getNamespaceMembersQuery = this.createQuery();
        if (this.currentContinueKey !== '') {
            getNamespaceMembersQuery.apcontinue = this.currentContinueKey;
        }

        const res = JSON.parse(await this.bot.getRequestSender().get(getNamespaceMembersQuery));
        this.addNamespaceMembers(res.query.allpages);

        if (res.continue !== undefined) {
            this.currentContinueKey = res.continue.apcontinue;
        } else {
            this.currentContinueKey = '';
        }
    }

    private addNamespaceMembers (namespaceMembersPart) {
        for (let obj of namespaceMembersPart) {
            const namespaceMember = new Page(obj.ns, obj.title);
            this.namespaceMembers.push(namespaceMember);
        }
    }

    protected createQuery (): GetNamespaceMembersQuery {
        const query: GetNamespaceMembersQuery = {
            action: 'query',
            list: 'allpages',
            aplimit: 'max',
            apnamespace: String(this.namespaceIndex),
            format: 'json'
        };
        return query;
    }
}