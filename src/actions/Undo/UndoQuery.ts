import { Query } from "../Query";

export interface UndoQuery extends Query {
    readonly title: string;
    readonly undo: number;
    readonly bot: boolean;
}