import type { ResultType } from "./state";

export function Result(props: { result: ResultType }) {
  return (
    <a
      href={props.result.url}
      target="_blank"
      rel="noreferrer"
      class="group block px-3 py-3 border-b-2 border-dashed border-ink/15 transition-colors duration-100 hover:bg-paper"
    >
      <p class="text-[15px] md:text-base font-bold leading-snug text-ink group-hover:underline decoration-hotpink decoration-2 underline-offset-4">
        {props.result.description}
      </p>
      <p class="mt-2 flex items-center gap-2 text-muted text-xs font-bold">
        <span class="y2k-tag">{props.result.source}</span>
        <span class="font-display text-base leading-none tracking-wide">
          {props.result.date}
        </span>
      </p>
    </a>
  );
}
