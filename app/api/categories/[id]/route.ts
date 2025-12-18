import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PUT - Modifier une catégorie (protégé)
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.error;

    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Le nom est requis' },
                { status: 400 }
            );
        }

        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const category = await prisma.category.update({
            where: { id: params.id },
            data: { name, slug },
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error updating category:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Catégorie non trouvée' },
                { status: 404 }
            );
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Une catégorie avec ce nom existe déjà' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la modification' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer une catégorie (protégé)
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.error;

    try {
        // Vérifier s'il y a des produits
        const productsCount = await prisma.product.count({
            where: { categoryId: params.id },
        });

        if (productsCount > 0) {
            return NextResponse.json(
                { error: `Impossible de supprimer : ${productsCount} produit(s) lié(s)` },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting category:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Catégorie non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
