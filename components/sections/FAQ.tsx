"use client";

import { Section } from "@/components/ui/section";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
    {
        question: "Comment se passe la livraison ?",
        answer: "À Yaoundé, nous livrons en main propre avec paiement à la livraison. Pour les autres villes (Douala, Bafoussam, etc.), nous expédions via les agences de voyage ou DHL après paiement.",
    },
    {
        question: "Puis-je essayer avant d'acheter ?",
        answer: "Oui, si vous êtes à Yaoundé, le livreur peut patienter pendant que vous essayez l'article.",
    },
    {
        question: "Comment commander ?",
        answer: "C'est simple ! Cliquez sur le bouton 'Acheter sur WhatsApp' d'un article. Vous serez redirigé vers notre numéro officiel avec les détails du produit pré-remplis.",
    },
    {
        question: "Avez-vous une boutique physique ?",
        answer: "Oui, nous sommes basés à Yaoundé. Contactez-nous sur WhatsApp pour obtenir la localisation exacte.",
    },
];

export function FAQ() {
    return (
        <Section className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-white">
                    QUESTIONS <span className="text-primary">FRÉQUENTES</span>
                </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                        <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors text-left">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </Section>
    );
}
