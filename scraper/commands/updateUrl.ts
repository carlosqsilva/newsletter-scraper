import type { Browser } from "happy-dom";

import type { InfoExtractor } from "../newsletter/interface";
import { PyCoders } from "../newsletter/pycoders.ts";
import type { Storage } from "../database.ts";
import { defined } from "../utils.ts";
import { SwiftNews } from "../newsletter/swiftnews.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import { GolangWeekly } from "../newsletter/golangweekly.ts"
import { FrontendFocus } from "../newsletter/frontendfocus.ts"
import { ReactStatusCode } from "../newsletter/reactstatuscode.ts"
import { PostgresWeekly } from "../newsletter/postgresweekly.ts"
import {
  JavascriptWeekly,
  NodeWeekly,
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

  if (GolangWeekly.canHandle(url)) {
    extractor = new GolangWeekly(browser, storage);
  }

  if (FrontendFocus.canHandle(url)) {
    extractor = new FrontendFocus(browser, storage);
  }

  if (ReactStatusCode.canHandle(url)) {
    extractor = new ReactStatusCode(browser, storage);
  }

  if (PostgresWeekly.canHandle(url)) {
    extractor = new PostgresWeekly(browser, storage);
  }

  const items = [
    JavascriptWeekly,
    NodeWeekly,
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
