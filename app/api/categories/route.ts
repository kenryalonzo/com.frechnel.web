import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Liste toutes les catégories (public)
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des catégories' },
            { status: 500 }
        );
    }
}

// POST - Créer une catégorie (protégé)
export async function POST(request: NextRequest) {
    // Protection JWT
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

        // Générer le slug
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const category = await prisma.category.create({
            data: { name, slug },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error('Error creating category:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Cette catégorie existe déjà' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création de la catégorie' },
            { status: 500 }
        );
    }
}
