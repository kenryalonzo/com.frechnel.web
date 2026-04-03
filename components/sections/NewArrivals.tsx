"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shared/ProductCard";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";

export function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?isNew=true&limit=6")
      .then((r) => r.json())
      .then((data) => setProducts(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-16 overflow-hidden">
      <div className="container px-4 md:px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Vient d'arriver
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              NOUVELLES <span className="text-primary">ARRIVÉES</span>
            </h2>
          </div>
          <Link
            href="/shop?isNew=true"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Horizontal scrollable on mobile */}
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
