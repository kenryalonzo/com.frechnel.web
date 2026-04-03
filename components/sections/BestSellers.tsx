"use client";

import { useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/shared/ProductCard";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2, Flame } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));

  useEffect(() => {
    async function fetchBestSellers() {
      try {
        const res = await fetch("/api/products?isBestSeller=true&limit=8");
        const data = await res.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Failed to fetch best sellers", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <Section className="container px-4 md:px-6">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Section>
    );
  }

  if (products.length === 0) return null;

  return (
    <Section className="container px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-12 text-center"
      >
        <div className="flex items-center gap-2 text-primary mb-3">
          <Flame className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Les plus populaires
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
          BEST <span className="text-primary text-glow-red">SELLERS</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl text-base">
          Les articles les plus convoités de Yaoundé. Ne rate pas ta chance.
        </p>
      </motion.div>

      <Carousel
        plugins={[plugin.current]}
        opts={{ align: "start", loop: true }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {products.map((product, i) => (
            <CarouselItem
              key={product.id}
              className="pl-3 md:pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex justify-end gap-3 mt-8">
          <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 hover:bg-primary hover:border-primary text-white hover:text-white" />
          <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 hover:bg-primary hover:border-primary text-white hover:text-white" />
        </div>
      </Carousel>
    </Section>
  );
}
