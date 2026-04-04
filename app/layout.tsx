import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { MouseGlow } from "@/components/ui/mouse-glow";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.frechnel-shopping.com"),
  title: {
    default: "FRECHNEL SHOPPING | Streetwear Yaoundé",
    template: "%s | FRECHNEL SHOPPING",
  },
  description:
    "La référence du streetwear à Yaoundé. Découvrez nos collections exclusives de vêtements et accessoires. Livraison rapide partout au Cameroun.",
  keywords: [
    "streetwear",
    "yaoundé",
    "cameroun",
    "mode urbaine",
    "frechnel",
    "vêtements",
    "shopping",
  ],
  authors: [{ name: "Frechnel Shopping" }],
  creator: "Frechnel Shopping",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.frechnel-shopping.com",
    title: "FRECHNEL SHOPPING | Streetwear Yaoundé",
    description:
      "La référence du streetwear à Yaoundé. Style, Qualité, Exclusivité.",
    siteName: "FRECHNEL SHOPPING",
    images: [
      {
        url: "/assets/frechel-hero.jpg",
        width: 1200,
        height: 630,
        alt: "FRECHNEL SHOPPING - Streetwear à Yaoundé",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FRECHNEL SHOPPING | Streetwear Yaoundé",
    description:
      "La référence du streetwear à Yaoundé. Style, Qualité, Exclusivité.",
    images: ["/assets/frechel-hero.jpg"],
  },
  verification: {
    other: {
      "msvalidate.01": "61F73B06ED20604822C716FBC306873E",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground`}
      >
        <MouseGlow />
        <main className="flex-1 relative z-10 flex flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
