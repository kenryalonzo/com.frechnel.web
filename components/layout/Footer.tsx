"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Instagram, Facebook, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TikTokIcon = () => (
  <svg
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("Inscription réussie !");
      setEmail("");
    } catch {
      toast.error("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full border-t border-white/8 bg-[#090909] pt-16 pb-8 text-white/50">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assets/logo.png"
                alt="Frechnel Shopping"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-black tracking-tighter text-white">
                  FRECHNEL<span className="text-red-600"> SHOPPING</span><span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Le meilleur du streetwear à Yaoundé.
              <br />
              Qualité premium, style urbain, livraison partout au Cameroun.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-white/60 transition-all duration-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-white/60 transition-all duration-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-white/60 transition-all duration-200"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://wa.me/237658508725"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-[#25D366] hover:text-white text-white/60 transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em]">
              Boutique
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/shop?isNew=true"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?isBestSeller=true"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?isPromo=true"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Promos
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Tout le catalogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em]">
              Aide
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Nous contacter
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/237658508725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Livraison & Retours
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-primary hover:pl-1 transition-all duration-200"
                >
                  Guide des tailles
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em]">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Yaoundé, Cameroun</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="https://wa.me/237658508725"
                  className="hover:text-primary transition-colors"
                >
                  +237 658 508 725
                </a>
              </li>
            </ul>

            {/* Newsletter mini */}
            <div className="mt-4">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">
                Newsletter
              </p>
              <form className="flex gap-2" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors glow-red text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "OK"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30 border-t border-white/8 pt-8">
          <p>© {currentYear} Frechnel Shopping. Tous droits réservés.</p>
          <p>Made with ❤️ à Yaoundé 🇨🇲</p>
        </div>
      </div>
    </footer>
  );
}
