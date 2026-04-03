"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, Category, ProductVariant } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceOriginal: 0,
    pricePromo: 0 as number | null,
    isPromo: false,
    categoryId: "",
    imageUrl: "",
    isNew: false,
    isBestSeller: false,
    inStock: true,
    gender: "UNISEX",
    tags: "",
  });

  // Variants management state inside the form
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products?limit=100"); // Load more for admin
      const data = await res.json();
      if (data.data) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      // Flatten categories for dropdown
      const flat: Category[] = [];
      const extract = (cats: Category[], prefix = "") => {
        for (const c of cats) {
          flat.push({ ...c, name: prefix + c.name });
          if (c.children?.length) extract(c.children, prefix + "— ");
        }
      };
      if (Array.isArray(data)) {
        extract(data);
      } else {
        console.warn("Categories API did not return an array:", data);
      }
      setCategories(flat);
    } catch (error) {
      console.error("Categories fetch error", error);
    }
  }

  function openAddDialog() {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      priceOriginal: 0,
      pricePromo: null,
      isPromo: false,
      categoryId: categories[0]?.id || "",
      imageUrl: "",
      isNew: false,
      isBestSeller: false,
      inStock: true,
      gender: "UNISEX",
      tags: "",
    });
    setVariants([
      {
        size: "M",
        color: "",
        colorHex: "#FFFFFF",
        stock: 10,
        priceAdjust: 0,
        imageUrl: "",
      },
    ]);
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      priceOriginal: product.priceOriginal,
      pricePromo: product.pricePromo || null,
      isPromo: product.isPromo,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      inStock: product.inStock,
      gender: product.gender,
      tags: product.tags?.join(", ") || "",
    });

    // Load variants or initialize default
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map((v) => ({ ...v })));
    } else {
      setVariants([]);
    }
    setDialogOpen(true);
  }

  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        colorHex: "#FFFFFF",
        stock: 0,
        priceAdjust: 0,
        imageUrl: "",
      },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: unknown,
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Format payload natively since API uses raw JSON (FormData unsupported by custom JSON endpoint)
      const payload = {
        ...formData,
        pricePromo:
          formData.isPromo && formData.pricePromo ? formData.pricePromo : null,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        variants: variants.map((v) => ({
          size: v.size || null,
          color: v.color || null,
          colorHex: v.colorHex || null,
          stock: parseInt(String(v.stock)) || 0,
          priceAdjust: parseFloat(String(v.priceAdjust)) || 0,
          imageUrl: v.imageUrl || null,
        })),
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de sauvegarde");
      }

      toast.success(
        editingProduct ? "Produit modifié ✨" : "Produit ajouté 🚀",
      );
      setDialogOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      const e = error as Error;
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm("Supprimer définitivement ce produit et toutes ses variantes ?")
    )
      return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur");

      toast.success("Produit supprimé");
      fetchProducts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Catalogue Produit</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos produits et variantes (stock, couleurs, tailles)
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="gap-2 bg-primary text-white font-bold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {/* Product Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => {
          const totalStock =
            product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
          return (
            <Card
              key={product.id}
              className="bg-white/5 border-white/10 p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex gap-4">
                <div className="relative w-28 h-32 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1.5 pt-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white text-base leading-tight truncate">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {product.category.name}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {product.isPromo && product.pricePromo ? (
                      <>
                        <span className="text-sm font-bold text-primary">
                          {product.pricePromo.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {product.priceOriginal.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {product.priceOriginal.toLocaleString()} F
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${product.inStock && totalStock > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {product.inStock && totalStock > 0
                        ? `${totalStock} en stock`
                        : "Rupture"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                      {product.variants?.length || 0} variations
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-full text-xs"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Editer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-8 px-0 border-red-500/30 text-red-500 shrink-0"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Giant Dialog for Product Management */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-white">
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configurez les détails principaux et gérez l&apos;inventaire par
                taille/couleur
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: BASE INFO */}
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">
                    Informations Générales
                  </h3>

                  <div>
                    <Label className="text-xs">Nom du produit *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-white/5 border-white/10 mt-1 h-9 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Image Principale *</Label>
                    <div className="flex gap-3 mt-1 flex-col sm:flex-row">
                      {formData.imageUrl && (
                        <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-white/10 relative">
                          <Image
                            src={formData.imageUrl}
                            alt="img"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            const file = e.target.files[0];
                            const data = new FormData();
                            data.append("file", file);
                            toast.loading("Upload...", { id: "uploadProd" });
                            try {
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: data,
                              });
                              if (!res.ok) throw new Error();
                              const val = await res.json();
                              setFormData({ ...formData, imageUrl: val.url });
                              toast.success("Image uploadée", {
                                id: "uploadProd",
                              });
                            } catch {
                              toast.error("Erreur", { id: "uploadProd" });
                            }
                          }}
                          className="bg-white/5 border-white/10 h-9 text-sm"
                        />
                        <Input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              imageUrl: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/10 h-9 text-sm"
                          placeholder="Ou lien URL (obligatoire si aucun upload)"
                          required={!formData.imageUrl}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Prix Original *</Label>
                      <Input
                        type="number"
                        value={formData.priceOriginal || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priceOriginal: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-white/5 border-white/10 mt-1 h-9 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        Prix Promo ({formData.isPromo ? "Actif" : "Inactif"})
                      </Label>
                      <Input
                        type="number"
                        value={formData.pricePromo || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricePromo: parseInt(e.target.value) || null,
                          })
                        }
                        className="bg-white/5 border-white/10 mt-1 h-9 text-sm"
                        disabled={!formData.isPromo}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Catégorie *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, categoryId: v })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 mt-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Genre</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gender: v })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 mt-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNISEX">Unisex</SelectItem>
                        <SelectItem value="MEN">Homme</SelectItem>
                        <SelectItem value="WOMEN">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">
                      Tags (séparés par des virgules)
                    </Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="ex: été, promo, sneakers"
                      className="bg-white/5 border-white/10 mt-1 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 mt-1 text-sm min-h-[100px]"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-y-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isPromo}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, isPromo: c })
                        }
                      />
                      <Label className="text-xs">En Promo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.inStock}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, inStock: c })
                        }
                      />
                      <Label className="text-xs">Statut Global En Stock</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isNew}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, isNew: c })
                        }
                      />
                      <Label className="text-xs">Nouveau</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isBestSeller}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, isBestSeller: c })
                        }
                      />
                      <Label className="text-xs">Best Seller</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: VARIANTS */}
              <div className="lg:col-span-8">
                <div className="bg-card border border-white/10 rounded-xl p-5 h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        Gérer les Variantes
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">
                          {variants.length}
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créez des combinaisons uniques de taille, couleur et
                        stock.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={addVariantRow}
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Ajouter variante
                    </Button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
                      <p className="text-muted-foreground text-sm">
                        Le produit n&apos;a aucune variante. <br />
                        Ajoutez-en pour gérer les tailles et couleurs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-3 px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-2">Taille</div>
                        <div className="col-span-2">Nom Couleur</div>
                        <div className="col-span-1 text-center">Hex</div>
                        <div className="col-span-2">Ajustement Prix</div>
                        <div className="col-span-2">Stock</div>
                        <div className="col-span-2">Image Spécifique (URL)</div>
                        <div className="col-span-1"></div>
                      </div>

                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/5 group relative"
                        >
                          <div className="col-span-2">
                            <Input
                              placeholder="S, M, 42..."
                              value={variant.size || ""}
                              onChange={(e) =>
                                updateVariant(index, "size", e.target.value)
                              }
                              className="h-8 text-xs bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Rouge, Noir"
                              value={variant.color || ""}
                              onChange={(e) =>
                                updateVariant(index, "color", e.target.value)
                              }
                              className="h-8 text-xs bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Input
                              type="color"
                              value={variant.colorHex || "#ffffff"}
                              onChange={(e) =>
                                updateVariant(index, "colorHex", e.target.value)
                              }
                              className="h-8 w-8 p-0 cursor-pointer border-white/10 bg-black/40 rounded overflow-hidden"
                              title="Code couleur CSS"
                            />
                          </div>
                          <div className="col-span-2 relative">
                            <Input
                              type="number"
                              value={variant.priceAdjust || 0}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "priceAdjust",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs pr-6 bg-black/40 border-white/10"
                            />
                            <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">
                              +F
                            </span>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={variant.stock || 0}
                              onChange={(e) =>
                                updateVariant(index, "stock", e.target.value)
                              }
                              className="h-8 text-xs bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="col-span-2 relative group-variant">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (!e.target.files?.[0]) return;
                                const file = e.target.files[0];
                                const data = new FormData();
                                data.append("file", file);
                                toast.loading("Upload...", {
                                  id: `uv-${index}`,
                                });
                                try {
                                  const res = await fetch("/api/upload", {
                                    method: "POST",
                                    body: data,
                                  });
                                  if (!res.ok) throw new Error();
                                  const val = await res.json();
                                  updateVariant(index, "imageUrl", val.url);
                                  toast.success("OK", { id: `uv-${index}` });
                                } catch {
                                  toast.error("Err", { id: `uv-${index}` });
                                }
                              }}
                              className="h-8 text-xs bg-black/40 border-white/10 mb-1"
                              title="Upload image variante"
                            />
                            {variant.imageUrl && (
                              <div className="absolute right-1 top-1 w-6 h-6 rounded overflow-hidden z-10">
                                <Image
                                  src={variant.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <Input
                              placeholder="Ou URL https://..."
                              value={variant.imageUrl || ""}
                              onChange={(e) =>
                                updateVariant(index, "imageUrl", e.target.value)
                              }
                              className="h-8 text-xs bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(index)}
                              className="h-8 w-8 text-red-500 hover:text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#0a0a0a] py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-white/20 text-white min-w-[120px]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white font-bold min-w-[160px] gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {editingProduct ? "Mettre à jour" : "Créer le produit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
