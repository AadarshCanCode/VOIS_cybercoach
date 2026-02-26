"use client";

import { animate } from "framer-motion";
import { useEffect, useRef } from "react";

export const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;

        const controls = animate(0, value, {
            duration: 2,
            ease: "easeOut",
            onUpdate(val) {
                if (node) {
                    node.textContent = `${prefix}${Math.round(val)}${suffix}`;
                }
            },
        });

        return () => controls.stop();
    }, [value, prefix, suffix]);

    return <span ref={nodeRef}>{prefix}0{suffix}</span>;
};
