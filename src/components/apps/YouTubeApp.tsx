import React, { useState } from 'react';
import {
  Play,
  Pause,
  ExternalLink,
  Search,
  Maximize2,
  Tv,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  category: 'Scenic' | 'Music' | 'Travel' | 'Podcast';
  gradient: string;
  badge: string;
}

const YOUTUBE_CABIN_VIDEOS: VideoItem[] = [
  {
    id: 'yt1',
    title: '4K Ultra HD Coastal Highway Sunset Drive • Ambient Cabin Music',
    channel: 'Pacific Scenic Drives',
    views: '2.4M views',
    duration: '45:12',
    category: 'Scenic',
    gradient: 'from-amber-600 via-rose-700 to-indigo-950',
    badge: '4K HDR',
  },
  {
    id: 'yt2',
    title: 'Top 10 Hidden Secret Places & Eateries in the Metro Area 2026',
    channel: 'Urban Traveler Guides',
    views: '840K views',
    duration: '14:20',
    category: 'Travel',
    gradient: 'from-sky-600 via-blue-800 to-slate-950',
    badge: 'Guide',
  },
  {
    id: 'yt3',
    title: 'Late Night Chillwave & Lo-Fi Beats to Relax / Study / Roadtrip',
    channel: 'ChilledCow / Lofi Girl',
    views: '12M views',
    duration: '1:20:00',
    category: 'Music',
    gradient: 'from-purple-700 via-indigo-900 to-slate-950',
    badge: 'Live Radio',
  },
  {
    id: 'yt4',
    title: 'The Art of Modern Hospitality & Executive Transportation',
    channel: 'Founder Stories & Business',
    views: '320K views',
    duration: '18:45',
    category: 'Podcast',
    gradient: 'from-emerald-700 via-slate-800 to-slate-950',
    badge: 'Documentary',
  },
];

export const YouTubeApp: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(YOUTUBE_CABIN_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Scenic' | 'Music' | 'Travel'>('All');

  const handleLaunchYouTube = (title?: string) => {
    playCabinChime('tap');
    const q = title ? encodeURIComponent(title) : '';
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = title ? `vnd.youtube://results?search_query=${q}` : 'vnd.youtube://';
    } else {
      openExternalUrl(title ? `https://www.youtube.com/results?search_query=${q}` : 'https://www.youtube.com');
    }
  };

  const filteredVideos = YOUTUBE_CABIN_VIDEOS.filter((v) => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-3.5 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
      {/* YouTube App Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/20">
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-display">
              YouTube In-Cabin
            </h3>
            <p className="text-[10px] text-slate-400">
              Passenger Entertainment & Video Hub
            </p>
          </div>
        </div>

        <button
          onClick={() => handleLaunchYouTube()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Open YouTube App on tablet"
        >
          <span>Open YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Video Player Deck */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-md group shrink-0">
        <div
          className={`w-full h-full bg-gradient-to-tr ${selectedVideo.gradient} flex items-center justify-center relative`}
        >
          {/* Subtle animated scan lines / glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />

          {/* Video Title Banner */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/20">
              {selectedVideo.badge}
            </span>
            <span className="text-[10px] text-white/80 tabular-nums bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
              {selectedVideo.duration}
            </span>
          </div>

          {/* Central Play/Pause Trigger */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setIsPlaying((prev) => !prev);
            }}
            className="w-13 h-13 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer z-10"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Bottom Title Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <h4 className="text-xs font-bold text-white truncate font-display">
                {selectedVideo.title}
              </h4>
              <p className="text-[10.5px] text-slate-300">
                {selectedVideo.channel} · {selectedVideo.views}
              </p>
            </div>
            <button
              onClick={() => handleLaunchYouTube(selectedVideo.title)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs shrink-0 cursor-pointer"
              title="Watch in full YouTube app"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex items-center gap-1.5 shrink-0">
        {(['All', 'Scenic', 'Music', 'Travel'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playCabinChime('tap');
              setActiveCategory(cat);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-white text-slate-950 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Related Video Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {filteredVideos.map((vid) => {
          const isSelected = selectedVideo.id === vid.id;
          return (
            <div
              key={vid.id}
              onClick={() => {
                playCabinChime('tap');
                setSelectedVideo(vid);
                setIsPlaying(true);
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-red-500/70 shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-14 h-10 rounded-lg bg-gradient-to-tr ${vid.gradient} flex items-center justify-center shrink-0 border border-slate-700/60 relative`}
                >
                  <Play className="w-3.5 h-3.5 text-white/90 fill-white" />
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-black/80 px-1 rounded text-white">
                    {vid.duration}
                  </span>
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {vid.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {vid.channel} · {vid.views}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchYouTube(vid.title);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
