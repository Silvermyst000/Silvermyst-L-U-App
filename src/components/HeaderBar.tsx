import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Wifi,
  Thermometer,
  Clock,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  Tablet,
} from 'lucide-react';
import { SilverMistLogo } from './SilverMistLogo';
import { playCabinChime } from '../utils/cabinAudio';

interface HeaderBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  pendingRequestsCount: number;
  onOpenDriverQueue: () => void;
  onOpenWifiModal: () => void;
  onOpenPassengerRequests: () => void;
  viewMode: 'balanced' | 'carlos-expanded' | 'carlos-full';
  onViewModeChange: (mode: 'balanced' | 'carlos-expanded' | 'carlos-full') => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isDark,
  onToggleTheme,
  pendingRequestsCount,
  onOpenDriverQueue,
  onOpenWifiModal,
  onOpenPassengerRequests,
  viewMode,
  onViewModeChange,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFullscreen = () => {
    playCabinChime('tap');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <header className="h-18 px-5 sm:px-6 shrink-0 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-between gap-4 transition-colors duration-200 select-none z-20">
      {/* Zone 1: Brand Wordmark & Crest */}
      <div className="flex items-center gap-4 shrink-0">
        <SilverMistLogo size="sm" showSubtitle={true} />
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium">Executive In-Cabin Passenger Suite</span>
        </div>
      </div>

      {/* Zone 2: Real-time In-Cabin Environmental Indicators */}
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="tabular-nums font-bold text-slate-800 dark:text-slate-100 text-sm">{timeStr || '12:00 PM'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <Thermometer className="w-4 h-4 text-sky-500" />
          <span className="tabular-nums text-sm font-semibold">71°F Climate</span>
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            onOpenWifiModal();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400 shadow-2xs"
          title="Vehicle 5G Guest Wi-Fi"
        >
          <Wifi className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline font-bold text-sm">Guest Wi-Fi Active</span>
          <span className="md:hidden font-bold text-sm">Wi-Fi</span>
        </button>

        {/* Passenger Requests Button: Volume up/down, too cold/hot, any other request */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onOpenPassengerRequests();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:brightness-110 active:scale-97 text-white font-extrabold text-sm tracking-tight shadow-sm transition-all cursor-pointer border border-sky-400/40"
          title="Request volume up/down, cabin temp too cold/hot, or any other request"
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span>Passenger Requests</span>
        </button>

        {/* View Layout Split Mode Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => {
              playCabinChime('tap');
              onViewModeChange('carlos-expanded');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'carlos-expanded'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Spacious Showcase for Carlos and Services"
          >
            Showcase (Expanded)
          </button>
          <button
            onClick={() => {
              playCabinChime('tap');
              onViewModeChange('balanced');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'balanced'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Equal 50/50 Split Screen"
          >
            50/50 Split
          </button>
        </div>
      </div>

      {/* Zone 3: Tablet Controls & Driver Notification Indicator */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* Driver Queue Trigger (so Carlos can see passenger requests or passenger can view request status) */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onOpenDriverQueue();
          }}
          className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
          title="Open Driver Queue & Requests Log"
        >
          <Bell className="w-4 h-4 text-sky-500" />
          <span className="hidden lg:inline">Driver Queue</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 tabular-nums animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        {/* Night / Dim Mode Toggle (essential for night driving so tablet doesn't blind driver) */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onToggleTheme();
          }}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          aria-label={isDark ? 'Switch to daylight cabin mode' : 'Switch to night driving dim mode'}
          title={isDark ? 'Daylight Mode' : 'Night Dim Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Fullscreen Kiosk Mode Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          aria-label={isFullscreen ? 'Exit fullscreen kiosk' : 'Enter 10-inch fullscreen kiosk'}
          title="Tablet Kiosk Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
