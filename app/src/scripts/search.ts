export interface SearchInput {
  query: string;
  source: string[];
}

export interface MessageData {
  callbackId: number;
  search: SearchInput;
}

export interface ResponseData<T> {
  callbackId: number;
  results: T;
}

/** Promise-based wrapper around the MiniSearch web worker. */
export class SearchWorker<T> {
  #worker: Worker;
  #nextId = 0;
  #pending = new Map<number, (results: T) => void>();

  constructor() {
    this.#worker = new Worker(new URL("./search.worker.ts", import.meta.url), {
      type: "module",
    });
    this.#worker.onmessage = ({ data }: MessageEvent<ResponseData<T>>) => {
      const resolve = this.#pending.get(data.callbackId);
      this.#pending.delete(data.callbackId);
      resolve?.(data.results);
    };
  }

  search(search: SearchInput): Promise<T> {
    const callbackId = this.#nextId++;
    return new Promise((resolve) => {
      this.#pending.set(callbackId, resolve);
      this.#worker.postMessage({ search, callbackId } satisfies MessageData);
    });
  }
}
