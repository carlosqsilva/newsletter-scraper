import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, For } from "solid-js";
import { Result } from "./result";
import { resultStore } from "./state";

export function Results() {
  // The scroller gets its height from the flex layout (flex-1 + min-h-0),
  // so no ResizeObserver or hardcoded initial height is needed.
  let scroller: HTMLDivElement | undefined;

  const virtual = createVirtualizer({
    estimateSize: () => 96,
    getScrollElement: () => scroller ?? null,
    paddingEnd: 16,
    get count() {
      return resultStore.results.length;
    },
  });

  return (
    <div ref={scroller} class="flex-1 min-h-0 overflow-y-auto px-4">
      <ul
        class="relative container"
        style={{ height: `${virtual.getTotalSize()}px` }}
      >
        <For each={virtual.getVirtualItems()}>
          {(item) => {
            const result = () => resultStore.results[item.index];

            return (
              <li
                data-index={item.index}
                class="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${item.start}px)` }}
                ref={(el) => {
                  // Re-measure when the result set changes; the row may now
                  // hold a different (differently sized) result.
                  createEffect(() => {
                    void result();
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
  );
}
