"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count?: { products: number };
  children?: Category[];
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
];

export function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        // Show max 4 root categories
        setCategories((Array.isArray(data) ? data : []).slice(0, 4));
      })
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container px-4 md:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
            Nos Collections
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            Shop par <span className="text-primary">Catégorie</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, i) => {
          const img =
            cat.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={i === 0 ? "col-span-2 row-span-2" : ""}
            >
              <Link
                href={`/shop?categoryId=${cat.id}`}
                className="group relative block rounded-2xl overflow-hidden bg-card border border-white/8 hover:border-primary/40 transition-all duration-300"
                style={{ aspectRatio: i === 0 ? "1/1" : "4/3" }}
              >
                <Image
                  src={img}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3
                    className={`font-black text-white tracking-tight ${i === 0 ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}
                  >
                    {cat.name}
                  </h3>
                  {cat._count && (
                    <p className="text-white/60 text-xs mt-0.5">
                      {cat._count.products} article
                      {cat._count.products !== 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Découvrir <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
