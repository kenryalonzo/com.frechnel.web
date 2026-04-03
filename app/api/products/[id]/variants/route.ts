import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Liste les variantes d'un produit
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des variantes" },
      { status: 500 },
    );
  }
}

// POST - Ajouter une variante à un produit (protégé)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const body = await request.json();
    const { size, color, colorHex, stock, priceAdjust, imageUrl } = body;

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        size: size || null,
        color: color || null,
        colorHex: colorHex || null,
        stock: parseInt(stock) || 0,
        priceAdjust: parseFloat(priceAdjust) || 0,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la variante" },
      { status: 500 },
    );
  }
}
