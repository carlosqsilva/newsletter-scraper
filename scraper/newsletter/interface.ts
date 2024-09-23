import type { Browser } from "happy-dom";
import type { Storage } from "../database";

export interface InfoExtractor {
  browser: Browser;
  db: Storage;
  updateUrl(url: string): Promise<void>;
  update(): Promise<void>;
}
