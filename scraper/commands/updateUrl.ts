import type { Browser } from "happy-dom";

import type { InfoExtractor } from "../newsletter/interface";
import { PyCoders } from "../newsletter/pycoders.ts";
import type { Storage } from "../database.ts";
import { defined } from "../utils.ts";
import { SwiftNews } from "../newsletter/swiftnews.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import {
  JavascriptWeekly,
  FrontendFocus,
  GolangWeekly,
  NodeWeekly,
  PostgresWeekly,
  ReactStatus,
  RubyWeekly,
} from "../newsletter/common/index.ts";

export async function updateUrl(
  url: string,
  browser: Browser,
  storage: Storage,
) {
  let extractor: InfoExtractor | null = null;

  if (PyCoders.canHandle(url)) {
    extractor = new PyCoders(browser, storage);
  }

  if (SwiftNews.canHandle(url)) {
    extractor = new SwiftNews(browser, storage);
  }

  if (ThisWeekInReact.canHandle(url)) {
    extractor = new ThisWeekInReact(browser, storage);
  }

  const items = [
    JavascriptWeekly,
    FrontendFocus,
    GolangWeekly,
    NodeWeekly,
    PostgresWeekly,
    ReactStatus,
    RubyWeekly,
  ];

  for (const item of items) {
    const init = item(browser, storage);

    if (init.canHandle(url)) {
      extractor = init;
      break;
    }
  }

  if (!defined(extractor)) {
    throw new Error(`Extractor not found for url: ${url}`);
  }

  extractor.updateUrl(url);
}
