import { onCleanup, splitProps, type JSX } from "solid-js";
import { tinykeys } from "tinykeys";

import { debouncedSearch, searchStore, setSearchStore } from "./state";
import { cn, defined } from "../../utils";
import { SearchIcon } from "../ui/icons";
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
      onSubmit={async (e) => {
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
        value={searchStore.searchQuery}
        class={cn(
          "text-2xl md:text-3xl rounded-lg pl-16 pr-10 py-2 w-full placeholder:text-zinc-400",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onInput={(e) => {
          setSearchStore("searchQuery", e.target.value);
          debouncedSearch();
        }}
      />

      <Kbd class="absolute top-3 right-3 h-7">/</Kbd>
    </form>
  );
}
