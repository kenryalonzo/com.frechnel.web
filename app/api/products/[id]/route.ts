import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { extractPublicId, deleteFromCloudinary } from "@/lib/cloudinary";

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

// PUT - Modifier un produit + synchroniser variantes (protégé)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceOriginal = parseFloat(formData.get("priceOriginal") as string);
    const pricePromo = formData.get("pricePromo")
      ? parseFloat(formData.get("pricePromo") as string)
      : null;
    const isPromo = formData.get("isPromo") === "true";
    const categoryId = formData.get("categoryId") as string;
    const isNew = formData.get("isNew") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const inStock = formData.get("inStock") !== "false";
    const gender = (formData.get("gender") as string) || "UNISEX";
    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    // Parse variants from FormData
    const variantsRaw = formData.get("variants") as string | null;
    const variantsData = variantsRaw ? JSON.parse(variantsRaw) : null;

    // Récupérer le produit existant
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

    let finalImageUrl = existingProduct.imageUrl;

    // Si nouvelle image uploadée
    if (imageFile) {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const oldPublicId = extractPublicId(existingProduct.imageUrl);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch {
          /* ignore */
        }
      }
      const uploadResult = await uploadToCloudinary(imageFile);
      finalImageUrl = uploadResult.url;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    // Synchronize variants if provided
    if (variantsData !== null) {
      // Delete variants not in the new list
      const newIds = variantsData
        .filter((v: { id?: string }) => v.id)
        .map((v: { id?: string }) => v.id);
      await prisma.productVariant.deleteMany({
        where: {
          productId: id,
          id: { notIn: newIds },
        },
      });

      // Upsert each variant
      for (const v of variantsData) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size || null,
              color: v.color || null,
              colorHex: v.colorHex || null,
              stock: parseInt(v.stock) || 0,
              priceAdjust: parseFloat(v.priceAdjust) || 0,
              imageUrl: v.imageUrl || null,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: v.size || null,
              color: v.color || null,
              colorHex: v.colorHex || null,
              stock: parseInt(v.stock) || 0,
              priceAdjust: parseFloat(v.priceAdjust) || 0,
              imageUrl: v.imageUrl || null,
            },
          });
        }
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl: finalImageUrl,
        priceOriginal,
        pricePromo: isPromo ? pricePromo : null,
        isPromo,
        categoryId,
        isNew,
        isBestSeller,
        inStock,
        gender: gender as "UNISEX" | "MEN" | "WOMEN",
        tags,
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

// DELETE - Supprimer un produit + image Cloudinary + variantes (protégé)
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
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer l'image de Cloudinary
    const publicId = extractPublicId(product.imageUrl);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch {
        /* ignore */
      }
    }

    // Cascade delete handles variants
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
