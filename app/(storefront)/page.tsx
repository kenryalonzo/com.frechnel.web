import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { NoiseBackground } from "@/components/ui/noise-background";
import { BestSellers } from "@/components/sections/BestSellers";
import { Trust } from "@/components/sections/Trust";
import { FAQ } from "@/components/sections/FAQ";
import { CategoriesGrid } from "@/components/sections/CategoriesGrid";
import { NewArrivals } from "@/components/sections/NewArrivals";
import { Newsletter } from "@/components/sections/Newsletter";
import { Section } from "@/components/ui/section";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NoiseBackground />

      {/* Hero Section */}
      <Section className="relative flex flex-col items-center justify-center min-h-[88vh] text-center px-4 pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/frechel-hero.jpg"
            alt="Frechnel Hero Background"
            fill
            className="object-cover opacity-50"
            priority
          />
          {/* Multi-stop gradient for depth */}
          <div className="absolute inset-0 bg-linear-to-b from-background/60 via-background/40 to-background" />
          {/* Side vignettes */}
          <div className="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-background/80" />
        </div>

        {/* Red accent blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Nouvelle collection disponible
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">
            <span className="text-white drop-shadow-2xl">FRECHNEL</span>
            <br />
            <span
              className="text-primary"
              style={{
                textShadow:
                  "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)",
              }}
            >
              SHOPPING
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mb-10 leading-relaxed">
            Le meilleur du streetwear à Yaoundé.{" "}
            <span className="text-primary font-semibold">
              Style. Qualité. Exclusivité.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 text-base md:text-lg px-8 py-6 rounded-full w-full sm:w-auto glow-red hover:glow-red-lg transition-all duration-300 font-bold"
              asChild
            >
              <Link href="/shop">
                Voir la collection <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base md:text-lg px-8 py-6 rounded-full bg-white/5 hover:bg-white/10 border-white/20 text-white backdrop-blur-sm w-full sm:w-auto transition-all"
              asChild
            >
              <a
                href="https://wa.me/237658508725"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5 text-[#25D366]" />
                WhatsApp
              </a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-md">
            {[
              { value: "500+", label: "Articles" },
              { value: "24h", label: "Livraison Yaoundé" },
              { value: "100%", label: "Qualité vérifiée" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </Section>

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* Best Sellers */}
      <BestSellers />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Newsletter */}
      <Newsletter />

      {/* Trust + FAQ */}
      <Trust />
      <FAQ />
    </div>
  );
}
