import { splitProps, type JSX } from "solid-js";
import { cn } from "../../utils";

interface keysProps extends JSX.ButtonHTMLAttributes<HTMLElement> {
  children: JSX.Element;
}

export function Kbd(props: keysProps) {
  const [local, defaultProps] = splitProps(props, ["class", "children"]);

  return (
    <kbd
      {...defaultProps}
      class={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
        local.class,
      )}
    >
      <span>{local.children}</span>
    </kbd>
  );
}
