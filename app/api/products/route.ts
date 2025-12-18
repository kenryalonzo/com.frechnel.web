import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Liste tous les produits (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const isPromo = searchParams.get('isPromo');
        const isNew = searchParams.get('isNew');
        const isBestSeller = searchParams.get('isBestSeller');

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100'); // Default high limit if not specified
        const skip = (page - 1) * limit;

        const where: any = {};

        if (categoryId && categoryId !== 'Tout') where.categoryId = categoryId;
        if (isPromo === 'true') where.isPromo = true;
        if (isNew === 'true') where.isNew = true;
        if (isBestSeller === 'true') where.isBestSeller = true;

        // Get total count for pagination metadata
        const total = await prisma.product.count({ where });

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des produits' },
            { status: 500 }
        );
    }
}

// POST - Créer un produit avec upload Cloudinary (protégé)
export async function POST(request: NextRequest) {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.error;

    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const priceOriginal = parseFloat(formData.get('priceOriginal') as string);
        const pricePromo = formData.get('pricePromo') ? parseFloat(formData.get('pricePromo') as string) : null;
        const isPromo = formData.get('isPromo') === 'true';
        const categoryId = formData.get('categoryId') as string;
        const isNew = formData.get('isNew') === 'true';
        const isBestSeller = formData.get('isBestSeller') === 'true';
        const inStock = formData.get('inStock') !== 'false';

        const imageFile = formData.get('image') as File | null;
        const imageUrl = formData.get('imageUrl') as string | null;

        // Validation
        if (!name || !priceOriginal || !categoryId) {
            return NextResponse.json(
                { error: 'Nom, prix et catégorie requis' },
                { status: 400 }
            );
        }

        let finalImageUrl = imageUrl;

        // Upload vers Cloudinary si un fichier est fourni
        if (imageFile) {
            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            const uploadResult = await uploadToCloudinary(imageFile);
            finalImageUrl = uploadResult.url;
        }

        if (!finalImageUrl) {
            return NextResponse.json(
                { error: 'Image requise (fichier ou URL)' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
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
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création du produit' },
            { status: 500 }
        );
    }
}
