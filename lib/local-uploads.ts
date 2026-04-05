import { unlink } from "fs/promises";
import { resolve, sep } from "path";
import { existsSync } from "fs";

/**
 * URL relative servie depuis /public/uploads (ex: /uploads/foo.jpg)
 */
export function isPublicUploadUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("/uploads/");
}

/**
 * Supprime un fichier sous public/uploads/ si l'URL est valide et sécurisée.
 */
export async function deletePublicUploadFile(
  url: string | null | undefined,
): Promise<void> {
  if (!isPublicUploadUrl(url)) return;
  const relative = url!.slice("/uploads/".length);
  if (!relative || relative.includes("..") || relative.includes("/")) {
    return;
  }
  const base = resolve(process.cwd(), "public", "uploads");
  const absolute = resolve(base, relative);
  if (!absolute.startsWith(base + sep) && absolute !== base) {
    return;
  }
  if (existsSync(absolute)) {
    try {
      await unlink(absolute);
    } catch {
      /* ignore */
    }
  }
}
