import { onCleanup, splitProps, type JSX } from "solid-js";
import { SearchIcon } from "lucide-solid";
import { tinykeys } from "tinykeys";

import { debouncedSearch, searchStore, setSearchStore } from "./state";
import { cn, defined } from "../../utils";
import { Kbd } from "../ui/kbd";

interface SearchInputProps extends JSX.ButtonHTMLAttributes<HTMLFormElement> {}

export function SearchInput(props: SearchInputProps) {
	const [local, defaultProps] = splitProps(props, ["class"]);

	let inputRef: HTMLInputElement | undefined;
	const unSubscribe = tinykeys(
		window,
		{
			"/": () => {
				const hasRef = defined(inputRef);
				const hasInputFocused =
					document.activeElement?.tagName?.toLowerCase() === "input";
				const alreadyFocused =
					hasRef && document.activeElement?.isSameNode(inputRef);
				if (hasRef && !hasInputFocused && !alreadyFocused) {
					inputRef.focus();
				}
			},
		},
		{ event: "keyup" },
	);

	onCleanup(unSubscribe);

	return (
		<form
			{...defaultProps}
			class={cn(
				"relative border border-slate-300 max-w-screen-lg rounded-lg",
				local.class,
			)}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();

				setSearchStore("searchView", true);
				debouncedSearch.flush();
			}}
		>
			<SearchIcon class="size-7 absolute top-3 left-4 text-zinc-400" />

			<input
				autofocus
				name="search"
				ref={inputRef}
				placeholder="Search..."
				class="text-3xl md:rounded-lg pl-16 pr-10 py-2 w-full focus:outline outline-offset-2 outline-2 placeholder:text-zinc-400"
				value={searchStore.searchQuery}
				onInput={(e) => {
					setSearchStore("searchQuery", e.target.value);
					debouncedSearch();
				}}
			/>

			<Kbd class="absolute top-3 right-3 h-7">/</Kbd>
		</form>
	);
}
