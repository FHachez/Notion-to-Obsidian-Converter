import * as fs from 'fs';
import * as npath from 'path';
import { getDirectoryContent } from './utils';
import { convertMarkdownLinks, truncateDirName, truncateFileName } from './link';
import { convertCSVToMarkdown } from './notion_csv';
import { dir } from 'console';

export interface FixNotionExportConfigI {
	shouldProcessCsv: boolean
	shouldProcessMdFiles: boolean
	shouldRemoveLinkedDb: boolean
}


const renameNonCsvFile = (file: string): string => {
	if (file.endsWith('.csv')) return file;

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

const processIfMarkdown = (file: string): number => {
	if (npath.extname(file) === '.md') {
		const correctedFileContents = convertMarkdownLinks(fs.readFileSync(file, 'utf8'));
		fs.writeFileSync(file, correctedFileContents.content, 'utf8');
		return correctedFileContents.links;
	}
	return 0;

}

const processIfCsv = (file: string): number => {
	//Convert CSV Links and create converted, extra CSV => Markdown file
	if (npath.extname(file) === '.csv') {
		const csvContent = fs.readFileSync(file, 'utf8');
		const csvContentAsMarkdown = convertCSVToMarkdown(csvContent);
		fs.writeFileSync(
			truncateFileName(file.replace(/.csv$/, '.md')),
			csvContentAsMarkdown.content,
			'utf8'
		);
		return csvContentAsMarkdown.links;

	}
	return 0;
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

export const isLinkedView = (file: string, directoriesNextToIt: string[]): boolean => {
	if (npath.extname(file) !== '.csv') {
		return false
	}
	// A database is represented by a csv and a folder with one note for each row of the table
	const expectedDir = npath.basename(file, `.csv`)
	// A linked view doesn't have an adjacent folder with the same name
	return !directoriesNextToIt.map(d => npath.basename(d)).includes(expectedDir);
}

const removeLinkedDb = (file: string) => {
	try {
		console.log(`remove linked view ${file}`)
		fs.unlinkSync(file);
	}
	catch (err) {
		console.error(`Couldn't remove linked db ${file} because ${err}`)
	}
}

const removeDirIfEmpty = (dir: string) => {
	if (!fs.readdirSync(dir).length) {
		try {
			console.log(`empty dir ${dir}`)
			fs.rmdirSync(dir);
		} catch (err) {
			console.log(`Couldn't remove empty dir ${dir} because ${err}`)

		}
	}
}


// Recursively fix the export
export const fixNotionExport = (path: string, config: FixNotionExportConfigI) => {
	let markdownLinks = 0;
	let csvLinks = 0;

	let { directories, files } = getDirectoryContent(path);

	for (let file of files) {
		if (config.shouldProcessMdFiles) {
			file = renameNonCsvFile(file);
			markdownLinks += processIfMarkdown(file);
		}
		if (config.shouldProcessCsv) {
			if (config.shouldRemoveLinkedDb) {
				if (isLinkedView(file, directories)) {
					removeLinkedDb(file);
				} else {
					csvLinks += processIfCsv(file);
				}
			} else {
				csvLinks += processIfCsv(file);
			}
		}
	}

	if (config.shouldProcessMdFiles) {
		directories = renameDirs(directories);
	}

	removeDirIfEmpty(path);

	let nFiles = 0;
	let nDirectories = 0;

	//Convert children directories
	directories.forEach((dir) => {
		const reading = fixNotionExport(dir, config);
		nDirectories += reading.nDirectories;
		nFiles += reading.nFiles;
		markdownLinks += reading.markdownLinks;
		csvLinks += reading.csvLinks;
	});

	return {
		nDirectories: nDirectories,
		nFiles: nFiles,
		markdownLinks: markdownLinks,
		csvLinks: csvLinks,
	};
};
