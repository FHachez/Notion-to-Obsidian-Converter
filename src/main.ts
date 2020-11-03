import * as fs from 'fs';
import * as readline from 'readline';
import * as npath from 'path';
import { ObsidianIllegalNameRegex, URLRegex, linkFullRegex, linkTextRegex, linkFloaterRegex, linkNotionRegex } from './regex';
import { getDirectoryContent } from './utils';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function main() {
	rl.question('Notion Export Path:\n', (path) => {
		const start = Date.now();
		const output = fixNotionExport(path.trim());
		const elapsed = Date.now() - start;

		console.log(
			`Fixed in ${elapsed}ms
${'-'.repeat(8)}
Directories: ${output.directories.length}
Files: ${output.files.length}
Markdown Links: ${output.markdownLinks}
CSV Links: ${output.csvLinks}`
		);

		rl.close();
	});
}

const truncateFileName = (name: string) => {
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

const truncateDirName = (name: string) => {
	// return directoryName.substring(0, directoryName.lastIndexOf(' '));
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
			if (linkText.includes('.png') || linkText.includes('.jpg')) {
				linkText = convertPNGPath(linkText);
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
		out = out.replace(linkFloaterRegex, convertRelativePath);
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
const convertPNGPath = (path: string) => {
	let imageTitle = path
		.substring(path.lastIndexOf('/') + 1)
		.split('%20')
		.join(' ');

	path = convertRelativePath(path.substring(0, path.lastIndexOf('/')));
	path = path.substring(2, path.length - 2);

	return `${path}/${imageTitle}`;
};

//* `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536` => `[[The Page Title]]`
const convertNotionLink = (match: string) => {
	return `[[${match
		.substring(match.lastIndexOf('/') + 1)
		.split('-')
		.slice(0, -1)
		.join(' ')}]]`;
};

//Removes the leading directory and uuid at the end, leaving the page title
//* `The%20Page%20Title%200637657f8a854e05a142871cce86ff701` => `[[Page Title]]
const convertRelativePath = (path: string) => {
	return `[[${(path.split('/').pop() || path).split('%20').slice(0, -1).join(' ')}]]`;
};

const convertLinksIfMD = (link: string) => {
	if (link.includes('.md')) {
		return convertRelativePath(link);
	}
	return link

}

// @TODO replace with proper csv parsing!
//Goes through each link inside of CSVs and converts them
//* ../Relative%20Path/To/File%20Name.md => [[File Name]]
const convertCSVLinks = (content: string) => {
	let lines = content.split('\n');
	let links = 0;
	for (let x = 0; x < lines.length; x++) {
		let line = lines[x];
		let cells = line.split(',');

		for (let y = 0; y < cells.length; y++) {
			let cell = cells[y];
			if (cell.includes('.md')) {
				cells[y] = convertRelativePath(cell);
				links++;
			}
		}
		lines[x] = cells.join(',');
	}
	return { content: lines.join('\n'), links: links };
};

// Convert to proper csv parsing
const convertCSVToMarkdown = (content: string) => {
	//TODO clean up parameters
	const csvCommaReplace = (match: string, p1: string, p2: string, p3: string, offset: string, string: string) => {
		return `${p1}|${p3}`;
	};

	let fix = content.replace(/(\S)(\,)((\S)|(\n)|($))/g, csvCommaReplace).split('\n');
	const headersplit = '-|'.repeat(fix[0].split('').filter((char) => char === '|').length + 1);
	fix.splice(1, 0, headersplit);
	return fix.join('\n');
};


const isImageFile = (file: string): boolean => {
	return npath.extname(file) !== '.png';
}

const renameNonImageFile = (file: string): string => {
	//Rename file
	if (isImageFile(file)) {
		const truncatedFileName = truncateFileName(file);
		if (fs.existsSync(truncatedFileName)) {
			console.log(`Already moved a note called ${truncatedFileName}`);
			return file
		} else {
			fs.renameSync(file, truncatedFileName);
			truncatedFileName;
			return truncatedFileName
		}
	}
	return file
}

const fixNotionExport = (path: string) => {
	let markdownLinks = 0;
	let csvLinks = 0;

	let { directories, files } = getDirectoryContent(path);
	//let directories: string[] = directoryContent.directories;
	//let files: string[] = directoryContent.files;

	for (let i = 0; i < files.length; i++) {
		let file = files[i];

		file = renameNonImageFile(file)
		files[i] = file

		//Convert Markdown Links
		if (npath.extname(file) === '.md') {
			const correctedFileContents = convertMarkdownLinks(fs.readFileSync(file, 'utf8'));
			if (correctedFileContents.links) markdownLinks += correctedFileContents.links;
			fs.writeFileSync(file, correctedFileContents.content, 'utf8');
		}
		//Convert CSV Links and create converted, extra CSV => Markdown file
		else if (npath.extname(file) === '.csv') {
			const convertedCSVFile = convertCSVLinks(fs.readFileSync(file, 'utf8'));
			const csvContentAsMarkdown = convertCSVToMarkdown(convertedCSVFile.content);
			if (convertedCSVFile.links) csvLinks += convertedCSVFile.links;
			fs.writeFileSync(file, convertedCSVFile.content, 'utf8');
			fs.writeFileSync(
				npath.resolve(
					npath.format({
						dir: npath.dirname(file),
						base: npath.basename(file, `.csv`) + '.md',
					})
				),
				csvContentAsMarkdown,
				'utf8'
			);
		}
	}

	//Rename directories
	for (let i = 0; i < directories.length; i++) {
		let dir = directories[i];
		if (fs.existsSync(dir)) {
			console.log(`Already moved a note with subnote called ${dir}`);
		} else {
			fs.renameSync(dir, truncateDirName(dir));
			directories[i] = truncateDirName(dir);
		}
	}

	//Convert children directories
	directories.forEach((dir) => {
		const reading = fixNotionExport(dir);
		directories = directories.concat(reading.directories);
		files = files.concat(reading.files);
		markdownLinks += reading.markdownLinks;
		csvLinks += reading.csvLinks;
	});

	return {
		directories: directories,
		files: files,
		markdownLinks: markdownLinks,
		csvLinks: csvLinks,
	};
};
