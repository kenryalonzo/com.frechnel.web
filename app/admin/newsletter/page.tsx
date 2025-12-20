"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function fetchSubscribers() {
        try {
            const res = await fetch("/api/newsletter");
            const data = await res.json();
            setSubscribers(data);
        } catch (error) {
            toast.error("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    function exportCSV() {
        const csv = Papa.unparse(
            subscribers.map((sub) => ({
                Email: sub.email,
                "Date d'inscription": new Date(sub.subscribedAt).toLocaleDateString("fr-FR"),
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `newsletter-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();

        toast.success("Export CSV téléchargé 📥");
    }

    function exportPDF() {
        const doc = new jsPDF();

        // Titre
        doc.setFontSize(20);
        doc.text("Liste Newsletter", 14, 20);

        doc.setFontSize(10);
        doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);
        doc.text(`Total: ${subscribers.length} abonnés`, 14, 34);

        // Tableau
        autoTable(doc, {
            startY: 40,
            head: [["#", "Email", "Date d'inscription"]],
            body: subscribers.map((sub, index) => [
                (index + 1).toString(),
                sub.email,
                new Date(sub.subscribedAt).toLocaleDateString("fr-FR"),
            ]),
            theme: "grid",
            headStyles: { fillColor: [239, 68, 68] }, // Rouge (primary)
            styles: { fontSize: 9 },
        });

        doc.save(`newsletter-${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("Export PDF téléchargé 📑");
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Newsletter</h1>
                    <p className="text-muted-foreground mt-1">
                        {subscribers.length} abonné(s) à votre newsletter
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={exportCSV} variant="outline" className="gap-2 flex-1 md:flex-none">
                        <Download className="h-4 w-4" />
                        CSV
                    </Button>
                    <Button onClick={exportPDF} className="gap-2 flex-1 md:flex-none">
                        <FileText className="h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <Card className="bg-white/5 border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    #
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Email
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Date d'inscription
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-muted-foreground">
                                        <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        Aucun abonné pour le moment
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((subscriber, index) => (
                                    <tr key={subscriber.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 text-sm text-white">{index + 1}</td>
                                        <td className="p-4 text-sm text-white">{subscriber.email}</td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(subscriber.subscribedAt).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
