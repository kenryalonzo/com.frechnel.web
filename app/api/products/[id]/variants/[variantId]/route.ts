import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PUT - Modifier une variante (protégé)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const { variantId } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const body = await request.json();
    const { size, color, colorHex, stock, priceAdjust, imageUrl } = body;

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        size: size || null,
        color: color || null,
        colorHex: colorHex || null,
        stock: parseInt(stock) || 0,
        priceAdjust: parseFloat(priceAdjust) || 0,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la variante" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une variante (protégé)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const { variantId } = await params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    await prisma.productVariant.delete({
      where: { id: variantId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la variante" },
      { status: 500 },
    );
  }
}
