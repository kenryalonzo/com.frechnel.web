import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DeliveryBanner } from "@/components/layout/DeliveryBanner";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DeliveryBanner />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
