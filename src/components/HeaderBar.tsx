import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Globe,
  MessageSquarePlus,
  MessageCircle,
  Palette,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { SilverMistLogo } from './SilverMistLogo';
import { DashboardClockButton } from './DashboardClockButton';
import { playCabinChime } from '../utils/cabinAudio';
import { CloudSyncState, CabinThemeMode, SupportedLanguage } from '../types/kiosk';
import { CABIN_THEMES, KIOSK_TRANSLATIONS } from '../data/cabinThemes';

interface HeaderBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  pendingRequestsCount?: number;
  onOpenDriverQueue?: () => void;
  onOpenWifiModal: () => void;
  onOpenPassengerRequests: () => void;
  viewMode: 'balanced' | 'carlos-expanded' | 'carlos-full';
  onViewModeChange: (mode: 'balanced' | 'carlos-expanded' | 'carlos-full') => void;
  onOpenAdminDashboard?: () => void;
  onOpenWeatherModal?: () => void;
  onOpenTranslateModal?: () => void;
  onOpenFeedbackModal?: () => void;
  onOpenDriverChat?: () => void;
  isChatDismissed?: boolean;
  language?: SupportedLanguage;
  cabinTheme?: CabinThemeMode;
  onSelectCabinTheme?: (theme: CabinThemeMode) => void;
  cloudSyncState?: CloudSyncState;
  easyView?: boolean;
  onToggleEasyView?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenPassengerRequests,
  viewMode,
  onViewModeChange,
  onOpenAdminDashboard,
  onOpenWeatherModal,
  onOpenTranslateModal,
  onOpenFeedbackModal,
  language = 'en',
  cabinTheme = 'royal_purple',
  onSelectCabinTheme,
  cloudSyncState = 'synced',
  easyView = false,
  onToggleEasyView,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const scrollStripRef = useRef<HTMLDivElement>(null);

  const t = KIOSK_TRANSLATIONS[language] || KIOSK_TRANSLATIONS.en;

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

  const scrollStrip = (dir: 'left' | 'right') => {
    playCabinChime('tap');
    if (!scrollStripRef.current) return;
    scrollStripRef.current.scrollBy({
      left: dir === 'left' ? -180 : 180,
      behavior: 'smooth',
    });
  };

  const activeThemeConfig = CABIN_THEMES[cabinTheme] || CABIN_THEMES.royal_purple;

  return (
    <header className="min-h-16 sm:h-18 px-2.5 sm:px-4 py-1.5 sm:py-0 shrink-0 border-b cabin-header backdrop-blur-md flex items-center justify-center transition-colors duration-200 select-none z-30 relative">
      <div className="w-full max-w-[2400px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Zone 1: Brand Wordmark & Live Clickable Timezone Clock Anchored Right Beside Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <SilverMistLogo size="sm" showSubtitle={false} />
          <DashboardClockButton />
        </div>

        {/* Zone 2: Centered & Expandable Horizontal Scrollable Kiosk Bar */}
        <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => scrollStrip('left')}
            className="hidden sm:flex p-1.5 rounded-lg cabin-panel border hover:opacity-90 shrink-0 cursor-pointer"
            aria-label="Scroll left"
            title="Scroll toolbar left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={scrollStripRef}
            className="flex-1 min-w-0 flex overflow-x-auto scrollbar-none py-1 scroll-smooth"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium mx-auto w-max px-1">
              {/* Live Weather */}
              <button
                onClick={() => {
                  playCabinChime('tap');
                  onOpenWeatherModal?.();
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl cabin-panel border hover:brightness-105 shadow-2xs transition-all cursor-pointer group shrink-0"
                title="Tap to view Live Weather & 7-Day Forecast"
              >
                <Thermometer className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                <span className="tabular-nums text-xs font-bold">71°F</span>
                <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
                  {t.weather}
                </span>
              </button>

              {/* Unified Requests & Driver Chat Button (Combined to avoid duplicate buttons) */}
              <button
                onClick={() => {
                  playCabinChime('tap');
                  onOpenPassengerRequests();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl cabin-primary-btn hover:brightness-110 active:scale-97 font-extrabold text-xs tracking-tight shadow-sm transition-all cursor-pointer border border-white/20 shrink-0 whitespace-nowrap"
                title="Open Passenger Requests & Direct Driver Chat"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{t.passengerRequests}</span>
              </button>

              {/* Google Translate System Language Switcher */}
              {onOpenTranslateModal && (
                <button
                  onClick={() => {
                    playCabinChime('tap');
                    onOpenTranslateModal();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  title="Activate Google Translate & Change System Language"
                >
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span>{t.translate}</span>
                  <span className="text-[9px] font-black uppercase px-1 rounded bg-sky-500 text-white">
                    {language}
                  </span>
                </button>
              )}

              {/* Easy Clean View (Accessibility: Larger Text & Cleaner Layout) */}
              {onToggleEasyView && (
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    onToggleEasyView();
                  }}
                  aria-pressed={easyView}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    easyView
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                  }`}
                  title="Switch to Easy View (larger buttons, bigger text, cleaner layout)"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>{easyView ? 'Easy View: ON' : 'Easy View'}</span>
                </button>
              )}

              {/* Suggest / Review Feedback Button */}
              {onOpenFeedbackModal && (
                <button
                  onClick={() => {
                    playCabinChime('tap');
                    onOpenFeedbackModal();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  title="Request a Feature or Send Feedback"
                >
                  <MessageSquarePlus className="w-4 h-4 text-amber-500" />
                  <span>{t.feedback}</span>
                </button>
              )}

              {/* View Layout Split Mode Switcher */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-xl cabin-panel border shrink-0">
                <button
                  onClick={() => {
                    playCabinChime('tap');
                    onViewModeChange('carlos-expanded');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'carlos-expanded'
                      ? 'cabin-primary-btn shadow-xs font-extrabold'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {t.showcaseExpanded}
                </button>
                <button
                  onClick={() => {
                    playCabinChime('tap');
                    onViewModeChange('balanced');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'balanced'
                      ? 'cabin-primary-btn shadow-xs font-extrabold'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {t.splitScreen}
                </button>
              </div>

              {/* Live Cloud Sync Indicator */}
              <div
                className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold select-none transition-colors shrink-0 ${
                  cloudSyncState === 'synced'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : cloudSyncState === 'saving'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : cloudSyncState === 'offline'
                    ? 'bg-slate-200/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-500'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
                title="Real-time multi-tablet cloud synchronization"
              >
                {cloudSyncState === 'synced' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                {cloudSyncState === 'saving' && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {cloudSyncState === 'offline' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                {cloudSyncState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                <span>
                  {cloudSyncState === 'synced'
                    ? 'Cloud Synced'
                    : cloudSyncState === 'saving'
                    ? 'Saving...'
                    : cloudSyncState === 'offline'
                    ? 'Offline'
                    : 'Sync Alert'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollStrip('right')}
            className="hidden sm:flex p-1.5 rounded-lg cabin-panel border hover:opacity-90 shrink-0 cursor-pointer"
            aria-label="Scroll right"
            title="Scroll toolbar right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zone 3: Compact Display Utilities & Secured Admin Access (No Alert Bell on Passenger Side) */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
        {/* Multi-Color Cabin Theme Selector */}
        {onSelectCabinTheme && (
          <div className="relative">
            <button
              onClick={() => {
                playCabinChime('tap');
                setIsThemeMenuOpen(!isThemeMenuOpen);
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl cabin-panel border transition-colors cursor-pointer text-xs font-bold"
              title="Customize Cabin Color Theme & Event Background"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/60 shrink-0"
                style={{ backgroundColor: activeThemeConfig.primaryColor }}
              />
              <Palette className="w-4 h-4" style={{ color: 'var(--cabin-accent)' }} />
              <span className="hidden xl:inline">{t.theme}</span>
            </button>

            {isThemeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsThemeMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl cabin-card border shadow-2xl p-3 z-50 space-y-2 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider cabin-text-muted">
                      {t.theme} ({isDark ? 'Night' : 'Day'})
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {(Object.values(CABIN_THEMES) as typeof CABIN_THEMES[CabinThemeMode][]).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          playCabinChime('acknowledged');
                          onSelectCabinTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          cabinTheme === theme.id
                            ? 'cabin-badge ring-1 ring-current'
                            : 'cabin-panel hover:brightness-105'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg shrink-0 border border-white/30 flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                            }}
                          >
                            {cabinTheme === theme.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{theme.name}</div>
                            <div className="text-[10px] cabin-text-muted truncate">{theme.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Night / Dim Mode Toggle */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onToggleTheme();
          }}
          className="p-2 rounded-xl cabin-panel border transition-colors cursor-pointer"
          aria-label={isDark ? 'Switch to daylight cabin mode' : 'Switch to night driving dim mode'}
          title={isDark ? 'Daylight Mode' : 'Night Dim Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-700" />}
        </button>

        {/* Fullscreen Kiosk Mode Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden sm:flex p-2 rounded-xl cabin-panel border transition-colors cursor-pointer"
          aria-label={isFullscreen ? 'Exit fullscreen kiosk' : 'Enter 10-inch fullscreen kiosk'}
          title="Fullscreen Kiosk"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Remote Web Administration Dashboard Switcher */}
        {onOpenAdminDashboard && (
          <button
            onClick={() => {
              playCabinChime('tap');
              onOpenAdminDashboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-extrabold rounded-xl cabin-badge border hover:brightness-110 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Open Remote Web Administration Dashboard"
          >
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--cabin-accent)' }} />
            <span className="hidden lg:inline">{t.adminPortal}</span>
          </button>
        )}
        </div>
      </div>
    </header>
  );
};


