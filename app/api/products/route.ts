import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/types";

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

    const where: any = {};

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

// POST - Créer un produit avec upload Cloudinary (protégé)
export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || !priceOriginal || !categoryId) {
      return NextResponse.json(
        { error: "Nom, prix et catégorie requis" },
        { status: 400 },
      );
    }

    // Auto-generate slug
    let slug = slugify(name);
    // Ensure uniqueness by appending random suffix if needed
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalImageUrl = imageUrl;

    // Upload vers Cloudinary si un fichier est fourni
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

    // Parse variants from FormData
    const variantsRaw = formData.get("variants") as string | null;
    const variantsData = variantsRaw ? JSON.parse(variantsRaw) : [];

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
        gender: gender as any,
        tags,
        variants:
          variantsData.length > 0
            ? {
                create: variantsData.map((v: any) => ({
                  size: v.size || null,
                  color: v.color || null,
                  colorHex: v.colorHex || null,
                  stock: parseInt(v.stock) || 0,
                  priceAdjust: parseFloat(v.priceAdjust) || 0,
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
