import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

const TikTokIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black py-12 text-white/60">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/assets/logo.png"
                                alt="Frechnel Shopping"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <h3 className="text-lg font-black tracking-tighter text-white mb-4">
                                FRECHNEL<span className="text-primary">.</span>
                            </h3>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Le meilleur du streetwear à Yaoundé.
                            <br />
                            Livraison partout au Cameroun.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Boutique</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Nouveautés</Link></li>
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Promos</Link></li>
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Accessoires</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Aide</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Livraison</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Retours</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Suivez-nous</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><TikTokIcon /></Link>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-white/40 border-t border-white/10 pt-8 mt-12 w-full">
                    <p>© {new Date().getFullYear()} Frechnel Shopping. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
