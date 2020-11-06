import { parse } from 'papaparse';
import markdownTable from 'markdown-table';
import width from 'string-width'

import { convertRelativePathToObsidianReference } from "./fix_md";
import { Content } from './content';
import { capReferenceLength, cleanUUIdsAndIllegalChar, sanatizeObsidianRefLink } from './regex';

export const processCSVCell = (cell: string) => {
	// Remove \n because markdown table doesn't support multiline cells
	cell = cell.replace(/\n/gi, ' ').replace(/  +/gi, ' ').trim();
	if (cell.includes('.md')) {
		cell = convertRelativePathToObsidianReference(cell);
	}
	return cell
}

/**
 * Tranform a cell to an Obsidian Link
 */
export const transformCellToLink = (cell: string) => {
	if (!cell || cell === ' ' || cell === '') {
		return cell;
	}
	// Remove \n because markdown table doesn't support multiline cells
	// Notion doesn't count the new line as a space for the file name.
	// Notion also remove the "." from the references
	cell = cleanUUIdsAndIllegalChar(cell);
	cell = cell.replace(/\n|\./gi, '').replace(/  +/gi, ' ').trim();

	cell = capReferenceLength(cell)

	return `[[${cell}]]`;
}

//Goes through each link inside of CSVs and converts them
export const convertCSVToMarkdown = (content: string): Content => {
	const parsedContent = parse<string[]>(content);
	if (!parsedContent.data.length) {
		console.log(`No Data ${content}`)
		return { content: "", links: 0 }
	}
	const header = parsedContent.data[0]

	const data = parsedContent.data.slice(1).map((r) => {
		const firstCell = transformCellToLink(r[0]);
		return [firstCell].concat(r.slice(1).map(processCSVCell));
	})

	return {
		content: markdownTable([header, ...data], { stringLength: width }),
		links: 0,
	}
};
