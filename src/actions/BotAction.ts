import { Bot } from '..';
import BotActionReturn from './BotActionReturn';

export abstract class BotAction {
    protected bot: Bot;
    
    protected constructor (bot: Bot) {
        this.bot = bot;
    }

	abstract exc (): Promise<BotActionReturn>;
}