import type { Browser } from "happy-dom";
import type { Storage } from "../database.ts";
import {
  FrontendFocus,
  GolangWeekly,
  JavascriptWeekly,
  NodeWeekly,
  PostgresWeekly,
  ReactStatusCode,
  RubyWeekly,
} from "../newsletter/common/index.ts";
import type { InfoExtractor } from "../newsletter/interface.ts";
import { PyCoders } from "../newsletter/pycoders.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import { defined } from "../utils.ts";

const statusCodeExtractors = [
  JavascriptWeekly,
  NodeWeekly,
  RubyWeekly,
  PostgresWeekly,
  ReactStatusCode,
  FrontendFocus,
  GolangWeekly,
];

export async function updateUrl(
  url: string,
  browser: Browser,
  storage: Storage,
) {
  let extractor: InfoExtractor | null = null;

  if (PyCoders.canHandle(url)) {
    extractor = new PyCoders(browser, storage);
  } else if (ThisWeekInReact.canHandle(url)) {
    extractor = new ThisWeekInReact(browser, storage);
  } else {
    const candidates = statusCodeExtractors.map((create) =>
      create(browser, storage),
    );
    extractor = candidates.find((it) => it.canHandle(url)) ?? null;
  }

  if (!defined(extractor)) {
    throw new Error(`Extractor not found for url: ${url}`);
  }

  await extractor.updateUrl(url);
}
