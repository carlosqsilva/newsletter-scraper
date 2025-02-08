import { createVirtualizer } from "@tanstack/solid-virtual";
import { resultStore } from "./state";
import { For, createEffect, onCleanup } from "solid-js";
import { Result } from "./result";

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
    <div
      class="flex-1 relative"
      ref={(el: HTMLElement) => resizeObserver.observe(el)}
    >
      <div
        class="overflow-y-auto w-full absolute top-0 left-0 px-4"
        ref={listContainer}
        style={{
          height: "2048px", // default initial size
        }}
      >
        <ul
          class="relative container"
          style={{
            height: `${virtual.getTotalSize()}px`,
          }}
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
                    createEffect(() => {
                      const _ = getCount(); // force effect to run
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
    </div>
  );
}
