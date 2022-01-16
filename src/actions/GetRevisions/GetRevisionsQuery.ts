import { Query } from "../Query";

export interface GetRevisionsQuery extends Query {
    readonly list: string; //usercontribs
    readonly uclimit: string; //max
    ucend?: string;
    ucstart?: string;
    readonly ucuser: string;
    readonly ucprop: string; //ids|title
    uccontinue?: string;
}