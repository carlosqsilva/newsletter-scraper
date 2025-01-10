import type { Browser } from "happy-dom";
import type { Storage } from "../database.ts";
import {
  JavascriptWeekly,
  FrontendFocus,
  GolangWeekly,
  NodeWeekly,
  PostgresWeekly,
  ReactStatus,
  RubyWeekly,
} from "../newsletter/common/index.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import { PyCoders } from "../newsletter/pycoders.ts";
import { SwiftNews } from "../newsletter/swiftnews.ts";

export async function update(browser: Browser, storage: Storage) {
  try {
    await Promise.all([
      JavascriptWeekly(browser, storage).update(),
      FrontendFocus(browser, storage).update(),
      GolangWeekly(browser, storage).update(),
      NodeWeekly(browser, storage).update(),
      PostgresWeekly(browser, storage).update(),
      ReactStatus(browser, storage).update(),
      RubyWeekly(browser, storage).update(),
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
