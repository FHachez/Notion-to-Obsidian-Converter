import { isLinkedView } from "../fix_notion_export";


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
