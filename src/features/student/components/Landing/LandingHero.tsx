import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useRouter } from 'next/navigation';
import FoundersTooltip from './FoundersTooltip';

export const LandingHero: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleGetStarted = () => {
        if (user) {
            router.push('/dashboard');
            return;
        }
        router.push('/login');
    };

    return (
        <section className="relative pt-32 pb-32 px-6 flex items-center overflow-visible">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 w-full space-y-10">

                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        Master Computer Science <br />
                        <span className="text-[#00FF88]">
                            With Hands-on Labs
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        The complete platform to learn, practice, and retrieve your dream job in cybersecurity. No fluff, just skills.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-8">
                    <button
                        onClick={handleGetStarted}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    >
                        <span>{user ? 'Access Dashboard' : 'Start Learning Free'}</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <FoundersTooltip />
                        <span className="text-zinc-500 text-sm tracking-wide">
                            Makers of this beautiful platform
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
