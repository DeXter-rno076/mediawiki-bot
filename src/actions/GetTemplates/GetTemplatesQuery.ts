import { Query } from "../Query";

export interface GetTemplatesQuery extends Query {
    readonly title: string;
    readonly prop: string;
    readonly text: string;
}