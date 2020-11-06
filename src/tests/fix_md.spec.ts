import fs from 'fs';
import { convertImagePath, convertMarkdownLinks, convertNotionLink, convertRelativePathToObsidianReference, truncateDirName, truncateFileName } from '../fix_md';

const currentDir = process.cwd()

describe('Integration: ConvertMarkdowLinks', () => {
	it('should correctly convert csv with multiline cells', () => {
		const inputFile = __dirname + '/md/test_input.md';
		const inputContent = fs.readFileSync(inputFile).toString()

		const output = convertMarkdownLinks(inputContent)

		expect(fs.readFileSync(__dirname + '/md/expected_output.md').toString()).toBe(output.content);
	})
});

const inputMarkdownLinkToExpectedValue = [
	["[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md)",
		"[[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket]]"],
	["[ test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)",
		"[[The Page Title (N)]]"],
	["![Histograms and kernel density estimation KDE 2/untitled](Histograms and kernel density estimation KDE 2/untitled)",
		"![Histograms and kernel density estimation KDE 2/untitled](Histograms and kernel density estimation KDE 2/untitled)"]
]

describe('ConvertMarkdownLinks', () => {
	it.each(inputMarkdownLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertMarkdownLinks(input)

		expect(output.content).toBe(expected)
	})
});


const fileNameToTruncateWithExpectedValues = [
	["test/Concepts Facts DB 509873978c5c4d1ab3002ee934ad4686.md", currentDir + "/test/Concepts Facts DB.md"],
	["/full/feedback (N) b0ab9f2e031f4fe79f6214cd876dbdf5.md", "/full/feedback (N).md"]
]
describe('truncateFileName', () => {
	it.each(fileNameToTruncateWithExpectedValues)(
		'It should truncate path %s into %s', (input, expected) => {
			const output = truncateFileName(input)

			expect(output).toBe(expected)

		})
});

const dirNameToTruncateWithExpectedValues = [
	["test/Concepts Facts DB 509873978c5c4d1ab3002ee934ad4686", currentDir + "/test/Concepts Facts DB"],
	["/full/feedback (N) b0ab9f2e031f4fe79f6214cd876dbdf5.md", "/full/feedback (N)"]
]
describe('truncateDirName', () => {
	it.each(dirNameToTruncateWithExpectedValues)(
		'It should truncate path %s into %s', (input, expected) => {
			const output = truncateDirName(input)

			expect(output.toString()).toEqual(expected)

		})
});

const inputNotionURLLinkToExpectedValue = [
	["https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536",
		"[[The Page Title]]"],
	// Decode URI
	["https://www.notion.so/The%20Page%E2%80%93-Title-2d41ab7b61d14cec885357ab17d48536",
		"[[The Page– Title]]"],
]

describe('convertNotionLink', () => {
	it.each(inputNotionURLLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertNotionLink(input)

		expect(output).toBe(expected)
	})
});


const inputImageLinkToExpectedValue = [
	["Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png",
		"Page Title/Image Name.png"],
]

describe('convertImagePath', () => {
	it.each(inputImageLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertImagePath(input)

		expect(output).toBe(expected)
	})
});

const inputRelativePageToExpectedValue = [
	["Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/File%20Name%2020c5ae5f01ba5d4fb9a94d13d9939710.md",
		"[[File Name]]"],
	["File%20Name%20notA UUUID.md",
		"[[File Name notA UUUID]]"],
]

describe('convertRelativePathToReference', () => {
	it.each(inputRelativePageToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertRelativePathToObsidianReference(input)

		expect(output).toBe(expected)
	})
});
