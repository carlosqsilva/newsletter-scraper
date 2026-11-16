import MiniSearch from "minisearch";
import type { MessageData } from "./search";

const options = {
  fields: ["description"],
  storeFields: ["url", "date", "source", "description"],
  searchOptions: {
    fuzzy: 0.2,
  },
};

const log = (msg: string) => console.info(`[WEB WORKER]: ${msg}`);

const dataUrl = "/newsletter-scraper/data.json";
// The serialized MiniSearch index is cached instead of the raw data:
// loading it (loadJSON) is ~3x faster than re-indexing every document.
const indexKey = `${dataUrl}?index`;
const INDEX_CACHE = "search-index-v1";
const LEGACY_CACHES = ["cache-v1"];
const expirationKey = "expiration";
const CACHE_TTL_MS = 172_800_000; // 2 days in milliseconds

let minisearch = new MiniSearch(options);
let ready = false;

function isFresh(resp?: Response): resp is Response {
  return !!resp && Number(resp.headers.get(expirationKey)) > Date.now();
}

/** Returns the index, plus whether it was freshly built (and should be cached). */
async function loadIndex(): Promise<{ index: MiniSearch; built: boolean }> {
  for (const name of LEGACY_CACHES) void caches.delete(name);

  const cache = await caches.open(INDEX_CACHE);
  const cached = await cache.match(indexKey);

  if (isFresh(cached)) {
    try {
      log("loading index from cache");
      return {
        index: MiniSearch.loadJSON(await cached.text(), options),
        built: false,
      };
    } catch {
      log("cached index unreadable, rebuilding");
    }
  }

  log("downloading data");
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const index = new MiniSearch(options);
  index.addAll(await response.json());
  return { index, built: true };
}

async function saveIndex(index: MiniSearch) {
  const cache = await caches.open(INDEX_CACHE);
  await cache.put(
    indexKey,
    new Response(JSON.stringify(index), {
      headers: {
        "content-type": "application/json",
        [expirationKey]: String(Date.now() + CACHE_TTL_MS),
      },
    }),
  );
  log("index saved in cache");
}

function processMessage({ search, callbackId }: MessageData) {
  const { query, source = [] } = search;

  const isSourceEmpty = source?.length === 0;
  const sourceSet = new Set(source);
  const results = minisearch.search(query, {
    filter: (item) => isSourceEmpty || sourceSet.has(item.source),
  });

  postMessage({
    results,
    callbackId,
  });
}

let pendingMessage: MessageData | null = null;

loadIndex()
  .then(({ index, built }) => {
    minisearch = index;
    // Serializing takes a moment; do it after answering any waiting search.
    if (built) setTimeout(() => saveIndex(index).catch(() => {}));
  })
  .catch((err) => {
    // Leave the empty index in place so searches still resolve (with no results).
    log(`Error loading data: ${err instanceof Error ? err.message : err}`);
  })
  .finally(() => {
    ready = true;
    if (pendingMessage) {
      processMessage(pendingMessage);
      pendingMessage = null;
    }
  });

// biome-ignore lint/suspicious/noGlobalAssign: this is a web worker
onmessage = ({ data }: MessageEvent<MessageData>) => {
  if (!ready) {
    // Only the latest request matters; settle the superseded one with no results.
    if (pendingMessage) {
      postMessage({ results: [], callbackId: pendingMessage.callbackId });
    }
    pendingMessage = data;
    return;
  }

  processMessage(data);
};
