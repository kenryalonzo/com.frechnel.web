"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState } from "react";

import { useRouter } from "next/navigation";

const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Mobile Menu */}
                <div className="flex md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/5">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-black/95 border-r border-white/10 text-white w-[300px] sm:w-[400px]">
                            <SheetTitle className="text-left text-2xl font-bold tracking-tighter text-white mb-8">
                                FRECHNEL
                            </SheetTitle>
                            <motion.nav
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-6 text-lg font-medium"
                            >
                                {navLinks.map((link) => (
                                    <motion.div key={link.href} variants={item}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block transition-colors hover:text-primary hover:translate-x-2 duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <div className="flex flex-1 justify-center md:flex-none md:w-auto md:justify-start">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.png"
                            alt="Freshnel Shopping"
                            width={40}
                            height={40}
                            className="object-contain w-auto h-10"
                        />
                        <span className="text-2xl font-black tracking-tighter text-white">
                            FRECHNEL<span className="text-primary">.</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="transition-colors hover:text-primary hover:glow-text">
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isSearchOpen ? (
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-40 md:w-60 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm text-white focus:outline-none focus:border-primary transition-all"
                                autoFocus
                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 text-white hover:text-primary"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex text-white hover:text-primary hover:bg-white/5"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Rechercher</span>
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/5 relative">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="sr-only">Panier</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
