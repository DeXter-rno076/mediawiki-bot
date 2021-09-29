export { Bot } from "./Bot";
export { Logger } from "./Logger";

export { Template, Parameter } from "./BotActions/GetTemplates";

export { 
	UnsolvableErrorError,
 	BadTokenError,
	PageDoesNotExistError,
	CantGetTokenError,
	ProtectedPageError,
	SectionNotFoundError,
	NoRevIdError,
	UndoFailureError
} from "./errors";

export { Section, CatMember, tokenType, catMemberType } from "./global-types";