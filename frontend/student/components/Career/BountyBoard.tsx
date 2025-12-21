import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, DollarSign, Shield, ExternalLink, Search } from 'lucide-react';
import { careerService, JobListing } from '../../services/careerService';

export const BountyBoard: React.FC = () => {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [applying, setApplying] = useState<string | null>(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await careerService.getJobListings();
            setJobs(data);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId: string) => {
        setApplying(jobId);
        await careerService.applyForJob(jobId);
        setApplying(null);
        alert('Application transmitted securely. Good luck, Operator.');
    };

    const filteredJobs = jobs.filter(job => {
        const matchesType = filterType === 'all' || job.type === filterType;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="p-6 space-y-8 min-h-screen animate-fade-in text-[#EAEAEA]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                        Mission <span className="text-[#00FF88]">Board</span>
                    </h1>
                    <p className="text-[#00B37A] font-mono text-sm mt-1">AVAILABLE CONTRACTS & BOUNTIES</p>
                </div>
                <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-[#00FF88]" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00B37A]" />
                    <input
                        type="text"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0F0A] border border-[#00FF88]/20 rounded-lg pl-10 pr-4 py-2 text-[#EAEAEA] focus:outline-none focus:border-[#00FF88]/50 placeholder-[#00B37A]/50"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'Full-time', 'Contract', 'Bounty'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider border transition-all ${filterType === type
                                ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                                : 'bg-[#0A0F0A] border-[#00FF88]/10 text-[#00B37A] hover:border-[#00FF88]/30'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 animate-pulse" />
                    ))
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="group relative bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 hover:border-[#00FF88]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] flex flex-col"
                        >
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${job.type === 'Bounty'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20'
                                    }`}>
                                    {job.type}
                                </span>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-[#00FF88] transition-colors line-clamp-1">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[#00B37A] text-sm font-mono mt-1">
                                    <Shield className="h-3 w-3" />
                                    {job.company}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-[#EAEAEA]">
                                    <MapPin className="h-4 w-4 text-[#00B37A]" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#EAEAEA]">
                                    <DollarSign className="h-4 w-4 text-[#00B37A]" />
                                    {job.salary_range}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {job.requirements.slice(0, 3).map((req, i) => (
                                        <span key={i} className="px-2 py-1 rounded bg-[#00FF88]/5 border border-[#00FF88]/10 text-[10px] text-[#00B37A] font-mono">
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleApply(job.id)}
                                disabled={applying === job.id}
                                className="w-full bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {applying === job.id ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        TRANSMITTING...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="h-4 w-4" />
                                        ACCEPT MISSION
                                    </>
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-[#00B37A]">
                        <p>No active missions found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
