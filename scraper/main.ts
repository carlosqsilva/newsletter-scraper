import { parseArgs } from "node:util";
import { update } from "./commands/update.ts";
import { updateUrl } from "./commands/updateUrl.ts";
import {
  Browser,
  BrowserErrorCaptureEnum,
  BrowserNavigationCrossOriginPolicyEnum,
} from "happy-dom";
import { Storage } from "./database.ts";
import { defined } from "./utils.ts";
import { getURLInfo } from "./commands/info.ts";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    update: {
      type: "boolean",
    },
    "update-url": {
      type: "string",
    },
    info: {
      type: "string",
    },
  },
});

const storage = new Storage();

const browser = new Browser({
  settings: {
    errorCapture: BrowserErrorCaptureEnum.processLevel,
    disableCSSFileLoading: true,
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: true,
    navigation: {
      crossOriginPolicy: BrowserNavigationCrossOriginPolicyEnum.anyOrigin,
    },
    navigator: {
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
  },
});

if (values.update) {
  await update(browser, storage);
}

if (values["update-url"]) {
  await updateUrl(values["update-url"], browser, storage);
}

if (defined(values.info)) {
  getURLInfo(values.info, storage);
}
