import React from 'react';


export const LandingFooter: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900 bg-black z-20 relative">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
                <img src="/cybercoach-logo.png" alt="Cybercoach" className="h-8 w-8" />
                <span className="text-lg font-bold tracking-tight text-white">
                    Cyber<span className="text-[#00FF88]">Coach</span>
                </span>
            </div>

            <div className="text-zinc-500 text-sm">
                &copy; {new Date().getFullYear()} CyberCoach by SparkStudio. All rights reserved.
            </div>
        </div>
    );
};
