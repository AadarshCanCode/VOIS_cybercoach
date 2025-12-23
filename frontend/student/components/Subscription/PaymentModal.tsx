import React, { useState } from 'react';
import { X, CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '@context/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [error, setError] = useState<string | null>(null);

    // Mock form state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            if (!user?.id) throw new Error('User not authenticated');
            const result = await subscriptionService.upgradeToPro(user.id);

            if (result.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setError(result.error || 'Payment failed');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[#00FF88]/10">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#00FF88]" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide">Secure Checkout</h2>
                    </div>
                    <button onClick={onClose} className="text-[#00B37A] hover:text-[#00FF88]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-lg p-4 flex items-center gap-3">
                            <div className="p-2 bg-[#00FF88]/10 rounded-full">
                                <Lock className="h-4 w-4 text-[#00FF88]" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Operative Tier (Pro)</div>
                                <div className="text-xs text-[#00B37A]">$29.00 / month</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-[#00B37A] mb-1">CARD NUMBER</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00B37A]" />
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-[#000000] border border-[#00FF88]/20 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00FF88] font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-[#00B37A] mb-1">EXPIRY</label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="MM/YY"
                                        className="w-full bg-[#000000] border border-[#00FF88]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FF88] font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-[#00B37A] mb-1">CVC</label>
                                    <input
                                        type="text"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        placeholder="123"
                                        className="w-full bg-[#000000] border border-[#00FF88]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FF88] font-mono"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-3 rounded-lg uppercase tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Upgrade'
                            )}
                        </button>

                        <div className="text-center text-[10px] text-[#00B37A]/50 font-mono">
                            ENCRYPTED TRANSMISSION // 256-BIT SSL
                        </div>
                    </form>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-[#00FF88]/10 rounded-full flex items-center justify-center mb-6 border border-[#00FF88]/20">
                            <CheckCircle className="h-8 w-8 text-[#00FF88]" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase mb-2">Access Granted</h3>
                        <p className="text-[#00B37A]">Welcome to the elite, Operative.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
