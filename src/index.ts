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

export { Section, Page, tokenType, catMemberType } from "./global-types";