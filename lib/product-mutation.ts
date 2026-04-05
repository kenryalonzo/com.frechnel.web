import { NextRequest } from "next/server";
import { ProductVariant } from "@/lib/types";

export type VariantMutationInput = Partial<ProductVariant> & { id?: string };

export type ParsedProductMutation = {
  name: string;
  description: string;
  priceOriginal: number;
  pricePromo: number | null;
  isPromo: boolean;
  categoryId: string;
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  gender: string;
  tags: string[];
  /** Fichier image principal (multipart uniquement) */
  imageFile: File | null;
  /** URL image principale (JSON ou multipart) */
  imageUrl: string | null;
  /**
   * null = ne pas synchroniser les variantes (PUT FormData sans champ)
   * tableau = remplacer / fusionner selon la logique de sync
   */
  variants: VariantMutationInput[] | null;
};

function normalizeTagsFromUnknown(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

/**
 * Parse le corps d'une création / mise à jour produit (JSON admin ou FormData).
 */
export async function parseProductMutationBody(
  request: NextRequest,
  mode: "create" | "update",
): Promise<ParsedProductMutation> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;

    const variantsUnknown = body.variants;
    let variants: VariantMutationInput[] | null;
    if (mode === "create") {
      variants = Array.isArray(variantsUnknown)
        ? (variantsUnknown as VariantMutationInput[])
        : [];
    } else {
      variants =
        "variants" in body
          ? Array.isArray(variantsUnknown)
            ? (variantsUnknown as VariantMutationInput[])
            : []
          : null;
    }

    const pricePromoRaw = body.pricePromo;
    const pricePromo =
      pricePromoRaw !== null &&
      pricePromoRaw !== undefined &&
      pricePromoRaw !== ""
        ? Number(pricePromoRaw)
        : null;

    return {
      name: String(body.name ?? ""),
      description: body.description != null ? String(body.description) : "",
      priceOriginal: Number(body.priceOriginal),
      pricePromo: Number.isFinite(pricePromo as number) ? pricePromo : null,
      isPromo: Boolean(body.isPromo),
      categoryId: String(body.categoryId ?? ""),
      isNew: Boolean(body.isNew),
      isBestSeller: Boolean(body.isBestSeller),
      inStock: body.inStock !== false && body.inStock !== "false",
      gender: body.gender != null ? String(body.gender) : "UNISEX",
      tags: normalizeTagsFromUnknown(body.tags),
      imageFile: null,
      imageUrl:
        body.imageUrl != null && body.imageUrl !== ""
          ? String(body.imageUrl)
          : null,
      variants,
    };
  }

  const formData = await request.formData();
  const tagsRaw = formData.get("tags") as string | null;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const variantsRaw = formData.get("variants") as string | null;
  let variants: VariantMutationInput[] | null;
  if (mode === "create") {
    variants = variantsRaw ? JSON.parse(variantsRaw) : [];
  } else {
    variants = variantsRaw ? JSON.parse(variantsRaw) : null;
  }

  const imageField = formData.get("image");
  const imageFile =
    imageField instanceof File && imageField.size > 0 ? imageField : null;

  const pricePromoForm = formData.get("pricePromo");
  const pricePromo = pricePromoForm
    ? parseFloat(pricePromoForm as string)
    : null;

  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || "",
    priceOriginal: parseFloat(formData.get("priceOriginal") as string),
    pricePromo: Number.isFinite(pricePromo) ? pricePromo : null,
    isPromo: formData.get("isPromo") === "true",
    categoryId: formData.get("categoryId") as string,
    isNew: formData.get("isNew") === "true",
    isBestSeller: formData.get("isBestSeller") === "true",
    inStock: formData.get("inStock") !== "false",
    gender: (formData.get("gender") as string) || "UNISEX",
    tags,
    imageFile,
    imageUrl: (formData.get("imageUrl") as string) || null,
    variants,
  };
}
