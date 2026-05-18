import type { Browser } from "happy-dom";
import type { Storage } from "../database.ts";
import {
  JavascriptWeekly,
  NodeWeekly,
  RubyWeekly,
} from "../newsletter/common/index.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";
import { PyCoders } from "../newsletter/pycoders.ts";
import { SwiftNews } from "../newsletter/swiftnews.ts";
import { GolangWeekly } from "../newsletter/golangweekly.ts";
import { FrontendFocus } from "../newsletter/frontendfocus.ts";
import { ReactStatusCode } from "../newsletter/reactstatuscode.ts";
import { PostgresWeekly } from "../newsletter/postgresweekly.ts";

export async function update(browser: Browser, storage: Storage) {
  try {
    await Promise.all([
      JavascriptWeekly(browser, storage).update(),
      NodeWeekly(browser, storage).update(),
      RubyWeekly(browser, storage).update(),
      new PostgresWeekly(browser, storage).update(),
      new ReactStatusCode(browser, storage).update(),
      new FrontendFocus(browser, storage).update(),
      new GolangWeekly(browser, storage).update(),
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
