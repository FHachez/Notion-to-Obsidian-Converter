import * as fs from 'fs';
import { convertCSVToMarkdown, transformCellToLink } from '../../notion_csv';


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

describe('transformCellToLink', () => {
	const inputNotionURLLinkToExpectedValue = [
		["Flatbread Easy Soft (No Yeast) - (Très sympa, un peu brioche/crêpe épaisse)",
			"[[Flatbread Easy Soft (No Yeast) - (Très sympa]]"],
		["T\"E?s|t:x/v<c>d.aa*x%v",
			"[[T E s t x v c d aa x%v]]"],
		["Loooooooooooooooong:Loooooooooooooooong:Loooooooooooooooong:Loooooooooooooooong*Loooooooooooooooong*Loooooooooooooooong*Loooooooooooooooong*Loooooooooooooooong",
			"[[Loooooooooooooooong Loooooooooooooooong Loooo]]"],
	]

	it.each(inputNotionURLLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {
		const output = transformCellToLink(input)
		expect(output.normalize("NFD")).toBe(expected)
	})
});
