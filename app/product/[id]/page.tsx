import { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/shared/ProductCard";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageCircle, Truck, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    // Simplification: en production, idéalement on utilise un cache ou on requête juste les champs nécessaires
    const product = await prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, imageUrl: true }
    });

    if (!product) {
        return {
            title: 'Produit Introuvable | Frechnel Shopping',
        };
    }

    return {
        title: `${product.name} | Frechnel Shopping`,
        description: product.description?.slice(0, 160) || `Découvrez ${product.name} chez Frechnel Shopping.`,
        openGraph: {
            title: `${product.name} - Frechnel Shopping`,
            description: product.description || undefined,
            images: [product.imageUrl],
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });

    if (!product) {
        notFound();
    }

    // JSON-LD Structured Data for Product
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: 'Frechnel Shopping',
        },
        offers: {
            '@type': 'Offer',
            url: `https://frechnel-shopping.com/product/${product.id}`,
            priceCurrency: 'XAF',
            price: product.pricePromo || product.priceOriginal,
            availability: 'https://schema.org/InStock',
        },
    };

    const discount = product.pricePromo
        ? Math.round(((product.priceOriginal - product.pricePromo) / product.priceOriginal) * 100)
        : 0;

    const whatsappMessage = `Salut Frechnel 👋, je veux commander : ${product.name} à ${product.pricePromo || product.priceOriginal} FCFA. Livrez-vous à [Ma Ville] ?`;
    const whatsappLink = `https://wa.me/237658508725?text=${encodeURIComponent(whatsappMessage)}`;

    // Fetch similar products (same category, excluding current)
    const similarProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
        },
        include: { category: true },
        take: 4,
    });


    return (
        <div className="min-h-screen pt-20 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Section className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    {/* Left: Image Gallery */}
                    <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-white/10">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                                    {product.category.name}
                                </span>
                                {product.isPromo && (
                                    <Badge className="bg-red-500 text-white border-none animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                                        PROMO
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                {product.isPromo && product.pricePromo ? (
                                    <>
                                        <span className="text-3xl font-bold text-primary">
                                            {product.pricePromo.toLocaleString()} FCFA
                                        </span>
                                        <span className="text-xl text-muted-foreground line-through">
                                            {product.priceOriginal.toLocaleString()} FCFA
                                        </span>
                                        <Badge variant="outline" className="border-primary text-primary">
                                            -{discount}%
                                        </Badge>
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {product.priceOriginal.toLocaleString()} FCFA
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {product.description || "Un article exclusif de la collection Freshnel. Qualité premium, design urbain et confort absolu. Parfait pour affirmer votre style dans les rues de Yaoundé."}
                            </p>
                        </div>

                        {/* WhatsApp Button */}
                        <Button
                            size="lg"
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg py-8 rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300"
                            asChild
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-6 h-6 mr-2" />
                                ACHETER MAINTENANT
                            </a>
                        </Button>

                        {/* Delivery Accordion */}
                        <Accordion type="single" collapsible className="w-full border rounded-xl border-white/10 bg-white/5 px-4">
                            <AccordionItem value="delivery" className="border-b-white/10">
                                <AccordionTrigger className="hover:text-primary hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-primary" />
                                        <span>Livraison & Expédition</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p><strong className="text-white">Yaoundé :</strong> Livraison en 24h à domicile ou en point relais. Paiement à la livraison possible.</p>
                                    <p><strong className="text-white">Autres villes :</strong> Expédition via agences de voyage ou DHL sous 48h après paiement.</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="guarantee" className="border-none">
                                <AccordionTrigger className="hover:text-primary hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                        <span>Garantie Qualité</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    Tous nos articles sont vérifiés avant expédition. Satisfait ou remboursé sous 3 jours en cas de défaut.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">
                            Vous aimerez <span className="text-primary">aussi</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </Section>
        </div>
    );
}
