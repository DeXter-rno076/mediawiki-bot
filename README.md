- [How to use](#how-to-use)
	- [General info](#general-info)
		- [Concerning waiting for server responses](#concerning-waiting-for-server-responses)
		- [Custom errors](#custom-errors)
		- [What can be imported](#what-can-be-imported)
	- [Hello World](#hello-world)
	- [constructor](#constructor)
	- [login](#login)
	- [getLogger](#getlogger)
	- [cleanUpLogFiles](#cleanuplogfiles)
	- [Editing actions](#editing-actions)
		- [edit](#edit)
		- [move](#move)
		- [revert](#revert)
		- [upload](#upload)
	- [Data actions](#data-actions)
		- [getting contents of a page](#getting-contents-of-a-page)
		- [getting category members](#getting-category-members)
		- [getting template data](#getting-template-data)
			- [Template class](#template-class)
			- [Parameter class](#parameter-class)
		- [getting sections of a page](#getting-sections-of-a-page)
	- [Examples](#examples)

# How to use
## General info
Your bot account **must** have bot rights. Otherwise most actions won't work.

Every bot action that interacts with your wiki returns a promise. Therefore you can structure your code with promise syntax (.then(), .catch()) or with async-await. In the examples I'll always use async-await.

### Concerning waiting for server responses
It's always a good idea to at least wait for one server response per page you're doing something with (e. g. waiting for the page content). It is possible to make a program completely asynchronus but most wiki servers don't like it, which will cause problems resulting in some or a lot of requests don't getting through.
The bot has some built-in functions to reduce problems with for example badtoken errors for edits, but this does not solve the problem. 

In general I strongly recommend to wait for every single request except of edit requests that are at the end of your loop (if you're editing a set of pages).

### Custom errors
Some actions can throw custom errors themselves (they are listed in the corresponding section of this file) and the error CantGetTokenError can happen for every editing action and login (because it happens in getting the token needed for the action). You can of course catch them but as long as you don't send too many requests at once to your wiki, you shouldn't need to.

### What can be imported
* Bot
* Logger

Classes/Interfaces that occur in return values:
* Parameter
* Template
* Section
* CatMember

Custom errors:
* UnsolvableErrorError
* BadTokenError
* PageDoesNotExistError
* CantGetTokenError
* SectionNotFoundError
* ProtectedPageError

## Hello World
```ts
import { Bot } from 'mediawiki-bot';

const bot = new Bot('bot name', 'bot password', 'https://www.examplewiki.org/api.php');

main();

async function main () {
	await bot.login();

	bot.edit('Bot testpage', 'Hello World!', 'edit summary');
}

```

## constructor
Parameters:
* bot name
* bot password
* api entrypoint url of your wiki
* noLogs (optional; whether all editing actions shall get logged in a folder, relevant for revert; default: false)

If you're not sure what the api entrypoint of your wiki looks like, you can look it up on Special:Version.

## login
No parameters. Just use:
```ts
await bot.login();
```
## getLogger
Returns the logger object. By using `saveMsg(msg: string)` you can add a custem log line to the current log file.
Example:
```ts
const logger = bot.getLogger();
logger.saveMsg('test log');
```

## cleanUpLogFiles
By using
```
bot.cleanUpLogfiles();
```
you can remove every logfile that is completely empty or has only one action (should be in all cases the login) logged.

## Editing actions
### edit
Parameters:
* page name: string
* new page text: string
* edit summary: string
* nocreate: boolean (optional; if set to true an error occurs when the page does not exist; default: true)
* section name/index: string | number (optional)

Possible errors:
* BadTokenError
* PageDoesNotExistError
* ProtectedPageError
* SectionNotFoundError
* UnsolvableErrorError

### move
Parameters:
* from: string
* to: string
* summary: string
* moveTalk: boolean (optional; default: true)
* moveSubpages: boolean (optional; default: true)
* noredirect: boolean (optional; default: true)

### revert
Parameters:
* user: string
* start: Date (if user is set to 'self', this param isn't needed)

If user is set to 'self', this will revert the last set of bot edits. Only possible with a bot task that got logged (i. e. noLogs wasn't set to true in the Bot constructor). **I only recommend to use this directly after a logged bot task if something went wrong.** The bot only selects the starting time of the last task. Therefore not logged bot edits since the last logged set will get reverted as well!!

You can revert bot edits free of the logs by just setting user to your bot's name.

### upload
Parameters:
* uploadType: 'remote' | 'local' (has to be 'remote', implementation of local file upload is planned but I have no idea when it will happen)
* wantedName: string ('File:' at the beginning is NOT needed)
* comment: string (upload comment that is also the initial content of the file page)
* url: string
* ignoreWarnings: boolean (optional; default: false)

## Data actions
### getting contents of a page
Parameters:
* page name: string
* section name/index: string | number (optional)

Return value: Page content in plain text.

Possible errors:
* PageDoesNotExistError
* SectionNotFoundError
* UnsolvableErrorError

### getting category members
Parameters:
* category name: string
* namespaces: namespace[] (optional; array of namespaces that shall be exclusevely be included in the resulting array)
* type: 'file' | 'page' | 'subcat' (optional; what kind of members will be returned; default: 'page')

Return value: array of CatMember objects. These are built up like this:
```ts
{
	ns: number,
	title: string
}
```
Namespace numbers can be found [here](https://www.mediawiki.org/wiki/Manual:Namespace#Built-in_namespaces).

### getting template data
Parameters:
* page name: string
* section name/index: string | number (optional)

Return value: Array of template objects.

Possible errors:
* SectionNotFoundError

#### Template class
Attributes:
* title: string
* index: number (marks position, further information at attribute text of Parameter class)
* params: Parameter[]
  
Methods:
* getParam(title: string) (for indexed parameters you can just use their number; keep in mind: param indices start at 1)
* toWikitext(removeWhitespace: boolean)
* toString(): calls toWikitext(false)

#### Parameter class
Attributes:
* title: string
* indexed: boolean (true for params like in `{{test|first param value}}`)
* text: string (every template inside this param has a placeholder in the text attribute `##TEMPLATE:index##` that marks its position (needed for toWikitext))
* templates: Template[]

Methods:
* toWikitext(removeWhitespace: boolean)
* toString(): calls toWikitext(false)

### getting sections of a page
Parameters:
* page name: string

Return value: Array of section objects:
```ts
{
	toclevel: number,
	level: string,
	line: string,//section title
	number: string,
	index: string,//section index
	fromtitle: string,//page name
	byteoffset: number,
	anchor: string//link anchor
}
```
Possible errors:
* SectionNotFoundError
  
## Examples
Let's replace some text with other text on all pages in a category.
```ts
import { Bot } from 'mediawiki-bot';

const bot = new Bot('bot name', 'bot password', 'https://www.examplewiki.org/api.php');

main();

async function main () {
	await bot.login();

	const catMembers = await bot.getCatMembers('Category:Test');

	for (let page of catMembers) {
		const title = page.title;
	
		let content = await bot.getWikitext(title);

		content = content.replace(/old text/g, 'new text');

		bot.edit(title, content, 'bot example');
	}
}
```
After finishing the bot task we realize that we somehow made a mistake and now want to revert everything.
```ts
import { Bot } from 'mediawiki-bot';

const bot = new Bot('bot name', 'bot password', 'https://www.examplewiki.org/api.php');

main();

async function main () {
	await bot.login();

	bot.revert('self');
}
```
Now let's move to another situation. We have a page with multiple templates and want to modify some parameter values.
```ts
import { Bot } from 'mediawiki-bot';

const bot = Bot('bot name', 'bot password', 'https://www.examplewiki.org/api.php');

main();

async function main() {
	const pageName = 'test page';

	await bot.login();

	// getting template object ===================================================
	const templates = await bot.getTemplates(pageName);

	const targetTemplate = templates.find(item => {
		return item.title === 'Cool table';
	});
	if (targetTemplate === undefined) {
		console.log('template not found');
		return;
	}
	//creating a text copy because we need the original template code for string replace
	const oldTemplateText = String(targetTemplate);

	// editing parameter ==========================================================
	const param = targetTemplate.getParam('coolnessRate');
	if (param === null) {
		console.log('param not found');
		return;
	}
	param.text = 'unlimited';

	//replacing template code and sending edit request ============================
	let content = await bot.getWikitext(pageName);
	content = content.replace(oldTemplateText, String(targetTemplate));

	bot.edit(pageName, content, 'template bot test');
}
```