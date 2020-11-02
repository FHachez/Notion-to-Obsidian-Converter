import { convertMarkdownLinks } from '../main';

const inputLinkToExpectedValue = [
	["[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md)",
		"[[Mental Models I Find Repeatedly Useful - Gabriel Weinberg - Pocket]]"]
]

describe('ConvertMarkdownLinks', () => {
	it.each(inputLinkToExpectedValue)('should correctly parse "%s"', (input, expected) => {

		const output = convertMarkdownLinks(input)

		expect(output.content).toBe(expected)
	})

	it('Test', () => {

	})
});
