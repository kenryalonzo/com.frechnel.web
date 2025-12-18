import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-t from-white/10 to-white/50 tracking-tighter select-none">
                404
            </h1>
            <div className="space-y-6 relative -mt-12 z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white glow-text">
                    PAGE <span className="text-primary">INTROUVABLE</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Oups ! La page que vous cherchez semble avoir disparu dans le néant.
                </p>
                <Link href="/">
                    <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                        Retour à l'accueil
                    </Button>
                </Link>
            </div>
        </div>
    );
}
