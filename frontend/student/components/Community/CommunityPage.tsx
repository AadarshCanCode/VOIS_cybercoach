import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, User, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { useAuth } from '@context/AuthContext';

interface Post {
    id: string;
    author: {
        name: string;
        avatar?: string;
        role: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
    tags: string[];
}

export const CommunityPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth(); // Get current user
    const [posts, setPosts] = useState<Post[]>([
        {
            id: '1',
            author: { name: 'Sentinel_AI', role: 'Security Architect' },
            content: 'Just deployed a new heuristic engine for zero-day detection. The results are promising.',
            likes: 42,
            comments: 12,
            timestamp: '2 hours ago',
            tags: ['AI', 'ZeroDay', 'Heuristics']
        }
    ]);
    const [newPostContent, setNewPostContent] = useState('');

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        const newPost: Post = {
            id: Date.now().toString(),
            author: {
                name: user?.name || 'Operative',
                role: user?.role === 'teacher' ? 'Instructor' : 'Student',
            },
            content: newPostContent,
            likes: 0,
            comments: 0,
            timestamp: 'Just now',
            tags: ['General']
        };

        setPosts([newPost, ...posts]);
        setNewPostContent('');
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#00FF88]/30">
            <SEO
                title="Community Feed"
                description="Connect with elite operatives. Share threat intel, bounties, and strategies in the global cybersecurity network."
            />
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8808_1px,transparent_1px),linear-gradient(to_bottom,#00FF8808_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 p-6 lg:p-10 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 border-b border-[#00FF88]/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-[#00FF88]/10 rounded-full transition-colors text-[#00FF88]">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Hub</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post Section */}
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-6 mb-8">
                            <form onSubmit={handlePostSubmit}>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex-shrink-0 flex items-center justify-center">
                                        <User className="h-5 w-5 text-[#00FF88]" />
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="Transmit intel to the network..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-[#EAEAEA] placeholder-[#00B37A]/30 resize-none min-h-[80px]"
                                        />
                                        <div className="flex justify-end pt-4 border-t border-[#00FF88]/10">
                                            <button
                                                type="submit"
                                                disabled={!newPostContent.trim()}
                                                className="px-6 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] rounded-lg font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Transmit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {posts.map(post => (
                            <div key={post.id} className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-6 hover:border-[#00FF88]/30 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                                        <User className="h-5 w-5 text-[#00FF88]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{post.author.name}</h3>
                                        <p className="text-[10px] text-[#00B37A] uppercase tracking-widest">{post.author.role} • {post.timestamp}</p>
                                    </div>
                                </div>
                                <p className="text-[#EAEAEA]/80 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                <div className="flex items-center gap-6 text-[#00B37A]">
                                    <button className="flex items-center gap-2 hover:text-[#00FF88] transition-colors">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="text-xs">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-[#00FF88] transition-colors">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-xs">{post.comments}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-6">
                            <h3 className="text-[#00FF88] font-bold uppercase tracking-widest text-xs mb-4">Trending Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {['#ZeroDay', '#CyberSec', '#Web3', '#AI', '#Security'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-full text-[10px] text-[#00B37A] cursor-pointer hover:bg-[#00FF88]/10 transition-all">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
