import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, For, onCleanup, Show } from "solid-js";
import { PixelSad } from "../ui/pixel";
import { WindowFrame } from "../ui/window";
import { Result } from "./result";
import { resultStore, searchStore } from "./state";

let listContainer: HTMLDivElement | undefined;

export function Results() {
  const getCount = () => resultStore.results.length;
  const virtual = createVirtualizer({
    estimateSize: () => 96,
    getScrollElement: () => listContainer ?? null,
    paddingEnd: 48,
    get count() {
      return resultStore.results.length;
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

  onCleanup(() => resizeObserver.disconnect());

  return (
    <WindowFrame
      title="search_results.txt"
      class="h-full flex flex-col"
      bodyClass="flex-1 min-h-0 relative"
      data-delay="2"
    >
      <Show when={resultStore.empty}>
        <div class="absolute inset-0 z-10 flex items-center justify-center p-6">
          <EmptyDialog />
        </div>
      </Show>

      <div
        class="overflow-y-auto w-full absolute inset-0 px-2"
        ref={listContainer}
        style={{
          height: "2048px", // default initial size
        }}
      >
        <ul class="relative" style={{ height: `${virtual.getTotalSize()}px` }}>
          <For each={virtual.getVirtualItems()}>
            {(item) => {
              const result = () => resultStore.results[item.index];

              return (
                <li
                  data-index={item.index}
                  class="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${item.start}px)` }}
                  ref={(el) => {
                    createEffect(() => {
                      void getCount(); // force effect to run
                      queueMicrotask(() => virtual.measureElement(el));
                    });
                  }}
                >
                  <Result result={result()} />
                </li>
              );
            }}
          </For>
        </ul>
      </div>

      <div class="y2k-status-bar shrink-0" role="status">
        <span>
          {resultStore.results.length} ITEM
          {resultStore.results.length === 1 ? "" : "S"} FOUND
        </span>
        <span class="hidden lg:inline truncate">
          QUERY: {searchStore.searchQuery || "—"}
        </span>
        <span>{resultStore.searchTime || "0MS"}</span>
      </div>
    </WindowFrame>
  );
}

function EmptyDialog() {
  return (
    <WindowFrame
      title="error_404.exe"
      class="w-full max-w-xs"
      bodyClass="flex flex-col items-center gap-3 p-5 text-center"
    >
      <PixelSad class="w-10 h-10 text-danger" />

      <p class="font-display text-2xl leading-tight text-ink">
        Nothing found for "{searchStore.searchQuery}"
      </p>

      <p class="text-xs font-bold text-muted">
        Try a different query or reset the source filters.
      </p>
    </WindowFrame>
  );
}
