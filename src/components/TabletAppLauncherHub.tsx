import React, { useState } from 'react';
import {
  Gamepad2,
  Music,
  Play,
  MapPin,
  Globe,
  SlidersHorizontal,
  Wifi,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Sparkles,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { InstalledAppItem, SongRequest } from '../types/kiosk';
import { launchTabletApp } from '../utils/appLauncher';
import { playCabinChime } from '../utils/cabinAudio';

interface TabletAppLauncherHubProps {
  apps: InstalledAppItem[];
  onSongRequest: (request: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
  onOpenGallery: () => void;
  onOpenWifi: () => void;
  onOpenComfort: () => void;
}

export const TabletAppLauncherHub: React.FC<TabletAppLauncherHubProps> = ({
  apps,
  onSongRequest,
  onOpenGallery,
  onOpenWifi,
  onOpenComfort,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [launchToast, setLaunchToast] = useState<{ title: string; message: string } | null>(null);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');

  // Filter only apps that are not hidden from passengers
  const visibleApps = apps.filter((app) => !app.isHiddenFromPassengers);

  // Category counts
  const categoryCounts = {
    all: visibleApps.length,
    games: visibleApps.filter((a) => a.category === 'games').length,
    music: visibleApps.filter((a) => a.category === 'music').length,
    google: visibleApps.filter((a) => a.category === 'google').length,
    entertainment: visibleApps.filter((a) => a.category === 'entertainment').length,
    utilities: visibleApps.filter((a) => a.category === 'utilities').length,
  };

  // Filtered list
  const filteredApps = visibleApps.filter((app) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunch = (app: InstalledAppItem) => {
    launchTabletApp(app, {
      onOpenGallery,
      onOpenWifi,
      onOpenComfort,
      onSongRequest: () => setIsSongRequestOpen(true),
      onNotifyLaunch: (appName, msg) => {
        setLaunchToast({ title: appName, message: msg });
        setTimeout(() => setLaunchToast(null), 3500);
      },
    });
  };

  const handleQuickSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    playCabinChime('song');
    onSongRequest({
      title: songTitle.trim(),
      artist: songArtist.trim() || 'Passenger Request',
      genre: 'Tablet Audio Request',
      note: 'Requested from Tablet Launcher Hub',
    });

    setLaunchToast({
      title: 'Song Request Sent',
      message: `"${songTitle}" queued for Carlos!`,
    });
    setTimeout(() => setLaunchToast(null), 3500);
    setSongTitle('');
    setSongArtist('');
    setIsSongRequestOpen(false);
  };

  // Helper to render app icon
  const renderAppIcon = (app: InstalledAppItem) => {
    if (app.iconType === 'spotify') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#1db954] flex items-center justify-center shadow-md shadow-[#1db954]/25 shrink-0">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-slate-950">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
          </svg>
        </div>
      );
    }
    if (app.iconType === 'playstore') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 text-white">
          <Gamepad2 className="w-6 h-6" />
        </div>
      );
    }
    if (app.iconType === 'youtube') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-600/25 shrink-0 text-white">
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </div>
      );
    }
    if (app.iconType === 'maps') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 text-white">
          <MapPin className="w-6 h-6" />
        </div>
      );
    }
    if (app.iconType === 'chrome') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-500 to-blue-500 flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 text-white">
          <Globe className="w-6 h-6" />
        </div>
      );
    }
    if (app.iconType === 'netflix') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-red-600/50 flex items-center justify-center shadow-md shadow-red-900/40 shrink-0 text-red-600 font-black text-xl font-display">
          N
        </div>
      );
    }
    if (app.iconType === 'translate') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0 text-white">
          <Globe className="w-6 h-6" />
        </div>
      );
    }
    if (app.iconType === 'games') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 text-white">
          <Gamepad2 className="w-6 h-6" />
        </div>
      );
    }
    if (app.packageName === 'internal.gallery') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 text-white">
          <ImageIcon className="w-6 h-6" />
        </div>
      );
    }
    if (app.packageName === 'internal.comfort') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 text-white">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
      );
    }
    if (app.packageName === 'internal.wifi') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0 text-white">
          <Wifi className="w-6 h-6" />
        </div>
      );
    }

    // Default icon
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0 text-white">
        <Sparkles className="w-6 h-6" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors overflow-hidden">
      {/* Top Banner: Spotify & Games Quick Launch Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 mb-3.5">
        {/* Spotify Tablet App Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 p-4 border border-[#1db954]/40 flex items-center justify-between gap-3 shadow-sm overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#1db954]/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#1db954] flex items-center justify-center shadow-md shadow-[#1db954]/30 shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-slate-950">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] bg-[#1db954]/10 px-2 py-0.5 rounded-full border border-[#1db954]/30">
                Tablet App Installed
              </span>
              <h3 className="text-sm font-bold text-white font-display mt-0.5 truncate">
                Spotify In-Cabin
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Stream on vehicle sound system
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0 z-10">
            <button
              onClick={() => {
                const spotifyApp = apps.find((a) => a.id === 'app-spotify');
                if (spotifyApp) handleLaunch(spotifyApp);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-slate-950 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-[#1db954]/20"
            >
              <span>Open App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSongRequestOpen(true)}
              className="text-[10px] text-slate-400 hover:text-white underline text-center"
            >
              Ask Carlos for Song
            </button>
          </div>
        </div>

        {/* Download Tablet Games Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 p-4 border border-indigo-500/40 flex items-center justify-between gap-3 shadow-sm overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0 text-white">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Tablet Game Area
              </span>
              <h3 className="text-sm font-bold text-white font-display mt-0.5 truncate">
                Download Any Games
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Subway Surfers, Candy Crush, Chess & more
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const playApp = apps.find((a) => a.id === 'app-play-games');
              if (playApp) handleLaunch(playApp);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-indigo-500/30 shrink-0 z-10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Play Store</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search Strip */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Apps ({categoryCounts.all})
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('games');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'games'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Games & Store ({categoryCounts.games})</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('music');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'music'
                ? 'bg-[#1db954] text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music ({categoryCounts.music})</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('google');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Apps ({categoryCounts.google})</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('entertainment');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'entertainment'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Video ({categoryCounts.entertainment})</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('utilities');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'utilities'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cabin Perks ({categoryCounts.utilities})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-44 sm:w-52 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps & games..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Main Apps & Games Touch Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-3 pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleLaunch(app)}
              className="group relative p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 text-left active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {renderAppIcon(app)}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate group-hover:text-sky-500 transition-colors">
                      {app.name}
                    </h4>
                    {app.badge && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {app.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 group-hover:bg-sky-500 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-400">
                <span className="font-mono text-[9px] truncate max-w-[140px]">
                  {app.packageName.startsWith('internal.') ? 'In-Cabin Action' : app.packageName}
                </span>
                <span className="font-bold text-sky-500 group-hover:underline flex items-center gap-0.5">
                  <span>Open</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Gamepad2 className="w-10 h-10 stroke-1 mb-2 text-slate-500" />
            <p className="text-sm font-bold text-slate-300">No apps or games match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try another keyword or select All Apps above</p>
          </div>
        )}
      </div>

      {/* Floating Status Notification Toast */}
      {launchToast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl border border-sky-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
          <div>
            <p className="text-xs font-bold text-sky-400">{launchToast.title}</p>
            <p className="text-xs text-slate-200">{launchToast.message}</p>
          </div>
        </div>
      )}

      {/* Quick Song Request Modal to Carlos */}
      {isSongRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-slate-950">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Ask Carlos for a Track
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Will be sent to Carlos's driver queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSongRequestOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuickSongSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Song Title or Track Name *
                </label>
                <input
                  type="text"
                  required
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="e.g. Blinding Lights, Hotel California, Bad Bunny..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1db954]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Artist or Band (Optional)
                </label>
                <input
                  type="text"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  placeholder="e.g. The Weeknd, Eagles, Spotify Playlist..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1db954]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-slate-950 font-bold text-xs tracking-tight transition-all active:scale-95 shadow-md shadow-[#1db954]/20 cursor-pointer"
              >
                Send Request to Carlos
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
