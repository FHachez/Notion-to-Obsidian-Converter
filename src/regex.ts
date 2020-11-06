export const ObsidianIllegalNameRegex = /[\*\"\/\<\>\:\|\?]/g;
export const URLRegex = /(:\/\/)|(w{3})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;

// Match paired paranteses: https://stackoverflow.com/questions/9580319/regular-expression-for-paired-brackets
export const linkFullRegex = /(\[([^ \]].*?| [^\]]+?)\])\((?:(?!\(\(|\)\)).)+\)/gi;
export const linkTextRegex = /(\[([^ \]].*?| [^\]]+?)\])(\()/gi;

// Full markdown link is [Link Text](Link Directory + uuid/And Page Name + uuid)
// Obsidian link [[LinkText]]

/**
 * Match [Link Text](Link Directory + uuid/And Page Name + uuid)
 */
export const getLinkTextWithPathMatches = (content: string) => content.match(linkFullRegex);

/**
 * Match [Link Text](
 */
export const getLinkTextWithSurroudingBracketMatches = (content: string) => content.match(linkTextRegex);

/**
 * Match `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536`
 */
export const linkNotionRegex = /https?:\/\/www.notion.so\/([-a-zA-Z0-9()@:%_\+.~#?&//=]+[-a-zA-Z0-9(@:%_\+.~#?&//=]+)/g;
export const getNotionMatches = (content: string) => content.match(linkNotionRegex);

// From https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
export const optionalSpaceOrDashThenUUIDRegex = /[ \-]?[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}/gi;
/**
 * Removes all UUIDs and it's leading space or -
 */
export const removeUUIDs = (content: string) => content.replace(optionalSpaceOrDashThenUUIDRegex, "");

export const replaceEncodedSpaceWithSpace = (content: string) => content.replace(/\%20/g, ' ')

/**
 * Replace Illegal Obsidian Char with space
 */
export const replaceIllegalObsidianCharWithSpace = (content: string) => content.replace(ObsidianIllegalNameRegex, ' ');

/**
 * Remove UUIDs and all the illegal char for the references. (Do not use on links or on paths)!!)
 */
export const cleanUUIdsAndIllegalChar = (content: string) => replaceIllegalObsidianCharWithSpace(removeUUIDs(content))
