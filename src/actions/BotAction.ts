import { Bot } from '..';
import BotActionReturn from './BotActionReturn';

export abstract class BotAction {
    bot: Bot;
    
    constructor (bot: Bot) {
        this.bot = bot;
    }

	abstract exc (): Promise<BotActionReturn>;
}