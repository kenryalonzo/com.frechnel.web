"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <span
            className="text-[160px] md:text-[240px] font-black leading-none tracking-tighter select-none"
            style={{
              WebkitTextStroke: "1px rgba(239,68,68,0.3)",
              color: "transparent",
              textShadow: "0 0 80px rgba(239,68,68,0.15)",
            }}
          >
            404
          </span>
          {/* Glitch line */}
          <motion.div
            className="absolute inset-x-0 h-px bg-primary/60"
            style={{ top: "55%" }}
            animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          className="space-y-3 -mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Erreur &mdash; Page introuvable
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Cette page a{" "}
            <span
              className="text-primary"
              style={{ textShadow: "0 0 20px rgba(239,68,68,0.5)" }}
            >
              disparu
            </span>
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-base">
            Le lien est cassé ou la page n&apos;existe plus. Retournez faire du
            shopping.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/">
            <Button
              size="lg"
              className="gap-2 rounded-full px-7 bg-primary hover:bg-primary/90 text-white font-bold"
              style={{ boxShadow: "0 0 24px rgba(239,68,68,0.4)" }}
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full px-7 border-white/20 text-white hover:bg-white/10 font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              Catalogue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
