import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, mergeProps, splitProps } from "solid-js";

const buttonVariants = cva("y2k-btn inline-flex items-center justify-center gap-1.5", {
  variants: {
    intent: {
      neutral: "bg-paper",
      primary: "bg-butter",
      info: "bg-lilac",
      danger: "bg-[#ff5b5b]",
      success: "bg-[#59d98f]",
      warning: "bg-butter",
    },
  },
  defaultVariants: {
    intent: "neutral",
  },
});

interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: JSX.Element;
}

export function Button(props: ButtonProps) {
  const merged = mergeProps({ type: "button" } as ButtonProps, props);
  const [local, buttonProps] = splitProps(merged, [
    "children",
    "class",
    "intent",
  ]);

  return (
    <button
      {...buttonProps}
      class={buttonVariants({ intent: local.intent, class: local.class })}
    >
      {local.children}
    </button>
  );
}
