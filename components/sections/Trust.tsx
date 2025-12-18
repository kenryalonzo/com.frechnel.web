"use client";

import { Section } from "@/components/ui/section";
import { Truck, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const TIMELINE_STEPS = [
    {
        icon: MessageCircle,
        step: "01",
        title: "Commande WhatsApp",
        description: "Discutez avec un humain. Choix du produit, taille, et mode de livraison.",
    },
    {
        icon: MapPin,
        step: "02",
        title: "Confirmation & Paiement",
        description: "À Yaoundé : paiement à la livraison. Autres villes : Mobile Money ou virement.",
    },
    {
        icon: Truck,
        step: "03",
        title: "Livraison Express",
        description: "24h pour Yaoundé. Sous 48h vers Douala, Bafoussam et tout le Cameroun.",
    },
];

export function Trust() {
    return (
        <Section className="bg-gradient-to-b from-black via-white/5 to-black border-y border-white/10 py-20">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-white">
                        COMMENT ÇA <span className="text-primary">MARCHE ?</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Du clic au colis, en toute simplicité. Voici votre parcours client.
                    </p>
                </div>

                {/* Timeline Horizontale */}
                <div className="relative">
                    {/* Ligne de connexion */}
                    <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {TIMELINE_STEPS.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                {/* Numéro de l'étape */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="relative z-10 mb-6"
                                >
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transition-all duration-300">
                                        <item.icon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shadow-lg">
                                        {item.step}
                                    </div>
                                </motion.div>

                                {/* Contenu */}
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                                    {item.description}
                                </p>

                                {/* Flèche de transition (sauf dernier élément) */}
                                {index < TIMELINE_STEPS.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.2 + 0.3 }}
                                        className="hidden md:block absolute top-12 -right-6 text-primary/30"
                                    >
                                        <svg className="w-12 h-6" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 10H40M40 10L30 2M40 10L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <a
                        href="https://wa.me/237658508725?text=Salut%20Frechnel%20%F0%9F%91%8B%2C%20je%20voudrais%20passer%20une%20commande%20!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Démarrer ma commande
                    </a>
                </motion.div>
            </div>
        </Section>
    );
}
