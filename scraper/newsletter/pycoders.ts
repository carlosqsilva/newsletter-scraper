import type {
  Browser,
  BrowserPage,
  Element,
  HTMLAnchorElement,
} from "happy-dom";
import { formatISO, isValid, parse } from "date-fns";
import { enUS } from "date-fns/locale";

import type { Storage } from "../database.ts";
import type { InfoContent } from "./common/helper.ts";
import { defined, resolveUrl } from "../utils.ts";
import type { InfoExtractor } from "./interface.ts";

export class PyCoders implements InfoExtractor {
  db: Storage;
  browser: Browser;
  static baseUrl = "https://pycoders.com";

  constructor(browser: Browser, db: Storage) {
    this.browser = browser;
    this.db = db;
  }

  static canHandle(url: string) {
    return url.startsWith(PyCoders.baseUrl);
  }

  async updateUrl(url: string) {
    if (!this.db.isSaved(url)) {
      throw new Error(`URL does not exist on database: ${url}`);
    }

    const page = this.browser.newPage();
    await page.goto(url);

    console.log(`parsing: ${url}`);
    const content = await extractContent(page);

    if (content.length) {
      this.db.updateUrl(url, content);
    }

    page.close();
  }

  async update() {
    const page = this.browser.newPage();

    await page.goto(`${PyCoders.baseUrl}/issues`);

    const issues = page.mainFrame.document.querySelectorAll(
      '.container div h2 a[href^="/issues"]',
    );

    for (const issue of issues) {
      const url = (issue as HTMLAnchorElement).href;
      if (!url) throw new Error("failed to extract url");
      if (!url || this.db.isSaved(url)) continue;

      const issueNumber = Number(url.split("/").at(-1));
      // skip everything from "Issue #402 (Jan. 1, 2020)"
      if (issueNumber < 402) break;

      try {
        await page.goto(url);
        console.log(`parsing: ${url}`);

        const textContent = issue?.textContent;
        const date = extractDate(textContent);
        const content = await extractContent(page);
        this.db.saveContent("pycoders", {
          url,
          date,
          content,
        });
      } catch (err) {
        console.error(err);
      } finally {
        page.close();
      }
    }
  }
}

async function extractContent(page: BrowserPage) {
  const parts = page.mainFrame.document.querySelectorAll(
    "table tbody tr td > span,br",
  );

  const promisesInfo = [] as Promise<InfoContent | null>[];
  let breakCount = 0;
  let currentInfo = [];

  for (const part of parts) {
    if (part.tagName.toLowerCase() === "span") {
      currentInfo.push(part);
      breakCount = Math.max(0, breakCount - 1);
    }
    if (part.tagName.toLowerCase() === "br") breakCount += 1;
    if (breakCount > 1) {
      const contentPromise = parseInfo(currentInfo);
      promisesInfo.push(contentPromise);
      currentInfo = [];
      breakCount = 0;
    }
  }

  let infoList = await Promise.all(promisesInfo);
  infoList = infoList.filter((it) => defined(it));
  console.log(`extracted ${infoList.length} items`);

  return infoList;
}

const sponsorRegex = /sponsor/i;
const locationRegex = /📍/i;
async function parseInfo(nodeList: Element[]): Promise<InfoContent | null> {
  if (nodeList.length < 2) return null;
  let nodes = nodeList;

  const lastItemContent = nodes.at(-1)?.textContent ?? "";

  // skip sponsor content
  if (sponsorRegex.test(lastItemContent)) return null;

  // try to remove "Jobs link" if has location 📍
  if (locationRegex.test(lastItemContent)) {
    return null;
  }

  if (nodes.length > 1) {
    nodes = nodes.slice(0, -1);
  }

  const content = {} as InfoContent;

  for (const ele of nodes) {
    if (!content.link) {
      content.link = (ele?.querySelector("a") as HTMLAnchorElement)?.href;
    }

    const textContent = ele.textContent;

    if (content.description) {
      content.description = `${content.description} - ${textContent}`;
    } else {
      content.description = textContent;
    }
  }

  if (!content.link) return null;

  if (content.link.startsWith(PyCoders.baseUrl)) {
    const finalUrl = await resolveUrl(content.link);
    if (!finalUrl) return null;
    content.link = finalUrl;
  }

  return content;
}

const dateStringRegex = /\((?<date>.+?)\)$/i;
function extractDate(str: string) {
  const groups = dateStringRegex.exec(str?.trim())?.groups;
  if (!groups || !groups.date)
    throw new Error(`failed to extract date: "${str}"`);

  const dateStr = groups.date
    .replace(/dec./i, "December")
    .replace(/nov./i, "November")
    .replace(/oct./i, "October")
    .replace(/sept./i, "September")
    .replace(/aug./i, "August")
    .replace(/feb./i, "February")
    .replace(/jan./i, "January")
    .replace(",", "");

  const date = parse(dateStr, "MMMM dd yyyy", new Date(), { locale: enUS });

  if (!isValid(date)) throw new Error("failed to parse date");
  const dateFmt = formatISO(date, { representation: "date" });

  return dateFmt;
}
