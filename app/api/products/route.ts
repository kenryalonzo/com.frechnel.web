import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ProductVariant } from "@/lib/types";
import { slugify } from "@/lib/types";
import { parseProductMutationBody } from "@/lib/product-mutation";

// GET - Liste tous les produits avec filtres avancés (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const gender = searchParams.get("gender");
    const tag = searchParams.get("tag");
    const isPromo = searchParams.get("isPromo");
    const isNew = searchParams.get("isNew");
    const isBestSeller = searchParams.get("isBestSeller");
    const inStock = searchParams.get("inStock");
    const q = searchParams.get("q"); // full-text search
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (categoryId) where.categoryId = categoryId;
    if (gender) where.gender = gender;
    if (tag) where.tags = { has: tag };
    if (isPromo === "true") where.isPromo = true;
    if (isNew === "true") where.isNew = true;
    if (isBestSeller === "true") where.isBestSeller = true;
    if (inStock === "true") where.inStock = true;

    // Price range filter
    if (minPrice || maxPrice) {
      where.OR = [
        {
          isPromo: false,
          priceOriginal: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
        {
          isPromo: true,
          pricePromo: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
      ];
    }

    // Full-text search on name and description
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    // Sort order
    const orderBy = (() => {
      switch (sortBy) {
        case "price_asc":
          return { priceOriginal: "asc" as const };
        case "price_desc":
          return { priceOriginal: "desc" as const };
        case "popularity":
          return [
            { isBestSeller: "desc" as const },
            { createdAt: "desc" as const },
          ];
        case "newest":
        default:
          return { createdAt: "desc" as const };
      }
    })();

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 },
    );
  }
}

// POST — Créer un produit (JSON admin ou FormData ; image fichier → Cloudinary, sinon URL)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const parsed = await parseProductMutationBody(request, "create");
    const {
      name,
      description,
      priceOriginal,
      pricePromo,
      isPromo,
      categoryId,
      isNew,
      isBestSeller,
      inStock,
      gender,
      tags,
      imageFile,
      imageUrl,
      variants,
    } = parsed;

    if (!name?.trim() || !Number.isFinite(priceOriginal) || !categoryId) {
      return NextResponse.json(
        { error: "Nom, prix et catégorie requis" },
        { status: 400 },
      );
    }

    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const uploadResult = await uploadToCloudinary(imageFile);
      finalImageUrl = uploadResult.url;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "Image requise (fichier ou URL)" },
        { status: 400 },
      );
    }

    const variantsData = variants ?? [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
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
        variants:
          variantsData.length > 0
            ? {
                create: variantsData.map((v: Partial<ProductVariant>) => ({
                  size: v.size || null,
                  color: v.color || null,
                  colorHex: v.colorHex || null,
                  stock: Number(v.stock) || 0,
                  priceAdjust: Number(v.priceAdjust) || 0,
                  imageUrl: v.imageUrl || null,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 },
    );
  }
}
