import React, { useState, useEffect } from 'react';
import { Play, Search, Film, RefreshCw, AlertTriangle, LayoutGrid, List, Shield, Database, Globe } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { fetchVideosFromImageKit, type ImageKitVideo } from '@services/imagekitService';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Card, CardContent } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs-default';
import { cn } from '@lib/utils';
import { Skeleton } from '@components/ui/skeleton';

export const VideoLibrary: React.FC = () => {
  type ViewMode = 'grid' | 'list';
  // Define extended video type locally to include source
  type ExtendedVideo = ImageKitVideo & { source: 'VU' | 'General' };

  const [allVideos, setAllVideos] = useState<ExtendedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedVideo, setSelectedVideo] = useState<ImageKitVideo | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vuFetched, othersFetched] = await Promise.all([
        fetchVideosFromImageKit('/VU'),
        fetchVideosFromImageKit('/cybercoach')
      ]);

      const merged: ExtendedVideo[] = [
        ...vuFetched.map(v => ({ ...v, source: 'VU' as const })),
        ...othersFetched.map(v => ({ ...v, source: 'General' as const }))
      ];
      setAllVideos(merged);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load mission briefings. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(allVideos.map(v => v.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filterVideos = (videoList: ExtendedVideo[]) => {
    return videoList.filter(video => {
      const s = searchTerm.trim().toLowerCase();
      const matchesSearch = s === '' || video.title.toLowerCase().includes(s) || video.description.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  // Get videos based on current tab
  const getDisplayVideos = () => {
    if (activeTab === 'vu') return filterVideos(allVideos.filter(v => v.source === 'VU'));
    if (activeTab === 'external') return filterVideos(allVideos.filter(v => v.source === 'General'));
    return filterVideos(allVideos);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400/20 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/20 bg-slate-400/10';
    }
  };

  const DEFAULT_PLACEHOLDER = '/video-placeholder.png'; // Should ideally allow specific placeholders per source

  // Video Grid/List Renderer
  const VideoGrid = ({ videos }: { videos: ExtendedVideo[] }) => {
    if (videos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border border-dashed border-[#00FF88]/10 rounded-xl bg-[#0A0F0A]/30">
          <Film className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-sm font-mono uppercase tracking-widest text-[#00B37A]/70">No videos found</p>
        </div>
      );
    }

    return (
      <div className={cn(
        "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className={cn(
              "group relative bg-[#0A0F0A] border rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
              viewMode === 'grid'
                ? "border-[#00FF88]/10 hover:border-[#00FF88]/40 hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] hover:-translate-y-1"
                : "flex hover:bg-[#00FF88]/5 border-[#00FF88]/10 items-center p-2",
              video.source === 'VU' && "border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
            )}
          >
            {/* VU Marker */}
            {video.source === 'VU' && viewMode === 'grid' && (
              <div className="absolute top-2 left-2 z-10 bg-indigo-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-400/50 shadow-lg backdrop-blur-sm flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> VU OFFICIAL
              </div>
            )}

            {/* Thumbnail */}
            <div className={cn(
              "relative overflow-hidden bg-black",
              viewMode === 'grid' ? "aspect-video w-full" : "h-24 w-40 shrink-0 rounded-lg"
            )}>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                onError={(e) => (e.target as HTMLImageElement).src = DEFAULT_PLACEHOLDER}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={cn(
                  "h-10 w-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
                  video.source === 'VU' ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]"
                )}>
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/80 border border-white/10 backdrop-blur-md">
                {video.duration}
              </div>
            </div>

            {/* Content */}
            <div className={cn("flex-1", viewMode === 'grid' ? "p-5 space-y-3" : "px-6 py-2")}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  {viewMode === 'list' && video.source === 'VU' && (
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[9px] px-1 h-4">VU</Badge>
                  )}
                  <h3 className={cn(
                    "font-bold text-white group-hover:text-[#00FF88] transition-colors line-clamp-2",
                    viewMode === 'list' && "text-lg",
                    video.source === 'VU' && "group-hover:text-indigo-400"
                  )}>
                    {video.title}
                  </h3>
                </div>
                {viewMode === 'list' && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{video.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] uppercase", getDifficultyColor(video.difficulty))}>
                  {video.difficulty}
                </Badge>
                <span className="text-[10px] font-mono text-[#00B37A]">{video.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (selectedVideo) {
    return (
      <div className="p-6 md:p-8 min-h-screen animate-in fade-in duration-300">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedVideo(null)}
            className="mb-6 hover:text-[#00FF88] hover:bg-[#00FF88]/10 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Video Library
          </Button>

          <Card className="border-[#00FF88]/20 bg-black/50 overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            <CardContent className="p-0">
              <VideoPlayer
                videoUrl={selectedVideo.videoUrl}
                title={selectedVideo.title}
                onProgress={() => { }}
                onComplete={() => { }}
              />
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">{selectedVideo.title}</h1>
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn("uppercase tracking-wider text-[10px]", getDifficultyColor(selectedVideo.difficulty))}>
                    {selectedVideo.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-[#00FF88]/20 text-[#00B37A] uppercase tracking-wider text-[10px]">
                    {selectedVideo.category}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{selectedVideo.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen animate-in fade-in duration-500 flex flex-col gap-8">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#00FF88]/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
            <Database className="h-8 w-8 text-[#00FF88]" />
            Video <span className="text-[#00FF88]">Library</span>
          </h1>
          <p className="text-[#00B37A] font-mono text-sm tracking-widest pl-11">TRAINING RESOURCES</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-black/40 p-1 rounded-lg border border-[#00FF88]/10 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 hover:bg-[#00FF88]/10 hover:text-[#00FF88]", viewMode === 'grid' && "bg-[#00FF88]/20 text-[#00FF88]")}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 hover:bg-[#00FF88]/10 hover:text-[#00FF88]", viewMode === 'list' && "bg-[#00FF88]/20 text-[#00FF88]")}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={loadVideos} className="h-10 w-10 border-[#00FF88]/20 hover:bg-[#00FF88]/10" title="Refresh Videos">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Tabs & Filters */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <TabsList className="bg-[#0A0F0A] border border-[#00FF88]/10 p-1 h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00FF88]/20 data-[state=active]:text-[#00FF88] px-4 py-2 gap-2">
              <Database className="h-3 w-3" /> ALL VIDEOS
            </TabsTrigger>
            <TabsTrigger value="vu" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 px-4 py-2 gap-2">
              <Shield className="h-3 w-3" /> UNIVERSITY
            </TabsTrigger>
            <TabsTrigger value="external" className="data-[state=active]:bg-[#00B37A]/20 data-[state=active]:text-[#00B37A] px-4 py-2 gap-2">
              <Globe className="h-3 w-3" /> EXTERNAL
            </TabsTrigger>
          </TabsList>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-[#00FF88] transition-colors" />
              <Input
                placeholder="SEARCH VIDEOS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 bg-black border-[#00FF88]/10 focus:border-[#00FF88]/50 text-xs transition-colors placeholder:text-muted-foreground/50"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-black border-[#00FF88]/10">
                <SelectValue placeholder="CATEGORY" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c} className="uppercase text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-black border-[#00FF88]/10">
                <SelectValue placeholder="DIFFICULTY" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(d => <SelectItem key={d} value={d} className="uppercase text-xs">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl bg-[#00FF88]/5" />
                  <Skeleton className="h-4 w-3/4 bg-[#00FF88]/5" />
                  <Skeleton className="h-3 w-1/2 bg-[#00FF88]/5" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4 opacity-80" />
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadVideos} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">Retry Connection</Button>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                <VideoGrid videos={getDisplayVideos()} />
              </TabsContent>
              <TabsContent value="vu" className="mt-0">
                <VideoGrid videos={getDisplayVideos()} />
              </TabsContent>
              <TabsContent value="external" className="mt-0">
                <VideoGrid videos={getDisplayVideos()} />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default VideoLibrary;