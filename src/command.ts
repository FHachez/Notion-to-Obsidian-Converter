import inquirer from 'inquirer';
import { fixNotionExport } from './fix_notion_export';

export interface ConfigI {
	inputFolder: string
	shouldProcessCsv: boolean
	shouldProcessMdFiles: boolean
}

function processPath({ inputFolder, shouldProcessCsv, shouldProcessMdFiles }: ConfigI) {
	const start = Date.now();
	const output = fixNotionExport(inputFolder.trim(), shouldProcessCsv, shouldProcessMdFiles);
	const elapsed = Date.now() - start;

	console.log(
		`Fixed in ${elapsed}ms
${'-'.repeat(8)}
Directories: ${output.directories.length}
Files: ${output.files.length}
Markdown Links: ${output.markdownLinks}
CSV Links: ${output.csvLinks}`
	);
}

const questions = [
	{ type: 'input', name: 'inputFolder', message: "What's Notion Export Path" },
	{ type: 'confirm', name: 'shouldProcessCsv', message: 'Do you want to transform the tables in markdown tables?', default: true },
	{ type: 'confirm', name: 'shouldProcessMdFiles', message: 'Do you want to remove the uuid and create obsidian links?', default: true },
]

async function main() {
	const config = await inquirer.prompt(questions)
	processPath(config)
}

main();
