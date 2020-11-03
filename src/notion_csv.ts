

// @TODO replace with proper csv parsing!
//Goes through each link inside of CSVs and converts them

import { convertRelativePath } from "./link";

//* ../Relative%20Path/To/File%20Name.md => [[File Name]]
export const convertCSVLinks = (content: string) => {
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
export const convertCSVToMarkdown = (content: string) => {
	//TODO clean up parameters
	const csvCommaReplace = (match: string, p1: string, p2: string, p3: string, offset: string, string: string) => {
		return `${p1}|${p3}`;
	};

	let fix = content.replace(/(\S)(\,)((\S)|(\n)|($))/g, csvCommaReplace).split('\n');
	const headersplit = '-|'.repeat(fix[0].split('').filter((char) => char === '|').length + 1);
	fix.splice(1, 0, headersplit);
	return fix.join('\n');
};
