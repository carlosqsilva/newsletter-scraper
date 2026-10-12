import { type JSX, splitProps } from "solid-js";
import { cn } from "../../utils";

/** Decorative OS-window control buttons (- □ x). */
export function WindowControls() {
  return (
    <span class="y2k-controls" aria-hidden="true">
      <span class="min">
        <svg
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M1 4h6" />
        </svg>
      </span>
      <span class="max">
        <svg
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="1.5" y="1.5" width="5" height="5" />
        </svg>
      </span>
      <span class="close">
        <svg
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
        </svg>
      </span>
    </span>
  );
}

interface WindowFrameProps extends JSX.HTMLAttributes<HTMLElement> {
  title: string;
  bodyClass?: string;
  /** Ref for the window body element. */
  bodyRef?: (el: HTMLDivElement) => void;
  /** Rendered below the body (e.g. status bars), outside of it. */
  footer?: JSX.Element;
  controls?: boolean;
}

/** Retro OS-style window: pixel title bar + hard box-shadow body. */
export function WindowFrame(props: WindowFrameProps) {
  const [local, rest] = splitProps(props, [
    "title",
    "class",
    "bodyClass",
    "bodyRef",
    "footer",
    "controls",
    "children",
  ]);

  return (
    <section {...rest} class={cn("y2k-window", local.class)}>
      <div class="y2k-title-bar">
        <span class="truncate">{local.title}</span>
        {local.controls !== false && <WindowControls />}
      </div>
      <div ref={local.bodyRef} class={local.bodyClass}>
        {local.children}
      </div>
      {local.footer}
    </section>
  );
}
