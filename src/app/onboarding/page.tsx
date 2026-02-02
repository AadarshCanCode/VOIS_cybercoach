"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { supabase } from '@lib/supabase';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function OnboardingPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email_type: 'personal' as 'vu' | 'personal',
        contact_email: '',
        faculty: '',
        department: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                contact_email: user.email || '',
                // If they partially filled it before, pre-fill here
                phone_number: user.phone_number || '',
                faculty: user.faculty || '',
                department: user.department || '',
                email_type: user.email_type || 'personal',
            }));

            // If already completed, redirect to dashboard
            if (user.onboarding_completed) {
                router.replace('/dashboard');
            }
        }
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const validate = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.phone_number.trim()) return "Phone number is required";
        if (!formData.faculty.trim()) return "Faculty is required";
        if (!formData.department.trim()) return "Department is required";

        if (formData.email_type === 'vu') {
            if (!formData.contact_email.endsWith('vupune.ac.in')) {
                return "VU Mail must end with @vupune.ac.in";
            }
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        try {
            if (!user) throw new Error("No user found");

            const updates = {
                full_name: formData.name,
                phone_number: formData.phone_number,
                faculty: formData.faculty,
                department: formData.department,
                contact_email: formData.contact_email,
                email_type: formData.email_type,
                onboarding_completed: true,
            };

            const { data, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Verify persistence
            if (!data || !data.onboarding_completed) {
                console.error("Update verification failed:", data);
                throw new Error("Database refused update. Please check RLS policies or internet connection.");
            }

            updateUser({
                name: formData.name,
                phone_number: formData.phone_number,
                faculty: formData.faculty,
                department: formData.department,
                contact_email: formData.contact_email,
                email_type: formData.email_type,
                onboarding_completed: true
            });

            // Redirect to dashboard after success
            router.push('/dashboard');

        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError(err.message || "Failed to save details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0F1115] text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-4">
            {/* Logo / Header */}
            <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-500/10 p-4 rounded-full w-fit mx-auto mb-4 border border-emerald-500/20">
                    <Shield className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    One Last Step
                </h1>
                <p className="text-gray-400 mt-2">
                    Complete your profile to access all CyberCoach features
                </p>
            </div>

            <div className="w-full max-w-xl bg-[#1A1D24]/50 border border-white/5 rounded-2xl shadow-xl backdrop-blur-sm p-6 md:p-10 animate-in fade-in zoom-in duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                Full Name
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                Phone Number
                            </label>
                            <input
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        {/* Email Logic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                    Email Type
                                </label>
                                <div className="relative">
                                    <select
                                        name="email_type"
                                        value={formData.email_type}
                                        onChange={handleChange}
                                        className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="personal">Personal Mail</option>
                                        <option value="vu">VU Mail</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                    Email Address
                                </label>
                                <input
                                    name="contact_email"
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder={formData.email_type === 'vu' ? "student@vupune.ac.in" : "student@gmail.com"}
                                />
                            </div>
                        </div>

                        {/* Faculty & Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                    Faculty
                                </label>
                                <input
                                    name="faculty"
                                    value={formData.faculty}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                    Department
                                </label>
                                <input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F1115] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="Computer Science"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] text-lg tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Securing Profile...
                                </span>
                            ) : (
                                "Complete Registration"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <p className="text-gray-600 text-xs mt-8">
                &copy; {new Date().getFullYear()} CyberCoach. All operations secured.
            </p>
        </div>
    );
}
