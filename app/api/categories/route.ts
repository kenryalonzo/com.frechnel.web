import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/types";

// GET - Arborescence complète des catégories (public)
export async function GET() {
  try {
    // Fetch all categories with parent/children + product count
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      where: { parentId: null }, // Only root categories
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 },
    );
  }
}

// POST - Créer une catégorie (protégé)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const body = await request.json();
    const { name, parentId, imageUrl, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
        imageUrl: imageUrl || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 },
    );
  }
}

// PUT - Modifier une catégorie (protégé)
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const body = await request.json();
    const { id, name, parentId, imageUrl, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (sortOrder !== undefined)
      updateData.sortOrder = parseInt(sortOrder) || 0;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une catégorie (protégé)
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) return auth.error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
