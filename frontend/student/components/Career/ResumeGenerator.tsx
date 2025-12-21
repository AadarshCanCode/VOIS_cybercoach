import React, { useRef, useState } from 'react';
import { Download, Shield, Award, Terminal, User, Mail, MapPin, Globe } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ResumeGenerator: React.FC = () => {
    const { user } = useAuth();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        if (!resumeRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                backgroundColor: '#ffffff', // Ensure white background for the resume itself
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();

            // Calculate image dimensions to fit the page
            const ratio = canvas.width / canvas.height;
            const imgHeight = pdfWidth / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`OPERATOR_DOSSIER_${user?.name?.toUpperCase() || 'UNKNOWN'}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate dossier. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen animate-fade-in text-[#EAEAEA]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                        Operator <span className="text-[#00FF88]">Dossier</span>
                    </h1>
                    <p className="text-[#00B37A] font-mono text-sm mt-1">AUTO-GENERATED CAREER PROFILE</p>
                </div>
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>
                            <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ENCRYPTING...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            EXPORT PDF
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview Container */}
                <div className="lg:col-span-1 bg-[#2A2A2A] p-8 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <div
                        ref={resumeRef}
                        className="bg-white text-black p-8 min-h-[842px] w-full max-w-[595px] mx-auto shadow-lg relative"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        {/* Resume Header */}
                        <div className="border-b-4 border-black pb-6 mb-6 flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{user?.name || 'OPERATOR NAME'}</h1>
                                <p className="text-lg font-mono text-gray-600 tracking-widest">{user?.level || 'NOVICE'} OPERATOR</p>
                            </div>
                            <div className="text-right text-sm space-y-1">
                                <div className="flex items-center justify-end gap-2">
                                    <span>{user?.email || 'operator@cyber.net'}</span>
                                    <Mail className="h-3 w-3" />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <span>Remote / Worldwide</span>
                                    <MapPin className="h-3 w-3" />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <span>cybercoach.dev/u/{user?.id?.slice(0, 8) || 'unknown'}</span>
                                    <Globe className="h-3 w-3" />
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="col-span-1 space-y-6 border-r border-gray-200 pr-6">
                                <section>
                                    <h3 className="font-black uppercase tracking-widest border-b border-black mb-3 pb-1 flex items-center gap-2">
                                        <Shield className="h-4 w-4" /> Skills
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="font-bold">Network Security</li>
                                        <li>Penetration Testing</li>
                                        <li>Incident Response</li>
                                        <li>Cryptography</li>
                                        <li>Python / Bash</li>
                                        <li>Linux Administration</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-black uppercase tracking-widest border-b border-black mb-3 pb-1 flex items-center gap-2">
                                        <Award className="h-4 w-4" /> Certs
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="font-bold">OWASP Top 10</li>
                                        <li className="text-xs text-gray-500">Issued: 2024</li>
                                        <li className="font-bold mt-2">Network Defense</li>
                                        <li className="text-xs text-gray-500">Issued: 2024</li>
                                    </ul>
                                </section>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-2 space-y-6">
                                <section>
                                    <h3 className="font-black uppercase tracking-widest border-b border-black mb-3 pb-1 flex items-center gap-2">
                                        <Terminal className="h-4 w-4" /> Mission History
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-lg">Cyber Coach Platform</h4>
                                            <p className="text-sm font-mono text-gray-600 mb-1">Top 10% Operator</p>
                                            <p className="text-sm text-gray-700">
                                                Completed advanced security simulations including SQL Injection defense, XSS mitigation, and network traffic analysis. Maintained a high accuracy rating in tactical assessments.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-black uppercase tracking-widest border-b border-black mb-3 pb-1 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Summary
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        Dedicated cybersecurity professional with hands-on experience in vulnerability assessment and threat mitigation. Proven ability to analyze complex security challenges and implement robust defense strategies. Ready for deployment.
                                    </p>
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-8 left-8 right-8 border-t border-gray-200 pt-4 flex justify-between items-center text-xs text-gray-400 font-mono">
                            <span>GENERATED BY CYBER COACH SYSTEM</span>
                            <span>ID: {user?.id?.slice(0, 12).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Controls / Info */}
                <div className="space-y-6">
                    <div className="bg-[#0A0F0A] border border-[#00FF88]/20 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-[#00FF88]" />
                            Dossier Configuration
                        </h3>
                        <p className="text-[#00B37A] text-sm mb-6">
                            This document is auto-generated from your active service record. Complete more labs and earn certificates to upgrade your clearance level and expand your dossier.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#000000] rounded-lg border border-[#00FF88]/10">
                                <span className="text-[#EAEAEA]">Include Profile Photo</span>
                                <div className="w-10 h-5 bg-[#00FF88]/20 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-[#00FF88] rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#000000] rounded-lg border border-[#00FF88]/10">
                                <span className="text-[#EAEAEA]">Show Clearance Level</span>
                                <div className="w-10 h-5 bg-[#00FF88]/20 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-[#00FF88] rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
