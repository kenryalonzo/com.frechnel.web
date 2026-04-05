"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Package,
  FolderTree,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/types";
import { getAdminAuthHeaders } from "@/lib/admin-api";

export default function CategoriesPage() {
  // API returns the hierarchical tree (categories map to children natively via Prisma include)
  const [categories, setCategories] = useState<Category[]>([]);

  // Flat list of categories for dropdown selection (exclude recursive children for simplicity)
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
    imageUrl: "",
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractFlat = (cats: Category[]): Category[] => {
    let flat: Category[] = [];
    for (const c of cats) {
      flat.push(c);
      if (c.children && c.children.length > 0) {
        flat = flat.concat(extractFlat(c.children));
      }
    }
    return flat;
  };

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        setFlatCategories(extractFlat(data));
      } else {
        console.warn("Categories API did not return an array:", data);
        setCategories([]);
        setFlatCategories([]);
      }
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingCategory(null);
    setFormData({ name: "", parentId: "", imageUrl: "", sortOrder: 0 });
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId || "",
      imageUrl: category.imageUrl || "",
      sortOrder: category.sortOrder || 0,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: string, productsCount: number) {
    if (productsCount > 0) {
      toast.error(`Impossible : ${productsCount} produit(s) lié(s)`);
      return;
    }
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur réseau");
      }

      toast.success("Catégorie supprimée");
      fetchCategories();
    } catch (error: unknown) {
      const e = error as Error;
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const payload: Record<string, string | number> = {
        name: formData.name,
        sortOrder: parseInt(formData.sortOrder.toString() || "0"),
      };
      if (formData.parentId) payload.parentId = formData.parentId;
      if (formData.imageUrl) payload.imageUrl = formData.imageUrl;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur");

      toast.success(
        editingCategory ? "Catégorie modifiée ✨" : "Catégorie ajoutée 🚀",
      );
      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  }

  // Recursive component to render tree
  const CategoryTreeItem = ({
    category,
    level = 0,
  }: {
    category: Category;
    level?: number;
  }) => (
    <Card className="bg-white/5 border-white/10 p-4 relative overflow-hidden">
      {level > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30" />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {category.imageUrl ? (
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white/10 shrink-0">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-md bg-white/5 flex flex-col items-center justify-center text-white/30 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              {category.name}
              {level > 0 && (
                <span className="text-[10px] uppercase font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
                  Sous-catégorie
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground flex gap-3">
              <span>/{category.slug}</span>
              <span>Ordre: {category.sortOrder}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
            <Package className="h-3 w-3 text-primary" />
            <span className="text-sm text-primary font-semibold">
              {category._count?.products || 0} produits
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(category)}
              className="h-8"
            >
              <Pencil className="h-3 w-3 mr-2" /> Modifier
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-red-500/30 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() =>
                openDeleteDialog(category.id, category._count?.products || 0)
              }
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recursively render children */}
      {category.children && category.children.length > 0 && (
        <div className="mt-4 pl-6 space-y-3 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-white/10">
          {category.children.map((child) => (
            <div
              key={child.id}
              className="relative before:absolute before:-left-6 before:top-1/2 before:w-6 before:h-px before:bg-white/10"
            >
              <CategoryTreeItem category={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );

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
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FolderTree className="h-8 w-8 text-primary" />
            Catégories & Arborescence
          </h1>
          <p className="text-muted-foreground mt-1">
            Organisez votre catalogue ({flatCategories.length} catégories et
            sous-catégories)
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="gap-2 bg-primary text-white hover:bg-primary/90 font-bold"
        >
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryTreeItem key={category.id} category={category} />
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-black border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? "Modifier" : "Ajouter"} une catégorie
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Une structure claire aide vos clients à trouver plus vite.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nom de la catégorie *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Ex: Sneakers"
                required
              />
            </div>

            <div>
              <Label>Catégorie Parente (Optionnel)</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue placeholder="Aucune (Catégorie principale)" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Aucune (principale)</SelectItem>
                  {flatCategories
                    .filter((c) => c.id !== editingCategory?.id) // Prevent self-parenting
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Permet de créer l&apos;arborescence du menu (ex: Vêtements {">"}{" "}
                Hoodies)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Image de couverture (Fichier local ou URL)</Label>
              <div className="flex gap-4 mt-1 flex-col sm:flex-row">
                {formData.imageUrl && (
                  <div className="relative w-16 h-16 rounded shrink-0 border border-white/10 overflow-hidden">
                    <Image
                      src={formData.imageUrl}
                      alt="preview"
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
                      toast.loading("Upload en cours...", { id: "upload" });
                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          headers: getAdminAuthHeaders(),
                          body: data,
                        });
                        if (!res.ok) throw new Error();
                        const val = await res.json();
                        setFormData({ ...formData, imageUrl: val.url });
                        toast.success("Image uploadée avec succès", {
                          id: "upload",
                        });
                      } catch {
                        toast.error("Erreur d'upload", { id: "upload" });
                      }
                    }}
                    className="bg-white/5 border-white/10"
                  />
                  <Input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                    placeholder="Ou lien de l'image (rempli automatiquement)"
                  />
                </div>
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
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                disabled={submitting}
              >
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Êtes-vous sûr ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible. La catégorie sera définitivement
              supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
