import { onMount, Show } from "solid-js";
import { Logo } from "../ui/logo";
import { FilterOptions } from "./filterOptions";
import { Results } from "./results";
import { SearchInput } from "./searchInput";
import {
  cleanSearch,
  debouncedSearch,
  resultStore,
  searchStore,
  setSearchStore,
} from "./state";

const NEWSLETTERS = [
  { label: "Node Weekly", value: "nodeweekly" },
  { label: "JavaScript Weekly", value: "javascriptweekly" },
  { label: "Frontend Focus", value: "frontendfocus" },
  { label: "React Status", value: "reactstatus" },
  { label: "This Week in React", value: "thisweekinreact" },
  { label: "Golang Weekly", value: "golangweekly" },
  { label: "Ruby Weekly", value: "rubyweekly" },
  { label: "Postgres Weekly", value: "postgresweekly" },
  { label: "PyCoders", value: "pycoders" },
  { label: "Swift News", value: "swiftnews" },
];

const onFilterChange = (filters: string[]) => {
  setSearchStore("searchFilter", filters);
  debouncedSearch.trigger();
};

export function Search() {
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    const s = params.getAll("s");

    if (q !== "") {
      setSearchStore({
        searchQuery: q,
        searchFilter: s,
        searchView: true,
      });

      debouncedSearch.trigger();
    }
  });

  return (
    <Show when={searchStore.searchView} fallback={<SearchEmpty />}>
      <SearchResult />
    </Show>
  );
}

function SearchEmpty() {
  return (
    <main class="flex-1 px-8 w-full max-w-screen-lg mx-auto flex flex-col gap-10 items-center justify-center">
      <Logo size="lg" />

      <p class="text-lg md:text-xl text-center text-fg-muted text-balance">
        Search curated content from many programming/coding newsletter
      </p>

      <SearchInput class="w-full" />
    </main>
  );
}

function SearchResult() {
  return (
    <div class="flex-1 min-h-0 flex flex-col">
      <header class="md:px-4 md:border-b md:border-border">
        <div class="md:py-10 container mx-auto flex items-center gap-8">
          <Logo
            class="max-sm:hidden"
            actionLabel=", start a new search"
            onClick={cleanSearch}
          />

          <SearchInput class="flex-1 max-sm:rounded-none" />
        </div>
      </header>

      <div class="flex-1 min-h-0 bg-surface">
        <main class="flex gap-6 h-full container mx-auto">
          <div class="hidden md:block max-w-56 pt-6 pl-4">
            <FilterOptions onChange={onFilterChange} options={NEWSLETTERS} />
          </div>

          <div class="flex-1 flex flex-col">
            {/* Filters are in the sidebar on md+; on small screens they live
                in a native disclosure so they are still reachable. */}
            <details class="md:hidden mx-4 mt-4 rounded-md border border-border bg-canvas">
              <summary class="cursor-pointer select-none px-4 py-3 font-medium">
                Filters
                <Show when={searchStore.searchFilter.length > 0}>
                  {" "}
                  ({searchStore.searchFilter.length})
                </Show>
              </summary>
              <div class="px-4 pb-4">
                <FilterOptions
                  options={NEWSLETTERS}
                  onChange={onFilterChange}
                />
              </div>
            </details>

            {/* Always-mounted polite live region so result changes are announced */}
            <div role="status">
              <Show when={resultStore.results.length > 0}>
                <div class="px-4 pt-5 text-fg">
                  Found{" "}
                  <span class="font-semibold">
                    {resultStore.results.length}
                  </span>{" "}
                  items in {resultStore.searchTime}
                </div>
              </Show>

              <Show when={resultStore.empty}>
                <div class="pt-32 text-fg flex flex-col gap-4 items-center justify-center text-center">
                  <div class="text-7xl" aria-hidden="true">
                    🫠
                  </div>
                  <span class="text-2xl">
                    Nothing Found for: '{searchStore.searchQuery}'
                  </span>
                </div>
              </Show>
            </div>

            <Results />
          </div>
        </main>
      </div>
    </div>
  );
}
