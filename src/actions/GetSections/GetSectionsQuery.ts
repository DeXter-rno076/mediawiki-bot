import { Query } from "../Query";

export interface GetSectionsQuery extends Query {
    readonly prop: string; //sections
    readonly page: string;
}