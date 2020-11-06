import {
	ObsidianIllegalNameRegex, URLRegex,
	getLinkTextWithSurroudingBracketMatches, getLinkTextWithPathMatches,
	linkNotionRegex,
	removeUUIDs,
	replaceEncodedSpaceWithSpace,
	cleanUUIdsAndIllegalChar
} from './regex';
import * as npath from 'path';
import { hasAFileExtension, isNotMDOrCSVFile } from './utils';

type ObsidianReference = string;

//* [Link Text](Link Directory + uuid/And Page Name + uuid) => [[LinkText]]
export const convertMarkdownLinks = (content: string) => {

	//They can likely be minimized or combined in some way.
	const linkFullMatches = getLinkTextWithPathMatches(content);

	let totalLinks = 0;
	let out = content;
	if (linkFullMatches) {
		totalLinks += linkFullMatches.length;

		// TODO refactor for clarity
		for (let match of linkFullMatches) {
			let replacement = "";
			if (URLRegex.test(match)) {
				if (linkNotionRegex.test(match)) {
					const url = match.match(linkNotionRegex);
					if (!url) continue;
					replacement = convertNotionLink(url[0]);
					out = out.replace(match, replacement);
				} else {
					// We don't touch non notion links!
					continue
				}
			} else {
				const linkTextWithBracket = getLinkTextWithSurroudingBracketMatches(match)
				if (!linkTextWithBracket) continue;
				// Remove the end ]( of the text match
				let linkText = linkTextWithBracket[0].substring(1, linkTextWithBracket[0].length - 2);
				// Before it was a simple include png, to see if still work
				if (!hasAFileExtension(match)) {
					replacement = removeUUIDs(replaceEncodedSpaceWithSpace(match))
				} else if (isNotMDOrCSVFile(match)) {
					replacement = `[[${convertImagePath(linkText)}]]`;
				} else {
					replacement = `[[${cleanUUIdsAndIllegalChar(linkText)}]]`;
				}
				out = out.replace(match, replacement);
			}
		}
	}

	return {
		content: out,
		links: totalLinks,
	};
};


/**
 * Transforms `bla](Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png)`
 * Into `![Page Title/Image Name.png]`
 */
export const convertImagePath = (path: string): string => {
	const decodedPathWithoutUUID = removeUUIDs(replaceEncodedSpaceWithSpace(path));

	let imageTitle = cleanUUIdsAndIllegalChar(npath.basename(decodedPathWithoutUUID));
	let folder = cleanUUIdsAndIllegalChar(npath.dirname(decodedPathWithoutUUID));

	return `${folder}/${imageTitle}`;
};

/**
 * Transforms `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536`
 * Into `[[The Page Title]]`
 */
export const convertNotionLink = (match: string): ObsidianReference => {
	const urlWithoutUUID = removeUUIDs(match)
	return decodeURI(`[[${urlWithoutUUID
		.substring(match.lastIndexOf('/') + 1).replace(/-/g, ' ')}]]`);
};

/**
 * Removes the leading directory and uuid at the end, leaving the page title
 * Transforms `The%20Page%20Title%200637657f8a854e05a142871cce86ff701`
 * Into `[[Page Title]]
 */
export const convertRelativePathToObsidianReference = (path: string): ObsidianReference => {
	const fileName = npath.basename(path)
	const fileNameWithoutUUID = removeUUIDs(replaceEncodedSpaceWithSpace(fileName));
	return `[[${fileNameWithoutUUID.replace(/\..+$/, '')}]]`;
};

export const convertLinksIfMD = (link: string): ObsidianReference => {
	if (link.includes('.md')) {
		return convertRelativePathToObsidianReference(link);
	}
	return link

}
