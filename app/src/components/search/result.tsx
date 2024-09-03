import type { ResultType } from "./state";

export function Result(props: {
	result: ResultType;
}) {
	return (
		<a
			href={props.result.url}
			target="_blank"
			rel="noreferrer"
			class="p-4 py-5 hover:underline underline-offset-4 decoration-zinc-400"
		>
			<p class="text-lg text-zinc-700">{props.result.description}</p>
			<div class="text-zinc-500">
				{props.result.date} | {props.result.source}
			</div>
		</a>
	);
}
