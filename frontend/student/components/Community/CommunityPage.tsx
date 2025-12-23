import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Search, User, MoreHorizontal, Hash, ArrowLeft, Zap, Send } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { communityService, Post, Comment } from '../../services/communityService';
import { useNavigate } from 'react-router-dom';

interface CommunityPageProps {
    onBack?: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onBack }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<'all' | 'social' | 'technical'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // New state for comments and expansion
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState<Record<string, Comment[]>>({});

    useEffect(() => {
        loadPosts();
        const postSubscription = communityService.subscribeToPosts((payload) => {
            if (payload.new) {
                const newPost = payload.new;
                const postWithAuthor = {
                    ...newPost,
                    timestamp: 'Just now',
                    author: newPost.author || { name: 'Anonymous', role: 'Student' },
                    tags: newPost.tags || [],
                    likes: newPost.likes || 0,
                    comments: newPost.comments || 0,
                    shares: newPost.shares || 0
                };
                setPosts(prev => [postWithAuthor, ...prev]);
            }
        });

        const commentSubscription = communityService.subscribeToComments((payload) => {
            if (payload.new) {
                const newComment = payload.new;
                setComments(prev => {
                    const postComments = prev[newComment.post_id] || [];
                    // Avoid duplicates if we already added it locally
                    if (postComments.some(c => c.id === newComment.id)) return prev;

                    return {
                        ...prev,
                        [newComment.post_id]: [...postComments, {
                            ...newComment,
                            timestamp: 'Just now'
                        }]
                    };
                });

                // Update comment count on post if it wasn't a local update
                setPosts(prev => prev.map(p =>
                    p.id === newComment.post_id ? { ...p, comments: p.comments + 1 } : p
                ));
            }
        });

        return () => {
            postSubscription.unsubscribe();
            commentSubscription.unsubscribe();
        };
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const data = await communityService.getPosts();
        setPosts(data);
        setLoading(false);
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        try {
            const newPost = {
                author: { name: user?.name || 'Anonymous', role: 'Student' },
                content: newPostContent,
                tags: ['General'],
                category: 'social' as const
            };
            await communityService.createPost(newPost);
            setNewPostContent('');
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handleLike = async (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        await communityService.likePost(postId);
    };

    const handleShare = async (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
        await communityService.sharePost(postId);
    };

    const toggleComments = async (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            if (!comments[postId]) {
                const fetchedComments = await communityService.getComments(postId);
                setComments(prev => ({ ...prev, [postId]: fetchedComments }));
            }
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            const newComment = {
                post_id: postId,
                author: { name: user?.name || 'Anonymous', role: 'Student' },
                content: commentContent
            };

            const createdComment = await communityService.createComment(newComment);

            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), createdComment]
            }));

            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comments: p.comments + 1 } : p
            ));

            setCommentContent('');
        } catch (error) {
            console.error('Failed to create comment:', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
        const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#00FF88]/30">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8808_1px,transparent_1px),linear-gradient(to_bottom,#00FF8808_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Radial Gradient Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00FF88]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <button
                            onClick={() => {
                                if (onBack) {
                                    onBack();
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="group flex items-center text-[#00B37A] hover:text-[#00FF88] transition-colors mb-6 text-sm font-medium tracking-wide uppercase"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Base
                        </button>
                        <h1 className="text-5xl font-black tracking-tight text-white mb-2">
                            NET<span className="text-[#00FF88]">WORK</span>
                        </h1>
                        <p className="text-[#00B37A] text-lg max-w-xl">
                            Global cybersecurity intelligence feed. Share intel, exploits, and discussions.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative group w-full md:w-96">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF88] to-[#00CC66] rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-500" />
                        <div className="relative flex items-center bg-[#0A0F0A] rounded-lg p-1 border border-[#00FF88]/20">
                            <Search className="h-5 w-5 text-[#00B37A] ml-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search the network..."
                                className="w-full bg-transparent border-none focus:ring-0 text-[#EAEAEA] placeholder:text-[#00B37A]/50 h-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {/* Filters */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest px-3 mb-4">Signal Filter</h3>
                                <FilterButton
                                    active={activeCategory === 'all'}
                                    onClick={() => setActiveCategory('all')}
                                    label="All Signals"
                                    icon={<Zap className="h-4 w-4" />}
                                />
                                <FilterButton
                                    active={activeCategory === 'technical'}
                                    onClick={() => setActiveCategory('technical')}
                                    label="Technical Intel"
                                    icon={<Hash className="h-4 w-4" />}
                                />
                                <FilterButton
                                    active={activeCategory === 'social'}
                                    onClick={() => setActiveCategory('social')}
                                    label="Social Comms"
                                    icon={<MessageSquare className="h-4 w-4" />}
                                />
                            </div>

                            {/* Trending */}
                            <div>
                                <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest px-3 mb-4">Trending Tags</h3>
                                <div className="flex flex-wrap gap-2 px-2">
                                    {['#ZeroDay', '#RedTeam', '#CTF', '#Malware', '#OpSec'].map(tag => (
                                        <span key={tag} className="text-xs font-mono text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/20 px-3 py-1.5 rounded cursor-pointer hover:bg-[#00FF88]/20 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Create Post */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF88] to-[#00CC66] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                            <div className="relative bg-[#0A0F0A] rounded-xl p-6 border border-[#00FF88]/20">
                                <form onSubmit={handlePostSubmit}>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded bg-[#0A0F0A] flex items-center justify-center flex-shrink-0 border border-[#00FF88]/30">
                                            <User className="h-6 w-6 text-[#00FF88]" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <textarea
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                placeholder="Broadcast your status..."
                                                className="w-full bg-[#000000]/50 border border-[#00FF88]/20 rounded-lg p-4 text-[#EAEAEA] placeholder:text-[#00B37A]/50 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all resize-none h-32 font-mono text-sm"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={!newPostContent.trim()}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    BROADCAST
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Feed */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-[#00B37A]">
                                    <div className="w-12 h-12 border-4 border-[#0A0F0A] border-t-[#00FF88] rounded-full animate-spin mb-4" />
                                    <p className="font-mono text-sm animate-pulse">ESTABLISHING UPLINK...</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="text-center py-20 bg-[#0A0F0A]/50 rounded-xl border border-[#00FF88]/20 border-dashed">
                                    <p className="text-[#00B37A] font-mono">NO SIGNALS DETECTED</p>
                                </div>
                            ) : (
                                filteredPosts.map(post => (
                                    <div key={post.id} className="group bg-[#0A0F0A] hover:bg-[#0A0F0A]/80 border border-[#00FF88]/10 hover:border-[#00FF88]/30 rounded-xl p-6 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded bg-gradient-to-br from-[#0A0F0A] to-[#000000] flex items-center justify-center border border-[#00FF88]/20">
                                                    <span className="font-bold text-[#00FF88] font-mono">{post.author.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#EAEAEA] group-hover:text-[#00FF88] transition-colors">{post.author.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-[#00B37A] font-mono mt-0.5">
                                                        <span className="text-[#00FF88]/80">@{post.author.role.toLowerCase()}</span>
                                                        <span>::</span>
                                                        <span>{post.timestamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-[#00B37A] hover:text-[#00FF88]">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <p className="text-[#EAEAEA] mb-6 leading-relaxed whitespace-pre-wrap font-light">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-[#00FF88]/10">
                                            <div className="flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-mono uppercase tracking-wider text-[#00B37A] bg-[#000000] px-2 py-1 rounded border border-[#00FF88]/20">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className="flex items-center gap-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group/action"
                                                >
                                                    <Heart className="h-4 w-4 group-hover/action:fill-current" />
                                                    <span className="text-xs font-mono">{post.likes}</span>
                                                </button>
                                                <button
                                                    onClick={() => toggleComments(post.id)}
                                                    className={`flex items-center gap-2 transition-colors group/action ${expandedPostId === post.id ? 'text-[#00FF88]' : 'text-[#00B37A] hover:text-[#EAEAEA]'}`}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="text-xs font-mono">{post.comments}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShare(post.id)}
                                                    className="flex items-center gap-2 text-[#00B37A] hover:text-[#EAEAEA] transition-colors"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    <span className="text-xs font-mono">{post.shares || 0}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        {expandedPostId === post.id && (
                                            <div className="mt-4 pt-4 border-t border-[#00FF88]/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                {/* Comment Input */}
                                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded bg-[#0A0F0A] flex items-center justify-center flex-shrink-0 border border-[#00FF88]/30">
                                                        <User className="h-4 w-4 text-[#00FF88]" />
                                                    </div>
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={commentContent}
                                                            onChange={(e) => setCommentContent(e.target.value)}
                                                            placeholder="Reply to this signal..."
                                                            className="flex-1 bg-[#000000]/50 border border-[#00FF88]/20 rounded-lg px-4 py-2 text-sm text-[#EAEAEA] placeholder:text-[#00B37A]/50 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!commentContent.trim()}
                                                            className="px-4 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] rounded-lg text-xs font-bold uppercase tracking-wider border border-[#00FF88]/20 transition-all disabled:opacity-50"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </form>

                                                {/* Comments List */}
                                                <div className="space-y-3 pl-11">
                                                    {comments[post.id]?.map(comment => (
                                                        <div key={comment.id} className="bg-[#000000]/30 rounded-lg p-3 border border-[#00FF88]/5">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold text-[#00FF88]">{comment.author.name}</span>
                                                                <span className="text-[10px] text-[#00B37A] font-mono">{comment.timestamp}</span>
                                                            </div>
                                                            <p className="text-sm text-[#EAEAEA] font-light">{comment.content}</p>
                                                        </div>
                                                    ))}
                                                    {(!comments[post.id] || comments[post.id].length === 0) && (
                                                        <p className="text-xs text-[#00B37A] italic">No replies yet. Be the first to intercept.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border ${active
            ? 'bg-[#00FF88]/10 border-[#00FF88]/50 text-[#00FF88]'
            : 'bg-transparent border-transparent text-[#00B37A] hover:bg-[#0A0F0A] hover:text-[#EAEAEA]'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.5)]" />}
    </button>
);
