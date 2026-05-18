import type { Browser, Element } from "happy-dom";
import type { Storage, SourceName } from "../database.ts";
import { extractContent } from "./common/helper.ts";
import type { InfoExtractor } from "./interface.ts";
import { defined } from "../utils.ts";
import { formatISO, isValid, parse } from "date-fns";
import { enUS } from "date-fns/locale";


export class PostgresWeekly implements InfoExtractor {
  browser: Browser;
  db: Storage;
  static baseUrl = "https://postgresweekly.com";

  constructor(
    browser: Browser,
    db: Storage,
  ) {
    this.browser = browser;
    this.db = db;
  }

  static canHandle(url: string) {
    return url.startsWith(PostgresWeekly.baseUrl);
  }

  async updateUrl(url: string): Promise<void> {
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const content = await extractContent(page, PostgresWeekly.baseUrl);

    if (Array.isArray(content) && content.length > 0) {
      this.db.updateUrl(url, content);
    }

    page.close();
  }

  async update() {
    const page = this.browser.newPage();

    await page.goto(`${PostgresWeekly.baseUrl}/issues`);

    const issues = page.mainFrame.document.querySelectorAll("div.issue-card");

    for (const issue of issues) {
      const url = issue?.querySelector("a")?.href;
      if (!url) throw new Error("failed to extract url");
      if (!url || this.db.isSaved(url)) continue;

      try {
        await page.goto(url);
        console.log(`parsing: ${url}`);

        const date = extractContentDate(issue);

        console.log(date)

        const content = await extractContent(page, PostgresWeekly.baseUrl);
        this.db.saveContent("postgresweekly", {
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

function extractContentDate(el?: Element): string {
  if (!defined(el)) throw new Error("failed to extract date: invalid string");

  const dateStr = el.querySelector(".issue-date")?.textContent ?? ""
  const date = parse(dateStr, "yyyy-MM-dd", new Date(), { locale: enUS })

  if (!isValid(date)) throw new Error("failed to parse date");
  const dateFmt = formatISO(date, { representation: "date" });

  return dateFmt;
}

// export const GolangWeekly = (browser: Browser, db: Storage) =>
//   new GolangWeekly("golangweekly", "https://golangweekly.com", browser, db);
