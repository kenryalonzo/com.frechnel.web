"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

// Update interface to match DB schema
interface Product {
    id: string;
    name: string;
    description?: string | null;
    imageUrl: string;
    priceOriginal: number;
    pricePromo?: number | null;
    isPromo: boolean;
    category: { name: string };
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const discount = product.pricePromo
        ? Math.round(((product.priceOriginal - product.pricePromo) / product.priceOriginal) * 100)
        : 0;

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative bg-card rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors duration-300"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {product.isPromo && discount > 0 && (
                    <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground font-bold">
                        -{discount}%
                    </Badge>
                )}
                <Link href={`/product/${product.id}`}>
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button className="rounded-full bg-white text-black hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
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
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center gap-2">
                    {product.isPromo && product.pricePromo ? (
                        <>
                            <span className="font-bold text-xl text-primary">
                                {product.pricePromo.toLocaleString()} FCFA
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                                {product.priceOriginal.toLocaleString()} FCFA
                            </span>
                        </>
                    ) : (
                        <span className="font-bold text-xl">
                            {product.priceOriginal.toLocaleString()} FCFA
                        </span>
                    )}
                </div>

                <Button
                    className="w-full mt-4 gap-2 bg-white/5 hover:bg-primary hover:text-white border border-white/10"
                    variant="outline"
                    asChild
                >
                    <a
                        href={`https://wa.me/237658508725?text=${encodeURIComponent(`Bonjour, je suis intéressé par ${product.name} à ${product.pricePromo || product.priceOriginal} FCFA.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Acheter sur WhatsApp
                    </a>
                </Button>
            </div>
        </motion.div>
    );
}
