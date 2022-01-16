import { Bot } from "..";
import { BotAction } from "./BotAction";
import { Query } from "./Query";

export abstract class APIAction extends BotAction {
    constructor (bot: Bot) {
        super(bot);
    }

    abstract createQuery (): Query;
}