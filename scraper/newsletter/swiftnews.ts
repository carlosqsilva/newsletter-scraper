import type {
  Browser,
  BrowserPage,
  HTMLAnchorElement,
  HTMLTimeElement,
} from "happy-dom";
import { isValid, parse } from "date-fns";
import { enUS } from "date-fns/locale";

import type { InfoExtractor } from "./interface.ts";
import type { Storage } from "../database.ts";
import type { InfoContent } from "./common/helper.ts";
import { defined, resolveUrl } from "../utils.ts";

export class SwiftNews implements InfoExtractor {
  browser: Browser;
  db: Storage;
  static baseUrl = "https://swiftnews.curated.co";

  constructor(browser: Browser, db: Storage) {
    this.browser = browser;
    this.db = db;
  }

  static canHandle(url: string) {
    return url.startsWith(SwiftNews.baseUrl);
  }

  async updateUrl(url: string) {
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const [, content] = await extractIssueContent(page);

    if (content.length) {
      this.db.updateUrl(url, content);
    }

    page.close();
  }

  async update() {
    const page = this.browser.newPage();
    const issuePage = this.browser.newPage();

    try {
      for await (const issue of extractIssues(page)) {
        if (this.db.isSaved(issue)) break;

        await issuePage.goto(issue);
        console.log(`parsing: ${issue}`);
        const [date, content] = await extractIssueContent(issuePage);
        this.db.saveContent("swiftnews", {
          url: issue,
          date,
          content,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      page.close();
      issuePage.close();
    }
  }
}

async function* extractIssues(page: BrowserPage) {
  for (let idx = 1; idx < 5; idx++) {
    await page.goto(`${SwiftNews.baseUrl}/issues?page=${idx}`);

    const items = page.mainFrame.document.querySelectorAll(".issues li.item a");

    for (const item of items) {
      const href = (item as HTMLAnchorElement)?.href;
      if (!href) continue;

      const url = new URL(href);

      yield `${url.origin}${url.pathname}`;
    }
  }
}

async function extractIssueContent(
  page: BrowserPage,
): Promise<[string, InfoContent[]]> {
  const timeEl = page.mainFrame.document.querySelector("header time");
  const dateStr = (timeEl as HTMLTimeElement).dateTime;
  const date = parse(dateStr, "yyyy-MM-dd", new Date(), { locale: enUS });
  if (!isValid(date)) throw new Error("failed to extract date");

  const sections = Array.from(
    page.mainFrame.document.querySelectorAll(
      'section.category:not([class*="sponsor"])',
    ),
  );

  const items = sections.flatMap((it) =>
    Array.from(it.querySelectorAll(".item.item--issue")),
  );

  const promisesInfo: Promise<InfoContent | null>[] = [];
  for (const item of items) {
    if (!defined(item)) continue;
    promisesInfo.push(
      (async () => {
        const titleEl = item.querySelector('*[class*="title"]');
        const href = (titleEl?.querySelector("a") as HTMLAnchorElement)?.href;
        if (!defined(href)) return null;

        const link = await resolveUrl(href);
        if (!defined(link)) return link;

        let description = item.querySelector("p")?.textContent;
        description = `${titleEl?.textContent} - ${description}`;

        return { link, description };
      })(),
    );
  }

  const infoList = (await Promise.all(promisesInfo)).filter((it) =>
    defined(it),
  );

  console.log(`extracted ${infoList.length} items`);
  return [dateStr, infoList];
}
