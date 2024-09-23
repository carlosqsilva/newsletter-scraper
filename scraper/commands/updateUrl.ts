import type { Browser } from "happy-dom";
import type { InfoExtractor } from "../newsletter/interface";
import { PyCoders } from "../newsletter/pycoders.ts";
import type { Storage } from "../database.ts";
import { defined } from "../utils.ts";

export async function updateUrl(
  url: string,
  browser: Browser,
  storage: Storage,
) {
  let extractor: InfoExtractor | null = null;

  if (PyCoders.canHandle(url)) {
    extractor = new PyCoders(browser, storage);
  }

  if (!defined(extractor)) {
    throw new Error(`Extractor not found for url: ${url}`);
  }

  extractor.updateUrl(url);
}
