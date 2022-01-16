import { Query } from "../Query";

export interface UploadQuery extends Query {
    readonly filename: string;
    readonly comment: string;
    url?: string;
    readonly ignorewarnings: boolean;
}