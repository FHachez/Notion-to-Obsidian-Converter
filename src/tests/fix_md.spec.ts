import fs from 'fs';
import { convertImagePath, convertMarkdownLinks, convertNotionLink, convertRelativePathToObsidianReference } from '../fix_md';

describe('Integration: ConvertMarkdowLinks', () => {
	it('should correctly convert csv with multiline cells', () => {
		const inputFile = __dirname + '/md/test_input.md';
		const inputContent = fs.readFileSync(inputFile).toString();

		const output = convertMarkdownLinks(inputContent);

		const expectedOutput = fs.readFileSync(__dirname + '/md/expected_output.md').toString();

		expect(output.content).toBe(expectedOutput);
	})
});

const inputMarkdownLinkToExpectedValue = [
	["[Mental/Models:I Find Repeatedly Useful - Gab Weinberg - Pocket](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md)",
		"[[Mental Models I Find Repeatedly Useful - Gab]]"],
	["[ test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)",
		"[[The Page Title (N)]]"],
	["![Histograms and kernel density estimation KDE 2/untitled](Histograms and kernel density estimation KDE 2/untitled)",
		"![Histograms and kernel density estimation KDE 2/untitled](Histograms and kernel density estimation KDE 2/untitled)"],
	["[Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially](test.md)",
		"[[Lorem Ipsum is simply dummy text of the print]]"],
	["[A 5-step process for nearly anything 1) Explore wi](d3ff636268ce4eceaccab28c7408dcb4.md)",
		"[[A 5-step process for nearly anything 1) Explo]]"],
]

describe('ConvertMarkdownLinks', () => {
	it.each(inputMarkdownLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {
		const output = convertMarkdownLinks(input)
		expect(output.content).toBe(expected)
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
	["Page:Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name*test.png",
		"Page Title/Image Name test.png"],
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
	["50% should work",
		"[[50% should work]]"]
]

describe('convertRelativePathToReference', () => {
	it.each(inputRelativePageToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertRelativePathToObsidianReference(input)

		expect(output).toBe(expected)
	})
});
