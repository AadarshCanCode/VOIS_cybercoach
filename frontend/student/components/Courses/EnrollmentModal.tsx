import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useAuth } from '@context/AuthContext';

interface EnrollmentModalProps {
    courseId: string;
    courseTitle: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ courseId, courseTitle, onSuccess, onClose }) => {
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiBase}/api/teacher/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentEmail: user?.email,
                    courseId,
                    accessCode: code
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Enrollment failed');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <Lock className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Enrollment Required</h2>
                    <p className="text-slate-400 text-sm">
                        Enter the access code provided by your instructor to join <br />
                        <span className="text-white font-bold">{courseTitle}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-white font-mono tracking-widest text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-sm"
                            placeholder="e.g. NET-101"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Unlock Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};
