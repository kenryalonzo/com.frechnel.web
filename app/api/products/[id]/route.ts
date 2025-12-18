import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { extractPublicId, deleteFromCloudinary } from '@/lib/cloudinary';

// GET - Détails d'un produit (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}

// PUT - Modifier un produit (protégé)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Récupérer le produit existant
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        let finalImageUrl = existingProduct.imageUrl;

        // Si nouvelle image uploadée
        if (imageFile) {
            const { uploadToCloudinary } = await import('@/lib/cloudinary');

            // Supprimer l'ancienne image de Cloudinary
            const oldPublicId = extractPublicId(existingProduct.imageUrl);
            if (oldPublicId) {
                try {
                    await deleteFromCloudinary(oldPublicId);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }

            // Upload nouvelle image
            const uploadResult = await uploadToCloudinary(imageFile);
            finalImageUrl = uploadResult.url;
        } else if (imageUrl) {
            // Si URL fournie
            finalImageUrl = imageUrl;
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
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la modification' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer un produit + image Cloudinary (protégé)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.error;

    try {
        // Récupérer le produit
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        // Supprimer l'image de Cloudinary
        const publicId = extractPublicId(product.imageUrl);
        if (publicId) {
            try {
                await deleteFromCloudinary(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
                // Continue même si la suppression Cloudinary échoue
            }
        }

        // Supprimer le produit de la DB
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
