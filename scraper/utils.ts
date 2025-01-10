import { request } from "undici";

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
  return item !== undefined && item !== null;
}

export async function resolveUrl(url: string) {
  try {
    const { headers, statusCode } = await request(url, {
      method: "HEAD",
      headersTimeout: 8_000,
    });

    if (statusCode < 404 && headers.location && headers.location !== url) {
      return headers.location as string;
    }

    return null;
  } catch {
    return null;
  }
}
