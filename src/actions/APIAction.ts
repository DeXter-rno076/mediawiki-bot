import { Bot } from "..";
import { BotAction } from "./BotAction";
import { Query } from "./Query";

export abstract class APIAction extends BotAction {
    protected constructor (bot: Bot) {
        super(bot);
    }

    protected abstract createQuery (): Query;
}