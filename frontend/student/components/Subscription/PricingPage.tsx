import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { PLANS } from '../../services/subscriptionService';
import { PaymentModal } from './PaymentModal';
import { useAuth } from '@context/AuthContext';

export const PricingPage: React.FC = () => {
    const { user } = useAuth();
    const [showPayment, setShowPayment] = useState(false);

    // Assuming user profile has subscription_tier (we'll need to update the AuthContext or fetch it)
    // For now, we'll assume 'free' if not present
    const currentTier = (user as any)?.subscription_tier || 'free';

    return (
        <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-4">
                        Mission <span className="text-[#00FF88]">Clearance</span>
                    </h1>
                    <p className="text-[#00B37A] text-lg">Select your operational tier to unlock advanced capabilities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Recruit</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="ml-2 text-[#00B37A]">/ month</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-400">Basic access for new operatives.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {PLANS[0].features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-[#00B37A] shrink-0" />
                                    <span className="text-sm text-[#EAEAEA]">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={true}
                            className="w-full py-3 rounded-lg border border-[#00FF88]/20 text-[#00B37A] font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
                        >
                            Current Status
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-[#0A0F0A] border border-[#00FF88] rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                        <div className="absolute top-0 right-0 bg-[#00FF88] text-black text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                            Recommended
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                Operative <Star className="h-5 w-5 text-[#00FF88] fill-[#00FF88]" />
                            </h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-black text-white">$29</span>
                                <span className="ml-2 text-[#00B37A]">/ month</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-400">Full access for serious professionals.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {PLANS[1].features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-[#00FF88] shrink-0" />
                                    <span className="text-sm text-white font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setShowPayment(true)}
                            disabled={currentTier === 'pro'}
                            className="w-full bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-3 rounded-lg uppercase tracking-wide transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentTier === 'pro' ? 'Active Clearance' : 'Upgrade Clearance'}
                        </button>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                onSuccess={() => {
                    // Ideally trigger a refresh of user profile here
                    window.location.reload(); // Simple reload to fetch new profile state
                }}
            />
        </div>
    );
};
