import MiniSearch from "minisearch";
import type { MessageData } from "./search";

const minisearch = new MiniSearch({
  fields: ["description"],
  storeFields: ["url", "date", "source", "description"],
  searchOptions: {
    fuzzy: 0.2,
  },
});

const log = (msg: string) => console.info(`[WEB WORKER]: ${msg}`);

const dataUrl = "/data.json";
const expirationKey = "expiration";
const now = Date.now();
const week = 604_800_000; // 1 week in miliseconds
let ready = false;

function validateResponse(resp?: Response) {
  if (resp && Number(resp.headers.get(expirationKey)) > now) return true;

  return false;
}

async function cloneResponse(response: Response, expirationDate?: string) {
  const headers = new Headers(response.headers);
  if (expirationDate) {
    headers.set(expirationKey, expirationDate);
  }
  return response.arrayBuffer().then(
    (buffer) =>
      new Response(buffer, {
        headers,
        status: response.status,
        statusText: response.statusText,
      }),
  );
}

async function getData(cacheName: string) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(dataUrl);

  if (validateResponse(cachedResponse)) {
    log("getting data from cache");
    return cachedResponse?.json();
  }

  try {
    log("downloading data");
    const response = await fetch(dataUrl);

    if (!response.ok) {
      log("failed to download data");
      return [];
    }
    const responseCopy = await cloneResponse(
      response.clone(),
      String(now + week),
    );

    cache.put(dataUrl, responseCopy);
    log("data downloaded and saved in cache");

    return response.json();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    log(`Error to load data: ${err.message}`);
  }
}

function processMessage({ search, callbackId }: MessageData) {
  const { query, source = [] } = search;

  const isSourceEmpty = source?.length === 0;
  const sourceSet = new Set(source);
  const results = minisearch
    .search(query, {
      filter: (item) => isSourceEmpty || sourceSet.has(item.source),
    })
    .slice(0, 1_000);

  postMessage({
    results,
    callbackId,
  });
}

let pendingMessage: MessageData | null = null;

getData("cache-v1").then((data) => {
  minisearch.addAll(data);
  ready = true;

  if (pendingMessage) {
    processMessage(pendingMessage);
    pendingMessage = null;
  }
});

// biome-ignore lint/suspicious/noGlobalAssign: this is a web worker
onmessage = (e: MessageEvent<MessageData>) => {
  if (!ready) {
    pendingMessage = e.data;
    return;
  }

  processMessage(e.data);
};
