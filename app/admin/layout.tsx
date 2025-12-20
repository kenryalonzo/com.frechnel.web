"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
    // Authentifié - afficher le layout avec sidebar responsive
    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed left-0 top-0 h-full z-40">
                <AdminSidebar />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="font-bold text-white">Admin Panel</div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-white/10 w-fit bg-black">
                        {/* Title hidden for accessibility but present in markup logic if needed, or simply render sidebar */}
                        <SheetTitle className="sr-only">Menu Admin</SheetTitle> {/* Fix accessibility warning */}
                        <AdminSidebar className="border-none" />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 overflow-y-auto">
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
