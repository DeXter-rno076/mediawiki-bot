import { Query } from "../Query";

export interface MoveQuery extends Query {
    readonly from: string;
    readonly to: string;
    readonly reason: string;
    readonly movetalk: boolean;
    readonly movesubpages: boolean;
    readonly noredirect: boolean;
}