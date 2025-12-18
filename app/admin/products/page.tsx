"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
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

interface Product {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    priceOriginal: number;
    pricePromo?: number;
    isPromo: boolean;
    category: { id: string; name: string };
    isNew: boolean;
    isBestSeller: boolean;
    inStock: boolean;
}

interface Category {
    id: string;
    name: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        priceOriginal: 0,
        pricePromo: 0,
        isPromo: false,
        categoryId: "",
        imageUrl: "",
        isNew: false,
        isBestSeller: false,
        inStock: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    async function fetchProducts() {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            // L'API retourne maintenant { data: Product[], meta: ... }
            if (data.data) {
                setProducts(data.data);
            } else if (Array.isArray(data)) {
                // Fallback au cas où l'API changerait
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des produits");
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des catégories");
        }
    }

    function openAddDialog() {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            priceOriginal: 0,
            pricePromo: 0,
            isPromo: false,
            categoryId: categories[0]?.id || "",
            imageUrl: "",
            isNew: false,
            isBestSeller: false,
            inStock: true,
        });
        setImageFile(null);
        setDialogOpen(true);
    }

    function openEditDialog(product: Product) {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            priceOriginal: product.priceOriginal,
            pricePromo: product.pricePromo || 0,
            isPromo: product.isPromo,
            categoryId: product.category.id,
            imageUrl: product.imageUrl,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            inStock: product.inStock,
        });
        setImageFile(null);
        setDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem("admin_token");
            const formDataToSend = new FormData();

            formDataToSend.append("name", formData.name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("priceOriginal", formData.priceOriginal.toString());
            if (formData.isPromo && formData.pricePromo) {
                formDataToSend.append("pricePromo", formData.pricePromo.toString());
            }
            formDataToSend.append("isPromo", formData.isPromo.toString());
            formDataToSend.append("categoryId", formData.categoryId);
            formDataToSend.append("isNew", formData.isNew.toString());
            formDataToSend.append("isBestSeller", formData.isBestSeller.toString());
            formDataToSend.append("inStock", formData.inStock.toString());

            if (imageFile) {
                formDataToSend.append("image", imageFile);
            } else if (formData.imageUrl) {
                formDataToSend.append("imageUrl", formData.imageUrl);
            }

            const url = editingProduct
                ? `/api/products/${editingProduct.id}`
                : "/api/products";
            const method = editingProduct ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formDataToSend,
            });

            if (!res.ok) throw new Error("Erreur");

            toast.success(
                editingProduct ? "Produit modifié ✨" : "Produit ajouté 🚀"
            );
            setDialogOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer ce produit ?")) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Erreur");

            toast.success("Produit supprimé");
            fetchProducts();
        } catch (error) {
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
                    <h1 className="text-3xl font-black text-white">Produits</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez votre catalogue ({products.length} produits)
                    </p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        className="bg-white/5 border-white/10 p-4 space-y-4"
                    >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-white">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {product.category.name}
                            </p>

                            <div className="flex items-center gap-2">
                                {product.isPromo && product.pricePromo ? (
                                    <>
                                        <span className="text-lg font-bold text-primary">
                                            {product.pricePromo.toLocaleString()} FCFA
                                        </span>
                                        <span className="text-sm text-muted-foreground line-through">
                                            {product.priceOriginal.toLocaleString()} FCFA
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-white">
                                        {product.priceOriginal.toLocaleString()} FCFA
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {product.isNew && (
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                        Nouveau
                                    </span>
                                )}
                                {product.isBestSeller && (
                                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                        Best
                                    </span>
                                )}
                                {!product.inStock && (
                                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                        Rupture
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openEditDialog(product)}
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(product.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-black border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingProduct ? "Modifier" : "Ajouter"} un produit
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingProduct
                                ? "Modifiez les informations du produit ci-dessous."
                                : "Remplissez le formulaire pour créer un nouveau produit."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nom *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="bg-white/5 border-white/10"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Catégorie *</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, categoryId: value })
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Prix original (FCFA) *</Label>
                                <Input
                                    type="number"
                                    value={formData.priceOriginal || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            priceOriginal: e.target.value === "" ? 0 : parseFloat(e.target.value),
                                        })
                                    }
                                    className="bg-white/5 border-white/10"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Prix promo (FCFA)</Label>
                                <Input
                                    type="number"
                                    value={formData.pricePromo || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pricePromo: e.target.value === "" ? 0 : parseFloat(e.target.value),
                                        })
                                    }
                                    className="bg-white/5 border-white/10"
                                    disabled={!formData.isPromo}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.isPromo}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isPromo: checked })
                                }
                            />
                            <Label>En promotion</Label>
                        </div>

                        <div className="space-y-4">
                            <Label>Image du produit</Label>

                            <div className="flex gap-4 items-start">
                                <div className="relative h-32 w-32 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                    {(imageFile || formData.imageUrl) ? (
                                        <Image
                                            src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs text-center p-2">
                                            Aucune image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">Upload depuis l'appareil</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="bg-white/5 border-white/10 cursor-pointer file:cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:text-sm file:font-semibold hover:file:bg-primary/20 transition-colors"
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-black px-2 text-muted-foreground">Ou via URL</span>
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) =>
                                                setFormData({ ...formData, imageUrl: e.target.value })
                                            }
                                            placeholder="https://exemple.com/image.jpg"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isNew}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, isNew: checked })
                                    }
                                />
                                <Label>Nouveau</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isBestSeller}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, isBestSeller: checked })
                                    }
                                />
                                <Label>Best seller</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.inStock}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, inStock: checked })
                                    }
                                />
                                <Label>En stock</Label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1" disabled={submitting}>
                                {submitting ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
