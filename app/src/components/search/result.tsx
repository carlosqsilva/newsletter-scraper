import type { ResultType } from "./state";

export function Result(props: { result: ResultType }) {
  return (
    <a
      href={props.result.url}
      target="_blank"
      rel="noreferrer"
      class="p-4 py-5 hover:underline underline-offset-4 decoration-fg-subtle"
    >
      <p class="md:text-lg text-fg text-pretty">{props.result.description}</p>
      <div class="text-fg-subtle">
        {props.result.date} | {props.result.source}
      </div>
    </a>
  );
}
