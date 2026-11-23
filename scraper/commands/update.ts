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
import { PyCoders } from "../newsletter/pycoders.ts";
import { ThisWeekInReact } from "../newsletter/thisweekinreact.ts";

export async function update(browser: Browser, storage: Storage) {
  try {
    await Promise.all([
      JavascriptWeekly(browser, storage).update(),
      NodeWeekly(browser, storage).update(),
      RubyWeekly(browser, storage).update(),
      PostgresWeekly(browser, storage).update(),
      ReactStatusCode(browser, storage).update(),
      FrontendFocus(browser, storage).update(),
      GolangWeekly(browser, storage).update(),
      new ThisWeekInReact(browser, storage).update(),
      new PyCoders(browser, storage).update(),
    ]);
  } catch (err) {
    console.log(err);
  }

  await browser.close();

  storage.summary();

  storage.export();
}
