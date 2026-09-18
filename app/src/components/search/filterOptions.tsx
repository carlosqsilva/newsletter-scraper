import { createSelector, For } from "solid-js";
import { Button } from "../ui/button";
import { RotateCcw } from "../ui/icons";
import { WindowFrame } from "../ui/window";
import { searchStore } from "./state";

interface OptionsFiltersProps {
  options: Array<{ label: string; value: string }>;
  onChange?: (options: string[]) => void;
}

export function FilterOptions(props: OptionsFiltersProps) {
  const isSelected = createSelector<string[], string>(
    () => searchStore.searchFilter,
    (value, options) => new Set(options).has(value),
  );

  const onChange = (option: string) => {
    const selected = new Set(searchStore.searchFilter);
    selected.has(option) ? selected.delete(option) : selected.add(option);
    props.onChange?.([...selected]);
  };

  return (
    <WindowFrame title="filters.dll" class="w-full" data-delay="1">
      <fieldset class="m-0 p-3 flex flex-col gap-1 border-0">
        <For each={props.options}>
          {(item) => (
            <label
              class={
                "flex items-center gap-2 -mx-1 px-2 py-1 cursor-pointer select-none transition-colors duration-100 " +
                (isSelected(item.value) ? "bg-butter/40" : "hover:bg-butter/20")
              }
            >
              <input
                type="checkbox"
                value={item.value}
                class="y2k-checkbox"
                checked={isSelected(item.value)}
                onChange={[onChange, item.value]}
              />
              <span
                class={
                  "text-[13px] font-bold tracking-tight " +
                  (isSelected(item.value) ? "text-ink" : "text-muted")
                }
              >
                {item.label}
              </span>
            </label>
          )}
        </For>
      </fieldset>

      <div class="px-3 pb-3">
        <Button
          class="w-full"
          intent="danger"
          onClick={() => props.onChange?.([])}
        >
          <RotateCcw size={12} strokeWidth={2.5} />
          Reset
        </Button>
      </div>
    </WindowFrame>
  );
}
