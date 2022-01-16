import { Query } from "../Query";

export interface LoginQuery extends Query {
    readonly username: string;
    readonly password: string;
    readonly loginreturnurl: string;
}