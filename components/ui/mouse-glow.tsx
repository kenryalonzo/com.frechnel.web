"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function MouseGlow() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - 250); // Center the 500px glow
            mouseY.set(e.clientY - 250);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            style={{ background: "transparent" }}
        >
            <motion.div
                className="absolute h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
                style={{
                    x,
                    y,
                    background: "radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)",
                }}
            />
        </motion.div>
    );
}
