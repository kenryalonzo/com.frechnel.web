import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@frechnel.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'freshnel2025';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        // Vérification via Variables d'Environnement (Plus robuste aux reset DB)
        const isValidEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const isValidPassword = password === ADMIN_PASSWORD;

        if (!isValidEmail || !isValidPassword) {
            return NextResponse.json(
                { error: 'Identifiants invalides' },
                { status: 401 }
            );
        }

        const emailNorm = email.toLowerCase().trim();

        // Générer JWT (adminId aligné avec lib/auth verifyAuth)
        const token = await new SignJWT({
            role: 'admin',
            adminId: emailNorm,
            email: emailNorm,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d') // Token valide 7 jours
            .sign(JWT_SECRET);

        // Retourner le token
        return NextResponse.json({
            success: true,
            token,
            admin: {
                email: emailNorm,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la connexion' },
            { status: 500 }
        );
    }
}

