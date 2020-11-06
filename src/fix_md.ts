import {
	ObsidianIllegalNameRegex, URLRegex,
	getLinkTextWithSurroudingBracketMatches, getLinkTextWithPathMatches,
	linkNotionRegex,
	removeUUIDs
} from './regex';
import * as npath from 'path';
import { hasAFileExtension, isNotMDOrCSVFile } from './utils';

type ObsidianReference = string;

export const truncateFileName = (name: string): string => {
	// return fileName.substring(0, fileName.lastIndexOf(' ')) + fileName.substring(fileName.indexOf('.'));
	let basename = npath.basename(name);
	basename = basename.lastIndexOf(' ') > 0 ? basename.substring(0, basename.lastIndexOf(' ')) : basename;
	// Todo, we shouldn't have to resolve the file name.
	return npath.resolve(
		npath.format({
			dir: npath.dirname(name),
			base: basename + npath.extname(name),
		})
	);
};

export const truncateDirName = (name: string): string => {
	//return name.substring(0, name.lastIndexOf(' '));
	let basename = npath.basename(name);
	basename = basename.lastIndexOf(' ') > 0 ? basename.substring(0, basename.lastIndexOf(' ')) : basename;
	return npath.resolve(
		npath.format({
			dir: npath.dirname(name),
			base: basename,
		})
	);
};

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
					replacement = removeUUIDs(decodeURI(match))
				} else if (isNotMDOrCSVFile(match)) {
					replacement = `[[${convertImagePath(linkText)}]]`;
				} else {
					replacement = `[[${linkText.replace(ObsidianIllegalNameRegex, ' ')}]]`;
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


//* `bla](Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png)` => `![Page Title/Image Name.png]`
export const convertImagePath = (path: string): string => {
	let imageTitle = path
		.substring(path.lastIndexOf('/') + 1)
		.split('%20')
		.join(' ');

	path = convertRelativePathToObsidianReference(path.substring(0, path.lastIndexOf('/')));
	path = path.substring(2, path.length - 2);

	return `${path}/${imageTitle}`;
};

//* `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536` => `[[The Page Title]]`
export const convertNotionLink = (match: string): ObsidianReference => {
	const urlWithoutUUID = removeUUIDs(match)
	return decodeURI(`[[${urlWithoutUUID
		.substring(match.lastIndexOf('/') + 1).replace(/-/g, ' ')}]]`);
};

//Removes the leading directory and uuid at the end, leaving the page title
//* `The%20Page%20Title%200637657f8a854e05a142871cce86ff701` => `[[Page Title]]
export const convertRelativePathToObsidianReference = (path: string): ObsidianReference => {
	const fileName = npath.basename(path)
	const fileNameWithoutUUID = removeUUIDs(decodeURI(fileName));
	return `[[${fileNameWithoutUUID.replace(/\..+$/, '')}]]`;
};

export const convertLinksIfMD = (link: string): ObsidianReference => {
	if (link.includes('.md')) {
		return convertRelativePathToObsidianReference(link);
	}
	return link

}
