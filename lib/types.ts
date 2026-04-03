export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
  imageUrl?: string | null;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stock: number;
  priceAdjust: number;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  priceOriginal: number;
  pricePromo: number | null;
  isPromo: boolean;
  categoryId: string;
  category: Category;
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  gender: "MEN" | "WOMEN" | "UNISEX";
  tags: string[];
  variants?: ProductVariant[];
}

export interface ShopFilters {
  categoryId?: string;
  gender?: "MEN" | "WOMEN" | "UNISEX";
  isPromo?: boolean;
  inStock?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  tags?: string;
  q?: string;
  sortBy?: string;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}
