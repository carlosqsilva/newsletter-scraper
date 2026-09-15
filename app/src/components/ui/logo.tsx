import { type JSX, mergeProps, splitProps } from "solid-js";
import { cn, defined } from "../../utils";

interface LogoProps extends JSX.ButtonHTMLAttributes<HTMLDivElement> {
  size?: "sm" | "lg";
}

export function Logo(props: LogoProps) {
  const merged = mergeProps({ size: "sm" }, props);
  const [local, defaultProps] = splitProps(merged, ["size", "class"]);
  const iconSize = local.size === "sm" ? "44px" : "56px";

  return (
    <div
      {...defaultProps}
      class={cn(
        "flex flex-nowrap flex-none items-center gap-2 text-ink",
        defined(defaultProps.onClick) && "cursor-pointer",
        local.class,
      )}
    >
      <svg
        class="y2k-icon"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M182 112a6 6 0 0 1-6 6H96a6 6 0 0 1 0-12h80a6 6 0 0 1 6 6m-6 26H96a6 6 0 0 0 0 12h80a6 6 0 0 0 0-12m54-74v120a22 22 0 0 1-22 22H32a22 22 0 0 1-22-21.91V88a6 6 0 0 1 12 0v96a10 10 0 0 0 20 0V64a14 14 0 0 1 14-14h160a14 14 0 0 1 14 14m-12 0a2 2 0 0 0-2-2H56a2 2 0 0 0-2 2v120a21.84 21.84 0 0 1-2.41 10H208a10 10 0 0 0 10-10Z"
        />
      </svg>
      <div
        class={cn(
          "flex flex-col font-pixel",
          local.size === "sm" && "text-[10px] leading-[1.6] tracking-wide",
          local.size === "lg" && "text-xs leading-[1.8] md:text-sm",
        )}
      >
        <span>Newsletter</span>
        <span>Scraper</span>
      </div>
    </div>
  );
}
