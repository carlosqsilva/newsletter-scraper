import { mergeProps, splitProps, type JSX } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium tracking-wide",
  {
    variants: {
      intent: {
        neutral:
          "transition-colors duration-100 rounded-md text-neutral-500 bg-neutral-50 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-100 hover:text-neutral-600 hover:bg-neutral-100",
        info: "text-blue-500 transition-colors duration-100 rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-100 bg-blue-50 hover:text-blue-600 hover:bg-blue-100",
        danger:
          "text-red-500 transition-colors duration-100 rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-red-100 bg-red-50 hover:text-red-600 hover:bg-red-100",
        success:
          "text-green-500 transition-colors duration-100 rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-green-100 bg-green-50 hover:text-green-600 hover:bg-green-100",
        warning:
          "text-yellow-600 transition-colors duration-100 rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-yellow-100 bg-yellow-50 hover:text-yellow-700 hover:bg-yellow-100",
      },
    },
    defaultVariants: {
      intent: "neutral",
    },
  },
);

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
