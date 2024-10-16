import type { Browser } from "happy-dom";
import type { Storage } from "../database.ts";
import { extractJavascriptlyWeekly } from "../newsletter/javascripweekly/index.ts";
import {
  extractFrontendFocus,
  extractGolangWeekly,
  extractNodeWeekly,
  extractPostgresWeekly,
  extractReactStatus,
  extractRubyWeekly,
} from "../newsletter/common.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import { PyCoders } from "../newsletter/pycoders.ts";
import { SwiftNews } from "../newsletter/swiftnews.ts";

export async function update(browser: Browser, storage: Storage) {
  try {
    await Promise.all([
      extractJavascriptlyWeekly(browser, storage),
      extractFrontendFocus(browser, storage),
      extractGolangWeekly(browser, storage),
      extractNodeWeekly(browser, storage),
      extractPostgresWeekly(browser, storage),
      extractReactStatus(browser, storage),
      extractRubyWeekly(browser, storage),
      new ThisWeekInReact(browser, storage).update(),
      new PyCoders(browser, storage).update(),
      new SwiftNews(browser, storage).update(),
    ]);
  } catch (err) {
    console.log(err);
  }

  await browser.close();

  storage.summary();

  storage.export();
}
