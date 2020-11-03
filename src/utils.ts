import * as fs from 'fs';
import * as npath from 'path';

export const isImageFile = (file: string): boolean => {
	return npath.extname(file) !== '.png';
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
