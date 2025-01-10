import type { Browser } from "happy-dom";
import type { Storage, SourceName } from "../../database.ts";
import { extractContent, extractContentDate } from "./helper.ts";
import type { InfoExtractor } from "../interface.ts";

class CommonExtractor implements InfoExtractor {
  browser: Browser;
  db: Storage;
  baseURL: string;
  source: SourceName;
  constructor(
    source: SourceName,
    baseURL: string,
    browser: Browser,
    db: Storage,
  ) {
    this.browser = browser;
    this.db = db;
    this.baseURL = baseURL;
    this.source = source;
  }

  canHandle(url: string) {
    return url.startsWith(this.baseURL);
  }

  async updateUrl(url: string): Promise<void> {
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const content = await extractContent(page, this.baseURL);

    if (Array.isArray(content) && content.length > 0) {
      this.db.updateUrl(url, content);
    }

    page.close();
  }

  async update() {
    const page = this.browser.newPage();

    await page.goto(`${this.baseURL}/issues`);

    const issues = page.mainFrame.document.querySelectorAll("div.issue");

    for (const issue of issues) {
      const url = issue?.querySelector("a")?.href;
      if (!url) throw new Error("failed to extract url");
      if (!url || this.db.isSaved(url)) continue;

      try {
        await page.goto(url);
        console.log(`parsing: ${url}`);

        const date = extractContentDate(issue.textContent);
        const content = await extractContent(page, this.baseURL);
        this.db.saveContent(this.source, {
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

export const JavascriptWeekly = (browser: Browser, db: Storage) =>
  new CommonExtractor(
    "javascriptweekly",
    "https://javascriptweekly.com",
    browser,
    db,
  );

export const FrontendFocus = (browser: Browser, db: Storage) =>
  new CommonExtractor("frontendfocus", "https://frontendfoc.us", browser, db);

export const NodeWeekly = (browser: Browser, db: Storage) =>
  new CommonExtractor("nodeweekly", "https://nodeweekly.com", browser, db);

export const ReactStatus = (browser: Browser, db: Storage) =>
  new CommonExtractor(
    "reactstatus",
    "https://react.statuscode.com",
    browser,
    db,
  );

export const GolangWeekly = (browser: Browser, db: Storage) =>
  new CommonExtractor("golangweekly", "https://golangweekly.com", browser, db);

export const RubyWeekly = (browser: Browser, db: Storage) =>
  new CommonExtractor("rubyweekly", "https://rubyweekly.com", browser, db);

export const PostgresWeekly = (browser: Browser, db: Storage) =>
  new CommonExtractor(
    "postgresweekly",
    "https://postgresweekly.com",
    browser,
    db,
  );
