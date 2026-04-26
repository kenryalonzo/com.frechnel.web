"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Erreur");
      
      setSuccess(true);
      toast.success("Bienvenue dans la famille Freshnel !");
      setEmail("");
    } catch {
      toast.error("Impossible de s'inscrire pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="container px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 p-8 md:p-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
                REJOINS LE <span className="text-primary">MOVEMENT</span>.
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Inscris-toi pour recevoir les drops exclusifs, les promos flash 
                et le meilleur du streetwear camerounais directement.
              </p>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {success ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">C'est fait !</h3>
                  <p className="text-muted-foreground">Vérifie tes mails pour une petite surprise.</p>
                  <Button 
                    variant="link" 
                    className="text-primary mt-2"
                    onClick={() => setSuccess(false)}
                  >
                    Réinitialiser
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="Ton email ..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 md:h-20 bg-black/40 border-white/10 rounded-2xl px-6 text-lg focus:border-primary transition-all pr-16"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors">
                      <Send className="h-6 w-6" />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 md:h-16 bg-primary text-white hover:bg-primary/90 text-lg font-black rounded-2xl shadow-xl shadow-red-500/10 group overflow-hidden relative"
                    disabled={loading}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "S'INSCRIRE MAINTENANT"
                      )}
                    </span>
                    {/* Hover light effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-40">
                    Nous respectons ta vie privée. Pas de spam, promis.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
