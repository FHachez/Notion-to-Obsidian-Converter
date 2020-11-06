import * as fs from 'fs';
import { convertCSVToMarkdown } from '../../notion_csv';


describe('ConvertCSVToMarkdown', () => {
	it('should correctly convert csv with multiline cells', () => {
		const inputFile = __dirname + '/fake.csv';
		const inputContent = fs.readFileSync(inputFile).toString()

		const output = convertCSVToMarkdown(inputContent)
		// VScode is adding a new line at the end of the expected file.
		output.content += '\n'

		const expectedOutput = fs.readFileSync(__dirname + '/expected_fake.md').toString();

		expect(output.content).toBe(expectedOutput);
	})
});
