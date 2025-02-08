import { createStore, unwrap } from "solid-js/store";
import qs from "query-string";
import debounce from "debounce";
import prettyMs from "pretty-ms";

import { defined } from "../../utils";
import { SearchWorker } from "../../scripts/search";

const search = new SearchWorker<ResultType[]>();

export interface ResultType {
  description: string;
  source: string;
  date: string;
  url: string;
}

interface ResultStore {
  results: ResultType[];
  searchTime: string;
  empty: boolean;
}

export const [resultStore, setResultStore] = createStore<ResultStore>({
  results: [],
  searchTime: "",
  empty: false,
});

interface SearchStore {
  searchView: boolean;
  searchQuery: string;
  searchFilter: string[];
}

export const [searchStore, setSearchStore] = createStore<SearchStore>({
  searchView: false,
  searchQuery: "",
  searchFilter: [],
});

interface QueryStringState {
  q: string; // search query
  s: string[]; // search filter
}

export function updateURLSearchParams(state?: QueryStringState) {
  const url = new URL(window.location.href);

  if (!defined(state)) {
    url.search = "";
    window.history.replaceState(null, "", url);
    return;
  }

  url.search = qs.stringify(state);
  window.history.replaceState(null, "", url);
}

export function submitSearch() {
  const { searchQuery, searchFilter } = unwrap(searchStore);
  const query = searchQuery.trim();

  updateURLSearchParams({ q: query, s: searchFilter });

  if (query === "") {
    setResultStore({ results: [], empty: true });
    return;
  }

  performance.mark("search-start");
  search.search({ query, source: searchFilter }, (results) => {
    performance.mark("search-end");
    const duration = performance.measure(
      "search-duration",
      "search-start",
      "search-end",
    );
    setResultStore({
      results,
      empty: results.length === 0,
      searchTime: prettyMs(duration.duration),
    });
  });
}

export const debouncedSearch = debounce(submitSearch, 700);

export const cleanSearch = () => {
  updateURLSearchParams();
  setSearchStore({
    searchView: false,
    searchFilter: [],
    searchQuery: "",
  });
};
