import type { Element, HTMLAnchorElement, BrowserPage } from "happy-dom";
import { parse, formatISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { defined, resolveUrl } from "../../utils.ts";

const dateReg =
  /\b(?<month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?<day>\d{1,2})(st|th)?,\s+(?<year>\d{4})\b/gi;

// parse string like ex: "July 20, 2024" and transform into ISO 8601 date yyyy-MM-dd
export function extractContentDate(content?: string) {
  if (!content) throw new Error("failed to extract date: invalid string");

  dateReg.lastIndex = 0;

  const str = content
    ?.replace("Decemeber", "December")
    .replace("Febraury", "February");

  const groups = dateReg.exec(str?.trim())?.groups;
  if (!groups) throw new Error(`failed to extract date: "${content}"`);

  const dateStr = `${groups.year}-${groups.month}-${groups.day}`;
  const date = parse(dateStr, "yyyy-MMMM-d", new Date(), { locale: enUS });

  if (!isValid(date)) throw new Error("failed to parse date");
  const dateFmt = formatISO(date, { representation: "date" });

  return dateFmt;
}

export interface InfoContent {
  author?: string;
  isSponsored?: boolean;
  description: string;
  link: string;
}

export async function extractContent(page: BrowserPage, baseURL: string) {
  const content = page.mainFrame.document.querySelectorAll(
    "table.el-item.item, table.content.el-md",
  );

  let infoList: InfoContent[] = [];
  for (const info of content) {
    const content = parseContent(info);

    if (!defined(content)) continue;

    infoList = infoList.concat(Array.isArray(content) ? content : [content]);
  }

  if (infoList.length === 0) return null;

  const promises = infoList.map(async (info) => {
    if (!info.link.startsWith(baseURL)) return info;
    const link = await resolveUrl(info.link);
    if (!defined(link)) return info;
    return { ...info, link };
  });

  infoList = await Promise.all(promises);

  console.log(`found ${content.length} items, extracted ${infoList.length}`);

  return infoList;
}

function parseContent(data: Element): InfoContent | InfoContent[] | null {
  const className = data?.className.trim();

  if (className.startsWith("el-item item")) {
    return parseStandardInfo(data);
  }

  if (className.startsWith("content el-md")) {
    return parseSmallInfo(data);
  }

  return null;
}

function parseStandardInfo(data: Element): InfoContent | null {
  const content = data.querySelector("p.desc");
  const description = content?.textContent.trim();
  const author = data.querySelector("p.name")?.textContent.trim();
  const link = (content?.querySelector("span a") as HTMLAnchorElement)?.href;

  const isSponsored = author?.toLowerCase().endsWith("sponsor");

  if (!link || !description) return null;

  return {
    author,
    isSponsored,
    description,
    link,
  };
}

const titleReg = /(brief|release)/i;

function parseSmallInfo(data: Element): InfoContent[] | null {
  const title = data.querySelector("p")?.textContent;
  if (title && titleReg.test(title)) return null;

  const items = data.querySelectorAll("td > ul > li, td > p");
  const contentList = [];

  for (const item of items) {
    const link = item.querySelector("a")?.href;
    const description = item?.textContent.trim();

    if (!link || !description) continue;

    contentList.push({
      link,
      description,
    });
  }

  console.table(`extracted small items: ${contentList.length}`);

  if (contentList.length > 0) return contentList;

  return null;
}
