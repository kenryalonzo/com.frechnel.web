"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./button";

export function FloatingWA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    // Show after 2 seconds
    const timer = setTimeout(() => setIsVisible(true), 2000);
    
    // Auto-show tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => setIsTooltipOpen(true), 5000);
    
    // Hide tooltip after 10 seconds
    const hideTooltipTimer = setTimeout(() => setIsTooltipOpen(false), 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipTimer);
      clearTimeout(hideTooltipTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
          {/* Tooltip / Message */}
          <AnimatePresence>
            {isTooltipOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="pointer-events-auto bg-black/90 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl max-w-[240px] relative"
              >
                <button 
                  onClick={() => setIsTooltipOpen(false)}
                  className="absolute -top-2 -right-2 bg-white/10 hover:bg-primary text-white rounded-full p-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-xs text-white leading-relaxed">
                  Salut ! Une question sur une taille ou un article ? 
                  <span className="font-bold text-primary block mt-1">Écris-nous sur WhatsApp 👋</span>
                </p>
                {/* Arrow */}
                <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-black border-r border-b border-white/10 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto"
          >
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-[0_0_30px_rgba(37,211,102,0.3)] group relative overflow-hidden"
              asChild
            >
              <a
                href="https://wa.me/237658508725"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-8 w-8 relative z-10 group-hover:rotate-12 transition-transform" />
                
                {/* Ping animation effect */}
                <span className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
                
                {/* Glow ring */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full scale-110" />
              </a>
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
