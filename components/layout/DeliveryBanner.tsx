"use client";

const MESSAGES = [
  "🇨🇲 Livraison rapide à Yaoundé en 24h",
  "📦 Expédition DHL partout au Cameroun",
  "✅ Paiement à la livraison disponible",
  "🔥 Nouveaux articles chaque semaine",
  "💯 Qualité vérifiée avant expédition",
];

export function DeliveryBanner() {
  // Duplicate for seamless infinite scroll
  const allMessages = [...MESSAGES, ...MESSAGES];

  return (
    <div className="bg-primary text-primary-foreground py-1.5 overflow-hidden relative z-50">
      <div className="flex">
        <div
          className="flex gap-12 whitespace-nowrap text-xs font-bold uppercase tracking-widest"
          style={{
            animation: "ticker 30s linear infinite",
          }}
        >
          {allMessages.map((msg, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>{msg}</span>
              <span className="opacity-50">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
