import * as fs from 'fs';
import * as readline from 'readline';
import * as npath from 'path';
import { getDirectoryContent, isImageFile, isNotMDOrCSVFile } from './utils';
import { convertMarkdownLinks, truncateDirName, truncateFileName } from './link';
import { convertCSVToMarkdown } from './notion_csv';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function processPath(path: string) {
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

}

const renameNonImageFile = (file: string): string => {
	//Rename file
	if (!isNotMDOrCSVFile(file)) {
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

const renameDirs = (directories: string[]): string[] => {
	return directories.map((dir) => {
		const newDirName = truncateDirName(dir)
		if (fs.existsSync(newDirName)) {
			console.log(`Already moved a note with subnotes called ${dir}`);
			return dir;
		} else {
			fs.renameSync(dir, newDirName);
			return newDirName;
		}
	})
}

// Recursively fix the export
const fixNotionExport = (path: string) => {
	let markdownLinks = 0;
	let csvLinks = 0;

	let { directories, files } = getDirectoryContent(path);

	const renamedFiles = [];

	for (let file of files) {
		file = renameNonImageFile(file);
		renamedFiles.push(file);

		//Convert Markdown Links
		if (npath.extname(file) === '.md') {
			const correctedFileContents = convertMarkdownLinks(fs.readFileSync(file, 'utf8'));
			if (correctedFileContents.links) markdownLinks += correctedFileContents.links;
			fs.writeFileSync(file, correctedFileContents.content, 'utf8');
		}
		//Convert CSV Links and create converted, extra CSV => Markdown file
		else if (npath.extname(file) === '.csv') {
			const csvContent = fs.readFileSync(file, 'utf8');
			const csvContentAsMarkdown = convertCSVToMarkdown(csvContent);
			csvLinks += csvContentAsMarkdown.links;
			fs.writeFileSync(
				npath.resolve(
					npath.format({
						dir: npath.dirname(file),
						base: npath.basename(file, `.csv`) + '.md',
					})
				),
				csvContentAsMarkdown.content,
				'utf8'
			);
		}
	}

	directories = renameDirs(directories);

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


function main() {
	rl.question('Notion Export Path:\n', processPath);
}

main();
