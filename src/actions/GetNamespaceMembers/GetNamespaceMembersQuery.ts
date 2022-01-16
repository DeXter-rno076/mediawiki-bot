import { Query } from "../Query";

export interface GetNamespaceMembersQuery extends Query {
    readonly list: string;
    readonly apnamespace: string;
    readonly aplimit: string;
    apcontinue?: string;
}