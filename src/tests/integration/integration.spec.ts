import tmp from 'tmp';
import fse from 'fs-extra';
import dircompare from 'dir-compare';
import { diffChars } from 'diff';

import { fixNotionExport, FixNotionExportConfigI } from '../../fix_notion_export';

tmp.setGracefulCleanup()

async function copyToTempDir(dirToCopy: string): Promise<string> {
	const tempDir = tmp.dirSync()
	// To copy a folder
	await fse.copySync(dirToCopy, tempDir.name);

	tempDir.name;

	return tempDir.name;
}


describe('Test the full conversion!', () => {
	const inputFolderToCopy = __dirname + "/input_export";
	const expectedFolder = __dirname + "/expected_output_export";
	it('should generate the expected results', async () => {
		const inputDir = await copyToTempDir(inputFolderToCopy)
		const config: FixNotionExportConfigI = {
			input_dir: inputDir,
			duplicates_dir: inputDir + '/__duplicates__',
			shouldProcessCsv: true,
			shouldProcessMdFiles: true,
			shouldRemoveLinkedDb: true
		}

		fixNotionExport(inputDir, config)

		const diff = dircompare.compareSync(inputDir, expectedFolder, {
			compareContent: true,
		})
		printDiff(diff)

		expect(diff.differences).toBe(0);
	})
});

function printDiff(result: dircompare.Result) {
	console.log('Directories are %s', result.same ? 'identical' : 'different')

	console.log('Statistics - equal entries: %s, distinct entries: %s, left only entries: %s, right only entries: %s, differences: %s',
		result.equal, result.distinct, result.left, result.right, result.differences)

	if (result.diffSet) {
		const differences = result.diffSet.filter((d) => d.state !== 'equal')
		differences.forEach(dif => console.log('Difference - name1: %s, type1: %s, name2: %s, type2: %s, state: %s',
			dif.name1, dif.type1, dif.name2, dif.type2, dif.state))

		differences.filter(d => d.reason === 'different-content').forEach(d => {
			console.log(`--- Diff for files: ${d.name1} and ${d.name2} have different content ----`)
			const a = fse.readFileSync(`${d.path1}/${d.name1}`).toString();

			const b = fse.readFileSync(`${d.path2}/${d.name2}`).toString();
			diffStrings(a, b)
		})
	}
}

function diffStrings(a: string, b: string) {
	const differences = diffChars(a, b);

	differences.forEach((part) => {
		const prefix = part.added ? 'Added:' :
			part.removed ? 'Removed:' : 'Same:';
		console.log(prefix, `'${part.value}'`);
	})
}
