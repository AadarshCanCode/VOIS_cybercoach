import { useState } from 'react';
import { Save, Bold, Italic, List, Code, Image as ImageIcon, Link as LinkIcon, Eye } from 'lucide-react';

export const CourseEditor = () => {
    const [moduleTitle, setModuleTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] p-6 animate-fade-in">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Course <span className="text-[#00FF88]">Editor</span>
                        </h1>
                        <p className="text-[#00B37A] font-mono text-sm mt-1">AUTHOR CLASSIFIED MATERIAL</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 rounded hover:bg-[#00FF88]/20 transition-all flex items-center gap-2 font-mono text-sm">
                            <Eye className="h-4 w-4" /> PREVIEW
                        </button>
                        <button className="px-4 py-2 bg-[#00FF88] text-black rounded font-bold hover:bg-[#00CC66] transition-all flex items-center gap-2">
                            <Save className="h-4 w-4" /> PUBLISH MODULE
                        </button>
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6">
                    <label className="block text-xs font-mono text-[#00B37A] mb-2">MODULE DESIGNATION</label>
                    <input
                        type="text"
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        className="w-full bg-black border border-[#00FF88]/20 rounded p-3 text-xl font-bold text-[#EAEAEA] focus:border-[#00FF88] outline-none transition-colors placeholder-[#00B37A]/30"
                        placeholder="e.g., Advanced Network Reconnaissance"
                    />
                </div>

                {/* Editor Toolbar */}
                <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl overflow-hidden flex flex-col h-[600px]">
                    <div className="flex items-center gap-1 p-2 border-b border-[#00FF88]/10 bg-black/50">
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="Bold">
                            <Bold className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="Italic">
                            <Italic className="h-4 w-4" />
                        </button>
                        <div className="w-px h-4 bg-[#00FF88]/10 mx-2" />
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="List">
                            <List className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="Code Block">
                            <Code className="h-4 w-4" />
                        </button>
                        <div className="w-px h-4 bg-[#00FF88]/10 mx-2" />
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="Insert Image">
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-[#00FF88]/10 rounded text-[#00B37A] hover:text-[#00FF88] transition-colors" title="Insert Link">
                            <LinkIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Editor Area */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 bg-black p-6 text-[#EAEAEA] outline-none resize-none font-sans leading-relaxed"
                        placeholder="Begin transmission..."
                    />

                    <div className="p-2 bg-black/50 border-t border-[#00FF88]/10 text-xs text-[#00B37A] font-mono flex justify-end">
                        {content.length} CHARS // {content.split(/\s+/).filter(Boolean).length} WORDS
                    </div>
                </div>

            </div>
        </div>
    );
};
