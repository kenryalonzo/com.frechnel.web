"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
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

interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    function openAddDialog() {
        setEditingCategory(null);
        setFormData({ name: "" });
        setDialogOpen(true);
    }

    function openEditDialog(category: Category) {
        setEditingCategory(category);
        setFormData({ name: category.name });
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

            if (!res.ok) throw new Error("Erreur");

            toast.success("Catégorie supprimée");
            fetchCategories();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
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

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Erreur");

            toast.success(editingCategory ? "Catégorie modifiée ✨" : "Catégorie ajoutée 🚀");
            setDialogOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSubmitting(false);
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
                    <h1 className="text-3xl font-black text-white">Catégories</h1>
                    <p className="text-muted-foreground mt-1">
                        Organisez votre catalogue ({categories.length} catégories)
                    </p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une catégorie
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Card
                        key={category.id}
                        className="bg-white/5 border-white/10 p-6 space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-white text-lg">{category.name}</h3>
                                <p className="text-sm text-muted-foreground">{category.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
                                <Package className="h-3 w-3 text-primary" />
                                <span className="text-sm text-primary">
                                    {category._count?.products || 0}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openEditDialog(category)}
                            >
                                <Pencil className="h-3 w-3 mr-2" />
                                Modifier
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => openDeleteDialog(category.id, category._count?.products || 0)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-black border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingCategory ? "Modifier" : "Ajouter"} une catégorie
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingCategory
                                ? "Modifiez les informations de la catégorie ci-dessous."
                                : "Remplissez le formulaire pour créer une nouvelle catégorie."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nom de la catégorie *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                className="bg-white/5 border-white/10"
                                placeholder="Ex: Hoodies"
                                required
                            />
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-black border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Cette action est irréversible. La catégorie sera définitivement supprimée.
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
