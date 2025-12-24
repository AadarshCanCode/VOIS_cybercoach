import React, { useRef, useState, useEffect } from 'react';
import { Download, Shield, Award, Terminal, User, Mail, MapPin, Globe, Trash2, Plus, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '@context/AuthContext';

interface ResumeData {
    name: string;
    level: string;
    email: string;
    location: string;
    website: string;
    skills: string[];
    certs: { name: string; year: string }[];
    missions: { title: string; subtitle: string; description: string }[];
    summary: string;
}

const INITIAL_DATA: ResumeData = {
    name: 'OPERATOR NAME',
    level: 'NOVICE',
    email: 'operator@cyber.net',
    location: 'Remote / Worldwide',
    website: 'cybercoach.dev/u/operator',
    skills: ['Network Security', 'Penetration Testing', 'Incident Response', 'Cryptography', 'Python / Bash', 'Linux Administration'],
    certs: [
        { name: 'OWASP Top 10', year: '2024' },
        { name: 'Network Defense', year: '2024' }
    ],
    missions: [
        {
            title: 'Cyber Coach Platform',
            subtitle: 'Top 10% Operator',
            description: 'Completed advanced security simulations including SQL Injection defense, XSS mitigation, and network traffic analysis. Maintained a high accuracy rating in tactical assessments.'
        }
    ],
    summary: 'Dedicated cybersecurity professional with hands-on experience in vulnerability assessment and threat mitigation. Proven ability to analyze complex security challenges and implement robust defense strategies. Ready for deployment.'
};

export const ResumeGenerator: React.FC = () => {
    const { user } = useAuth();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<ResumeData>(INITIAL_DATA);
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        if (user) {
            setData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                level: user.level || prev.level,
                website: `cybercoach.dev/u/${user.id?.slice(0, 8) || 'unknown'}`
            }));
        }
    }, [user]);

    const updateField = (field: keyof ResumeData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateListField = (field: 'skills' | 'certs' | 'missions', index: number, value: any) => {
        setData(prev => {
            const newList = [...(prev[field] as any[])];
            newList[index] = value;
            return { ...prev, [field]: newList };
        });
    };

    const addItem = (field: 'skills' | 'certs' | 'missions') => {
        setData(prev => {
            const newItem = field === 'skills' ? 'New Skill' :
                field === 'certs' ? { name: 'New Certificate', year: '2024' } :
                    { title: 'New Mission', subtitle: 'Role/Unit', description: 'Describe your achievements here.' };
            return { ...prev, [field]: [...(prev[field] as any[]), newItem] };
        });
    };

    const removeItem = (field: 'skills' | 'certs' | 'missions', index: number) => {
        setData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index)
        }));
    };

    const handleImport = () => {
        if (!importText.trim()) return;

        // Very basic parser for demonstration
        const lines = importText.split('\n');
        const newData = { ...data };

        if (lines[0]) newData.name = lines[0].trim();
        if (lines[1]) newData.summary = lines[1].trim();

        setData(newData);
        setShowImport(false);
        setImportText('');
    };

    const generatePDF = async () => {
        if (!resumeRef.current) return;
        setIsGenerating(true);

        try {
            const [html2canvasModule, jsPDFModule] = await Promise.all([
                import('html2canvas'),
                import('jspdf')
            ]);
            const html2canvas = html2canvasModule.default;
            const jsPDF = jsPDFModule.default;

            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const ratio = canvas.width / canvas.height;
            const imgHeight = pdfWidth / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`OPERATOR_RESUME_${data.name.toUpperCase()}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate resume. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    const EditableContent = ({ content, onUpdate, className = "" }: { content: string, onUpdate: (val: string) => void, className?: string }) => (
        <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(e.currentTarget.textContent || "")}
            className={`outline-none hover:bg-gray-50 focus:bg-gray-50 transition-colors p-0.5 rounded ${className}`}
        >
            {content}
        </div>
    );

    return (
        <div className="p-6 space-y-8 min-h-screen animate-fade-in text-[#EAEAEA]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
                        <span className="text-[#00FF88]">Resume Editor</span>
                        <div className="px-2 py-0.5 bg-[#00FF88]/10 text-[#00FF88] text-[10px] font-mono border border-[#00FF88]/20 rounded tracking-[0.2em] animate-pulse">
                            DRAFT_MODE
                        </div>
                    </h1>
                    <p className="text-[#00B37A] font-mono text-sm mt-1">DIRECT INLINE EDITING ENABLED</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowImport(true)}
                        className="bg-white/5 hover:bg-white/10 text-white font-mono text-xs py-2 px-4 rounded-lg flex items-center gap-2 transition-all border border-white/10"
                    >
                        <FileText className="h-4 w-4" />
                        IMPORT TEXT
                    </button>
                    <button
                        onClick={() => setData(INITIAL_DATA)}
                        className="bg-white/5 hover:bg-white/10 text-white font-mono text-xs py-2 px-4 rounded-lg flex items-center gap-2 transition-all border border-white/10"
                    >
                        <RefreshCw className="h-4 w-4" />
                        RESET
                    </button>
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
            </div>

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1A1A] border border-[#00FF88]/30 p-8 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,255,136,0.1)]">
                        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Import Existing Resume</h2>
                        <p className="text-gray-400 mb-6 text-sm font-mono">Paste your resume text below. Our system will attempt to extract key data points. (Experimental)</p>
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            className="w-full h-64 bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-[#00FF88] outline-none transition-colors"
                            placeholder="Paste your resume content here..."
                        />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleImport}
                                className="flex-1 bg-[#00FF88] text-black font-bold py-3 rounded-lg hover:bg-[#00CC66] transition-all"
                            >
                                START PARSING
                            </button>
                            <button
                                onClick={() => setShowImport(false)}
                                className="flex-1 bg-white/5 text-white font-bold py-3 rounded-lg hover:bg-white/10 border border-white/10 transition-all"
                            >
                                ABORT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
                {/* Resume Preview */}
                <div className="w-full max-w-[800px] bg-[#2A2A2A] p-4 sm:p-12 rounded-xl overflow-hidden shadow-2xl border border-white/10 group relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-[#00FF88] text-[10px] px-2 py-1 rounded font-mono border border-[#00FF88]/20">
                        CLICK ANY TEXT TO EDIT
                    </div>

                    <div
                        ref={resumeRef}
                        className="bg-white text-black p-12 min-h-[1050px] w-full shadow-lg relative"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {/* Resume Header */}
                        <div className="border-b-4 border-black pb-8 mb-8 flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 outline-none">
                                    <EditableContent
                                        content={data.name}
                                        onUpdate={(val) => updateField('name', val)}
                                    />
                                </h1>
                                <div className="text-xl font-mono text-gray-600 tracking-widest flex items-center gap-2">
                                    <EditableContent
                                        content={data.level}
                                        onUpdate={(val) => updateField('level', val)}
                                    />
                                    <span>OPERATOR</span>
                                </div>
                            </div>
                            <div className="text-right text-sm space-y-2 font-medium">
                                <div className="flex items-center justify-end gap-3 group">
                                    <EditableContent
                                        content={data.email}
                                        onUpdate={(val) => updateField('email', val)}
                                    />
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <EditableContent
                                        content={data.location}
                                        onUpdate={(val) => updateField('location', val)}
                                    />
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <EditableContent
                                        content={data.website}
                                        onUpdate={(val) => updateField('website', val)}
                                    />
                                    <Globe className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-12">
                            {/* Left Column */}
                            <div className="col-span-1 space-y-8 border-r border-gray-100 pr-8">
                                <section>
                                    <div className="flex items-center justify-between border-b border-black mb-4 pb-1 group/section">
                                        <h3 className="font-black uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="h-4 w-4" /> Skills
                                        </h3>
                                        <button onClick={() => addItem('skills')} className="opacity-0 group-hover/section:opacity-100 hover:text-green-600 transition-all">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        {data.skills.map((skill, i) => (
                                            <li key={i} className="flex items-center justify-between group/item">
                                                <EditableContent
                                                    content={skill}
                                                    onUpdate={(val) => updateListField('skills', i, val)}
                                                    className="flex-1 font-semibold"
                                                />
                                                <button onClick={() => removeItem('skills', i)} className="opacity-0 group-hover/item:opacity-100 text-red-500 ml-2">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between border-b border-black mb-4 pb-1 group/section">
                                        <h3 className="font-black uppercase tracking-widest flex items-center gap-2">
                                            <Award className="h-4 w-4" /> Certs
                                        </h3>
                                        <button onClick={() => addItem('certs')} className="opacity-0 group-hover/section:opacity-100 hover:text-green-600 transition-all">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <ul className="space-y-4 text-sm">
                                        {data.certs.map((cert, i) => (
                                            <li key={i} className="group/item">
                                                <div className="flex items-center justify-between">
                                                    <EditableContent
                                                        content={cert.name}
                                                        onUpdate={(val) => updateListField('certs', i, { ...cert, name: val })}
                                                        className="font-bold flex-1"
                                                    />
                                                    <button onClick={() => removeItem('certs', i)} className="opacity-0 group-hover/item:opacity-100 text-red-500 ml-2">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <EditableContent
                                                    content={cert.year}
                                                    onUpdate={(val) => updateListField('certs', i, { ...cert, year: val })}
                                                    className="text-xs text-gray-500"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-2 space-y-8">
                                <section>
                                    <div className="flex items-center justify-between border-b border-black mb-4 pb-1 group/section">
                                        <h3 className="font-black uppercase tracking-widest flex items-center gap-2">
                                            <Terminal className="h-4 w-4" /> Mission History
                                        </h3>
                                        <button onClick={() => addItem('missions')} className="opacity-0 group-hover/section:opacity-100 hover:text-green-600 transition-all">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-8">
                                        {data.missions.map((mission, i) => (
                                            <div key={i} className="space-y-2 group/item">
                                                <div className="flex items-center justify-between">
                                                    <EditableContent
                                                        content={mission.title}
                                                        onUpdate={(val) => updateListField('missions', i, { ...mission, title: val })}
                                                        className="font-bold text-xl flex-1"
                                                    />
                                                    <button onClick={() => removeItem('missions', i)} className="opacity-0 group-hover/item:opacity-100 text-red-500 ml-2">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <EditableContent
                                                    content={mission.subtitle}
                                                    onUpdate={(val) => updateListField('missions', i, { ...mission, subtitle: val })}
                                                    className="text-sm font-mono text-gray-600"
                                                />
                                                <EditableContent
                                                    content={mission.description}
                                                    onUpdate={(val) => updateListField('missions', i, { ...mission, description: val })}
                                                    className="text-sm text-gray-700 leading-relaxed"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-black uppercase tracking-widest border-b border-black mb-4 pb-1 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Professional Summary
                                    </h3>
                                    <EditableContent
                                        content={data.summary}
                                        onUpdate={(val) => updateField('summary', val)}
                                        className="text-sm text-gray-700 leading-relaxed italic"
                                    />
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-12 left-12 right-12 border-t border-gray-200 pt-6 flex justify-between items-center text-xs text-gray-400 font-mono tracking-widest">
                            <span>SERIAL_ID: {user?.id?.slice(0, 12).toUpperCase() || 'OFFLINE_OPERATOR'}</span>
                            <span>VERIFIED BY CYBER COACH NETWORK</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-full xl:w-80 space-y-6">
                    <div className="bg-[#0A0F0A] border border-[#00FF88]/20 p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-[#00FF88]/10 pb-4">
                            <Terminal className="h-5 w-5 text-[#00FF88]" />
                            <h3 className="text-xl font-bold text-white tracking-tight">System Logs</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-black/50 rounded-lg border border-[#00FF88]/10">
                                <p className="text-xs text-[#00FF88] font-mono mb-2 uppercase">[HINT]</p>
                                <p className="text-[#EAEAEA]/80 text-[13px] leading-relaxed">
                                    Click any text block in the resume to modify it. Changes are saved locally during your session.
                                </p>
                            </div>

                            <div className="p-4 bg-black/50 rounded-lg border border-[#00FF88]/10">
                                <p className="text-xs text-[#00FF88] font-mono mb-2 uppercase">[TEMPLATE]</p>
                                <p className="text-[#EAEAEA]/80 text-[13px] leading-relaxed">
                                    Use the 'RESET' button to restore original platform data if you need to start over.
                                </p>
                            </div>

                            <div className="p-4 bg-black/50 rounded-lg border border-[#00FF88]/10">
                                <p className="text-xs text-[#00FF88] font-mono mb-2 uppercase">[ACTION]</p>
                                <p className="text-[#EAEAEA]/80 text-[13px] leading-relaxed mb-4">
                                    Need to add new entries? Hover over sections to see the <Plus className="inline h-3 w-3" /> button.
                                </p>
                                <div className="space-y-2">
                                    <button onClick={() => addItem('missions')} className="w-full text-left text-xs text-[#00FF88] hover:underline flex items-center gap-2">
                                        <Plus className="h-3 w-3" /> ADD MISSION
                                    </button>
                                    <button onClick={() => addItem('skills')} className="w-full text-left text-xs text-[#00FF88] hover:underline flex items-center gap-2">
                                        <Plus className="h-3 w-3" /> ADD SKILL
                                    </button>
                                    <button onClick={() => addItem('certs')} className="w-full text-left text-xs text-[#00FF88] hover:underline flex items-center gap-2">
                                        <Plus className="h-3 w-3" /> ADD CERTIFICATE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#00FF88]/10">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#00FF88]/50 uppercase">
                                <span>Status</span>
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-[#00FF88] rounded-full animate-pulse" />
                                    Synchronized
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
