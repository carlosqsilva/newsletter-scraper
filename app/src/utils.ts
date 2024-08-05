import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
  return item !== undefined && item !== null;
}

export function updateURLSearchParams(inputParams?: Record<string, string>) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);

  if (!defined(inputParams)) {
    url.search = "";
    window.history.replaceState(null, "", url);
    return;
  }

  for (const key in inputParams) {
    params.set(key, inputParams[key]);
  }

  url.search = params.toString();
  window.history.replaceState(null, "", url);
}

export function getSearchParams(paramKey: string) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);

  return params.get(paramKey);
}
