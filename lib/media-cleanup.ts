import { extractPublicId, deleteFromCloudinary } from "@/lib/cloudinary";
import { deletePublicUploadFile, isPublicUploadUrl } from "@/lib/local-uploads";

/**
 * Supprime une image stockée soit sur Cloudinary, soit en fichier local (/uploads).
 */
export async function removeStoredImage(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  if (url.includes("res.cloudinary.com")) {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch {
        /* ignore */
      }
    }
    return;
  }
  if (isPublicUploadUrl(url)) {
    await deletePublicUploadFile(url);
  }
}
