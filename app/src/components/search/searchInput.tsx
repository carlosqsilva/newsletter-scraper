import { type JSX, onCleanup, splitProps } from "solid-js";
import { tinykeys } from "tinykeys";
import { cn, defined } from "../../utils";
import { SearchIcon } from "../ui/icons";
import { Kbd } from "../ui/kbd";
import { debouncedSearch, searchStore, setSearchStore } from "./state";

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
        "relative flex items-center bg-paper border-2 border-ink max-w-screen-lg",
        "shadow-[3px_3px_0_0_var(--color-ink)] focus-within:shadow-[3px_3px_0_0_var(--color-hotpink)]",
        "transition-shadow duration-100",
        local.class,
      )}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSearchStore("searchView", true);
        debouncedSearch.flush();
      }}
    >
      <SearchIcon
        class="y2k-icon w-5 h-5 shrink-0 ml-3 text-muted pointer-events-none"
        strokeWidth={2.5}
      />

      <input
        autofocus
        name="search"
        ref={inputRef}
        placeholder="Search the archive..."
        value={searchStore.searchQuery}
        class={cn(
          "w-full bg-transparent px-3 py-2.5 text-base md:text-lg font-bold text-ink",
          "placeholder:text-muted/60 outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onInput={(e) => {
          setSearchStore("searchQuery", e.target.value);
          debouncedSearch();
        }}
      />

      <Kbd class="mr-3 shrink-0">/</Kbd>
    </form>
  );
}
