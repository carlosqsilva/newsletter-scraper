import { formatISO, isValid, parse } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Browser, Element } from "happy-dom";
import type { SourceName, Storage } from "../../database.ts";
import type { InfoExtractor } from "../interface.ts";
import { extractContent } from "./helper.ts";

/**
 * Extractor for the Copper Press / StatusCode newsletters.
 *
 * All of them share the same markup: issues are listed as `div.issue-card`
 * elements with an ISO date in `.issue-date`, and issue content lives in
 * `table.el-item` / `table.content.el-md` elements.
 */
export class StatusCodeExtractor implements InfoExtractor {
  browser: Browser;
  db: Storage;
  source: SourceName;
  baseUrl: string;

  constructor(
    source: SourceName,
    baseUrl: string,
    browser: Browser,
    db: Storage,
  ) {
    this.source = source;
    this.baseUrl = baseUrl;
    this.browser = browser;
    this.db = db;
  }

  canHandle(url: string) {
    return url.startsWith(this.baseUrl);
  }

  async updateUrl(url: string): Promise<void> {
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const content = await extractContent(page, this.baseUrl);

    if (Array.isArray(content) && content.length > 0) {
      this.db.updateUrl(url, content);
    }

    await page.close();
  }

  async update(): Promise<void> {
    const page = this.browser.newPage();
    // Issue content is loaded in a separate page: happy-dom replaces the
    // document on navigation, which would invalidate the issue cards below.
    const issuePage = this.browser.newPage();

    await page.goto(`${this.baseUrl}/issues`);

    const issues = page.mainFrame.document.querySelectorAll("div.issue-card");

    for (const issue of issues) {
      const url = issue.querySelector("a")?.href;
      if (!url) throw new Error("failed to extract url");
      if (this.db.isSaved(url)) continue;

      try {
        const date = extractIssueDate(issue);

        await issuePage.goto(url);
        console.log(`parsing: ${url}`);
        console.log(date);

        const content = await extractContent(issuePage, this.baseUrl);
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
    await issuePage.close();
  }
}

function createExtractor(source: SourceName, baseUrl: string) {
  return (browser: Browser, db: Storage) =>
    new StatusCodeExtractor(source, baseUrl, browser, db);
}

export const JavascriptWeekly = createExtractor(
  "javascriptweekly",
  "https://javascriptweekly.com",
);
export const NodeWeekly = createExtractor(
  "nodeweekly",
  "https://nodeweekly.com",
);
export const RubyWeekly = createExtractor(
  "rubyweekly",
  "https://rubyweekly.com",
);
export const PostgresWeekly = createExtractor(
  "postgresweekly",
  "https://postgresweekly.com",
);
export const ReactStatusCode = createExtractor(
  "reactstatus",
  "https://react.statuscode.com",
);
export const FrontendFocus = createExtractor(
  "frontendfocus",
  "https://frontendfoc.us",
);
export const GolangWeekly = createExtractor(
  "golangweekly",
  "https://golangweekly.com",
);

// parse the ISO date from the issue list, e.g. "2026-11-19"
function extractIssueDate(el: Element): string {
  const dateStr = el.querySelector(".issue-date")?.textContent ?? "";
  const date = parse(dateStr, "yyyy-MM-dd", new Date(), { locale: enUS });

  if (!isValid(date)) throw new Error("failed to parse date");

  return formatISO(date, { representation: "date" });
}
