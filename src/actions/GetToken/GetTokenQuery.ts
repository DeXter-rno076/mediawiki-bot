import { Query } from "../Query";

export interface GetTokenQuery extends Query {
    readonly meta: string; //tokens
    readonly type: 'csrf' | 'login' | 'createaccount' | 'patrol' | 'rollback' | 'userrights' | 'watch';
}