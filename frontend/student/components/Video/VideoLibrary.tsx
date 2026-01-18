import React, { useState, useEffect } from 'react';
import { Play, Search, Film, RefreshCw, AlertTriangle, ChevronDown, Lock } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { fetchVideosFromImageKit, type ImageKitVideo } from '../../../services/imagekitService';

export const VideoLibrary: React.FC = () => {
  type ViewState = 'folders' | 'list' | 'player';

  const [vuVideos, setVuVideos] = useState<ImageKitVideo[]>([]);
  const [otherVideos, setOtherVideos] = useState<ImageKitVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('folders');
  const [activeFolder, setActiveFolder] = useState<'VU' | 'Others' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ImageKitVideo | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch videos on mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from both ImageKit folders concurrently
      const [vuFetched, othersFetched] = await Promise.all([
        fetchVideosFromImageKit('/VU'),
        fetchVideosFromImageKit('/cybercoach')
      ]);
      setVuVideos(vuFetched);
      setOtherVideos(othersFetched);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFolderClick = (folder: 'VU' | 'Others') => {
    setActiveFolder(folder);
    setView('list');
  };

  const navigateBack = () => {
    if (view === 'player') {
      setView('list');
      setSelectedVideo(null);
    } else if (view === 'list') {
      setView('folders');
      setActiveFolder(null);
      setExpandedId(null);
    }
  };

  // Combine for global stats and filters
  const allVideos = [...vuVideos, ...otherVideos];

  // Get unique categories from all videos dynamically
  const categories = ['all', ...Array.from(new Set(allVideos.map(v => v.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filterVideos = (videoList: ImageKitVideo[]) => {
    return videoList.filter(video => {
      const s = searchTerm.trim().toLowerCase();
      const matchesSearch = s === '' || video.title.toLowerCase().includes(s) || video.description.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  const currentVideos = activeFolder === 'VU' ? filterVideos(vuVideos) : filterVideos(otherVideos);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  const DEFAULT_PLACEHOLDER = '/video-placeholder.png';

  const renderVideoItem = (video: ImageKitVideo) => {
    const isExpanded = expandedId === video.id;

    return (
      <div
        key={video.id}
        className={`bg-[#0A0F0A] rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-[#00FF88]/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]' : 'border-[#00FF88]/10 hover:border-[#00FF88]/30'}`}
      >
        {/* Main Header / Clickable Area */}
        <div
          onClick={() => toggleExpand(video.id)}
          className="p-4 cursor-pointer flex items-center gap-4 group"
        >
          {/* Compact Thumbnail (Fixed Aspect Ratio for List) */}
          <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#00FF88]/10">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-5 w-5 text-[#00FF88] fill-current" />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[8px] font-mono text-[#00FF88]">
              {video.duration}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white group-hover:text-[#00FF88] transition-colors truncate text-base tracking-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getDifficultyColor(video.difficulty)}`}>
                {video.difficulty}
              </span>
              <span className="text-[#00B37A] text-[10px] font-mono truncate">
                {video.category}
              </span>
            </div>
          </div>

          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4 text-[#00B37A]" />
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] border-t border-[#00FF88]/10 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-6 bg-[#000000]/30">
            <p className="text-[#00B37A] text-sm leading-relaxed mb-6 italic">
              "{video.description}"
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVideo(video);
                  setView('player');
                }}
                className="bg-[#00FF88] hover:bg-[#00CC66] text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] text-sm"
              >
                <Play className="h-4 w-4 fill-current" />
                INITIATE
              </button>
              <div className="text-[10px] text-[#00B37A]/60 font-mono">
                SIZE: {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF88] mx-auto mb-4"></div>
          <p className="text-[#00FF88] font-mono">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-[#00B37A] mb-6">{error}</p>
          <button
            onClick={loadVideos}
            className="bg-[#00FF88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00CC66] transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'player' && selectedVideo) {
    return (
      <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={navigateBack}
            className="flex items-center space-x-2 text-[#00FF88] hover:text-[#00CC66] transition-colors mb-6 font-mono uppercase tracking-wider text-sm"
          >
            <span>← Back to {activeFolder} List</span>
          </button>

          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">{selectedVideo.title}</h1>

          <div className="rounded-xl overflow-hidden border border-[#00FF88]/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
            <VideoPlayer
              videoUrl={selectedVideo.videoUrl}
              title={selectedVideo.title}
              onProgress={() => { }}
              onComplete={() => { }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumbs / Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#00B37A] uppercase tracking-[0.2em] mb-1">
              <span className="cursor-pointer hover:text-[#00FF88]" onClick={() => setView('folders')}>Repositories</span>
              {view === 'list' && (
                <>
                  <span>/</span>
                  <span className="text-[#00FF88]">{activeFolder}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Video <span className="text-[#00FF88]">Library</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {view === 'list' && (
              <button
                onClick={navigateBack}
                className="px-4 py-2 border border-[#00FF88]/20 rounded-lg text-xs font-bold text-[#00FF88] hover:bg-[#00FF88]/10 transition-all uppercase tracking-widest"
              >
                Return
              </button>
            )}
            <button
              onClick={loadVideos}
              className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center hover:bg-[#00FF88]/20 transition-colors"
              title="Refresh videos"
            >
              <RefreshCw className="h-4 w-4 text-[#00FF88]" />
            </button>
          </div>
        </div>

        {/* VIEW: FOLDERS */}
        {view === 'folders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
            {[
              { id: 'VU', label: 'VU Collection', count: vuVideos.length, icon: 'M 3 7 L 3 19 L 21 19 L 21 9 L 11 9 L 9 7 L 3 7 Z', color: '#00FF88', isLocked: false },
              { id: 'Others', label: 'Others Database', count: otherVideos.length, icon: 'M 3 7 L 3 19 L 21 19 L 21 9 L 11 9 L 9 7 L 3 7 Z', color: '#00B37A', isLocked: false }
            ].map((folder) => (
              <button
                key={folder.id}
                onClick={() => !folder.isLocked && handleFolderClick(folder.id as 'VU' | 'Others')}
                className={`group relative bg-[#0A0F0A] border rounded-2xl p-10 text-left transition-all overflow-hidden ${folder.isLocked
                  ? 'border-red-500/20 opacity-60 cursor-not-allowed'
                  : 'border-[#00FF88]/10 hover:border-[#00FF88]/40 hover:shadow-[0_0_40px_rgba(0,255,136,0.05)]'
                  }`}
              >
                {folder.isLocked && (
                  <div className="absolute top-4 right-4 z-20 bg-red-500/10 border border-red-500/40 p-2 rounded-lg text-red-500">
                    <Lock className="h-4 w-4" />
                  </div>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity translate-x-8 -translate-y-8" style={{ color: folder.isLocked ? '#EF4444' : folder.color }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={folder.icon} />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className={`h-16 w-16 mb-6 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-500 ${folder.isLocked
                    ? 'from-red-500/20 to-transparent border-red-500/20 text-red-500'
                    : 'from-[#00FF88]/20 to-transparent border-[#00FF88]/20 text-[#00FF88] group-hover:scale-110'
                    }`}>
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7v12a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-8l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-black uppercase italic tracking-wider mb-2 ${folder.isLocked ? 'text-red-500' : 'text-white'}`}>{folder.label}</h2>
                  <p className={`${folder.isLocked ? 'text-red-500/60' : 'text-[#00B37A]'} font-mono text-xs uppercase tracking-widest`}>
                    {folder.isLocked ? 'Access Restricted' : `${folder.count} Storage Nodes Active`}
                  </p>

                  <div className={`mt-8 flex items-center gap-2 text-[10px] font-bold transition-all translate-x-[-10px] group-hover:translate-x-0 ${folder.isLocked
                    ? 'text-red-500 opacity-100'
                    : 'text-[#00FF88] opacity-0 group-hover:opacity-100'
                    }`}>
                    {folder.isLocked ? 'ENCRYPTED' : 'ACCESS FILES'} <ChevronDown className={`h-3 w-3 -rotate-90 ${folder.isLocked ? 'hidden' : ''}`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* VIEW: LIST */}
        {view === 'list' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Search and Filters */}
            <div className="bg-[#0A0F0A]/50 backdrop-blur-xl border border-[#00FF88]/10 rounded-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00B37A] group-focus-within:text-[#00FF88] transition-colors" />
                <input
                  type="text"
                  placeholder="SEARCH REPOSITORY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-[#00FF88]/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#00FF88] focus:outline-none transition-all placeholder-[#00B37A]/30"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black border border-[#00FF88]/10 rounded-lg px-4 py-2 text-xs font-mono uppercase text-[#00B37A] outline-none cursor-pointer hover:border-[#00FF88]/30 transition-colors"
                >
                  {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'ALL CATEGORIES' : c.toUpperCase()}</option>)}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-black border border-[#00FF88]/10 rounded-lg px-4 py-2 text-xs font-mono uppercase text-[#00B37A] outline-none cursor-pointer hover:border-[#00FF88]/30 transition-colors"
                >
                  {difficulties.map(d => <option key={d} value={d}>{d === 'all' ? 'ALL LEVELS' : d.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {currentVideos.length > 0 ? (
                currentVideos.map(video => renderVideoItem(video))
              ) : (
                <div className="py-20 text-center border border-dashed border-[#00FF88]/10 rounded-2xl bg-[#0A0F0A]/30">
                  <div className="text-[#00FF88]/10 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-[#00B37A]/50 font-mono text-sm uppercase tracking-widest">Zero results found in this sector</p>
                </div>
              )}
            </div>
          </div>
        )}

        {allVideos.length === 0 && !loading && (
          <div className="text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
            <div className="text-[#00FF88]/20 mb-6">
              <Film className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Digital Void Detected</h3>
            <p className="text-[#00B37A] mb-4">No training data found in standard repositories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;