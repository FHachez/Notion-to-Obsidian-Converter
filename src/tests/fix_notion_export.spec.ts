import { cleanFileNameForReferenceAndResolvePath, isLinkedView, removeUUIDAndResolvePath } from "../fix_notion_export";

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
	["/full/feedback (N) b0ab9f2e031f4fe79f6214cd876dbdf5", "/full/feedback (N)"],
	["Test: c29d85477c77427f88ece7143e480e1f.md", currentDir + "/Test.md"],
	["test/Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially.md",
		currentDir + "/test/Lorem Ipsum is simply dummy text of the print.md"],
	["test/A 5-step process for nearly anything 1) Explore wi d3ff636268ce4eceaccab28c7408dcb4.md",
		currentDir + "/test/A 5-step process for nearly anything 1) Explo.md"],
	["/Creamy Mac and Cheese - Million Dollar Vegan a2be8eb3f3b9472a908caf6dae487160.md",
		"/Creamy Mac and Cheese - Million Dollar Vegan.md"],

]
describe('removeUUIDAndResolvePath', () => {
	it.each(fileNameToTruncateWithExpectedValues)(
		'It should truncate path %s into %s', (input, expected) => {
			const output = cleanFileNameForReferenceAndResolvePath(input)

			expect(output).toBe(expected)

		})
});
