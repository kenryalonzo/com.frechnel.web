"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Mail,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Produits", href: "/admin/products", icon: Package },
    { name: "Catégories", href: "/admin/categories", icon: FolderTree },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        toast.success('Déconnexion réussie');
        router.push('/admin/login');
    };

    return (
        <div className="flex h-full w-64 flex-col fixed left-0 top-0 bg-black border-r border-white/10">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
                <Image
                    src="/assets/logo.png"
                    alt="Frechnel"
                    width={32}
                    height={32}
                    className="object-contain"
                />
                <div>
                    <h2 className="text-lg font-black tracking-tight text-white">
                        FRECH<span className="text-primary">NEL</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Admin</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_0_theme(colors.primary)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-all w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
