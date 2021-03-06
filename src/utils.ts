import * as fs from 'fs';
import * as npath from 'path';
import { fileExtensionRegex } from './regex';

export const isImageFile = (file: string): boolean => {
	return file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg');
}

/**
 * It ends with a dot and some characters".xyz"
 */
export const hasFileExtensionInMDLink = (file: string): boolean => {
	return /\.[0-9a-zA-Z]+\)$/.test(file);
}

/**
 * It ends with a dot and some characters".xyz"
 */
export const hasAFileExtension = (file: string): boolean => {
	//return !!file.match(/\..+$/);
	return fileExtensionRegex.test(file);
}
export const isNotMDOrCSVFile = (file: string): boolean => {
	return !(file.includes('.md') || file.includes('.csv'));
}

export interface DirectoryContentI {
	files: string[]
	directories: string[]
}

//Returns all of the directories and files for a path
export const getDirectoryContent = (path: string): DirectoryContentI => {
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
