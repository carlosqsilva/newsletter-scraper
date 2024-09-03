import { createSelector, For } from "solid-js";
import { Button } from "../ui/button";
import { searchStore } from "./state";
import { RotateCcw } from "lucide-solid";

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
		<div class="space-y-2">
			<For each={props.options}>
				{(item) => (
					<label class="flex items-center select-none">
						<input
							type="checkbox"
							value={item.value}
							class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-neutral-900 focus:ring-neutral-900"
							checked={isSelected(item.value)}
							onChange={[onChange, item.value]}
						/>
						<span class="ml-2 text-sm font-medium text-gray-900">
							{item.label}
						</span>
					</label>
				)}
			</For>

			<Button class="w-full" onClick={() => props.onChange?.([])}>
				<RotateCcw size={18} />
				Reset Filter
			</Button>
		</div>
	);
}
