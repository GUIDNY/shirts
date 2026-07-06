import "server-only";
import { put } from "@vercel/blob";

/**
 * Uploads a file to Vercel Blob and returns its public URL.
 * URLs get a random suffix, so they're public but unguessable —
 * this also lets Gelato fetch design files directly.
 */
export async function uploadPublicFile(
  pathname: string,
  data: Buffer | Blob,
  contentType: string
): Promise<string> {
  const { url } = await put(pathname, data, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return url;
}
