import { ObsidianIllegalNameRegex, URLRegex, linkFullRegex, linkTextRegex, linkFloaterRegex, linkNotionRegex } from './regex';
import * as npath from 'path';
import { isImageFile } from './utils';

type ObsidianReference = string;

export const truncateFileName = (name: string): string => {
	// return fileName.substring(0, fileName.lastIndexOf(' ')) + fileName.substring(fileName.indexOf('.'));
	let basename = npath.basename(name);
	basename = basename.lastIndexOf(' ') > 0 ? basename.substring(0, basename.lastIndexOf(' ')) : basename;
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

	//TODO: Test all of these regex patterns and document exactly what they match to.
	//They can likely be minimized or combined in some way.
	const linkFullMatches = content.match(linkFullRegex); //=> [Link Text](Link Directory + uuid/And Page Name + uuid)
	//? Because this is only a part of the above, it should probably be run in the iteration below so it doesn't have to check the whole page twice.
	const linkTextMatches = content.match(linkTextRegex); //=> [Link Text](
	const linkFloaterMatches = content.match(linkFloaterRegex);// => Text](Link Directory + uuid/And Page Name + uuid)
	const linkNotionMatches = content.match(linkNotionRegex); // => `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536`
	if (!linkFullMatches && !linkFloaterMatches && !linkNotionMatches) return { content: content, links: 0 };

	let totalLinks = 0;
	let out = content;
	if (linkFullMatches && linkTextMatches) {
		totalLinks += linkFullMatches.length;
		for (let i = 0; i < linkFullMatches.length; i++) {
			if (URLRegex.test(linkFullMatches[i])) {
				continue;
			}
			let linkText = linkTextMatches[i].substring(1, linkTextMatches[i].length - 2);
			// Before it was a simple include png, to see if still work
			if (isImageFile(linkText)) {
				linkText = convertImagePath(linkText);
			} else {
				linkText = linkText.replace(ObsidianIllegalNameRegex, ' ');
			}
			out = out.replace(linkFullMatches[i], `[[${linkText}]]`);
		}
	}

	//! Convert free-floating relativePaths
	//TODO Document when and why this happens
	if (linkFloaterMatches) {
		totalLinks += linkFullMatches ? linkFloaterMatches.length - linkFullMatches.length : linkFloaterMatches.length;
		//* This often won't run because the earlier linkFullMatches && linkTextMatches block will take care of most of the links
		out = out.replace(linkFloaterRegex, convertRelativePathToReference);
	}

	//Convert random Notion.so links
	if (linkNotionMatches) {
		out = out.replace(linkNotionRegex, convertNotionLink);
		totalLinks += linkNotionMatches.length;
	}

	return {
		content: out,
		links: totalLinks,
	};
};

//* `![Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png](Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png)` => `![Page Title/Image Name.png]`
export const convertImagePath = (path: string): string => {
	let imageTitle = path
		.substring(path.lastIndexOf('/') + 1)
		.split('%20')
		.join(' ');

	path = convertRelativePathToReference(path.substring(0, path.lastIndexOf('/')));
	path = path.substring(2, path.length - 2);

	return `${path}/${imageTitle}`;
};

//* `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536` => `[[The Page Title]]`
export const convertNotionLink = (match: string): ObsidianReference => {
	return `[[${match
		.substring(match.lastIndexOf('/') + 1)
		.split('-')
		.slice(0, -1)
		.join(' ')}]]`;
};

//Removes the leading directory and uuid at the end, leaving the page title
//* `The%20Page%20Title%200637657f8a854e05a142871cce86ff701` => `[[Page Title]]
export const convertRelativePathToReference = (path: string): ObsidianReference => {
	return `[[${(path.split('/').pop() || path).split('%20').slice(0, -1).join(' ')}]]`;
};

export const convertLinksIfMD = (link: string): ObsidianReference => {
	if (link.includes('.md')) {
		return convertRelativePathToReference(link);
	}
	return link

}
