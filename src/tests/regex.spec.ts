import { TupleExpression } from '@babel/types';
import { execFile } from 'child_process';
import { getLinkTextWithSurroudingBracketMatches, getLinkTextWithPathMatches, getNotionMatches, removeUUIDs } from '../regex';


describe('getLinkTextWithPathMatches', () => {
	const inputTextToExpectedLinkWithPath = [
		// Normal link to other note
		["let's get a full match [Mental - Pocket (N)](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md) follow up",
			"[Mental - Pocket (N)](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md)"],
		// Url link
		["ahaha [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)"],
		["ahaha [test](https://www.google.com) test",
			"[test](https://www.google.com)"],
		["🎞️ **Content Creation Dashboard** **(add your link, [template available](https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e))**",
			"[template available](https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e)"],
		// Image
		["ahaha [test_image](folder/path.png) test",
			"[test_image](folder/path.png)"],
		// Image without file type
		["- [] [Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20and%20KDE%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled) test",
			"[Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20and%20KDE%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled)"],
		// Link after todo
		["- [] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)"],
		["- [ ] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)"],
		["- [ ] [test([])](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test([])](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536)"],
	]

	it.each(inputTextToExpectedLinkWithPath)('should correctly parse "%s"', (input, expected) => {

		const output = getLinkTextWithPathMatches(input)

		expect(output).toStrictEqual([expected])

	})
});


describe('getLinkTextMatches', () => {
	const inputTextToExpectedLinkText = [
		// Normal link to other note
		["let's get a full match [Mental - Pocket (N)](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md) follow up",
			"[Mental - Pocket (N)]("],
		// Url link
		["ahaha [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test]("],
		["ahaha [test](https://www.google.com) test",
			"[test]("],
		["🎞️ **Content Creation Dashboard** **(add your link, [template available](https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e))**",
			"[template available]("],
		// Image
		["ahaha [test_image](folder/path.png) test",
			"[test_image]("],
		// Image without file type
		["- [] [Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20and%20KDE%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled) test",
			"[Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled]("],
		// Link after todo
		["- [] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test]("],
		["- [ ] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test]("],
		["- [ ] [test([])](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"[test([])]("],
	]

	it.each(inputTextToExpectedLinkText)('should correctly parse "%s"', (input, expected) => {

		const output = getLinkTextWithSurroudingBracketMatches(input)

		expect(output).toStrictEqual([expected])

	})
});

describe('getNotionMatches', () => {
	const inputTextToExpectedNotionMatches: [string, string | null][] = [
		// Normal link to other note
		["let's get a full match [Mental - Pocket (N)](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md) follow up",
			null],
		// Url link
		["ahaha [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536"],
		["ahaha [test](https://www.google.com) test",
			null],
		["🎞️ **Content Creation Dashboard** **(add your link, [template available](https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e))**",
			"https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e"],
		// Image
		["ahaha [test_image](folder/path.png) test",
			null],
		// Image without file type
		["- [] [Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20and%20KDE%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled) test",
			null],
		// Link after todo
		["- [] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536"],
		["- [ ] [test([])](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536"],
	]

	it.each(inputTextToExpectedNotionMatches)('should correctly parse "%s"', (input, expectedFullMatch) => {

		const output = getNotionMatches(input)

		if (expectedFullMatch) {
			expect(output).toStrictEqual([expectedFullMatch])
			//@ts-ignore
			//expect(output.groups).toStrictEqual([expectedFullMatch])
		} else {
			expect(output).toBeNull()
		}

	})
});

describe('removeUUIDs', () => {
	const inputTextWithUUIDToExpectedText: [string, string][] = [
		// Normal link to other note
		["let's get a full match [Mental - Pocket (N)](Mental%20Model%20(Master)%209046d23c4cd340f2854d889061e29548/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20460d555b62aa404eab75b7a3f188e96e.md) follow up",
			"let's get a full match [Mental - Pocket (N)](Mental%20Model%20(Master)%20/Mental%20Models%20I%20Find%20Repeatedly%20Useful%20-%20Gabriel%20W%20.md) follow up"],
		// Url link
		["ahaha [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"ahaha [test](https://www.notion.so/The-Page-Title-(N)) test"],
		["ahaha [test](https://www.google.com) test",
			"ahaha [test](https://www.google.com) test"],
		["🎞️**Content Creation Dashboard** **(add your link, [template available](https://www.notion.so/yearzero/Content-Machine-Template-371ee5a46e9e498b8f7d51f23e496c4e))**",
			"🎞️**Content Creation Dashboard** **(add your link, [template available](https://www.notion.so/yearzero/Content-Machine-Template))**"],
		// Image
		["ahaha [test_image](folder/path.png) test",
			"ahaha [test_image](folder/path.png) test"],
		// Image without file type
		["- [] [Histograms%20and%20kernel%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20and%20KDE%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled) test",
			"- [] [Histograms%20and%20kernel%202%20/untitled](Histograms%20and%20KDE%202%20/untitled) test"],
		// Link after todo
		["- [] [test](https://www.notion.so/The-Page-Title-(N)-2d41ab7b61d14cec885357ab17d48536) test",
			"- [] [test](https://www.notion.so/The-Page-Title-(N)) test"],
	]

	it.each(inputTextWithUUIDToExpectedText)('should correctly parse "%s"', (input, expectedFullMatch) => {

		const output = removeUUIDs(input)

		expect(output).toBe(expectedFullMatch)
	})
});
