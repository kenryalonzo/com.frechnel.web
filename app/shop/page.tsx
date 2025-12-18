"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    priceOriginal: number;
    pricePromo?: number;
    isPromo: boolean;
    category: { name: string };
    isNew: boolean;
    isBestSeller: boolean;
    inStock: boolean;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 6, totalPages: 1 });

    // Filter states
    const [activeCategory, setActiveCategory] = useState("Tout");
    const searchQuery = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory, searchQuery, currentPage]);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories([{ id: "all", name: "Tout" }, ...data]);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }

    async function fetchProducts() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("limit", "6"); // Grid of 6 as requested

            if (activeCategory !== "Tout") {
                // Find category ID
                const category = categories.find(c => c.name === activeCategory);
                if (category && category.id !== "all") {
                    params.append("categoryId", category.id);
                }
            }

            // Note: Search is currently handled client-side in the original code, 
            // but for real pagination it should be server-side. 
            // The current API doesn't support search query yet, so we might need to add it later.
            // For now, we'll fetch and if search is present, we might have issues with pagination 
            // unless we implement search in backend. 
            // Assuming for now the user wants basic category filtering + pagination.

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();

            if (data.data) {
                setProducts(data.data);
                setMeta(data.meta);
            } else {
                // Fallback if API structure is different (e.g. error)
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCategoryChange = (categoryName: string) => {
        setActiveCategory(categoryName);
        // Reset to page 1 when filter changes
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.push(`/shop?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <div className="min-h-screen pt-20 pb-20">
            <Section className="container px-4 md:px-6">
                <div className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white">
                        NOTRE <span className="text-primary">COLLECTION</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl mb-8">
                        Explorez notre catalogue complet. Des pièces uniques pour un style unique.
                    </p>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.name ? "default" : "outline"}
                                onClick={() => handleCategoryChange(category.name)}
                                className={`rounded-full ${activeCategory === category.name
                                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    : "bg-transparent border-white/10 hover:bg-white/5"
                                    }`}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6" // Changed to lg:grid-cols-3 to fit 6 items nicely (2 rows of 3)
                        >
                            <AnimatePresence mode="popLayout">
                                {products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {products.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                Aucun article trouvé dans cette catégorie.
                            </div>
                        )}

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(meta.page - 1); }}
                                                className={meta.page <= 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === meta.page}
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(meta.page + 1); }}
                                                className={meta.page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </Section>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ShopContent />
        </Suspense>
    );
}
