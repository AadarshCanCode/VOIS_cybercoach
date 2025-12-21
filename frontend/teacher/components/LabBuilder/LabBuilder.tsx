import { useState } from 'react';
import { Terminal, Save, Plus, Trash2, Folder, FileCode, Play } from 'lucide-react';

interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: FileNode[];
}

export const LabBuilder = () => {
    const [labTitle, setLabTitle] = useState('');
    const [labDescription, setLabDescription] = useState('');
    const [difficulty, setDifficulty] = useState('beginner');
    const [files, setFiles] = useState<FileNode[]>([
        { id: 'root', name: 'root', type: 'directory', children: [] }
    ]);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

    const handleAddFile = (parentId: string, type: 'file' | 'directory') => {
        const name = prompt(`Enter ${type} name:`);
        if (!name) return;

        const newNode: FileNode = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            children: type === 'directory' ? [] : undefined,
            content: type === 'file' ? '' : undefined
        };

        const addNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.id === parentId && node.type === 'directory') {
                    return { ...node, children: [...(node.children || []), newNode] };
                }
                if (node.children) {
                    return { ...node, children: addNode(node.children) };
                }
                return node;
            });
        };

        setFiles(addNode(files));
    };

    const handleDeleteNode = (nodeId: string) => {
        const deleteNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(node => node.id !== nodeId).map(node => {
                if (node.children) {
                    return { ...node, children: deleteNode(node.children) };
                }
                return node;
            });
        };
        setFiles(deleteNode(files));
        if (selectedFile?.id === nodeId) setSelectedFile(null);
    };

    const renderTree = (nodes: FileNode[]) => {
        return (
            <div className="pl-4 border-l border-[#00FF88]/10">
                {nodes.map(node => (
                    <div key={node.id} className="my-1">
                        <div
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedFile?.id === node.id ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'hover:bg-[#00FF88]/5 text-[#EAEAEA]'}`}
                            onClick={() => setSelectedFile(node)}
                        >
                            <div className="flex items-center gap-2">
                                {node.type === 'directory' ? <Folder className="h-4 w-4 text-[#00B37A]" /> : <FileCode className="h-4 w-4 text-[#00FF88]" />}
                                <span className="font-mono text-sm">{node.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {node.type === 'directory' && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleAddFile(node.id, 'file'); }} className="p-1 hover:text-[#00FF88]"><Plus className="h-3 w-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleAddFile(node.id, 'directory'); }} className="p-1 hover:text-[#00FF88]"><Folder className="h-3 w-3" /></button>
                                    </>
                                )}
                                {node.id !== 'root' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} className="p-1 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                                )}
                            </div>
                        </div>
                        {node.children && renderTree(node.children)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Panel: Lab Metadata & File Tree */}
                <div className="space-y-6">
                    <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-[#00FF88] mb-4 flex items-center gap-2">
                            <Terminal className="h-5 w-5" /> Lab Configuration
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-[#00B37A] mb-1">MISSION TITLE</label>
                                <input
                                    type="text"
                                    value={labTitle}
                                    onChange={(e) => setLabTitle(e.target.value)}
                                    className="w-full bg-black border border-[#00FF88]/20 rounded p-2 text-[#EAEAEA] focus:border-[#00FF88] outline-none transition-colors"
                                    placeholder="e.g., Operation Blackout"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-[#00B37A] mb-1">DIFFICULTY</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full bg-black border border-[#00FF88]/20 rounded p-2 text-[#EAEAEA] focus:border-[#00FF88] outline-none"
                                >
                                    <option value="beginner">Recruit (Beginner)</option>
                                    <option value="intermediate">Operative (Intermediate)</option>
                                    <option value="advanced">Elite (Advanced)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-[#00B37A] mb-1">BRIEFING</label>
                                <textarea
                                    value={labDescription}
                                    onChange={(e) => setLabDescription(e.target.value)}
                                    className="w-full bg-black border border-[#00FF88]/20 rounded p-2 text-[#EAEAEA] focus:border-[#00FF88] outline-none h-24 resize-none"
                                    placeholder="Mission objectives..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 h-[500px] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#00FF88] mb-4 flex items-center gap-2">
                            <Folder className="h-5 w-5" /> File System
                        </h2>
                        {renderTree(files)}
                    </div>
                </div>

                {/* Middle Panel: File Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-[#00FF88]/10 pb-4">
                            <h2 className="text-xl font-bold text-[#00FF88] flex items-center gap-2">
                                <FileCode className="h-5 w-5" />
                                {selectedFile ? selectedFile.name : 'Select a file to edit'}
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 rounded hover:bg-[#00FF88]/20 transition-all flex items-center gap-2 font-mono text-sm">
                                    <Play className="h-4 w-4" /> TEST RUN
                                </button>
                                <button className="px-4 py-2 bg-[#00FF88] text-black rounded font-bold hover:bg-[#00CC66] transition-all flex items-center gap-2">
                                    <Save className="h-4 w-4" /> SAVE LAB
                                </button>
                            </div>
                        </div>

                        {selectedFile && selectedFile.type === 'file' ? (
                            <textarea
                                value={selectedFile.content}
                                onChange={(e) => {
                                    const updateContent = (nodes: FileNode[]): FileNode[] => {
                                        return nodes.map(node => {
                                            if (node.id === selectedFile.id) return { ...node, content: e.target.value };
                                            if (node.children) return { ...node, children: updateContent(node.children) };
                                            return node;
                                        });
                                    };
                                    setFiles(updateContent(files));
                                    setSelectedFile({ ...selectedFile, content: e.target.value });
                                }}
                                className="flex-1 bg-black font-mono text-sm text-[#00FF88] p-4 rounded border border-[#00FF88]/10 outline-none resize-none focus:border-[#00FF88]/30"
                                spellCheck={false}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#00B37A]/50 border-2 border-dashed border-[#00FF88]/10 rounded">
                                <Terminal className="h-16 w-16 mb-4" />
                                <p className="font-mono">Select a file from the tree to edit its contents</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
