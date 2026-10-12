import { type JSX, splitProps } from "solid-js";
import { cn } from "../../utils";

interface keysProps extends JSX.ButtonHTMLAttributes<HTMLElement> {
  children: JSX.Element;
}

export function Kbd(props: keysProps) {
  const [local, defaultProps] = splitProps(props, ["class", "children"]);

  return (
    <kbd
      {...defaultProps}
      class={cn("y2k-kbd pointer-events-none select-none", local.class)}
    >
      <span>{local.children}</span>
    </kbd>
  );
}
