import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NoiseBackground } from "@/components/ui/noise-background";
import { BestSellers } from "@/components/sections/BestSellers";
import { Trust } from "@/components/sections/Trust";
import { FAQ } from "@/components/sections/FAQ";
import { Section } from "@/components/ui/section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NoiseBackground />

      {/* Hero Section */}
      <Section className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/frechel-hero.jpg"
            alt="Frechnel Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent drop-shadow-2xl">
            FRECHNEL <br />
            <span className="text-primary drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">SHOPPING</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 drop-shadow-lg">
            Le meilleur du streetwear à Yaoundé.
            <br />
            <span className="text-primary font-medium">Style. Qualité. Exclusivité.</span>
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all duration-300">
              Voir la collection
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full bg-black/40 hover:bg-black/60 border-white/20 text-white backdrop-blur-sm">
              Nous contacter
            </Button>
          </div>
        </div>
      </Section>

      <BestSellers />
      <Trust />
      <FAQ />
    </div>
  );
}
