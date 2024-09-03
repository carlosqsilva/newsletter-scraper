import { onMount, Show } from "solid-js";
import qs from "query-string";

import { Results } from "./results";
import {
	setSearchStore,
	resultStore,
	searchStore,
	debouncedSearch,
} from "./state";
import { defined } from "../../utils";
import { Logo } from "../ui/logo";
import { FilterOptions } from "./filterOptions";
import { SearchInput } from "./searchInput";

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
		<div class="px-8 max-w-screen-lg mx-auto min-h-[80vh] flex flex-col gap-10 items-center justify-center">
			<Logo size="lg" />

			<p class="text-xl text-zinc-600">
				Search curated content from 7 programming newsletter
			</p>

			<SearchInput class="w-full" />
		</div>
	);
}

function SearchResult() {
	return (
		<div class="h-screen flex flex-col">
			<header class="px-4 border-b">
				<div class="py-10 container mx-auto flex items-center gap-8">
					<Logo />

					<SearchInput class="flex-1" />
				</div>
			</header>

			<div class="px-4 flex-1 bg-zinc-50">
				<main class="flex gap-8 h-full container mx-auto">
					<div class="max-w-56 py-10 px-4">
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
							]}
						/>
					</div>

					<div class="flex-1 flex flex-col">
						<Show when={resultStore.results.length > 0}>
							<div class="pt-5 text-zinc-800">
								Found{" "}
								<span class="font-semibold">{resultStore.results.length}</span>{" "}
								items in {resultStore.searchTime} ms
							</div>
						</Show>

						<Show when={resultStore.empty}>
							<div class="pt-32 text-zinc-800 flex flex-col gap-4 items-center justify-center text-center">
								<div class="text-7xl">🫠</div>
								<span class="text-2xl">
									Nothing Found for: '{searchStore.searchQuery}'
								</span>
							</div>
						</Show>

						<Results />
					</div>
				</main>
			</div>
		</div>
	);
}
