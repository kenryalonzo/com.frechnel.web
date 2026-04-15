"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll effect: opaque on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3 },
    }),
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-black/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/5"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-[#0a0a0a]/98 border-r border-white/10 text-white w-[300px] sm:w-[360px] p-0"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-6 border-b border-white/10">
                  <Image
                    src="/assets/logo.png"
                    alt="Freshnel"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <SheetTitle className="text-2xl font-black tracking-tighter text-white">
                      FRECHNEL<span className="text-red-600"> SHOPPING</span><span className="text-primary">.</span>
                  </SheetTitle>
                </div>

                {/* Mobile search */}
                <div className="px-6 py-4 border-b border-white/5">
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3"
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher un article…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </form>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      custom={i}
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-all ${
                          pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {link.name}
                        {pathname === link.href && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex flex-1 justify-center md:flex-none md:w-auto md:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="Freshnel Shopping"
              width={36}
              height={36}
              className="object-contain w-auto h-9"
            />
            <span className="text-xl font-black tracking-tighter text-white">
                FRECHNEL<span className="text-red-600"> SHOPPING</span><span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/70">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 transition-colors duration-200 group ${
                pathname === link.href ? "text-primary" : "hover:text-white"
              }`}
            >
              {link.name}
              {/* Animated underline */}
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] bg-primary transition-all duration-300 ${
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.form
                key="search-form"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onSubmit={handleSearch}
                className="relative flex items-center overflow-hidden"
              >
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Rechercher…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 md:w-56 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  onKeyDown={(e) =>
                    e.key === "Escape" && setIsSearchOpen(false)
                  }
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-1 p-1 text-white/60 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.form>
            ) : (
              <Button
                key="search-btn"
                variant="ghost"
                size="icon"
                className="hidden md:flex text-white hover:text-primary hover:bg-white/5"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
              </Button>
            )}
          </AnimatePresence>

          <Link href="/shop">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-primary hover:bg-white/5 relative"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="sr-only">Shop</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
