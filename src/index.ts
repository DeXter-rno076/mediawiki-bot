export { Bot } from "./Bot";
export { Options } from "./Options/Options";
export { EditOptions } from "./Options/EditOptions";
export { GetCatMembersOptions } from "./Options/GetCatMembersOptions";
export { GetSectionsOptions } from "./Options/GetSectionsOptions";
export { GetTemplatesOptions } from "./Options/GetTemplatesOptions";
export { GetWikitextOptions } from "./Options/GetWikitextOptions";
export { MoveOptions } from "./Options/MoveOptions";
export { RevertOptions } from "./Options/RevertOptions";
export { UploadOptions } from "./Options/UploadOptions";

export { Template, Parameter } from "./BotActions/GetTemplates";

export { 
	UnsolvableErrorError,
 	BadTokenError,
	PageDoesNotExistError,
	CantGetTokenError,
	ProtectedPageError
} from "./errors";

export { Section, CatMember } from "./global-types";