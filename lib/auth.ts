import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthenticatedRequest extends NextRequest {
    adminId?: string;
    email?: string;
}

/**
 * Middleware pour vérifier le JWT
 * Utiliser dans les API routes protégées
 */
export async function verifyAuth(request: NextRequest): Promise<{
    authenticated: boolean;
    adminId?: string;
    email?: string;
    error?: string;
}> {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authenticated: false,
                error: 'Token manquant',
            };
        }

        const token = authHeader.substring(7); // Enlever "Bearer "

        // Vérifier et décoder le token
        const verified = await jwtVerify(token, JWT_SECRET);
        const payload = verified.payload as { adminId: string; email: string };

        return {
            authenticated: true,
            adminId: payload.adminId,
            email: payload.email,
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return {
            authenticated: false,
            error: 'Token invalide ou expiré',
        };
    }
}

/**
 * HOC pour protéger les API routes
 * Exemple d'utilisation :
 * 
 * export async function GET(req: NextRequest) {
 *   const authResult = await requireAuth(req);
 *   if (authResult.error) return authResult.error;
 *   
 *   // Route protégée - adminId disponible dans authResult.adminId
 *   return NextResponse.json({ data: 'protected' });
 * }
 */
export async function requireAuth(request: NextRequest): Promise<{
    authenticated: true;
    adminId: string;
    email: string;
} | {
    authenticated: false;
    error: NextResponse;
}> {
    const result = await verifyAuth(request);

    if (!result.authenticated) {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: result.error || 'Non autorisé' },
                { status: 401 }
            ),
        };
    }

    return {
        authenticated: true,
        adminId: result.adminId!,
        email: result.email!,
    };
}
