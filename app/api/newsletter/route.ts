import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Liste des abonnés (public pour affichage, peut être protégé)
export async function GET() {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: {
                subscribedAt: 'desc',
            },
        });

        return NextResponse.json(subscribers);
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}

// POST - S'abonner à la newsletter (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email invalide' },
                { status: 400 }
            );
        }

        const subscriber = await prisma.newsletterSubscriber.create({
            data: { email },
        });

        return NextResponse.json(
            { success: true, subscriber },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error subscribing to newsletter:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Cet email est déjà inscrit' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500 }
        );
    }
}
