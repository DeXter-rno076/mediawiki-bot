import { mwActionType } from "../global-types";

export interface Query {
    readonly action: mwActionType;
    readonly format: string;
    assert?: string;
    token?: string;
    logintoken?: string;
}