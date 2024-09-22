import ky from "ky";

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
  return item !== undefined && item !== null;
}

export async function resolveUrl(url: string) {
  try {
    const response = await ky(url, {
      throwHttpErrors: false,
      timeout: 8000,
      retry: 0,
    });
    if (response.ok) {
      return response.url;
    }

    return null;
  } catch {
    return null;
  }
}
