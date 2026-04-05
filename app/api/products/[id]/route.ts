import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { removeStoredImage } from "@/lib/media-cleanup";
import { parseProductMutationBody } from "@/lib/product-mutation";
import { syncProductVariants } from "@/lib/sync-product-variants";
import { slugify } from "@/lib/types";

// GET - Détails d'un produit par ID ou slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Try by slug first, then by id
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: {
          include: { parent: true },
        },
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}

// PUT — Modifier un produit (JSON ou FormData)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const parsed = await parseProductMutationBody(request, "update");

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    if (
      !parsed.name?.trim() ||
      !Number.isFinite(parsed.priceOriginal) ||
      !parsed.categoryId
    ) {
      return NextResponse.json(
        { error: "Nom, prix et catégorie requis" },
        { status: 400 },
      );
    }

    let finalImageUrl = existingProduct.imageUrl;

    if (parsed.imageFile) {
      await removeStoredImage(existingProduct.imageUrl);
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const uploadResult = await uploadToCloudinary(parsed.imageFile);
      finalImageUrl = uploadResult.url;
    } else if (
      parsed.imageUrl != null &&
      parsed.imageUrl !== "" &&
      parsed.imageUrl !== existingProduct.imageUrl
    ) {
      await removeStoredImage(existingProduct.imageUrl);
      finalImageUrl = parsed.imageUrl;
    }

    await syncProductVariants(id, parsed.variants);

    let newSlug = existingProduct.slug;
    if (parsed.name.trim() !== existingProduct.name) {
      let candidate = slugify(parsed.name);
      const clash = await prisma.product.findFirst({
        where: { slug: candidate, NOT: { id } },
      });
      if (clash) {
        candidate = `${candidate}-${Date.now()}`;
      }
      newSlug = candidate;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: newSlug,
        description: parsed.description,
        imageUrl: finalImageUrl,
        priceOriginal: parsed.priceOriginal,
        pricePromo: parsed.isPromo ? parsed.pricePromo : null,
        isPromo: parsed.isPromo,
        categoryId: parsed.categoryId,
        isNew: parsed.isNew,
        isBestSeller: parsed.isBestSeller,
        inStock: parsed.inStock,
        gender: parsed.gender as "UNISEX" | "MEN" | "WOMEN",
        tags: parsed.tags,
      },
      include: {
        category: true,
        variants: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

// DELETE — Supprimer un produit et nettoyer les médias (Cloudinary + fichiers locaux)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    for (const v of product.variants) {
      await removeStoredImage(v.imageUrl);
    }

    await removeStoredImage(product.imageUrl);

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
