import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/types";
import { removeStoredImage } from "@/lib/media-cleanup";

// PUT — Modifier une catégorie (nom, parent, image, ordre)
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = body.name != null ? String(body.name) : "";

    if (!name.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    const nameTrim = name.trim();
    const slug = slugify(nameTrim);

    const data: {
      name: string;
      slug: string;
      parentId?: string | null;
      imageUrl?: string | null;
      sortOrder?: number;
    } = {
      name: nameTrim,
      slug,
    };

    if ("parentId" in body) {
      const pid = body.parentId != null ? String(body.parentId) : "";
      const parentIdVal = pid ? pid : null;
      if (parentIdVal === params.id) {
        return NextResponse.json(
          { error: "Une catégorie ne peut pas être son propre parent" },
          { status: 400 },
        );
      }
      if (parentIdVal) {
        const parent = await prisma.category.findUnique({
          where: { id: parentIdVal },
        });
        if (!parent) {
          return NextResponse.json(
            { error: "Catégorie parente introuvable" },
            { status: 400 },
          );
        }
      }
      data.parentId = parentIdVal;
    }

    if ("imageUrl" in body) {
      const next =
        body.imageUrl != null && String(body.imageUrl).trim() !== ""
          ? String(body.imageUrl).trim()
          : null;
      if (next !== existing.imageUrl) {
        await removeStoredImage(existing.imageUrl);
      }
      data.imageUrl = next;
    }

    if ("sortOrder" in body) {
      data.sortOrder =
        parseInt(String(body.sortOrder ?? "0"), 10) || 0;
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Error updating category:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom ou ce slug existe déjà" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une catégorie (protégé)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${productsCount} produit(s) lié(s)`,
        },
        { status: 400 },
      );
    }

    const row = await prisma.category.findUnique({
      where: { id: params.id },
      select: { imageUrl: true },
    });
    if (row?.imageUrl) {
      await removeStoredImage(row.imageUrl);
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting category:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
