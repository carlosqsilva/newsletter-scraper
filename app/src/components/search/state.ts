import debounce from "debounce";
import { createStore, unwrap } from "solid-js/store";
import { SearchWorker } from "../../scripts/search";
import { defined } from "../../utils";

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
  const params = new URLSearchParams();

  if (defined(state)) {
    params.set("q", state.q);
    for (const source of state.s) params.append("s", source);
  }

  url.search = params.toString();
  window.history.replaceState(null, "", url);
}

// Sub-second times read as "12ms", longer ones as "1.3s".
const msFormat = new Intl.NumberFormat(undefined, {
  style: "unit",
  unit: "millisecond",
  unitDisplay: "narrow",
  maximumFractionDigits: 0,
});
const secondsFormat = new Intl.NumberFormat(undefined, {
  style: "unit",
  unit: "second",
  unitDisplay: "narrow",
  maximumFractionDigits: 1,
});

function formatDuration(ms: number) {
  return ms < 1000 ? msFormat.format(ms) : secondsFormat.format(ms / 1000);
}

let latestRequest = 0;

export async function submitSearch() {
  const { searchQuery, searchFilter } = unwrap(searchStore);
  const query = searchQuery.trim();

  updateURLSearchParams({ q: query, s: searchFilter });

  if (query === "") {
    setResultStore({ results: [], empty: true });
    return;
  }

  const requestId = ++latestRequest;
  const start = performance.now();
  const results = await search.search({ query, source: searchFilter });

  // A newer search was submitted while this one ran; drop the stale results.
  if (requestId !== latestRequest) return;

  setResultStore({
    results,
    empty: results.length === 0,
    searchTime: formatDuration(performance.now() - start),
  });
}

export const debouncedSearch = debounce(submitSearch, 200);

export const cleanSearch = () => {
  updateURLSearchParams();
  setSearchStore({
    searchView: false,
    searchFilter: [],
    searchQuery: "",
  });
};
