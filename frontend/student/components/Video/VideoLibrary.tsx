import React, { useState } from 'react';
import { Play, Clock, User, Search, BookOpen, Film, Filter } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | string;
  views: number;
  uploadDate: string;
  videoUrl: string;
}

const videoLibrary: Video[] = [
  {
    id: '1',
    title: 'Intro to OWASP Top 10',
    description: 'Understand the OWASP Top 10 vulnerabilities and how to mitigate them.',
    instructor: 'Security Academy',
    duration: '12:34',
    thumbnail: 'https://img.youtube.com/vi/1/maxresdefault.jpg',
    category: 'OWASP Top 10',
    difficulty: 'beginner',
    views: 45230,
    uploadDate: '2023-06-05',
    videoUrl: 'https://www.youtube.com/watch?v=example1'
  },
  {
    id: '2',
    title: 'Cryptography Basics',
    description: 'A practical guide to modern cryptography concepts and primitives.',
    instructor: 'CryptoLab',
    duration: '28:10',
    thumbnail: 'https://img.youtube.com/vi/2/maxresdefault.jpg',
    category: 'Cryptography',
    difficulty: 'intermediate',
    views: 98765,
    uploadDate: '2023-02-14',
    videoUrl: 'https://www.youtube.com/watch?v=example2'
  },
  {
    id: '3',
    title: 'Practical Penetration Testing',
    description: 'Hands-on exercises and tools for real-world penetration testing.',
    instructor: 'PentestPro',
    duration: '45:12',
    thumbnail: 'https://img.youtube.com/vi/3/maxresdefault.jpg',
    category: 'Penetration Testing',
    difficulty: 'advanced',
    views: 210000,
    uploadDate: '2022-11-02',
    videoUrl: 'https://www.youtube.com/watch?v=example3'
  }
];

export const VideoLibrary: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', 'OWASP Top 10', 'Cryptography', 'Penetration Testing', 'Tools', 'Web Security'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredVideos = videoLibrary.filter(video => {
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

  if (selectedVideo) {
    return (
      <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedVideo(null)}
            className="flex items-center space-x-2 text-[#00FF88] hover:text-[#00CC66] transition-colors mb-6 font-mono uppercase tracking-wider text-sm"
          >
            <span>← Return to Archives</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="rounded-xl overflow-hidden border border-[#00FF88]/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                <VideoPlayer
                  videoUrl={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  onProgress={() => { }}
                  onComplete={() => { }}
                />
              </div>

              <div className="mt-8">
                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{selectedVideo.title}</h1>
                <div className="flex items-center space-x-6 text-sm text-[#EAEAEA]/60 font-mono mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#00FF88]" />
                    <span>{selectedVideo.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-[#00FF88]" />
                    <span>{selectedVideo.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-[#00FF88]" />
                    <span>{selectedVideo.views.toLocaleString()} VIEWS</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(selectedVideo.difficulty)}`}>
                    {selectedVideo.difficulty}
                  </span>
                </div>
                <div className="p-6 bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10">
                  <p className="text-[#00B37A] leading-relaxed">{selectedVideo.description}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Related Intel</h3>
              <div className="space-y-4">
                {videoLibrary
                  .filter(v => v.id !== selectedVideo.id && v.category === selectedVideo.category)
                  .slice(0, 3)
                  .map(video => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="cursor-pointer group bg-[#0A0F0A] rounded-lg border border-[#00FF88]/10 hover:border-[#00FF88]/30 overflow-hidden transition-all"
                    >
                      <div className="aspect-video bg-black relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-[#00FF88] fill-current" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-[#EAEAEA] text-sm group-hover:text-[#00FF88] transition-colors line-clamp-1">
                          {video.title}
                        </h4>
                        <p className="text-[10px] text-[#00B37A] font-mono mt-1">{video.duration}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
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
              Intel <span className="text-[#00FF88]">Archives</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">CLASSIFIED VIDEO DATABASE</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <Film className="h-5 w-5 text-[#00FF88]" />
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

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </span>
                </div>

                <p className="text-[#00B37A] text-sm mb-4 line-clamp-2 leading-relaxed">{video.description}</p>

                <div className="flex items-center justify-between text-xs text-[#EAEAEA]/50 font-mono border-t border-[#00FF88]/10 pt-3">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 text-[#00FF88]" />
                    <span>{video.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3 text-[#00FF88]" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
            <div className="text-[#00FF88]/20 mb-6">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No Intel Found</h3>
            <p className="text-[#00B37A]">Adjust search parameters to locate classified files.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;