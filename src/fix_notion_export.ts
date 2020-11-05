import * as fs from 'fs';
import * as readline from 'readline';
import * as npath from 'path';
import { getDirectoryContent, isImageFile, isNotMDOrCSVFile } from './utils';
import { convertMarkdownLinks, truncateDirName, truncateFileName } from './link';
import { convertCSVToMarkdown } from './notion_csv';
import { scheduled } from 'rxjs';

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
export const fixNotionExport = (path: string, shouldProcessCsv: boolean, shouldProcessMdFiles: boolean) => {
	let markdownLinks = 0;
	let csvLinks = 0;

	let { directories, files } = getDirectoryContent(path);


	for (let file of files) {
		if (shouldProcessMdFiles) {
			file = renameNonImageFile(file);

			//Convert Markdown Links
			if (npath.extname(file) === '.md') {
				const correctedFileContents = convertMarkdownLinks(fs.readFileSync(file, 'utf8'));
				if (correctedFileContents.links) markdownLinks += correctedFileContents.links;
				fs.writeFileSync(file, correctedFileContents.content, 'utf8');
			}
		}
		if (shouldProcessCsv) {
			//Convert CSV Links and create converted, extra CSV => Markdown file
			if (npath.extname(file) === '.csv') {
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
	}

	if (shouldProcessMdFiles) {
		directories = renameDirs(directories);
	}

	//Convert children directories
	directories.forEach((dir) => {
		const reading = fixNotionExport(dir, shouldProcessCsv, shouldProcessMdFiles);
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
