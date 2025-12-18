"use client";

import { motion } from "framer-motion";

export function DeliveryBanner() {
    return (
        <div className="bg-primary text-primary-foreground py-1 overflow-hidden relative z-50">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: "linear",
                    }}
                    className="flex gap-8 text-xs font-bold uppercase tracking-widest"
                >
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="flex items-center gap-8">
                            <span>Livraison rapide sur Yaoundé 🇨🇲</span>
                            <span>•</span>
                            <span>Expédition DHL partout au Cameroun 📦</span>
                            <span>•</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
