import React, { useState } from 'react';
import { X, User, Mail, Building, GraduationCap, School } from 'lucide-react';
import { courseService } from '@services/courseService';

interface VURegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
}

export const VURegistrationModal: React.FC<VURegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        vu_email: '',
        faculty_name: '',
        year: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Basic validation
            if (!formData.vu_email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            await courseService.registerVUStudent(formData);
            localStorage.setItem('vu_student_email', formData.vu_email);
            onSuccess(formData.vu_email);
            onClose();
        } catch (err: any) {
            console.error('Registration failed:', err);
            // specific check if user already exists, just treat as success for the UI flow but warn
            if (err.message?.includes('already registered')) {
                localStorage.setItem('vu_student_email', formData.vu_email);
                onSuccess(formData.vu_email);
                onClose();
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)]">

                {/* Header */}
                <div className="p-6 border-b border-[#00FF88]/10 flex justify-between items-center bg-[#00FF88]/5">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <School className="h-5 w-5 text-[#00FF88]" />
                            VU Student Registration
                        </h2>
                        <p className="text-[#00B37A] text-xs mt-1">One-time registration required for VU courses</p>
                    </div>
                    <button onClick={onClose} className="text-[#EAEAEA]/50 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-[#00B37A] mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/50" />
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full bg-black/50 border border-[#00FF88]/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00FF88] transition-colors placeholder-white/20"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#00B37A] mb-1.5 uppercase tracking-wider">VU Mail ID</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/50" />
                            <input
                                type="email"
                                name="vu_email"
                                required
                                className="w-full bg-black/50 border border-[#00FF88]/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00FF88] transition-colors placeholder-white/20"
                                placeholder="firstName.lastName@vishwakarma.edu.in"
                                value={formData.vu_email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#00B37A] mb-1.5 uppercase tracking-wider">Faculty Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/50" />
                            <input
                                type="text"
                                name="faculty_name"
                                required
                                className="w-full bg-black/50 border border-[#00FF88]/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00FF88] transition-colors placeholder-white/20"
                                placeholder="e.g. Prof. X"
                                value={formData.faculty_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#00B37A] mb-1.5 uppercase tracking-wider">Year</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/50" />
                                <select
                                    name="year"
                                    required
                                    className="w-full bg-black/50 border border-[#00FF88]/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00FF88] transition-colors appearance-none"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select Year</option>
                                    <option value="FY">First Year</option>
                                    <option value="SY">Second Year</option>
                                    <option value="TY">Third Year</option>
                                    <option value="BTech">Final Year (B.Tech)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#00B37A] mb-1.5 uppercase tracking-wider">Department</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/50" />
                                <select
                                    name="department"
                                    required
                                    className="w-full bg-black/50 border border-[#00FF88]/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00FF88] transition-colors appearance-none"
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select Dept</option>
                                    <option value="CS">Comp Sci (CS)</option>
                                    <option value="IT">IT</option>
                                    <option value="AI_DS">AI & DS</option>
                                    <option value="ENTC">E & TC</option>
                                    <option value="MECH">Mechanical</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00FF88] text-black font-bold py-3 rounded-lg hover:bg-[#00CC66] transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};
