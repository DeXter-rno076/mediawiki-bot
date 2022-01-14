export const NAMESPACES = {
	'Main': 0,
	'Talk': 1,
	'User': 2,
	'User talk': 3,
	'Project': 4,
	'Project talk': 5,
	'File': 6,
	'File talk': 7,
	'MediaWiki': 8,
	'MediaWiki talk': 9,
	'Template': 10,
	'Template talk': 11,
	'Help': 12,
	'Help talk': 13,
	'Category': 14,
	'Category talk': 15
};

/**
 * ===============================================================================
 * logger constants
 * every other log file paths depend on the current situation
 */

export const LOG_DIR = './mediawikibot_logs';
export const LOG_URL_LIST_PATH = LOG_DIR + '/urlList.json';