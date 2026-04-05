import prisma from "@/lib/prisma";
import { removeStoredImage } from "@/lib/media-cleanup";
import type { VariantMutationInput } from "@/lib/product-mutation";

/**
 * Synchronise les variantes : suppressions, mises à jour, créations.
 * Nettoie les images (Cloudinary ou /uploads) des variantes supprimées.
 */
export async function syncProductVariants(
  productId: string,
  variantsData: VariantMutationInput[] | null,
): Promise<void> {
  if (variantsData === null) return;

  const existing = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });

  const incomingIds = new Set(
    variantsData
      .map((v) => v.id)
      .filter((id): id is string => Boolean(id)),
  );

  const toRemove = existing
    .filter((e) => !incomingIds.has(e.id))
    .map((e) => e.id);

  if (toRemove.length > 0) {
    const doomed = await prisma.productVariant.findMany({
      where: { id: { in: toRemove } },
      select: { imageUrl: true },
    });
    for (const d of doomed) {
      await removeStoredImage(d.imageUrl);
    }
    await prisma.productVariant.deleteMany({
      where: { id: { in: toRemove } },
    });
  }

  for (const v of variantsData) {
    const stock = Number(v.stock) || 0;
    const priceAdjust = Number(v.priceAdjust) || 0;

    if (v.id) {
      const prev = await prisma.productVariant.findUnique({
        where: { id: v.id },
        select: { imageUrl: true },
      });
      if (
        prev?.imageUrl &&
        v.imageUrl !== undefined &&
        v.imageUrl !== prev.imageUrl
      ) {
        await removeStoredImage(prev.imageUrl);
      }
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          size: v.size ?? null,
          color: v.color ?? null,
          colorHex: v.colorHex ?? null,
          stock,
          priceAdjust,
          imageUrl: v.imageUrl ?? null,
        },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId,
          size: v.size ?? null,
          color: v.color ?? null,
          colorHex: v.colorHex ?? null,
          stock,
          priceAdjust,
          imageUrl: v.imageUrl ?? null,
        },
      });
    }
  }
}
