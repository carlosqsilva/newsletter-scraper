import "scheduler-polyfill";
import "../../styles/global.css";

import qs from "query-string";
import { onMount, Show } from "solid-js";
import { defined } from "../../utils";
import { PixelCloud, PixelHeart, Sparkle } from "../ui/pixel";
import { Kbd } from "../ui/kbd";
import { Logo } from "../ui/logo";
import { WindowFrame } from "../ui/window";
import { FilterOptions } from "./filterOptions";
import { Results } from "./results";
import { SearchInput } from "./searchInput";
import {
  cleanSearch,
  debouncedSearch,
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
    <div class="relative min-h-screen max-w-screen-lg mx-auto px-4 py-12 flex flex-col gap-8 items-center justify-center">
      {/* decorative pixel sky */}
      <Sparkle class="absolute top-[16%] left-[14%] w-6 h-6 text-hotpink" />
      <Sparkle class="absolute top-[28%] right-[12%] w-4 h-4 text-lilac" />
      <Sparkle class="absolute bottom-[22%] left-[20%] w-4 h-4 text-ink" />
      <PixelCloud class="absolute top-[14%] right-[26%] w-16 h-8 text-paper/80 hidden sm:block" />
      <PixelHeart class="absolute bottom-[30%] right-[22%] w-7 h-7 text-hotpink hidden sm:block" />

      <WindowFrame
        title="newsletter_scraper.exe"
        class="w-full max-w-xl"
        data-delay="1"
      >
        <div class="px-6 py-10 flex flex-col gap-6 items-center text-center">
          <Logo size="lg" />

          <p class="font-display text-2xl md:text-[28px] leading-tight text-ink">
            Search curated content from many programming &amp; coding
            newsletters.
          </p>

          <SearchInput class="w-full" />
        </div>
      </WindowFrame>

      <p class="font-pixel text-[8px] leading-relaxed text-ink/80 flex items-center gap-2 text-center">
        TIP: PRESS
        <Kbd>/</Kbd>
        TO FOCUS SEARCH
      </p>
    </div>
  );
}

const FILTER_OPTIONS = [
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

function SearchResult() {
  return (
    <div class="h-screen flex flex-col pb-10">
      <header class="shrink-0 px-4 pt-4 md:px-6 md:pt-5">
        <WindowFrame title="newsletter_scraper.exe" class="max-w-5xl mx-auto">
          <div class="px-3 py-2.5 flex items-center gap-4">
            <Logo class="max-[640px]:hidden" onClick={cleanSearch} />
            <SearchInput class="flex-1" />
          </div>
        </WindowFrame>
      </header>

      <main class="flex-1 min-h-0 w-full px-4 pt-4 md:px-6">
        <div class="h-full min-h-0 max-w-5xl mx-auto flex gap-5">
          <aside class="hidden md:block w-52 shrink-0 min-h-0 overflow-y-auto">
            <FilterOptions
              onChange={(filters) => {
                setSearchStore("searchFilter", filters);
                debouncedSearch.trigger();
              }}
              options={FILTER_OPTIONS}
            />
          </aside>

          <div class="flex-1 min-h-0 flex flex-col">
            <Results />
          </div>
        </div>
      </main>
    </div>
  );
}
