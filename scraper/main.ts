import {
	Browser,
	BrowserErrorCaptureEnum,
	BrowserNavigationCrossOriginPolicyEnum,
} from "happy-dom";
import { Storage } from "./database.ts";
import { extractThisWeekInReact } from "./newsletter/thisweekinreact.ts";
import { extractJavascriptlyWeekly } from "./newsletter/javascripweekly/index.ts";
import {
	extractFrontendFocus,
	extractGolangWeekly,
	extractNodeWeekly,
	extractPostgresWeekly,
	extractReactStatus,
	extractRubyWeekly,
} from "./newsletter/common.ts";

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

try {
	await Promise.all([
		extractJavascriptlyWeekly(browser, storage),
		extractFrontendFocus(browser, storage),
		extractGolangWeekly(browser, storage),
		extractNodeWeekly(browser, storage),
		extractPostgresWeekly(browser, storage),
		extractReactStatus(browser, storage),
		extractRubyWeekly(browser, storage),
		extractThisWeekInReact(browser, storage),
	]);
} catch (err) {
	console.log(err);
}

await browser.close();

storage.summary();

storage.export();
