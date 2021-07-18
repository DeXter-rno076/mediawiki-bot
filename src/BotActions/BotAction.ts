import BotActionReturn from '../BotActionReturn';

export default abstract class BotAction {
	//if using opt: Options and initialising it in the constructor opt in the sub classes is handled as of type Options
	abstract exc (): Promise<BotActionReturn>;
}