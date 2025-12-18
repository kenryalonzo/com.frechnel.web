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
import { Loader2 } from "lucide-react";

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

export function BestSellers() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBestSellers() {
            try {
                const res = await fetch("/api/products?isBestSeller=true&limit=6");
                const data = await res.json();
                if (data.data) {
                    setProducts(data.data);
                } else if (Array.isArray(data)) {
                    // Handle case where API might return array directly (if pagination structure varies)
                    setProducts(data);
                }
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
            <div className="flex flex-col items-center mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-white">
                    BEST <span className="text-primary">SELLERS</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                    Les articles les plus convoités de Yaoundé. Ne rate pas ta chance.
                </p>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </Carousel>
        </Section>
    );
}
