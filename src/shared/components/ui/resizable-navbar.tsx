"use client";
import { cn } from "@lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";


interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface NavItemsProps {
    items: {
        name: string;
        link: string;
        onClick?: () => void;
    }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const [visible, setVisible] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <motion.div
            ref={ref}
            className={cn("sticky inset-x-0 top-0 z-50 w-full font-[system-ui]", className)}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(
                        child as React.ReactElement<{ visible?: boolean }>,
                        { visible },
                    )
                    : child,
            )}
        </motion.div>
    );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(16px)" : "blur(0px)",
                backgroundColor: visible ? "rgba(0, 0, 0, 0.85)" : "transparent",
                borderColor: visible ? "rgba(0, 255, 136, 0.2)" : "transparent",
                width: visible ? "90%" : "100%",
                y: visible ? 12 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
            }}
            className={cn(
                "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between rounded-2xl border px-6 py-3 lg:flex",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex pointer-events-none",
                className,
            )}
        >
            {items.map((item, idx) => (
                <button
                    onMouseEnter={() => setHovered(idx)}
                    onClick={() => {
                        item.onClick?.();
                        onItemClick?.();
                    }}
                    className="relative px-4 py-2 text-[#EAEAEA]/70 hover:text-[#00FF88] transition-colors cursor-pointer pointer-events-auto"
                    key={`link-${idx}`}
                >
                    {hovered === idx && (
                        <motion.div
                            layoutId="hovered"
                            className="absolute inset-0 h-full w-full rounded-lg bg-[#00FF88]/10"
                        />
                    )}
                    <span className="relative z-20 text-xs font-bold uppercase tracking-[0.15em]">{item.name}</span>
                </button>
            ))}
        </motion.div>
    );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(16px)" : "blur(0px)",
                backgroundColor: visible ? "rgba(0, 0, 0, 0.9)" : "transparent",
                width: visible ? "95%" : "100%",
                borderRadius: visible ? "16px" : "0px",
                y: visible ? 12 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
            }}
            className={cn(
                "relative z-50 mx-auto flex w-full flex-col items-center justify-between border border-transparent px-4 py-3 lg:hidden",
                visible && "border-[#00FF88]/20",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({
    children,
    className,
}: MobileNavHeaderProps) => {
    return (
        <div
            className={cn(
                "flex w-full flex-row items-center justify-between",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const MobileNavMenu = ({
    children,
    className,
    isOpen,
    onClose: _onClose,
}: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                        "absolute inset-x-0 top-full z-50 mt-2 flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-black/95 backdrop-blur-xl border border-[#00FF88]/20 px-6 py-8 shadow-[0_0_30px_rgba(0,255,136,0.1)]",
                        className,
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({
    isOpen,
    onClick,
}: {
    isOpen: boolean;
    onClick: () => void;
}) => {
    return isOpen ? (
        <IconX className="h-6 w-6 text-[#00FF88] cursor-pointer" onClick={onClick} />
    ) : (
        <IconMenu2 className="h-6 w-6 text-[#00FF88] cursor-pointer" onClick={onClick} />
    );
};

export const NavbarLogo = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="relative z-20 flex items-center gap-3 cursor-pointer group"
        >
            <div className="relative">
                <div className="absolute -inset-2 bg-[#00FF88]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <img
                    src="/cybercoach-logo.png"
                    alt="Cybercoach"
                    className="relative h-10 w-10 group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <span className="font-black text-white text-lg tracking-tight uppercase hidden sm:block">
                Cyber<span className="text-[#00FF88]">coach</span>
            </span>
        </button>
    );
};

export const NavbarButton = ({
    href,
    children,
    className,
    variant = "primary",
    onClick,
}: {
    href?: string;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "outline";
    onClick?: () => void;
}) => {
    const baseStyles =
        "px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200";

    const variantStyles = {
        primary:
            "bg-[#00FF88] text-black hover:bg-[#00CC66] hover:scale-105 shadow-[0_0_20px_rgba(0,255,136,0.3)]",
        secondary: "bg-transparent text-[#EAEAEA] hover:text-[#00FF88]",
        outline: "bg-transparent border border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10 hover:border-[#00FF88]",
    };

    if (href) {
        return (
            <a
                href={href}
                className={cn(baseStyles, variantStyles[variant], className)}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(baseStyles, variantStyles[variant], className)}
        >
            {children}
        </button>
    );
};
