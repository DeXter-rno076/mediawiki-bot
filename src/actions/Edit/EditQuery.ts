import { Query } from "../Query";

export interface EditQuery extends Query {
    readonly title: string;
    readonly text: string;
    readonly summary: string;
    readonly nocreate: boolean;
    section?: string;
    readonly bot: boolean;
}