import { Query } from "../Query";

export interface GetCatMembersQuery extends Query {
    readonly cmtitle: string;
    readonly cmnamespace: string;
    readonly cmlimit: string;
    readonly cmprop: string;
    readonly list: string;
    cmcontinue?: string;
}