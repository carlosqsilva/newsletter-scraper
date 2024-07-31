import { For, onCleanup, Show } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

import { SearchWorker } from "../scripts/search";
import { Result } from "./result";
import { setStore, store, type ResultType } from "./state";

const search = new SearchWorker<ResultType[]>();

export function Search() {
  return (
    <>
      <div class="py-8 bg-slate-700">
        <div class="container mx-auto ">
          <SearchInput />
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
    get count() {
      return store.results.length;
    },
  });

  const resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries;
    if (!entry?.target) return;
    const parentHeight = entry.target?.clientHeight;
    if (listContainer?.style) {
      listContainer.style.height = `${parentHeight}px`;
    }
  });

  const observeSize = (el: HTMLElement) => resizeObserver.observe(el);
  onCleanup(() => resizeObserver.disconnect());

  return (
    <div class="flex-1" ref={observeSize}>
      <div class="overflow-y-auto" ref={listContainer}>
        <ul
          class="relative container mx-auto"
          style={{
            height: `${virtual.getTotalSize()}px`,
          }}
        >
          <For each={virtual.getVirtualItems()}>
            {(item) => {
              console.log(item);
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
        const searchQuery = form.get("search") as string;
        search.search({ query: searchQuery, source: [] }, (results) => {
          console.log(results);
          listContainer?.scrollTo({ top: 0 });
          setStore("results", results);
        });
      }}
    >
      <input
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
