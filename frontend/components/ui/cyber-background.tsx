"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const CyberBackground = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute inset-0 -z-10 h-full w-full overflow-hidden bg-[#0A0F0A] pointer-events-none", className)}>
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF8805_1px,transparent_1px),linear-gradient(to_bottom,#00FF8805_1px,transparent_1px)] bg-size-[3rem_3rem]" />

            {/* Radial Gradient Mask for fading out edges */}
            <div className="absolute inset-0 bg-[#0A0F0A] mask-[radial-gradient(ellipse_80%_80%_at_50%_20%,transparent_20%,#000_100%)]" />

            {/* Animated Glowing Orbs */}
            <motion.div
                animate={{
                    x: ["0%", "20%", "-20%", "0%"],
                    y: ["0%", "-20%", "20%", "0%"],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00FF88]/10 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    x: ["0%", "-30%", "30%", "0%"],
                    y: ["0%", "30%", "-30%", "0%"],
                    scale: [1, 0.8, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00FF88]/5 rounded-full blur-[150px]"
            />

            {/* Horizontal Scanning Line */}
            <motion.div
                animate={{
                    top: ["-10%", "110%"],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute left-0 right-0 w-full h-px bg-linear-to-r from-transparent via-[#00FF88]/20 to-transparent blur-[1px]"
            />
        </div>
    );
};
