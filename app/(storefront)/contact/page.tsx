"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                toast.success('Merci ! Tu vas recevoir nos exclusivités 🔥');
                setEmail("");
            } else {
                const error = await res.json();
                toast.error(error.error || 'Une erreur est survenue');
            }
        } catch (error) {
            toast.error('Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary/20 to-black border border-primary/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-4">
                Rejoins le <span className="text-primary">Club Freshnel</span>
            </h2>
            <p className="text-muted-foreground mb-8">
                Reçois les drops exclusifs et les codes promo avant tout le monde. Pas de spam, que du style.
            </p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ton email..."
                    required
                    disabled={loading}
                    className="flex-1 bg-black/50 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                    {loading ? "Envoi..." : "M'inscrire"}
                </Button>
            </form>
        </div>
    );
}

const CONTACT_METHODS = [
    {
        icon: MessageCircle,
        title: "WhatsApp",
        description: "Service Client Rapide",
        action: "Chatter maintenant",
        href: "https://wa.me/237658508725",
        color: "text-[#25D366]",
        borderColor: "hover:border-[#25D366]/50",
        shadow: "hover:shadow-[0_0_20px_rgba(37,211,102,0.2)]",
    },
    {
        icon: Mail,
        title: "Email",
        description: "arielnoudem@gmail.com",
        action: "Envoyer un mail",
        href: "mailto:arielnoudem@gmail.com",
        color: "text-blue-400",
        borderColor: "hover:border-blue-400/50",
        shadow: "hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]",
    },
    {
        icon: Phone,
        title: "Téléphone",
        description: "658508725",
        action: "Appeler",
        href: "tel:+237658508725",
        color: "text-white",
        borderColor: "hover:border-white/50",
        shadow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
    },
];

const PARTNERS = ["DOFGERMANY Store", "NASHMOOD"];

const FAQ_ITEMS = [
    {
        question: "Quels sont les délais pour le Grand Nord ?",
        answer: "Pour le Grand Nord (Garoua, Maroua, Ngaoundéré), comptez 3 à 4 jours ouvrables via nos partenaires logistiques.",
    },
    {
        question: "Puis-je essayer en boutique ?",
        answer: "Absolument ! Notre showroom à Yaoundé est ouvert pour les essayages. Contactez-nous sur WhatsApp pour l'adresse exacte.",
    },
    {
        question: "Comment payer ?",
        answer: "Paiement à la livraison (Cash/Orange Money/MTN Money) pour Yaoundé. Paiement avant expédition pour les autres villes.",
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-20 pb-20">
            {/* Header */}
            <Section className="container px-4 md:px-6 text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white">
                    RESTONS <span className="text-primary">CONNECTÉS</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Une question sur votre style ou une livraison à Bafoussam ? On est là.
                </p>
            </Section>

            {/* Contact Cards */}
            <Section className="container px-4 md:px-6 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CONTACT_METHODS.map((method, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`bg-black/40 backdrop-blur-md border-white/10 transition-all duration-300 ${method.borderColor} ${method.shadow}`}>
                                <CardContent className="flex flex-col items-center p-8 text-center">
                                    <div className={`p-4 rounded-full bg-white/5 mb-6 ${method.color}`}>
                                        <method.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                                    <p className="text-muted-foreground mb-6">{method.description}</p>
                                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/10" asChild>
                                        <a href={method.href} target="_blank" rel="noopener noreferrer">
                                            {method.action}
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Partners */}
            <Section className="bg-white/5 border-y border-white/10 py-16 mb-24">
                <div className="container px-4 md:px-6 text-center">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-muted-foreground mb-12 uppercase">
                        Official Partners
                    </h2>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
                        {/* Dof Logo */}
                        <motion.div
                            whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{
                                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                            }}
                            className="relative"
                        >
                            <Image
                                src="/assets/partners/Dof.png"
                                alt="DOFGERMANY Store"
                                width={150}
                                height={80}
                                className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </motion.div>

                        {/* NASHMOOD Text */}
                        <motion.div
                            whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{
                                scale: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 },
                            }}
                            className="text-2xl md:text-4xl font-black text-white/80 tracking-tighter cursor-default"
                        >
                            NASHMOOD
                        </motion.div>
                    </div>
                </div>
            </Section>

            {/* VIP Club & FAQ */}
            <Section className="container px-4 md:px-6 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* FAQ */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                            <span className="text-primary">FAQ</span> Rapide
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            {FAQ_ITEMS.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                                    <AccordionTrigger className="text-lg hover:text-primary transition-colors text-left">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* VIP Form */}
                    <NewsletterForm />
                </div>
            </Section>

            {/* Map */}
            <Section className="w-full h-[400px] relative grayscale invert-[.9] contrast-[1.2]">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127357.54605234678!2d11.45383665806499!3d3.830606687903827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf7a309a7977%3A0x7f54bad35e693c51!2sYaound%C3%A9!5e0!3m2!1sfr!2scm!4v1700000000000!5m2!1sfr!2scm"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent" />
            </Section>
        </div>
    );
}
