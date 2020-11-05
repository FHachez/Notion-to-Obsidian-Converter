import { parse } from 'papaparse';
import markdownTable from 'markdown-table';
import width from 'string-width'

import { convertRelativePathToReference } from "./link";
import { Content } from './content';

export const processCSVCell = (cell: string) => {
	// Remove \n because markdown table doesn't support multiline cells
	cell = cell.replace('\n', ' ').trim();
	if (cell.includes('.md')) {
		cell = convertRelativePathToReference(cell);
	}
	return cell
}

//Goes through each link inside of CSVs and converts them
export const convertCSVToMarkdown = (content: string): Content => {
	const parsedContent = parse<Record<string, string>>(content, { header: true });
	if (!parsedContent.data.length) {
		console.log(`No Data ${content}`)
		return { content: "", links: 0 }
	}
	const header = Object.keys(parsedContent.data[0])
	const dataWithoutColumns = parsedContent.data.map((r) => {
		return header.map((c) => r[c]).map(processCSVCell);
	})

	return {
		content: markdownTable([header, ...dataWithoutColumns], { stringLength: width }),
		links: 0,
	}
};
