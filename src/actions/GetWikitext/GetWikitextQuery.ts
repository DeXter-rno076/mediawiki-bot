import { Query } from "../Query";

export interface GetWikitextQuery extends Query {
    readonly page: string;
    readonly prop: string; //wikitext
    section?: string;
}