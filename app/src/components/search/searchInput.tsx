import { createUniqueId, type JSX, onCleanup, splitProps } from "solid-js";
import { cn } from "../../utils";
import { SearchIcon } from "../ui/icons";
import { Kbd } from "../ui/kbd";
import { debouncedSearch, searchStore, setSearchStore } from "./state";

interface SearchInputProps extends JSX.HTMLAttributes<HTMLElement> {}

export function SearchInput(props: SearchInputProps) {
  const [local, defaultProps] = splitProps(props, ["class"]);

  const inputId = createUniqueId();
  let inputRef: HTMLInputElement | undefined;
  // "/" focuses the search box, unless the user is already typing somewhere.
  // keydown + preventDefault keeps the "/" from being typed into the field.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "/" || e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    inputRef?.focus();
  };
  window.addEventListener("keydown", onKeyDown);
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));

  return (
    <search
      {...defaultProps}
      class={cn(
        "block relative border border-border max-w-screen-lg rounded-lg",
        local.class,
      )}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          setSearchStore("searchView", true);
          debouncedSearch.flush();
        }}
      >
        <label for={inputId} class="sr-only">
          Search newsletters
        </label>

        <SearchIcon class="size-7 absolute top-3 left-4 text-fg-subtle" />

        <input
          autofocus
          id={inputId}
          type="search"
          name="search"
          enterkeyhint="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck={false}
          aria-keyshortcuts="/"
          ref={inputRef}
          placeholder="Search..."
          value={searchStore.searchQuery}
          class={cn(
            "text-2xl md:text-3xl rounded-lg pl-16 pr-10 py-2 w-full placeholder:text-fg-subtle",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          onInput={(e) => {
            setSearchStore("searchQuery", e.target.value);
            debouncedSearch();
          }}
        />

        <Kbd aria-hidden="true" class="absolute top-3 right-3 h-7">
          /
        </Kbd>
      </form>
    </search>
  );
}
