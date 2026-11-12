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
  ChevronRight,
  ChevronLeft,
  Grid,
  Camera,
  Layers,
  CloudSun,
} from 'lucide-react';
import { InstalledAppItem, SongRequest } from '../types/kiosk';
import { launchTabletApp } from '../utils/appLauncher';
import { playCabinChime } from '../utils/cabinAudio';

interface TabletAppLauncherHubProps {
  apps: InstalledAppItem[];
  onSongRequest: (request: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
  onOpenGallery: () => void;
  onOpenWifi?: () => void;
  onOpenComfort: () => void;
  onOpenWeather?: () => void;
  activeDriverName?: string;
}

export const TabletAppLauncherHub: React.FC<TabletAppLauncherHubProps> = ({
  apps,
  onSongRequest,
  onOpenGallery,
  onOpenComfort,
  onOpenWeather,
  activeDriverName = 'Carlos',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [launchToast, setLaunchToast] = useState<{ title: string; message: string } | null>(null);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const [isMoreAppsModalOpen, setIsMoreAppsModalOpen] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [carouselPage, setCarouselPage] = useState<number>(0);

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

  // Carousel pagination (6 apps per page for 1280x800 landscape layout)
  const APPS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / APPS_PER_PAGE));
  const currentPageApps = filteredApps.slice(
    carouselPage * APPS_PER_PAGE,
    (carouselPage + 1) * APPS_PER_PAGE
  );

  const handleLaunch = (app: InstalledAppItem) => {
    launchTabletApp(app, {
      onOpenGallery,
      onOpenComfort,
      onOpenWeather,
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
      message: `"${songTitle}" queued for ${activeDriverName}!`,
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
    if (app.packageName === 'internal.camera') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 text-white">
          <Camera className="w-6 h-6" />
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
    if (app.packageName === 'internal.weather' || app.id === 'app-weather') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0 text-white">
          <CloudSun className="w-6 h-6" />
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors overflow-hidden">
      {/* Top Banner: Spotify & Games Quick Launch Hero Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 shrink-0 mb-3">
        {/* Spotify Tablet App Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 p-3.5 border border-[#1db954]/40 flex items-center justify-between gap-3 shadow-xs overflow-hidden group">
          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#1db954] flex items-center justify-center shadow-md shadow-[#1db954]/30 shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-slate-950">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#1db954] bg-[#1db954]/10 px-2 py-0.5 rounded-full border border-[#1db954]/30">
                Installed App
              </span>
              <h3 className="text-sm font-bold text-white font-display mt-0.5 truncate">
                Spotify App
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Stream on vehicle audio
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0 z-10">
            <button
              onClick={() => {
                const spotifyApp = apps.find((a) => a.id === 'app-spotify');
                if (spotifyApp) handleLaunch(spotifyApp);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-slate-950 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Open</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSongRequestOpen(true)}
              className="text-[10px] text-slate-400 hover:text-white underline text-center"
            >
              Ask Driver for Song
            </button>
          </div>
        </div>

        {/* Download Tablet Games Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 p-3.5 border border-indigo-500/40 flex items-center justify-between gap-3 shadow-xs overflow-hidden group">
          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0 text-white">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Tablet Game Area
              </span>
              <h3 className="text-sm font-bold text-white font-display mt-0.5 truncate">
                Download Any Games
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Google Play Store Catalog
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const playApp = apps.find((a) => a.id === 'app-play-games');
              if (playApp) handleLaunch(playApp);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 z-10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Play Store</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Quick Controls */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('all');
              setCarouselPage(0);
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
              setCarouselPage(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'games'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Games ({categoryCounts.games})</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory('music');
              setCarouselPage(0);
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
              setCarouselPage(0);
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
        </div>

        {/* View All Grid Trigger & Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              playCabinChime('tap');
              setIsMoreAppsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
            title="Open clean grid of all approved applications"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">More Apps</span>
          </button>

          <div className="relative w-36 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCarouselPage(0);
              }}
              placeholder="Search apps..."
              className="w-full pl-8 pr-2 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Swipeable Carousel View (6 apps per page with page indicators) */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-2.5 pr-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {currentPageApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleLaunch(app)}
              className="group relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2 text-left active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderAppIcon(app)}
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display truncate group-hover:text-sky-500 transition-colors">
                      {app.name}
                    </h4>
                    {app.badge && (
                      <span className="inline-block mt-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {app.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 group-hover:bg-sky-500 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[9.5px] text-slate-400">
                <span className="font-mono truncate max-w-[120px]">
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

        {/* Carousel Pagination Strip with Page Indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              disabled={carouselPage === 0}
              onClick={() => {
                playCabinChime('tap');
                setCarouselPage((prev) => Math.max(0, prev - 1));
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playCabinChime('tap');
                    setCarouselPage(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    carouselPage === idx
                      ? 'w-6 bg-sky-500'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              disabled={carouselPage >= totalPages - 1}
              onClick={() => {
                playCabinChime('tap');
                setCarouselPage((prev) => Math.min(totalPages - 1, prev + 1));
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Status Notification Toast */}
      {launchToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl border border-sky-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <div>
            <p className="text-xs font-bold text-sky-400">{launchToast.title}</p>
            <p className="text-[11px] text-slate-200">{launchToast.message}</p>
          </div>
        </div>
      )}

      {/* Clean Grid of All Approved Applications Modal ("More Apps") */}
      {isMoreAppsModalOpen && (
        <div
          onClick={() => {
            playCabinChime('tap');
            setIsMoreAppsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Approved In-Cabin Applications ({visibleApps.length})
                </h3>
              </div>
              <button
                onClick={() => setIsMoreAppsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visibleApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setIsMoreAppsModalOpen(false);
                    handleLaunch(app);
                  }}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-all active:scale-97 cursor-pointer flex items-center gap-3"
                >
                  {renderAppIcon(app)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {app.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {app.badge || app.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Song Request Modal to Driver */}
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
                    Ask {activeDriverName} for a Track
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Will be sent to driver's dashboard
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
                Send Request to {activeDriverName}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
