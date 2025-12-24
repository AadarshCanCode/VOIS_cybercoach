import React, { useState, useEffect } from 'react';
import { Play, Search, Film, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { fetchVideosFromImageKit, type ImageKitVideo } from '../../../services/imagekitService';

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<ImageKitVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ImageKitVideo | null>(null);
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
      // Fetch from ImageKit folder - just dump videos in /cybercoach
      const fetchedVideos = await fetchVideosFromImageKit('/cybercoach');
      setVideos(fetchedVideos);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from videos dynamically
  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredVideos = videos.filter(video => {
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch = s === '' || video.title.toLowerCase().includes(s) || video.description.toLowerCase().includes(s);
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
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

  if (selectedVideo) {
    return (
      <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedVideo(null)}
            className="flex items-center space-x-2 text-[#00FF88] hover:text-[#00CC66] transition-colors mb-6 font-mono uppercase tracking-wider text-sm"
          >
            <span>← Back to Videos</span>
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

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Video <span className="text-[#00FF88]">Library</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">Browse and watch videos • {videos.length} files</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadVideos}
              className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center hover:bg-[#00FF88]/20 transition-colors"
              title="Refresh videos"
            >
              <RefreshCw className="h-4 w-4 text-[#00FF88]" />
            </button>
            <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
              <Film className="h-5 w-5 text-[#00FF88]" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00B37A] group-focus-within:text-[#00FF88] transition-colors" />
                <input
                  type="text"
                  placeholder="SEARCH DATABASE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] placeholder-[#00B37A]/50 font-mono text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00B37A]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] appearance-none font-mono text-sm cursor-pointer hover:border-[#00FF88]/40 transition-colors"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category === 'all' ? 'ALL CATEGORIES' : category.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00B37A]" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] appearance-none font-mono text-sm cursor-pointer hover:border-[#00FF88]/40 transition-colors"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty === 'all' ? 'ALL LEVELS' : difficulty.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden cursor-pointer hover:border-[#00FF88]/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 group"
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                  <div className="bg-[#00FF88] rounded-full p-4 shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                    <Play className="h-6 w-6 text-black fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/80 border border-[#00FF88]/30 text-[#00FF88] px-2 py-1 rounded text-xs font-mono">
                  {video.duration}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white group-hover:text-[#00FF88] transition-colors line-clamp-2 text-lg tracking-tight">
                    {video.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#00B37A]/30 bg-[#00B37A]/10 text-[#00B37A]">
                    {video.category}
                  </span>
                </div>

                <p className="text-[#00B37A] text-sm mb-2 line-clamp-2 leading-relaxed">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && videos.length > 0 && (
          <div className="text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
            <div className="text-[#00FF88]/20 mb-6">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No Videos Found</h3>
            <p className="text-[#00B37A]">Try adjusting your search or filter options.</p>
          </div>
        )}

        {/* No Videos State */}
        {videos.length === 0 && !loading && (
          <div className="text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
            <div className="text-[#00FF88]/20 mb-6">
              <Film className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No Videos Available</h3>
            <p className="text-[#00B37A] mb-4">Upload videos to your ImageKit folder to see them here.</p>
            <p className="text-[#EAEAEA]/50 text-sm font-mono">Folder: /cybercoach</p>
            <p className="text-[#EAEAEA]/40 text-xs font-mono mt-2">Naming format: Category_Difficulty_Title.mp4</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;