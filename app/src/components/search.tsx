import { For, onCleanup, Show } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

import { SearchWorker } from "../scripts/search";
import { Result } from "./result";
import { setStore, store, type ResultType } from "./state";
import { defined, getSearchParams, updateURLSearchParams } from "../utils";

const search = new SearchWorker<ResultType[]>();

function submitSearch(query: string) {
  updateURLSearchParams({ q: query });
  performance.mark("search-start");
  search.search({ query, source: [] }, (results) => {
    performance.mark("search-end");
    const duration = performance.measure(
      "search-duration",
      "search-start",
      "search-end",
    );
    setStore({
      results,
      search_time: Math.round(duration.duration),
    });
  });
}

(() => {
  const param = getSearchParams("q");
  console.log({ param });
  if (!defined(param)) return;
  submitSearch(param);
})();

export function Search() {
  return (
    <>
      <div class="bg-slate-700">
        <div class="py-8 container mx-auto relative">
          <SearchInput />

          <Show when={store.results.length > 0}>
            <div class="absolute bottom-0 text-slate-300">
              Found {store.results.length} items in {store.search_time} ms
            </div>
          </Show>
        </div>
      </div>

      <Results />
    </>
  );
}

let listContainer: HTMLDivElement | undefined;

function Results() {
  const virtual = createVirtualizer({
    estimateSize: () => 96,
    getScrollElement: () => listContainer ?? null,
    paddingEnd: 48,
    get count() {
      return store.results.length;
    },
  });

  const resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries;
    if (!entry?.target) return;
    const parentHeight = entry.target?.clientHeight;
    if (parentHeight && listContainer?.style) {
      listContainer?.style.setProperty("height", `${parentHeight}px`);
    }
  });

  const observeSize = (el: HTMLElement) => resizeObserver.observe(el);
  onCleanup(() => resizeObserver.disconnect());

  return (
    <>
      <div class="flex-1 relative" ref={observeSize}>
        <div
          class="overflow-y-auto w-full absolute top-0 left-0"
          ref={listContainer}
        >
          <ul
            class="relative container mx-auto"
            style={{
              height: `${virtual.getTotalSize()}px`,
            }}
          >
            <For each={virtual.getVirtualItems()}>
              {(item) => {
                return (
                  <Show when={store.results[item.index]}>
                    <li
                      data-index={item.index}
                      class="absolute top-0 left-0 w-full"
                      style={{ transform: `translateY(${item.start}px)` }}
                      ref={(el) => {
                        queueMicrotask(() => virtual.measureElement(el));
                      }}
                    >
                      <Result result={store.results[item.index]} />
                    </li>
                  </Show>
                );
              }}
            </For>
          </ul>
        </div>
      </div>
    </>
  );
}

function SearchInput() {
  return (
    <form
      class="relative"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const form = new FormData(e.currentTarget);
        const searchQuery = (form.get("search") as string)?.trim();

        listContainer?.scrollTo({ top: 0 });

        if (searchQuery === "") {
          updateURLSearchParams();
          setStore("results", []);
        }

        if (searchQuery) {
          submitSearch(searchQuery);
        }
      }}
    >
      <input
        autofocus
        placeholder="Search..."
        class="bg-slate-800 text-white text-4xl pl-5 pr-10 py-3 w-full focus:outline outline-offset-2 outline-2 placeholder:text-slate-300"
        name="search"
      />
      <svg
        class="size-8 absolute top-4 right-4 text-slate-300"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    </form>
  );
}
