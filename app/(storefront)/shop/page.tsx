"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/shared/ProductCard";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
  _count?: { products: number };
}

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "popularity", label: "Popularité" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "MEN", label: "Homme" },
  { value: "WOMEN", label: "Femme" },
  { value: "UNISEX", label: "Unisex" },
];

function FiltersPanel({
  categories,
  filters,
  onChange,
  onReset,
}: {
  categories: Category[];
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, val: string | boolean | undefined) => void;
  onReset: () => void;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const activeCount = [
    filters.categoryId,
    filters.gender,
    filters.isPromo,
    filters.inStock,
    filters.isNew,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Active count + reset */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary font-semibold">
            {activeCount} filtre{activeCount > 1 ? "s" : ""} actif
            {activeCount > 1 ? "s" : ""}
          </span>
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Réinitialiser
          </button>
        </div>
      )}

      {/* Categories */}
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Catégories
        </p>
        <div className="space-y-1">
          <button
            onClick={() => onChange("categoryId", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.categoryId ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center">
                <button
                  onClick={() => onChange("categoryId", cat.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.categoryId === cat.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  <span className="flex items-center justify-between">
                    {cat.name}
                    {cat._count && (
                      <span className="text-xs opacity-50">
                        {cat._count.products}
                      </span>
                    )}
                  </span>
                </button>
                {(cat.children?.length ?? 0) > 0 && (
                  <button
                    onClick={() =>
                      setExpandedCats((prev) => {
                        const n = new Set(prev);
                        if (n.has(cat.id)) n.delete(cat.id);
                        else n.add(cat.id);
                        return n;
                      })
                    }
                    className="p-1 text-muted-foreground hover:text-white"
                  >
                    {expandedCats.has(cat.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              {expandedCats.has(cat.id) &&
                cat.children?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onChange("categoryId", child.id)}
                    className={`w-full text-left pl-7 pr-3 py-1.5 rounded-lg text-xs transition-colors ${filters.categoryId === child.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                  >
                    ↳ {child.name}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Genre
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("gender", opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filters.gender === opt.value ? "bg-primary border-primary text-white" : "border-white/10 text-muted-foreground hover:border-primary/50 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Statut
        </p>
        <div className="space-y-2">
          {[
            { key: "isPromo", label: "🔥 Promotions uniquement" },
            { key: "inStock", label: "✅ En stock uniquement" },
            { key: "isNew", label: "✨ Nouveautés" },
            { key: "isBestSeller", label: "⭐ Best sellers" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                onClick={() => onChange(key, !filters[key])}
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${filters[key] ? "bg-primary" : "bg-white/10"}`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mx-0.5 ${filters[key] ? "translate-x-4" : ""}`}
                />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    gender: searchParams.get("gender") || "",
    isPromo: searchParams.get("isPromo") === "true",
    inStock: searchParams.get("inStock") === "true",
    isNew: searchParams.get("isNew") === "true",
    isBestSeller: searchParams.get("isBestSeller") === "true",
    sortBy: searchParams.get("sortBy") || "newest",
    q: searchParams.get("q") || "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "12");
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.gender) params.set("gender", filters.gender);
      if (filters.isPromo) params.set("isPromo", "true");
      if (filters.inStock) params.set("inStock", "true");
      if (filters.isNew) params.set("isNew", "true");
      if (filters.isBestSeller) params.set("isBestSeller", "true");
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.q) params.set("q", filters.q);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch (error: unknown) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (
    key: string,
    val: string | boolean | undefined,
  ) => {
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    // Update URL
    const params = new URLSearchParams();
    params.set("page", "1");
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    router.push(`/shop?${params}`, { scroll: false });
  };

  const handleReset = () => {
    const empty = {
      categoryId: "",
      gender: "",
      isPromo: false,
      inStock: false,
      isNew: false,
      isBestSeller: false,
      sortBy: "newest",
      q: "",
    };
    setFilters(empty);
    router.push("/shop", { scroll: false });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params}`, { scroll: false });
  };

  const activeFilterCount = [
    filters.categoryId,
    filters.gender,
    filters.isPromo,
    filters.inStock,
    filters.isNew,
    filters.isBestSeller,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-12 pb-20">
      <Section className="container px-4 md:px-6 !py-0">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">
            NOTRE <span className="text-primary">CATALOGUE</span>
          </h1>
          <p className="text-muted-foreground">
            {loading
              ? "Chargement…"
              : `${meta.total} article${meta.total !== 1 ? "s" : ""} trouvé${meta.total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.categoryId &&
              categories.find((c) => c.id === filters.categoryId) && (
                <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                  <button onClick={() => handleFilterChange("categoryId", "")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            {filters.gender && (
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
                {GENDER_OPTIONS.find((g) => g.value === filters.gender)?.label}
                <button onClick={() => handleFilterChange("gender", "")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isPromo && (
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
                Promotions{" "}
                <button onClick={() => handleFilterChange("isPromo", false)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isNew && (
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
                Nouveautés{" "}
                <button onClick={() => handleFilterChange("isNew", false)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
                En stock{" "}
                <button onClick={() => handleFilterChange("inStock", false)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-primary underline transition-colors ml-2"
            >
              Tout effacer
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-5">
                Filtres
              </p>
              <FiltersPanel
                categories={categories}
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort + mobile filter row */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile filter button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden relative border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-[#0a0a0a] border-r border-white/10 w-72 overflow-y-auto"
                >
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">Filtres</SheetTitle>
                  </SheetHeader>
                  <FiltersPanel
                    categories={categories}
                    filters={filters}
                    onChange={(k, v) => {
                      handleFilterChange(k, v);
                    }}
                    onReset={handleReset}
                  />
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Trier par :
                </span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange("sortBy", opt.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.sortBy === opt.value ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 text-muted-foreground">
                <p className="text-xl font-semibold mb-2">
                  Aucun article trouvé
                </p>
                <p className="text-sm">
                  Essaie d&apos;autres filtres ou{" "}
                  <button
                    onClick={handleReset}
                    className="text-primary hover:underline"
                  >
                    réinitialise les filtres
                  </button>
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(meta.page - 1);
                            }}
                            className={
                              meta.page <= 1
                                ? "pointer-events-none opacity-40"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: Math.min(meta.totalPages, 7) },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === meta.page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              className={
                                page === meta.page
                                  ? "bg-primary border-primary text-white"
                                  : ""
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(meta.page + 1);
                            }}
                            className={
                              meta.page >= meta.totalPages
                                ? "pointer-events-none opacity-40"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
