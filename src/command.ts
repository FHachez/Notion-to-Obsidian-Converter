import inquirer from 'inquirer';
import { fixNotionExport, FixNotionExportConfigI } from './fix_notion_export';

function processPath({ inputFolder, shouldProcessCsv, shouldProcessMdFiles, shouldRemoveLinkedDb = false }: FixNotionExportConfigI & { inputFolder: string }) {
	const start = Date.now();
	const output = fixNotionExport(inputFolder.trim(), {
		shouldProcessCsv, shouldProcessMdFiles, shouldRemoveLinkedDb,
		input_dir: inputFolder, duplicates_dir: inputFolder + "/__duplicates__"
	});
	const elapsed = Date.now() - start;

	console.log(
		`Fixed in ${elapsed}ms
${'-'.repeat(8)}
Directories: ${output.nDirectories}
Files: ${output.nFiles}
Markdown Links: ${output.markdownLinks}
CSV Links: ${output.csvLinks}`
	);
}

const questions = [
	{ type: 'input', name: 'inputFolder', message: "What's Notion Export Path" },
	{ type: 'confirm', name: 'shouldProcessCsv', message: 'Do you want to transform the tables in markdown tables?', default: true },
	{ type: 'confirm', name: 'shouldProcessMdFiles', message: 'Do you want to remove the uuid and create obsidian links?', default: true },
]

const questionIfProcessMdFiles = [
	{ type: 'confirm', name: 'shouldRemoveLinkedDb', message: 'Do you want to remove linked DB (the exported linked db are not filtered)?', default: true },
]

async function main() {
	const config = await inquirer.prompt(questions)

	if (config.shouldProcessCsv) {
		const linkedDbConfig = await inquirer.prompt(questionIfProcessMdFiles)
		processPath({ ...config, ...linkedDbConfig })

	} else {
		processPath(config)
	}

}

main();
