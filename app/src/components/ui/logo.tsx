import { mergeProps } from "solid-js";
import { cn } from "../../utils";

interface LogoProps {
	size?: "sm" | "lg";
}

export function Logo(props: LogoProps) {
	const merged = mergeProps({ size: "sm" }, props);
	const iconSize = merged.size === "sm" ? "64px" : "72px";

	return (
		<div class="flex text-zinc-600 items-center">
			<svg
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
			<div class="h-[36px] w-0.5 rounded bg-white" />
			<div
				class={cn(
					"flex flex-col font-semibold leading-6 ml-1",
					merged.size === "sm" && "text-base leading-5",
					merged.size === "lg" && "text-xl leading-6",
				)}
			>
				<span>Newsletter</span>
				<span>Scraper</span>
			</div>
		</div>
	);
}