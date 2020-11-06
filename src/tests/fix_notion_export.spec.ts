import { isLinkedView, removeUUIDAndResolvePath } from "../fix_notion_export";

const currentDir = process.cwd()

describe('isLinkedView', () => {
	it('should correctly detect a linked view', () => {
		const output = isLinkedView(
			'/test/db%c29d85477c77427f88ece7143e480e1f.csv',
			[
				'/test/whatever'
			]
		);

		expect(output).toBeTruthy()
	})
	it('should correctly detect a main db as not a linked view', () => {
		const output = isLinkedView(
			'/test/dbc29d85477c77427f88ece7143e480e1f.csv',
			[
				'/test/dbc29d85477c77427f88ece7143e480e1f',
				'/test/whatever'
			]
		);

		expect(output).toBeFalsy()
	})
});


const fileNameToTruncateWithExpectedValues = [
	["test/Concepts Facts DB 509873978c5c4d1ab3002ee934ad4686.md", currentDir + "/test/Concepts Facts DB.md"],
	["/full/feedback (N) b0ab9f2e031f4fe79f6214cd876dbdf5.md", "/full/feedback (N).md"],
	["test/Concepts Facts DB 509873978c5c4d1ab3002ee934ad4686", currentDir + "/test/Concepts Facts DB"],
	["/full/feedback (N) b0ab9f2e031f4fe79f6214cd876dbdf5", "/full/feedback (N)"]
]
describe('removeUUIDAndResolvePath', () => {
	it.each(fileNameToTruncateWithExpectedValues)(
		'It should truncate path %s into %s', (input, expected) => {
			const output = removeUUIDAndResolvePath(input)

			expect(output).toBe(expected)

		})
});
