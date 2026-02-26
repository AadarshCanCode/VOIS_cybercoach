import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ThumbsUp, Share2, User, ArrowLeft, Send, ChevronDown, ChevronUp, Loader2, Tag, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { useAuth } from '@context/AuthContext';
import { communityService, type Post, type Comment } from '@student/services/communityService';

// ---- Seed data used ONLY if Supabase tables are empty ------------------
const SEED_POSTS: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares'>[] = [
    {
        author: { name: 'Sentinel_AI', role: 'Security Architect' },
        content: 'Just deployed a new heuristic engine for zero-day detection. The results are promising — false positive rate dropped by 40% compared to signature-based approaches. Anyone else experimenting with ML-driven threat detection?',
        tags: ['AI', 'ZeroDay', 'Heuristics'],
        category: 'technical',
    },
    {
        author: { name: 'CryptoPhantom', role: 'Penetration Tester' },
        content: 'Completed a red team engagement today. Found an SSRF chain that led to internal cloud metadata access. Always remember to block 169.254.169.254 from your application servers! 🔥',
        tags: ['RedTeam', 'SSRF', 'CloudSecurity'],
        category: 'technical',
    },
    {
        author: { name: 'NetWarden', role: 'SOC Analyst' },
        content: 'Our SIEM flagged 3 lateral movement attempts last night. Turned out to be a misconfigured service account with way too many privileges. Principle of Least Privilege is not optional, people!',
        tags: ['SIEM', 'SOC', 'LeastPrivilege'],
        category: 'technical',
    },
    {
        author: { name: 'ByteGuardian', role: 'Student' },
        content: 'Just passed my CompTIA Security+ exam! 🎉 Huge thanks to this community for all the study resources and moral support. Starting on CySA+ next month.',
        tags: ['Certification', 'SecurityPlus', 'CareerGrowth'],
        category: 'social',
    },
    {
        author: { name: 'ZeroCool', role: 'Bug Bounty Hunter' },
        content: 'Found a critical XSS in a major e-commerce platform\'s checkout flow. Responsible disclosure went smoothly and got a $5,000 bounty! Always check those input sanitization paths.',
        tags: ['BugBounty', 'XSS', 'WebSecurity'],
        category: 'technical',
    },
    {
        author: { name: 'QuantumShield', role: 'Cryptography Researcher' },
        content: 'Interesting paper just dropped on lattice-based post-quantum signatures. NIST\'s CRYSTALS-Dilithium is looking strong, but the key sizes are still a concern for IoT devices. Thoughts?',
        tags: ['PostQuantum', 'Cryptography', 'Research'],
        category: 'technical',
    },
    {
        author: { name: 'PhishHunter', role: 'Instructor' },
        content: 'Reminder for all students: Our live CTF event is happening this Saturday at 2 PM UTC! Teams of 4, beginner-friendly challenges included. Register via the dashboard. Let\'s go! 🏁',
        tags: ['CTF', 'Event', 'Learning'],
        category: 'social',
    },
    {
        author: { name: 'MalwareMonk', role: 'Malware Analyst' },
        content: 'Reverse-engineered a new ransomware variant today. It uses AES-256-CBC with per-file keys encrypted via RSA-4096. The dropper disguises itself as a Windows Update notification. Stay vigilant.',
        tags: ['Malware', 'ReverseEngineering', 'Ransomware'],
        category: 'technical',
    },
    {
        author: { name: 'CloudNinja', role: 'DevSecOps Engineer' },
        content: 'Just open-sourced my Terraform module for automated AWS security group auditing. Catches overly permissive rules before they hit production. Link in profile! 🚀',
        tags: ['DevSecOps', 'AWS', 'OpenSource'],
        category: 'technical',
    },
    {
        author: { name: 'CyberSensei', role: 'Instructor' },
        content: 'Pro tip for aspiring security professionals: Don\'t just learn to attack — learn to defend. Understanding blue team ops (log analysis, incident response, hardening) makes you 10x more valuable in the industry.',
        tags: ['CareerAdvice', 'BlueTeam', 'Learning'],
        category: 'social',
    },
];

const SEED_COMMENTS: Record<number, { author: { name: string; role: string }; content: string }[]> = {
    0: [
        { author: { name: 'ByteGuardian', role: 'Student' }, content: 'This is amazing! What ML framework are you using for the heuristic engine? TensorFlow or PyTorch?' },
        { author: { name: 'QuantumShield', role: 'Cryptography Researcher' }, content: 'A 40% reduction is significant. Are you training on labeled malware samples or using unsupervised anomaly detection?' },
        { author: { name: 'Sentinel_AI', role: 'Security Architect' }, content: 'Great questions! Using PyTorch with a hybrid approach — supervised for known families, autoencoder for anomaly detection on novel threats.' },
    ],
    1: [
        { author: { name: 'NetWarden', role: 'SOC Analyst' }, content: 'SSRF to cloud metadata is a classic chain. Was IMDSv2 enforced on the instances?' },
        { author: { name: 'CryptoPhantom', role: 'Penetration Tester' }, content: 'Nope, they were still on IMDSv1. Grabbed the IAM role creds in seconds. That was the critical finding.' },
        { author: { name: 'CloudNinja', role: 'DevSecOps Engineer' }, content: 'This is exactly why we enforce IMDSv2 via SCP. No exceptions. Block that metadata endpoint!' },
        { author: { name: 'ZeroCool', role: 'Bug Bounty Hunter' }, content: 'Nice find! SSRF is still one of the most underrated vulnerability classes. OWASP put it in the Top 10 for a reason.' },
    ],
    2: [
        { author: { name: 'CyberSensei', role: 'Instructor' }, content: 'Least privilege is taught in every course, yet violated in every org. It\'s a culture problem more than a technical one.' },
        { author: { name: 'ByteGuardian', role: 'Student' }, content: 'How do you audit service account permissions effectively? Any tools you recommend?' },
        { author: { name: 'NetWarden', role: 'SOC Analyst' }, content: 'We use a combo of CrowdStrike Falcon + custom SOAR playbooks. Also, IAM Access Analyzer in AWS is a lifesaver.' },
    ],
    3: [
        { author: { name: 'PhishHunter', role: 'Instructor' }, content: 'Congratulations! Security+ is a great foundation. If you need CySA+ study material, DM me!' },
        { author: { name: 'ZeroCool', role: 'Bug Bounty Hunter' }, content: 'Awesome achievement! 🎉 The journey from Sec+ to CySA+ is smooth. You\'ll love the hands-on analysis portions.' },
        { author: { name: 'CyberSensei', role: 'Instructor' }, content: 'Well done! Remember, certifications open doors but real-world practice keeps them open. Keep labbing!' },
        { author: { name: 'MalwareMonk', role: 'Malware Analyst' }, content: 'Welcome to the certified club! The real learning starts now. Good luck on CySA+.' },
    ],
    4: [
        { author: { name: 'CryptoPhantom', role: 'Penetration Tester' }, content: '$5K for an XSS? Nice payout! Was it stored or reflected?' },
        { author: { name: 'ZeroCool', role: 'Bug Bounty Hunter' }, content: 'Stored XSS in the checkout flow. It could exfiltrate credit card data via a crafted payload. That\'s why the bounty was high.' },
        { author: { name: 'Sentinel_AI', role: 'Security Architect' }, content: 'This is why Content Security Policy headers are critical. A strict CSP would have mitigated this entirely.' },
    ],
    5: [
        { author: { name: 'MalwareMonk', role: 'Malware Analyst' }, content: 'Key sizes for IoT is a real concern. Have you looked at XMSS as an alternative for constrained devices?' },
        { author: { name: 'QuantumShield', role: 'Cryptography Researcher' }, content: 'XMSS is interesting but stateful, which creates its own operational challenges on IoT. SPHINCS+ might be the safer bet, despite being slower.' },
    ],
    6: [
        { author: { name: 'ByteGuardian', role: 'Student' }, content: 'Registered!! Can\'t wait for the CTF! Any prep resources you\'d recommend for beginners?' },
        { author: { name: 'PhishHunter', role: 'Instructor' }, content: 'Check out PicoCTF and OverTheWire for warm-up. Our beginner track will have hints too. See you there!' },
        { author: { name: 'CloudNinja', role: 'DevSecOps Engineer' }, content: 'I\'ll be there! Looking forward to defending my team\'s undefeated streak 😤' },
    ],
    7: [
        { author: { name: 'Sentinel_AI', role: 'Security Architect' }, content: 'Per-file AES keys with RSA wrapping is unfortunately very robust encryption. Recovery without the private key is basically impossible.' },
        { author: { name: 'CryptoPhantom', role: 'Penetration Tester' }, content: 'The Windows Update disguise is clever social engineering. Users will click anything that says "Security Update Required".' },
        { author: { name: 'NetWarden', role: 'SOC Analyst' }, content: 'We flagged a similar dropper last week. It was delivered via a compromised npm package. Supply chain attacks are escalating.' },
    ],
    8: [
        { author: { name: 'CyberSensei', role: 'Instructor' }, content: 'This is great work! Just starred the repo. Would love to see a GCP version too.' },
        { author: { name: 'NetWarden', role: 'SOC Analyst' }, content: 'We were looking for exactly this! Going to integrate it into our CI/CD pipeline. Thanks for open-sourcing!' },
    ],
    9: [
        { author: { name: 'ByteGuardian', role: 'Student' }, content: 'This advice is gold. I\'ve been so focused on offensive skills, but you\'re right — defense is where the jobs are.' },
        { author: { name: 'PhishHunter', role: 'Instructor' }, content: '100% agree. The best pen testers I know started as SOC analysts. Understanding defense makes your attacks more realistic.' },
        { author: { name: 'MalwareMonk', role: 'Malware Analyst' }, content: 'Purple teaming is the future. Offense and defense working together in continuous feedback loops.' },
    ],
};
// ----------- end seed data -----------------------------------------------


export const CommunityPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [postCategory, setPostCategory] = useState<'social' | 'technical'>('social');
    const [postTags, setPostTags] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'social' | 'technical'>('all');

    // Per-post expanded comments state
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
    const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ---- Load posts ---------------------------------------------------
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            let fetched = await communityService.getPosts();

            // Seed if empty
            if (fetched.length === 0) {
                try {
                    // Create posts in order and collect IDs for comment seeding
                    const createdPosts: Post[] = [];
                    for (const seed of SEED_POSTS) {
                        const created = await communityService.createPost(seed);
                        createdPosts.push(created);
                    }

                    // Seed comments
                    for (const [indexStr, comments] of Object.entries(SEED_COMMENTS)) {
                        const postIndex = parseInt(indexStr, 10);
                        const post = createdPosts[postIndex];
                        if (!post) continue;
                        for (const commentData of comments) {
                            await communityService.createComment({
                                post_id: post.id,
                                ...commentData,
                            });
                        }
                    }

                    fetched = await communityService.getPosts();
                } catch (err) {
                    console.error('Seeding community data failed:', err);
                }
            }

            // Randomise likes for seeded posts that still have 0 likes (makes it look alive)
            for (const p of fetched) {
                if (p.likes === 0 && p.content !== newPostContent) {
                    p.likes = Math.floor(Math.random() * 80) + 5;
                }
            }

            setPosts(fetched);
            setLoading(false);
        };
        load();

        // Realtime subscription
        const sub = communityService.subscribeToPosts(() => {
            communityService.getPosts().then(setPosts);
        });
        return () => { sub.unsubscribe(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Create post --------------------------------------------------
    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || submitting) return;
        setSubmitting(true);
        try {
            const tags = postTags
                .split(',')
                .map(t => t.trim().replace(/^#/, ''))
                .filter(Boolean);
            const created = await communityService.createPost({
                author: {
                    name: user?.name || 'Operative',
                    role: user?.role === 'teacher' ? 'Instructor' : 'Student',
                },
                content: newPostContent,
                tags: tags.length ? tags : ['General'],
                category: postCategory,
            });
            setPosts(prev => [created, ...prev]);
            setNewPostContent('');
            setPostTags('');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Like post ----------------------------------------------------
    const handleLike = async (postId: string) => {
        if (likedPosts.has(postId)) return;
        setLikedPosts(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        await communityService.likePost(postId);
    };

    // ---- Share post ---------------------------------------------------
    const handleShare = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            await navigator.clipboard?.writeText(`${post.author.name}: "${post.content.slice(0, 100)}…"`);
        }
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
        await communityService.sharePost(postId);
    };

    // ---- Toggle comments section --------------------------------------
    const toggleComments = async (postId: string) => {
        const isOpen = expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: !isOpen }));

        if (!isOpen && !postComments[postId]) {
            setLoadingComments(prev => ({ ...prev, [postId]: true }));
            const comments = await communityService.getComments(postId);
            setPostComments(prev => ({ ...prev, [postId]: comments }));
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    // ---- Submit comment -----------------------------------------------
    const handleCommentSubmit = async (postId: string) => {
        const text = commentInputs[postId]?.trim();
        if (!text) return;
        setSubmittingComment(prev => ({ ...prev, [postId]: true }));
        try {
            const comment = await communityService.createComment({
                post_id: postId,
                author: {
                    name: user?.name || 'Operative',
                    role: user?.role === 'teacher' ? 'Instructor' : 'Student',
                },
                content: text,
            });
            setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(prev => ({ ...prev, [postId]: false }));
        }
    };

    // ---- Filtered posts -----------------------------------------------
    const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

    // ---- All unique tags from posts -----------------------------------
    const trendingTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 12);

    // ---- Render -------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#00FF88]/30">
            <SEO
                title="Community Page"
                description="Connect with elite operatives. Share threat intel, bounties, and strategies in the global cybersecurity network."
            />
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8808_1px,transparent_1px),linear-gradient(to_bottom,#00FF8808_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-[#00FF88]/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-[#00FF88]/10 rounded-full transition-colors text-[#00FF88]">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white">Community Page</h1>
                            <p className="text-xs text-[#00B37A]/60 mt-0.5">{posts.length} transmissions • Real-time feed</p>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-1 bg-[#0A0F0A] rounded-lg p-1 border border-[#00FF88]/10">
                        {(['all', 'social', 'technical'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${filter === f
                                    ? 'bg-[#00FF88]/15 text-[#00FF88]'
                                    : 'text-[#EAEAEA]/40 hover:text-[#EAEAEA]/70'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Create Post */}
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-5">
                            <form onSubmit={handlePostSubmit}>
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex-shrink-0 flex items-center justify-center">
                                        <User className="h-5 w-5 text-[#00FF88]" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            ref={textareaRef}
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="Transmit intel to the network..."
                                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#EAEAEA] placeholder-[#00B37A]/30 resize-none min-h-[70px] text-sm"
                                        />
                                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#00FF88]/10">
                                            <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                                                <Tag className="h-3.5 w-3.5 text-[#00B37A]/50" />
                                                <input
                                                    value={postTags}
                                                    onChange={(e) => setPostTags(e.target.value)}
                                                    placeholder="Tags (comma separated)"
                                                    className="bg-transparent text-xs text-[#EAEAEA]/70 placeholder-[#00B37A]/25 focus:outline-none flex-1"
                                                />
                                            </div>
                                            <select
                                                value={postCategory}
                                                onChange={(e) => setPostCategory(e.target.value as 'social' | 'technical')}
                                                className="bg-[#0A0F0A] border border-[#00FF88]/15 rounded-md px-2 py-1 text-[10px] uppercase tracking-widest text-[#00B37A] focus:outline-none"
                                            >
                                                <option value="social">Social</option>
                                                <option value="technical">Technical</option>
                                            </select>
                                            <button
                                                type="submit"
                                                disabled={!newPostContent.trim() || submitting}
                                                className="px-5 py-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                Transmit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-7 w-7 animate-spin text-[#00FF88]/60" />
                                <span className="ml-3 text-sm text-[#00B37A]/50">Loading feed…</span>
                            </div>
                        )}

                        {/* Posts */}
                        {!loading && filtered.map(post => (
                            <div key={post.id} className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-5 hover:border-[#00FF88]/25 transition-all group">
                                {/* Author row */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-sm font-bold text-[#00FF88]">
                                        {post.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">{post.author.name}</h3>
                                        <p className="text-[10px] text-[#00B37A]/60 uppercase tracking-widest">{post.author.role} • {post.timestamp}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold ${post.category === 'technical'
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }`}>
                                        {post.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="text-[#EAEAEA]/80 text-sm mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-[#00FF88]/5 border border-[#00FF88]/15 rounded-full text-[10px] text-[#00B37A]/70">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions row */}
                                <div className="flex items-center gap-5 text-[#00B37A]/60 border-t border-[#00FF88]/5 pt-3">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-1.5 transition-colors text-xs ${likedPosts.has(post.id)
                                            ? 'text-[#00FF88]'
                                            : 'hover:text-[#00FF88]'
                                            }`}
                                    >
                                        <ThumbsUp className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center gap-1.5 hover:text-[#00FF88] transition-colors text-xs"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{post.comments}</span>
                                        {expandedComments[post.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                    <button
                                        onClick={() => handleShare(post.id)}
                                        className="flex items-center gap-1.5 hover:text-[#00FF88] transition-colors text-xs"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span>{post.shares}</span>
                                    </button>
                                </div>

                                {/* Comments section */}
                                {expandedComments[post.id] && (
                                    <div className="mt-4 pt-3 border-t border-[#00FF88]/10 space-y-3">
                                        {loadingComments[post.id] && (
                                            <div className="flex items-center gap-2 py-3 justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#00FF88]/50" />
                                                <span className="text-[11px] text-[#00B37A]/40">Loading replies…</span>
                                            </div>
                                        )}

                                        {/* Comment list */}
                                        {(postComments[post.id] || []).map(comment => (
                                            <div key={comment.id} className="flex gap-2.5 pl-2">
                                                <div className="h-7 w-7 rounded-full bg-[#00FF88]/5 border border-[#00FF88]/10 flex items-center justify-center text-[10px] font-bold text-[#00FF88]/70 flex-shrink-0 mt-0.5">
                                                    {comment.author.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xs font-bold text-white/90">{comment.author.name}</span>
                                                        <span className="text-[9px] text-[#00B37A]/40">{comment.author.role} • {comment.timestamp}</span>
                                                    </div>
                                                    <p className="text-[12px] text-[#EAEAEA]/65 mt-0.5 leading-relaxed">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* New comment input */}
                                        <div className="flex gap-2 pt-2">
                                            <div className="h-7 w-7 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center flex-shrink-0">
                                                <User className="h-3.5 w-3.5 text-[#00FF88]" />
                                            </div>
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCommentSubmit(post.id)}
                                                    placeholder="Add a reply…"
                                                    className="flex-1 bg-[#111611] border border-[#00FF88]/10 rounded-lg px-3 py-1.5 text-xs text-[#EAEAEA] placeholder-[#00B37A]/25 focus:outline-none focus:border-[#00FF88]/30"
                                                />
                                                <button
                                                    onClick={() => handleCommentSubmit(post.id)}
                                                    disabled={!commentInputs[post.id]?.trim() || submittingComment[post.id]}
                                                    className="px-3 py-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 rounded-lg transition-all disabled:opacity-30"
                                                >
                                                    {submittingComment[post.id]
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00FF88]" />
                                                        : <Send className="h-3.5 w-3.5 text-[#00FF88]" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {!loading && filtered.length === 0 && (
                            <div className="text-center py-20 text-[#00B37A]/40 text-sm">
                                No transmissions found for this filter.
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Trending Tags */}
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-4 w-4 text-[#00FF88]" />
                                <h3 className="text-[#00FF88] font-bold uppercase tracking-widest text-xs">Trending Tags</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(trendingTags.length > 0 ? trendingTags : ['ZeroDay', 'CyberSec', 'Web3', 'AI', 'Security']).map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-full text-[10px] text-[#00B37A] cursor-pointer hover:bg-[#00FF88]/10 transition-all">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Community Stats */}
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-5">
                            <h3 className="text-[#00FF88] font-bold uppercase tracking-widest text-xs mb-4">Network Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#EAEAEA]/50">Total Posts</span>
                                    <span className="text-sm font-bold text-white">{posts.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#EAEAEA]/50">Active Operatives</span>
                                    <span className="text-sm font-bold text-white">{new Set(posts.map(p => p.author.name)).size}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#EAEAEA]/50">Total Intel Shares</span>
                                    <span className="text-sm font-bold text-white">{posts.reduce((a, p) => a + p.likes, 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-2xl p-5">
                            <h3 className="text-[#00FF88] font-bold uppercase tracking-widest text-xs mb-4">Top Operatives</h3>
                            <div className="space-y-2.5">
                                {Array.from(new Map(posts.map(p => [p.author.name, p.author]))).slice(0, 5).map(([name, author], i) => (
                                    <div key={name} className="flex items-center gap-2.5">
                                        <span className="text-[10px] font-bold text-[#00FF88]/50 w-4">{i + 1}.</span>
                                        <div className="h-7 w-7 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[10px] font-bold text-[#00FF88]">
                                            {name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white/90 truncate">{name}</p>
                                            <p className="text-[9px] text-[#00B37A]/50">{author.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
