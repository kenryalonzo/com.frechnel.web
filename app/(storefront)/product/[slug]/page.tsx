import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductClient from "./ProductClient";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { name: true, description: true, imageUrl: true, slug: true },
  });

  if (!product) {
    return { title: "Produit Introuvable | Frechnel Shopping" };
  }

  const productUrl = `https://frechnel-shopping.com/product/${product.slug}`;

  return {
    title: `${product.name} | Frechnel Shopping`,
    description:
      product.description?.slice(0, 160) ||
      `Découvrez ${product.name} chez Frechnel Shopping.`,
    openGraph: {
      title: `${product.name} — Frechnel Shopping`,
      description: product.description || undefined,
      images: [{ url: product.imageUrl, alt: product.name }],
      url: productUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Frechnel Shopping`,
      description: product.description || undefined,
      images: [product.imageUrl],
    },
    alternates: { canonical: productUrl },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Validate product exists server-side for SEO/404
  const exists = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { id: true },
  });

  if (!exists) notFound();

  return <ProductClient slug={slug} />;
}
