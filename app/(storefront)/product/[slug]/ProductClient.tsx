"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductCard } from "@/components/shared/ProductCard";
import {
  MessageCircle,
  Share2,
  Truck,
  ShieldCheck,
  ChevronRight,
  Check,
} from "lucide-react";
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
    <div className="min-h-screen pt-20 pb-20">
      <Section className="container px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-20">
          {/* Left: Image */}
          <div>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square md:aspect-4/5 rounded-2xl overflow-hidden bg-muted border border-white/10"
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.isPromo && (
                <Badge className="absolute top-4 left-4 bg-primary text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                  -{discount}%
                </Badge>
              )}
              {product.isNew && (
                <Badge className="absolute top-4 right-4 bg-white text-black font-bold">
                  NOUVEAU
                </Badge>
              )}
            </motion.div>

            {/* Variant image thumbnails */}
            {product.variants.filter((v) => v.imageUrl).length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                <button
                  onClick={() => setActiveImage(product.imageUrl)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === product.imageUrl ? "border-primary" : "border-white/10"}`}
                >
                  <Image
                    src={product.imageUrl}
                    alt="Principal"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
                {product.variants
                  .filter((v) => v.imageUrl)
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === v.imageUrl ? "border-primary" : "border-white/10"}`}
                    >
                      <Image
                        src={v.imageUrl!}
                        alt={v.color || ""}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-6">
            {/* Category + Badges */}
            <div className="flex items-center gap-3">
              <Link
                href={`/shop?categoryId=${product.category.id}`}
                className="text-sm text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors flex items-center gap-1"
              >
                {product.category.name} <ChevronRight className="h-3 w-3" />
              </Link>
              {product.gender !== "UNISEX" && (
                <Badge
                  variant="outline"
                  className="border-white/20 text-white/50 text-xs"
                >
                  {product.gender === "MEN" ? "Homme" : "Femme"}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span
                className={`text-3xl font-black ${product.isPromo ? "text-primary" : "text-white"}`}
              >
                {finalPrice.toLocaleString()} FCFA
              </span>
              {product.isPromo && product.pricePromo && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {product.priceOriginal.toLocaleString()} FCFA
                  </span>
                  <Badge
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock indicator */}
            {selectedVariant && (
              <div
                className={`text-sm font-medium flex items-center gap-2 ${variantStock > 5 ? "text-emerald-400" : variantStock > 0 ? "text-yellow-400" : "text-red-400"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${variantStock > 5 ? "bg-emerald-400" : variantStock > 0 ? "bg-yellow-400" : "bg-red-400"}`}
                />
                {variantStock > 5
                  ? "En stock"
                  : variantStock > 0
                    ? `Plus que ${variantStock} restant${variantStock > 1 ? "s" : ""}`
                    : "Rupture de stock"}
              </div>
            )}

            {/* Variant selectors */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                  Couleur :{" "}
                  {selectedVariant?.color && (
                    <span className="text-white normal-case font-normal">
                      {selectedVariant.color}
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  {colors.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      title={v.color!}
                      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${selectedVariant?.colorHex === v.colorHex ? "border-primary scale-110 shadow-lg" : "border-white/20"}`}
                      style={{ backgroundColor: v.colorHex! }}
                    />
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                  Taille
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const variant = product.variants.find(
                      (v) =>
                        v.size === size &&
                        (!selectedVariant?.colorHex ||
                          v.colorHex === selectedVariant.colorHex),
                    );
                    const outOfStock = variant?.stock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() =>
                          variant && !outOfStock && setSelectedVariant(variant)
                        }
                        disabled={outOfStock}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                          selectedVariant?.size === size
                            ? "bg-primary border-primary text-white"
                            : outOfStock
                              ? "border-white/5 text-white/20 line-through cursor-not-allowed"
                              : "border-white/15 text-white/80 hover:border-primary hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/shop?tag=${tag}`}
                    className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-white/50 hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-base py-6 rounded-xl transition-all duration-300"
                style={{ boxShadow: "0 0 20px rgba(37,211,102,0.4)" }}
                asChild
              >
                <a
                  href={`https://wa.me/237658508725?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Commander sur WhatsApp
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/15 bg-white/5 hover:bg-white/10 text-white py-5"
                onClick={handleShare}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                {copied ? "Lien copié !" : "Partager ce produit"}
              </Button>
            </div>

            {/* Delivery Accordion */}
            <Accordion
              type="single"
              collapsible
              className="w-full border rounded-xl border-white/10 bg-white/5 px-4"
            >
              <AccordionItem value="delivery" className="border-b-white/10">
                <AccordionTrigger className="hover:text-primary hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-primary" />
                    <span className="text-sm">Livraison & Expédition</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm space-y-2">
                  <p>
                    <strong className="text-white">Yaoundé :</strong> Livraison
                    en 24h. Paiement à la livraison possible.
                  </p>
                  <p>
                    <strong className="text-white">Autres villes :</strong>{" "}
                    Expédition via agences de voyage ou DHL sous 48h après
                    paiement.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="guarantee" className="border-none">
                <AccordionTrigger className="hover:text-primary hover:no-underline">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm">Garantie Qualité</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Tous nos articles sont vérifiés avant expédition. Satisfait ou
                  remboursé sous 3 jours en cas de défaut.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-8">
              Vous aimerez <span className="text-primary">aussi</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
