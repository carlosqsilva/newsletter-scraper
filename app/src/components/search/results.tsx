import { createVirtualizer } from "@tanstack/solid-virtual";
import { resultStore } from "./state";
import { For, Show, onCleanup } from "solid-js";
import { Result } from "./result";

let listContainer: HTMLDivElement | undefined;

export function Results() {
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

	const observeSize = (el: HTMLElement) => resizeObserver.observe(el);
	onCleanup(() => resizeObserver.disconnect());

	return (
		<div class="flex-1 relative" ref={observeSize}>
			<div
				class="overflow-y-auto w-full absolute top-0 left-0"
				ref={listContainer}
			>
				<ul
					class="relative container"
					style={{
						height: `${virtual.getTotalSize()}px`,
					}}
				>
					<For each={virtual.getVirtualItems()}>
						{(item) => {
							return (
								<Show when={resultStore.results[item.index]}>
									<li
										data-index={item.index}
										class="absolute top-0 left-0 w-full"
										style={{ transform: `translateY(${item.start}px)` }}
										ref={(el) => {
											queueMicrotask(() => virtual.measureElement(el));
										}}
									>
										<Result result={resultStore.results[item.index]} />
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
