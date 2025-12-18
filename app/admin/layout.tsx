"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Si on est sur la page de login, pas besoin de vérifier l'auth
        if (pathname === '/admin/login') {
            setIsLoading(false);
            return;
        }

        // Vérifier si le token existe
        const token = localStorage.getItem('admin_token');

        if (!token) {
            router.push('/admin/login');
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
    }, [pathname, router]);

    // Page de login - afficher directement
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Chargement de la vérification
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Non authentifié - redirection en cours
    if (!isAuthenticated) {
        return null;
    }

    // Authentifié - afficher le layout avec sidebar
    return (
        <div className="flex h-screen bg-black">
            <AdminSidebar />
            <div className="flex-1 ml-64 overflow-y-auto">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
