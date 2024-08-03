import { createStore } from "solid-js/store";

export interface ResultType {
  description: string;
  source: string;
  date: string;
  url: string;
}

interface Store {
  results: ResultType[];
  search_time: number;
}

export const [store, setStore] = createStore<Store>({
  results: [],
  search_time: 0,
});
