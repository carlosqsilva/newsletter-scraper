import qs from "query-string";
import { onMount, Show } from "solid-js";
import { defined } from "../../utils";
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

export function Search() {
  onMount(() => {
    const { q, s = [] } = qs.parse(window.location.search, {
      types: {
        q: "string",
        s: "string[]",
      },
    }) as { q: string; s: string[] };

    if (defined(q) && q !== "") {
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

      <p class="text-lg md:text-xl text-center text-zinc-600">
        Search curated content from many programming/coding newsletter
      </p>

      <SearchInput class="w-full" />
    </main>
  );
}

function SearchResult() {
  return (
    <div class="flex-1 min-h-0 flex flex-col">
      <header class="md:px-4 md:border-b">
        <div class="md:py-10 container mx-auto flex items-center gap-8">
          <Logo
            class="max-[640px]:hidden"
            actionLabel=", start a new search"
            onClick={cleanSearch}
          />

          <SearchInput class="flex-1 max-[640px]:rounded-none" />
        </div>
      </header>

      <div class="flex-1 bg-zinc-50">
        <main class="flex gap-6 h-full container mx-auto">
          <div class="hidden md:block max-w-56 pt-6 pl-4">
            <FilterOptions
              onChange={(filters) => {
                setSearchStore("searchFilter", filters);
                debouncedSearch.trigger();
              }}
              options={[
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
              ]}
            />
          </div>

          <div class="flex-1 flex flex-col">
            {/* Always-mounted polite live region so result changes are announced */}
            <div role="status">
              <Show when={resultStore.results.length > 0}>
                <div class="px-4 pt-5 text-zinc-800">
                  Found{" "}
                  <span class="font-semibold">
                    {resultStore.results.length}
                  </span>{" "}
                  items in {resultStore.searchTime}
                </div>
              </Show>

              <Show when={resultStore.empty}>
                <div class="pt-32 text-zinc-800 flex flex-col gap-4 items-center justify-center text-center">
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
