import type { Browser } from "happy-dom";
import type { Storage, SourceName } from "../../database";
import { extractContent, extractContentDate } from "./helper.ts";

export function extractFactory(source: SourceName, archiveUrl: string) {
	return async (browser: Browser, db: Storage) => {
		const page = browser.newPage();

		await page.goto(archiveUrl);

		const issues = page.mainFrame.document.querySelectorAll("div.issue");

		for (const issue of issues) {
			const url = issue?.querySelector("a")?.href;
			if (!url) throw new Error("failed to extract url");
			if (!url || db.isSaved(url)) continue;

			try {
				await page.goto(url);
				console.log(`parsing: ${url}`);

				const textContent = issue?.textContent;
				const date = extractContentDate(textContent);
				const content = extractContent(page);
				db.saveContent(source, {
					url,
					date,
					content,
				});
			} catch (err) {
				console.log(err);
			}
		}

		await page.close();
	};
}

export const extractJavascriptlyWeekly = extractFactory(
	"javascriptweekly",
	"https://javascriptweekly.com/issues",
);
