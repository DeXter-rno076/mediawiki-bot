import { NAMESPACES } from "../../constants";
import { categoryName, namespace, pageType } from "../../global-types";
import { isNum, isNamespace, pageTypeToNS } from "../../utils";

export class GetPagesOptions {
/*     private namespacesFilter: namespace[];
    private categories: categoryName[];
    private namespaces: namespace[]; */

    public constructor (
        groupIdentifier: 'all' | namespace | categoryName | (namespace | categoryName)[],
        types?: pageType | namespace | (pageType | namespace)[]
    ) {
        if (types !== undefined) {
            this.setTypesToNSList(types);
        }

        if (groupIdentifier === 'all') {
            //all
        } else if (Array.isArray(groupIdentifier)) {
            //array
        } else if (isNum(groupIdentifier) || NAMESPACES[groupIdentifier] !== undefined) {
            //namespace
        } else {
            //category name
        }
    }

    private setTypesToNSList (types: pageType | namespace | (pageType | namespace)[]) {
        const nsList: namespace[] = [];
        if (!Array.isArray(types)) {
            types = [types];
        }
        for (const pageTypeIdentifier of types) {
            if (isNamespace(pageTypeIdentifier)) {
                nsList.push(pageTypeIdentifier as namespace);
            } else {
                const typeNamespace = pageTypeToNS(pageTypeIdentifier as pageType);
                if (typeNamespace === null) {
                    console.error('pageTypesToNSList: invalid page type: ' + pageTypeIdentifier);
                    continue;
                }
                nsList.push(typeNamespace);
            }
        }
        //this.namespacesFilter = nsList;
    }

}