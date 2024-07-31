import type { ResultType } from "./state";

export function Result(props: {
	result: ResultType;
}) {
	return (
		<a
			href={props.result.url}
			target="_blank"
			rel="noreferrer"
			class="p-4 py-5 hover:underline underline-offset-4 decoration-slate-200"
		>
			<p class="text-lg text-slate-200">{props.result.description}</p>
			<div class="text-slate-400">
				{props.result.date} | {props.result.source}
			</div>
		</a>
	);
}
