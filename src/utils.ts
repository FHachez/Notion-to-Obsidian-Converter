import * as fs from 'fs';
import * as npath from 'path';

export const isImageFile = (file: string): boolean => {
	return file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg');
}

export const isNotMDOrCSVFile = (file: string): boolean => {
	return !(file.includes('.md') || file.includes('.csv'));
}

//Returns all of the directories and files for a path
export const getDirectoryContent = (path: string) => {
	const directories: string[] = [];
	const files: string[] = [];
	const currentDirectory = fs.readdirSync(path, { withFileTypes: true });

	for (let i = 0; i < currentDirectory.length; i++) {
		let currentPath = npath.format({
			dir: path,
			base: currentDirectory[i].name,
		});
		if (currentDirectory[i].isDirectory()) directories.push(currentPath);
		if (currentDirectory[i].isFile()) files.push(currentPath);
	}

	return { directories: directories, files: files };
}
