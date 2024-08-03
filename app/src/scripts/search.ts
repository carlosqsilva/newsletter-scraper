import { nanoid } from "nanoid";

type Callback<T> = (data: T) => void;

interface SearchInput {
  query: string;
  source: string[];
}

export interface MessageData {
  callbackId: string;
  search: SearchInput;
}

export class SearchWorker<T> {
  worker: Worker;
  callbacks: Array<{
    id: string;
    cb: Callback<T>;
  }> = [];

  constructor() {
    this.worker = new Worker(new URL("./search.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = ({ data }) => {
      this.runWorkerCallback(data.callbackId, data.results);
    };
  }

  search(search: SearchInput, callback: Callback<T>) {
    this.worker.postMessage({
      search,
      callbackId: this.addCallback(callback),
    });
  }

  addCallback(cb: Callback<T>) {
    const id = nanoid();
    this.callbacks.push({
      id,
      cb,
    });
    return id;
  }

  runWorkerCallback(id: string, data: T) {
    for (let i = 0; i < this.callbacks.length; i++) {
      if (this.callbacks[i].id === id) {
        this.callbacks[i].cb(data);
        this.callbacks.splice(i, 1);
      }
    }
  }
}
