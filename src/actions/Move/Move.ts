import { APIAction } from "../APIAction";
import BotActionReturn from "../BotActionReturn";
import LogEntry from "../../LogEntry";
import { Bot } from "../..";
import { MoveQuery } from "./MoveQuery";

export class Move extends APIAction {
    private from: string;
    private to: string;
    private reason: string;
    private movetalk: boolean;
    private movesubpages: boolean;
    private noredirect: boolean;

	public constructor (
        bot: Bot,
        from: string,
        to: string,
        reason: string,
        movetalk = true,
        movesubpages = true,
        noredirect = true
    ) {
		super(bot);
        this.from = from;
        this.to = to;
        this.reason = reason;
        this.movetalk = movetalk;
        this.movesubpages = movesubpages;
        this.noredirect = noredirect;
	}

	public async exc (): Promise<BotActionReturn> {
        const query = this.createQuery();
		const res = await this.bot.getRequestSender().post(query);
		const logEntry = new LogEntry('move', res);
		return new BotActionReturn(logEntry, '');
	}

    protected createQuery (): MoveQuery {
        const query: MoveQuery = {
            action: 'move',
            from: this.from,
            to: this.to,
            reason: this.reason,
            movetalk: this.movetalk,
            movesubpages: this.movesubpages,
            noredirect: this.noredirect,
            format: 'json'
        };

        return query;
    }
}