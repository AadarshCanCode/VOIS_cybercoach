import React, { useState } from 'react';
import { Search, Shield, CheckCircle, AlertTriangle, Building, Globe, Award, ExternalLink, ArrowLeft, Database, Clock } from 'lucide-react';
import { verificationService, CompanyData } from '../../services/verificationService';

import { useNavigate } from 'react-router-dom';

export const CompanyVerification: React.FC = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<CompanyData | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResult(null);

        try {
            const data = await verificationService.verifyCompany(searchQuery);
            if (data) {
                setSearchResult(data);
            } else {
                // Fallback for demo if not found in DB, or show "Not Found" state
                // For now, we'll just show nothing if not found in our registry
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" /> Verified Entity
                    </span>
                );
            case 'warning':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" /> High Risk
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" /> Unverified
                    </span>
                );
        }
    };

    return (
        <div className="p-6 min-h-screen bg-black animate-fade-in text-[#EAEAEA]">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-[#00B37A] hover:text-white transition-colors font-mono uppercase tracking-wider text-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </button>
                </div>

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#00FF88]/5 border border-[#00FF88]/20 mb-4 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                        <Shield className="h-12 w-12 text-[#00FF88]" />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Company <span className="text-[#00FF88]">Verification</span>
                    </h1>
                    <p className="text-[#00B37A] max-w-lg mx-auto font-mono text-sm">
                        AUTHENTICATE CORPORATE ENTITIES AGAINST GLOBAL REGISTRIES
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent pointer-events-none" />
                    <form onSubmit={handleSearch} className="relative z-10">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00B37A]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ENTER DOMAIN OR ENTITY NAME..."
                            className="w-full bg-black border border-[#00FF88]/20 rounded-xl pl-12 pr-32 py-4 text-white placeholder-[#00B37A]/50 focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_20px_rgba(0,255,136,0.1)] font-mono transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-[#00FF88] text-black rounded-lg font-bold hover:bg-[#00CC66] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,136,0.3)] uppercase tracking-wide"
                        >
                            {isSearching ? 'SCANNING...' : 'VERIFY'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {searchResult ? (
                    <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />

                        <div className="p-8 border-b border-[#00FF88]/10 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{searchResult.name}</h2>
                                        {getStatusBadge(searchResult.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[#00B37A] font-mono text-sm">
                                        <Globe className="h-4 w-4" />
                                        <a href={`https://${searchResult.domain}`} target="_blank" rel="noreferrer" className="hover:text-[#00FF88] transition-colors flex items-center gap-1 underline decoration-[#00B37A]/30 underline-offset-4">
                                            {searchResult.domain}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center bg-black p-4 rounded-xl border border-[#00FF88]/20 min-w-[120px] shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                                    <div className="text-[10px] text-[#00B37A] mb-1 uppercase tracking-wider">Trust Score</div>
                                    <div className={`text-4xl font-black font-mono ${getScoreColor(searchResult.trust_score)}`}>
                                        {searchResult.trust_score}
                                    </div>
                                </div>
                            </div>

                            {/* Verdict Banner */}
                            {searchResult.verdict && (
                                <div className={`mt-6 p-4 rounded-xl border ${searchResult.verdict === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                    searchResult.verdict === 'dANGER' ? 'bg-red-500/10 border-red-500/20' :
                                        'bg-amber-500/10 border-amber-500/20'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {searchResult.verdict === 'SAFE' ? <CheckCircle className="h-6 w-6 text-emerald-400" /> :
                                            searchResult.verdict === 'dANGER' ? <AlertTriangle className="h-6 w-6 text-red-400" /> :
                                                <AlertTriangle className="h-6 w-6 text-amber-400" />}
                                        <div>
                                            <h3 className={`font-bold uppercase tracking-wide mb-1 ${searchResult.verdict === 'SAFE' ? 'text-emerald-400' :
                                                searchResult.verdict === 'dANGER' ? 'text-red-400' : 'text-amber-400'
                                                }`}>
                                                Verdict: {searchResult.verdict}
                                            </h3>
                                            <p className="text-sm text-[#EAEAEA]/90 font-mono">
                                                {searchResult.explanation}
                                            </p>
                                            {searchResult.recommendation && (
                                                <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-80">
                                                    Recommendation: {searchResult.recommendation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Entity Details
                                    </h3>
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex items-center gap-3 text-[#EAEAEA]">
                                            <span className="text-[#00B37A]">ESTABLISHED:</span>
                                            <span>{searchResult.founded_year}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[#EAEAEA]">
                                            <span className="text-[#00B37A]">HQ LOCATION:</span>
                                            <span>{searchResult.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-3">Analysis Profile</h3>
                                    <p className="text-[#EAEAEA]/80 leading-relaxed text-sm mb-4">
                                        {searchResult.description}
                                    </p>

                                    {/* Signals */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                                            <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Red Flags</div>
                                            {searchResult.red_flags && searchResult.red_flags.length > 0 ? (
                                                <ul className="list-disc list-inside text-xs text-red-300 font-mono">
                                                    {searchResult.red_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                                                </ul>
                                            ) : <span className="text-xs text-zinc-500 italic">None detected</span>}
                                        </div>
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                                            <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-2">Green Flags</div>
                                            {searchResult.green_flags && searchResult.green_flags.length > 0 ? (
                                                <ul className="list-disc list-inside text-xs text-emerald-300 font-mono">
                                                    {searchResult.green_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                                                </ul>
                                            ) : <span className="text-xs text-zinc-500 italic">None detected</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Certifications & Signals
                                </h3>
                                {searchResult.certifications && searchResult.certifications.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {searchResult.certifications.map((cert, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-[#00FF88]/5 border border-[#00FF88]/20 px-3 py-2 rounded-lg text-[#EAEAEA]">
                                                <CheckCircle className="h-3 w-3 text-[#00FF88]" />
                                                <span className="text-xs font-mono font-bold">{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-zinc-500 italic bg-zinc-500/5 p-3 rounded-lg border border-zinc-500/10 text-sm mb-6">
                                        <AlertTriangle className="h-4 w-4" />
                                        No specific certification signals
                                    </div>
                                )}

                                <div className="p-4 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Database className="h-5 w-5 text-[#00FF88] mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-[#00FF88] text-sm mb-1 uppercase tracking-wide">Verified Source</h4>
                                            <p className="text-xs text-[#00B37A] font-mono mb-2">
                                                {searchResult.verification_source}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-[#00B37A]/70 uppercase tracking-wider border-t border-[#00FF88]/10 pt-2">
                                                <Clock className="h-3 w-3" />
                                                LAST VERIFIED: {new Date(searchResult.last_verified_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reputation Sentiment */}
                                    {searchResult.sentiment && (
                                        <div className="border-t border-[#00FF88]/10 pt-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-[#00B37A] uppercase tracking-wider">Online Reputation</span>
                                                <span className={`text-xs font-bold uppercase ${searchResult.sentiment === 'positive' ? 'text-emerald-400' :
                                                    searchResult.sentiment === 'negative' ? 'text-red-400' : 'text-amber-400'
                                                    }`}>{searchResult.sentiment}</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-mono">
                                                Found {searchResult.scam_hits} potential scam reports/reviews.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
                        <div className="text-[#00FF88]/20 mb-4">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest">Entity Not Found</h3>
                        <p className="text-[#00B37A] font-mono text-sm">
                            No verified record found for "{searchQuery}" in the global registry.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};