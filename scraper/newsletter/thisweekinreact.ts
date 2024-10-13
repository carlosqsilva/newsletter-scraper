import type {
  Browser,
  BrowserPage,
  HTMLAnchorElement,
  Element,
} from "happy-dom";
import type { Storage } from "../database";
import {
  extractContentDate,
  type InfoContent,
} from "./javascripweekly/helper.ts";
import type { InfoExtractor } from "./interface.ts";

export class ThisWeekInReact implements InfoExtractor {
  browser: Browser;
  db: Storage;
  static issueUrlPattern = /newsletter\/\d+$/i;
  static baseURL = "https://thisweekinreact.com";

  static canHandle(url: string) {
    return (
      url.startsWith(ThisWeekInReact.baseURL) &&
      ThisWeekInReact.issueUrlPattern.test(url)
    );
  }

  constructor(browser: Browser, db: Storage) {
    this.browser = browser;
    this.db = db;
  }

  async updateUrl(url: string) {
    if (!ThisWeekInReact.canHandle(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const [, content] = extractContent(page);

    if (content.length) {
      this.db.updateUrl(url, content);
    }

    page.close();
  }

  async update() {
    const page = this.browser.newPage();

    await page.goto(`${ThisWeekInReact.baseURL}/newsletter`);

    const issues = page.mainFrame.document.querySelectorAll(
      `nav[class^="sidebar"] ul[class^="sidebarItemList"] li`,
    );

    for (const issue of issues) {
      const url = issue?.querySelector("a")?.href;

      if (!url) throw new Error("failed to extract url");
      if (!ThisWeekInReact.issueUrlPattern.test(url)) continue;
      if (this.db.isSaved(url)) continue;
      if (url.endsWith("previous")) continue;

      try {
        await page.goto(url);
        console.log(`parsing: ${url}`);

        const [date, content] = extractContent(page);
        this.db.saveContent("thisweekinreact", {
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
}

function extractContent(page: BrowserPage): [string, InfoContent[]] {
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

  return [date, infoList];
}
