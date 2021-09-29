- [changes in v1.1](#changes-in-v11)
- [How to use](#how-to-use)
	- [General info](#general-info)
		- [Concerning waiting for server responses](#concerning-waiting-for-server-responses)
		- [Custom errors](#custom-errors)
		- [logs](#logs)
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
			- [CatMember class](#catmember-class)
		- [getting template data](#getting-template-data)
			- [Template class](#template-class)
			- [Parameter class](#parameter-class)
		- [getting sections of a page](#getting-sections-of-a-page)
		- [getting tokens](#getting-tokens)
	- [get and post](#get-and-post)
	- [Examples](#examples)

# changes in v1.1
* added manual [get and post](#get-and-post) methods
* added [getToken](#getting-tokens) method
* added `end` param to [revert](#revert)
* changed [CatMember](#catmember-class) into a class with custom toString method
* improved `type` / `ns` parameter handling in [getCatMembers](#getting-category-members) (including switching places of `type` and `ns`)
* added `reLogin` parameter to bot [constructor](#constructor)
* added `cutServerResponse` param to [upload](#upload) (the default status message of uploads is very long because the entire file page content is included; this info is cut out per default now)
* changed return values from [editing bot actions](#editing-actions) (instead of an empty string, they now return the status message; this allows problem handling directly in the program)
* changed bot action status message handling when `noLogs` is set to true (previously even console logs were blocked, now only the text logs are blocked)
* reworked logs directory structure to separate logs from different urls
* fixed bug in [getTemplates](#getting-template-data) that caused crashes when the template parsetree of the selected page was too big

# How to use
## General info
Your bot account **must** have bot rights. Otherwise most actions won't work.

Every bot action that interacts with your wiki returns a promise. Therefore you can structure your code with promise syntax (`.then()`, `.catch()`) or with async-await. In the examples I'll always use async-await.

### Concerning waiting for server responses
It's always a good idea to at least wait for one server response per page you're doing something with (e. g. waiting for the page content). It is possible to make a program completely asynchronus but most wiki servers don't like it, which will cause problems resulting in some or a lot of requests don't getting through.
The bot has some built-in functions to reduce problems with for example badtoken errors for edits, but this does not solve the problem. 

In general I strongly recommend to wait for every single request except of edit requests that are at the end of your loop (if you're editing a set of pages).

### Custom errors
Some actions can throw custom errors themselves (they are listed in the corresponding section of this file) and the error `CantGetTokenError` can happen for every editing action and login (because it happens in getting the token needed for the action). You can of course catch them but as long as you don't send too many requests at once to your wiki, you shouldn't need to.

### logs
Per default the bot automatically creates a directory "logs" where every editing action gets logged. This helps to find potential problems that occured when editing, without having to keep the terminal open. Each URL gets an own sub directory. This is especially relevant for [reverting](#revert) edits of the bot. To remove logs that are empty or contain only the login, you can use [cleanUpLogFiles](#cleanUpLogFiles).

### What can be imported
* Bot
* Logger

Classes/Interfaces that occur in return values:
* Parameter
* Template
* Section
* CatMember

Types:
* tokenType
* catMemberType

Custom errors:
* UnsolvableErrorError,
* BadTokenError,
* PageDoesNotExistError,
* CantGetTokenError,
* ProtectedPageError,
* SectionNotFoundError,
* NoRevIdError,
* UndoFailureError

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
* bot name: `string`
* bot password: `string`
* url: `string` (api entrypoint url of your wiki; also relevant for [logs](#logs))
* noLogs: `boolean` (optional; whether all editing actions shall get logged in a folder, relevant for [revert](#revert); default: `false`)
* reLogin: `boolean` (optional; whether to automatically relogin when the bot gets logged out while editing; default: `true`)

If you're not sure what the api entrypoint of your wiki looks like, you can look it up on Special:Version.

## login
No parameters. Just use:
```ts
await bot.login();
```
## getLogger
Returns the logger object. By using `saveMsg(msg: string)` you can add a custom log line to the current log file.
Example:
```ts
const logger = bot.getLogger();
logger.saveMsg('test log');
```

## cleanUpLogFiles
By using
```ts
bot.cleanUpLogfiles();
```
you can remove every logfile that is completely empty or has only one action (should be in all cases the login) logged.

## Editing actions
### edit
Method: edit

Parameters:
* page name: `string` | `CatMember`
* new page text: `string`
* edit summary: `string`
* nocreate: `boolean` (optional; if set to true an error occurs when the page does not exist; default: `true`)
* section name/index: `string` | `number` (optional)

Return value: string status message

Possible errors:
* BadTokenError
* PageDoesNotExistError
* ProtectedPageError
* SectionNotFoundError
* UnsolvableErrorError

### move
Method: move

Parameters:
* from: `string` | `CatMember`
* to: `string` | `CatMember`
* summary: `string`
* moveTalk: `boolean` (optional; default: `true`)
* moveSubpages: `boolean` (optional; default: `true`)
* noredirect: `boolean` (optional; default: `true`)

Return value: string status msg

### revert
Method: revert

Parameters:
* user: `string` (if set to `'self'` start and end aren't needed)
* start: `Date` (optional) older timestamp (start of the time span, included)
* end: `Date` (optional) newer timestamp (end of the time span, not included)

If user is set to `'self'`, this will revert the last set of bot edits that were sent to Bot.url (i. e. when Bot.url is x, recent edits to url y will be ignored, because the logs for different urls are separeted from each other). Only possible with a bot task that got logged (i. e. noLogs wasn't set to true in the Bot constructor). **I only recommend to use this directly after a logged bot task if something went wrong.** The bot only selects the starting time of the last task. Therefore not logged bot edits since the last logged set will get reverted as well!!

You can revert bot edits free of the logs by just setting user to your bot's name.

Return value: `undefined`

### upload
Method: upload

Parameters:
* uploadType: `'remote'` | `'local'` (has to be `'remote'`, implementation of local file upload is planned but I have no idea when it will happen)
* wantedName: `string` ('File:' at the beginning is NOT needed)
* comment: `string` (upload comment that is also the initial content of the file page)
* url: `string`
* ignoreWarnings: `boolean` (optional; default: `false`)
* cutServerResponse: `boolean` (optional; default: `true`; whether to remove file page content info of server response)

Return value: string status msg

## Data actions
### getting contents of a page
Method: getWikitext

Parameters:
* page name: `string` | `CatMember`
* section name/index: `string` | `number` (optional)

Return value: Page content in plain text.

Possible errors:
* PageDoesNotExistError
* SectionNotFoundError
* UnsolvableErrorError

### getting category members
Method: getCatMembers

Parameters:
* category name: `string`
* type: `catMemberType` (i. e. `'file'` | `'page'` | `'subcat'`) (optional; what kind of members will be returned; default: `'page'`)
* namespaces: `namespace[]` (optional; array of namespaces (text names or numbers) that shall exclusevely be included in the resulting array)

Per default only Main namespace pages get included.

When using both `type` and `namespaces` the namespace exclusion is used on the already reduced list of pages.

Return value: array of `CatMember` objects.

#### CatMember class
Attributes:
* ns: `number` (number of the namespace the page belongs to)
* title: `string` (page name)

Methods:
* toString() (returns title)

Namespace names and numbers can be found [here](https://www.mediawiki.org/wiki/Manual:Namespace#Built-in_namespaces).

### getting template data
Method: getTemplates

Parameters:
* page name: `string` | `CatMember`
* section name/index: `string` | `number` (optional)

Return value: Array of template objects.

Possible errors:
* SectionNotFoundError

#### Template class
Attributes:
* title: `string`
* index: `number` (marks position, further information at attribute text of Parameter class)
* params: `Parameter[]`
  
Methods:
* getParam(title: `string`): `Parameter` | `null` (for indexed parameters you can just use their number; keep in mind: param indices start at 1)
* toWikitext(removeWhitespace: `boolean`): `string`
* toString(): calls toWikitext(`false`)

#### Parameter class
Attributes:
* title: `string`
* indexed: `boolean` (true for params like in `{{test|first param value}}`)
* text: `string` (every template inside this param has a placeholder in the text attribute `##TEMPLATE:index##` that marks its position (needed for `toWikitext()`))
* templates: `Template[]`

Methods:
* toWikitext(removeWhitespace: `boolean`): `string`
* toString(): calls toWikitext(`false`)

### getting sections of a page
Method: getSections

Parameters:
* page name: `string`

Return value: Array of Section objects:
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

### getting tokens
Method: getToken

Parameters:
* type: `tokenType` (i. e. `'csrf'` | `'login'` | ... ; [full list](https://www.mediawiki.org/w/api.php?action=help&modules=query%2Btokens))

Return value: Token as a string

## get and post
Method: get / post

Parameters:
* opt: `any` (configuration object for [request](https://github.com/request/request))

Most of the time, `opt` will probably look like this (`qs` for get and `form` for post):
```ts
{
	url: string,
	qs / form: {
		//post body / querystring parameters
		action: string,
		//...
		format = 'json'
	}
}
```

Return value: Promise\<string\>

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
		let content = await bot.getWikitext(page);

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

	const templates = await bot.getTemplates(pageName);
	const targetTemplate = templates.find(item => {
		return item.title === 'Cool table';
	});

	//creating a text copy because we need the original template code for string replace
	const oldTemplateText = String(targetTemplate);

	const param = targetTemplate.getParam('coolnessRate');
	param.text = 'unlimited';

	//replacing template code and sending edit request ============================
	let content = await bot.getWikitext(pageName);
	content = content.replace(oldTemplateText, String(targetTemplate));

	bot.edit(pageName, content, 'template bot test');
}
```