import { cn } from '@/lib/utils';
import React, { CSSProperties } from 'react';

const dottedBackgroundStyle: CSSProperties = {
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
};

const LightMorphWrapper = (
    {
        children,
        gardient1 = 'bg-[#10B981]',
        gradient2 = 'bg-[#00FF88]',
        containerClass,
        inerContainerClass,
        blurOnGradients = 'blur-[45px]',
        switchGrad = false
    }: {
        children: React.ReactNode,
        gardient1?: string,
        gradient2?: string,
        containerClass?: string,
        inerContainerClass?: string,
        blurOnGradients?: string,
        switchGrad?: boolean
    }) => {
    return (
        <div className={cn("border border-white/10 h-max w-max p-[1.5px] rounded-[2rem] bg-linear-to-b from-white/15 to-transparent", containerClass)}>
            <div
                style={dottedBackgroundStyle}
                className={cn("border border-white/5 rounded-[1.7rem] overflow-hidden relative flex items-center justify-center group min-w-max", inerContainerClass)}
            >
                <div className={cn("absolute w-full h-full z-10 pointer-events-none ", switchGrad && 'rotate-90')}>
                    <div className={cn("opacity-50 z-10 w-[65%] h-[65%] rounded-full -bottom-[20%] absolute -left-[20%] group-hover:opacity-80 transition-opacity duration-700 ease-in-out animate-pulse", gardient1, blurOnGradients)}></div>

                    <div className={cn("opacity-50 z-10 w-[65%] h-[65%] rounded-full -top-[20%] absolute -right-[20%] group-hover:opacity-80 transition-opacity duration-700 ease-in-out animate-pulse", gradient2, blurOnGradients)}></div>
                </div>
                <div className="relative z-20 px-4 py-2">
                    {children}
                </div>
                <Noise />
            </div>
        </div>
    );
};

export default LightMorphWrapper;

const Noise = () => {
    return (
        <svg
            className="pointer-events-none absolute isolate z-50 opacity-[0.03] size-full inset-0"
            width="100%"
            height="100%"
        >
            <filter id="noise">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="0.8"
                    stitchTiles="stitch"
                ></feTurbulence>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)"></rect>
        </svg>
    );
};
