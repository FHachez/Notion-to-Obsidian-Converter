export const ObsidianIllegalNameRegex = /[\*\"\/\\\<\>\:\|\?]/g;
export const URLRegex = /(:\/\/)|(w{3})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
export const linkFullRegexOld = /(\[(.*?)\])(\((.*?)\))/gi;
// Match paired paranteses: https://stackoverflow.com/questions/9580319/regular-expression-for-paired-brackets
export const linkFullRegex = /(\[([^ \]].*?| [^\]]+?)\])\((?:(?!\(\(|\)\)).)+\)/gi;
export const linkTextRegex = /(\[([^ \]].*?| [^\]]+?)\])(\()/gi;

// Full markdown link is [Link Text](Link Directory + uuid/And Page Name + uuid)
// Obsidian link [[LinkText]]

//=> [Link Text](Link Directory + uuid/And Page Name + uuid)
export const getLinkTextWithPathMatches = (content: string) => content.match(linkFullRegex);

//=> [Link Text](
export const getLinkTextWithSurroudingBracketMatches = (content: string) => content.match(linkTextRegex);

// => find `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536`
export const linkNotionRegex = /https?:\/\/www.notion.so\/([-a-zA-Z0-9()@:%_\+.~#?&//=]+[-a-zA-Z0-9(@:%_\+.~#?&//=]+)/g
export const getNotionMatches = (content: string) => content.match(linkNotionRegex);
