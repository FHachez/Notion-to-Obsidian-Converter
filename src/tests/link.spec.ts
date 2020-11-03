import { convertImagePath, convertMarkdownLinks, convertNotionLink, convertRelativePathToReference, truncateDirName, truncateFileName } from '../link';

const currentDir = process.cwd()

const inputLinkToExpectedValue = [
	["[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md)",
		"[[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket]]"],
	["https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536",
		"[[The Page Title (N)]]"]
]

describe('ConvertMarkdownLinks', () => {
	it.each(inputLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

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
			console.log(output)

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
	["Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/File%20Name%20azaUUUID.md",
		"[[File Name]]"],
	["File%20Name%20azaUUUID.md",
		"[[File Name]]"],
]

describe('convertRelativePathToReference', () => {
	it.each(inputRelativePageToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertRelativePathToReference(input)

		expect(output).toBe(expected)
	})
});