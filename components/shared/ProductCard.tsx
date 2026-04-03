"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ProductVariant {
  id: string;
  color: string | null;
  colorHex: string | null;
  stock: number;
  size: string | null;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl: string;
  priceOriginal: number;
  pricePromo?: number | null;
  isPromo: boolean;
  isNew?: boolean;
  inStock?: boolean;
  category: { name: string };
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.pricePromo
    ? Math.round(
        ((product.priceOriginal - product.pricePromo) / product.priceOriginal) *
          100,
      )
    : 0;

  const productHref = `/product/${product.slug || product.id}`;
  const price =
    product.isPromo && product.pricePromo
      ? product.pricePromo
      : product.priceOriginal;

  // Color swatches — show unique colors from variants
  const colorSwatches = product.variants
    ? Array.from(
        new Map(
          product.variants
            .filter((v) => v.colorHex && v.color)
            .map((v) => [v.colorHex, v]),
        ).values(),
      ).slice(0, 5)
    : [];

  const isOutOfStock = product.inStock === false;
  const whatsappMsg = `Salut Frechnel 👋, je veux commander :\n*${product.name}* — ${price.toLocaleString()} FCFA\nLien : https://frechnel-shopping.com/product/${product.slug || product.id}`;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-white/8 hover:border-primary/40 transition-colors duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-4/5 bg-white/5 overflow-hidden group">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isPromo && discount > 0 && (
            <Badge className="bg-primary text-white font-bold text-xs px-2 py-0.5 shadow-lg shadow-red-500/30">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-white text-black font-bold text-xs px-2 py-0.5">
              NOUVEAU
            </Badge>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
            <span className="text-white/80 text-sm font-bold uppercase tracking-wider border border-white/20 rounded-full px-3 py-1">
              Rupture
            </span>
          </div>
        )}

        <Link href={productHref}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <Button
              size="sm"
              className="rounded-full bg-white text-black hover:bg-primary hover:text-white font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            >
              Voir le produit
            </Button>
          </div>
        </Link>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category.name}
        </div>
        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {/* Color swatches */}
        {colorSwatches.length > 0 && (
          <div className="flex gap-1.5 items-center pt-0.5">
            {colorSwatches.map((v) => (
              <div
                key={v.colorHex}
                className="h-4 w-4 rounded-full border border-white/20 cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: v.colorHex! }}
                title={v.color!}
              />
            ))}
            {(product.variants?.filter((v) => v.colorHex).length ?? 0) > 5 && (
              <span className="text-xs text-muted-foreground">
                +{(product.variants?.filter((v) => v.colorHex).length ?? 0) - 5}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.isPromo && product.pricePromo ? (
            <>
              <span className="font-bold text-lg text-primary">
                {product.pricePromo.toLocaleString()} FCFA
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {product.priceOriginal.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg text-white">
              {product.priceOriginal.toLocaleString()} FCFA
            </span>
          )}
        </div>

        {/* WhatsApp CTA */}
        <Button
          className="w-full mt-1 gap-2 bg-white/5 hover:bg-primary hover:text-white border border-white/10 hover:border-primary text-sm py-2 transition-all duration-200"
          variant="outline"
          asChild
        >
          <a
            href={`https://wa.me/237658508725?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </Button>
      </div>
    </motion.article>
  );
}
