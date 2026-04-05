"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductCard } from "@/components/shared/ProductCard";
import { MessageCircle, Share2, Truck, Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stock: number;
  priceAdjust: number;
  imageUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  priceOriginal: number;
  isPromo: boolean;
  pricePromo: number | null;
  isNew: boolean;
  inStock: boolean;
  gender: string;
  tags: string[];
  category: { id: string; name: string; slug: string };
  variants: Variant[];
}

export default function ProductClientPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setActiveImage(data.imageUrl);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
          if (data.variants[0].imageUrl)
            setActiveImage(data.variants[0].imageUrl);
        }
        // Fetch similar
        return fetch(`/api/products?categoryId=${data.category.id}&limit=4`);
      })
      .then((r) => r?.json())
      .then((sim) => {
        if (sim?.data)
          setSimilar(
            sim.data
              .filter((p: Product) => p.id !== product?.id && p.slug !== slug)
              .slice(0, 4),
          );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  // Price calculation
  const basePrice =
    product.isPromo && product.pricePromo
      ? product.pricePromo
      : product.priceOriginal;
  const finalPrice = selectedVariant
    ? basePrice + selectedVariant.priceAdjust
    : basePrice;
  const discount = product.pricePromo
    ? Math.round(
        ((product.priceOriginal - product.pricePromo) / product.priceOriginal) *
          100,
      )
    : 0;

  // Unique sizes and colors from variants
  const sizes = Array.from(
    new Set(product.variants.filter((v) => v.size).map((v) => v.size!)),
  );
  const colors = Array.from(
    new Map(
      product.variants.filter((v) => v.colorHex).map((v) => [v.colorHex, v]),
    ).values(),
  );

  const productUrl = `https://www.frechnel-shopping.com/product/${product.slug}`;
  const whatsappMsg = `Salut Frechnel 👋, je veux commander :\n*${product.name}*${selectedVariant?.size ? ` — Taille: ${selectedVariant.size}` : ""}${selectedVariant?.color ? ` — Couleur: ${selectedVariant.color}` : ""}\nPrix: ${finalPrice.toLocaleString()} FCFA\nLien : ${productUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: productUrl });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) setActiveImage(variant.imageUrl);
  };

  const variantStock = selectedVariant?.stock ?? (product.inStock ? 99 : 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-4 pb-20 overflow-x-hidden flex flex-col items-center justify-center lg:py-12">
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Section className="container px-4 md:px-6 relative flex flex-col items-center pt-4 md:pt-6 pb-16 md:pb-24 max-w-7xl">
        {/* Breadcrumb - Balanced */}
        <div className="w-full max-w-5xl mb-6 opacity-40 hover:opacity-100 transition-opacity">
          <Breadcrumb
            items={[
              { label: "Shop", href: "/shop" },
              {
                label: product.category.name,
                href: `/shop?categoryId=${product.category.id}`,
              },
              { label: product.name },
            ]}
          />
        </div>

        {/* THE PRODUCT BOX - Centered Delimiter */}
        <div className="w-full max-w-5xl bg-[#0d0d0d] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
          {/* LEFT: IMAGE SECTION (Gallery Style) */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col items-center justify-center bg-white/1 border-b lg:border-b-0 lg:border-r border-white/5">
            <div className="w-full max-w-sm space-y-8">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                {/* Image Showcase - Refined Border & Shadow */}
                <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden border border-white/5 bg-white/2 shadow-2xl transition-all duration-500">
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700"
                    priority
                  />

                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-40" />

                  {/* Badges - Minimalist */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {product.isPromo && (
                      <Badge className="bg-primary text-white font-black px-2.5 py-1 text-xs tracking-tighter border-none">
                        -{discount}%
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-white text-black font-black px-2.5 py-1 text-[10px] tracking-tighter border-none">
                        NEW DROP
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Thumbnails - Centered below */}
              {product.variants.filter((v) => v.imageUrl).length > 0 && (
                <div className="flex justify-center flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveImage(product.imageUrl)}
                    className={`relative shrink-0 w-14 h-18 rounded-lg overflow-hidden border transition-all duration-300 ${activeImage === product.imageUrl ? "border-primary scale-110 shadow-lg" : "border-white/10 opacity-40 hover:opacity-100"}`}
                  >
                    <Image
                      src={product.imageUrl}
                      alt="Principal"
                      fill
                      className="object-cover"
                    />
                  </button>
                  {product.variants
                    .filter((v) => v.imageUrl)
                    .map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelect(v)}
                        className={`relative shrink-0 w-14 h-18 rounded-lg overflow-hidden border transition-all duration-300 ${activeImage === v.imageUrl ? "border-primary scale-110 shadow-lg" : "border-white/10 opacity-40 hover:opacity-100"}`}
                      >
                        <Image
                          src={v.imageUrl!}
                          alt={v.color || ""}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS SECTION */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/shop?categoryId=${product.category.id}`}
                    className="text-[10px] font-black tracking-widest text-primary hover:text-white transition-colors uppercase"
                  >
                    {product.category.name}
                  </Link>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                  <span className="text-[10px] font-medium text-white/30 tracking-widest uppercase">
                    {product.gender === "MEN"
                      ? "HOMME"
                      : product.gender === "WOMEN"
                        ? "FEMME"
                        : "UNISEX"}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                  {product.name}
                </h1>
              </div>

              {/* Price & Status */}
              <div className="flex flex-wrap items-center gap-4 pt-4 pb-6 border-b border-white/5">
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-3xl md:text-4xl font-black ${product.isPromo ? "text-primary" : "text-white"}`}
                  >
                    {finalPrice.toLocaleString()}{" "}
                    <span className="text-xl opacity-60">FCFA</span>
                  </span>
                  {product.isPromo && product.priceOriginal && (
                    <span className="text-sm text-white/20 line-through font-medium">
                      {product.priceOriginal.toLocaleString()} FCFA
                    </span>
                  )}
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${variantStock > 5 ? "border-emerald-500/20 text-emerald-400" : variantStock > 0 ? "border-yellow-500/20 text-yellow-400" : "border-red-500/20 text-red-400"}`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${variantStock > 5 ? "bg-emerald-400" : variantStock > 0 ? "bg-yellow-400" : "bg-red-400"}`}
                  />
                  {variantStock > 5
                    ? "In Stock"
                    : variantStock > 0
                      ? `Only ${variantStock} Left`
                      : "Sold Out"}
                </div>
              </div>

              {/* Compact Description */}
              {product.description && (
                <p className="text-base text-white/50 leading-relaxed max-w-prose">
                  {product.description}
                </p>
              )}

              {/* Variants Selector - More Compact */}
              <div className="space-y-6 pt-2">
                {/* Color */}
                {colors.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelect(v)}
                          className={`group relative h-9 w-9 rounded-xl p-0.5 transition-all duration-300 ${selectedVariant?.colorHex === v.colorHex ? "bg-primary scale-110" : "bg-white/5 hover:bg-white/10"}`}
                        >
                          <div
                            className="w-full h-full rounded-[9px] border border-black/10 shadow-inner"
                            style={{ backgroundColor: v.colorHex! }}
                          />
                          {selectedVariant?.colorHex === v.colorHex && (
                            <motion.div
                              layoutId="color-check-refined"
                              className="absolute -top-1 -right-1 bg-white text-black rounded-full p-0.5 shadow-sm"
                            >
                              <Check className="w-2 h-2" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {sizes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                      Size
                    </p>
                    <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                      {sizes.map((size) => {
                        const variant = product.variants.find(
                          (v) =>
                            v.size === size &&
                            (!selectedVariant?.colorHex ||
                              v.colorHex === selectedVariant.colorHex),
                        );
                        const outOfStock = variant?.stock === 0;
                        const isSelected = selectedVariant?.size === size;

                        return (
                          <button
                            key={size}
                            onClick={() =>
                              variant &&
                              !outOfStock &&
                              setSelectedVariant(variant)
                            }
                            disabled={outOfStock}
                            className={`h-11 rounded-lg border font-black text-xs transition-all duration-300 ${isSelected ? "bg-white text-black border-white shadow-lg" : outOfStock ? "border-white/5 text-white/5 line-through" : "bg-white/5 border-white/5 text-white/60 hover:border-primary hover:text-white"}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action */}
              <div className="flex flex-col gap-3 pt-6 pb-8">
                <Button
                  size="lg"
                  className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-base rounded-xl transition-all duration-300 shadow-xl group"
                  asChild
                >
                  <a
                    href={`https://wa.me/237658508725?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    CONTACT FRECHNEL SHOPPING
                  </a>
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 border-white/5 bg-white/2 hover:bg-white/5 text-white font-bold rounded-xl text-xs"
                    onClick={handleShare}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4 mr-2" />
                    )}
                    {copied ? "COPIED" : "SHARE LINK"}
                  </Button>

                  <div className="flex items-center justify-center gap-2 px-4 rounded-xl bg-white/2 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    DHL / NATIONAL
                  </div>
                </div>
              </div>

              {/* Minimal Info */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="details"
                  className="border border-white/5 bg-white/2 rounded-xl px-5"
                >
                  <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest py-4 hover:no-underline opacity-60 hover:opacity-100">
                    Product Specifications
                  </AccordionTrigger>
                  <AccordionContent className="text-white/40 text-xs leading-relaxed pb-4">
                    <ul className="space-y-2 list-disc pl-4">
                      <li>Premium Cameroon Streetwear collection.</li>
                      <li>High durability tailored finish.</li>
                      {product.tags.length > 0 && (
                        <li className="list-none pt-1 flex flex-wrap gap-1.5">
                          {product.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] border border-white/10 rounded-full px-2 py-0.5"
                            >
                              #{t}
                            </span>
                          ))}
                        </li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>

        {/* Similar Section - Discrete */}
        {similar.length > 0 && (
          <div className="w-full max-w-5xl mt-32 border-t border-white/5 pt-16">
            <div className="flex items-end justify-between mb-8 px-4 lg:px-0">
              <div>
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">
                  Collection
                </span>
                <h2 className="text-3xl font-black tracking-tighter text-white mt-1">
                  MORE TO EXPLORE
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-white/20 hover:text-white transition-colors border-b border-white/10 pb-0.5"
              >
                FULL SHOP
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 lg:px-0">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
