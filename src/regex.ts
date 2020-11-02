export const ObsidianIllegalNameRegex = /[\*\"\/\\\<\>\:\|\?]/g;
export const URLRegex = /(:\/\/)|(w{3})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
export const linkFullRegexOld = /(\[(.*?)\])(\((.*?)\))/gi;
export const linkFullRegex = /(\[(.*?)\])\((?:(?!\(\(|\)\)).)*\)/gi;
export const linkTextRegex = /(\[(.*?)\])(\()/gi;
export const linkFloaterRegex = /([\S]*\.md(\))?)/gi;
export const linkNotionRegex = /([\S]*notion.so(\S*))/g
