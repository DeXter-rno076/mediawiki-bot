import Options from './Options';

export default class MoveOptions extends Options {
	from: string;
	to: string;
	reason: string;
	movetalk = true;
	movesubpages = true;
	noredirect = true;
	
	constructor (from: string, to: string, summary: string) {
		super('move', 'move');
		this.from = from;
		this.to = to;
		this.reason = summary;
	}

	setAdvancedSettings (moveTalk: boolean, moveSubpages: boolean, noRedirect: boolean) {
		this.movetalk = moveTalk;
		this.movesubpages = moveSubpages;
		this.noredirect = noRedirect;
	}
}