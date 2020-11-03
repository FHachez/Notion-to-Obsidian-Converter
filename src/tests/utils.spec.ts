import { isNotMDOrCSVFile } from "../utils";


const inputLinkToExpectedValue = [
	["test.md", false],
	["(test.md)", false],
	["(test.png)", true],
	["(test.pdf)", true],
]

describe('isNotMDOrCSVFile', () => {
	it.each(inputLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = isNotMDOrCSVFile(<string>input)

		expect(output).toBe(expected)
	})
});
