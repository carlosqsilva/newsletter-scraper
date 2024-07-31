import type {
  Browser,
  BrowserPage,
  HTMLAnchorElement,
  Element,
} from "happy-dom";
import type { Storage } from "../database";
import { extractContentDate } from "./javascripweekly/helper.ts";

const baseUrl = "https://thisweekinreact.com";

export async function extractThisWeekInReact(browser: Browser, db: Storage) {
  const page = browser.newPage();

  await page.goto(`${baseUrl}/newsletter`);

  const issues = page.mainFrame.document.querySelectorAll(
    `nav[class^="sidebar"] > ul li`,
  );

  for (const issue of issues) {
    const url = issue?.querySelector("a")?.href;

    if (!url) throw new Error("failed to extract url");
    if (db.isSaved(url)) continue;
    if (url.endsWith("previous")) continue;

    try {
      await page.goto(url);
      console.log(`parsing: ${url}`);

      const { date, content } = extractContent(page);
      db.saveContent("thisweekinreact", {
        url,
        date,
        content,
      });
    } catch (err) {
      console.log(err);
    }
  }

  await page.close();
}

function extractContent(page: BrowserPage) {
  const dateStr =
    page.mainFrame.document.querySelector("main header time")?.textContent;

  const date = extractContentDate(dateStr);

  const contentList =
    page.mainFrame.document.querySelectorAll("main article ul");

  const infoList = [];
  for (const content of contentList) {
    const listItems = Array.from<Element>(content.children ?? []);
    if (listItems.length < 5) continue;
    if (listItems.some((item) => !item?.querySelector("a"))) continue;

    for (const item of listItems) {
      const link = (item?.querySelector("a") as HTMLAnchorElement)?.href;
      const description = item.textContent?.trim();
      if (!link || !description) continue;

      infoList.push({ link, description });
    }
  }

  console.log(`extracted ${infoList.length} items`);

  return { date, content: infoList.length === 0 ? null : infoList };
}
