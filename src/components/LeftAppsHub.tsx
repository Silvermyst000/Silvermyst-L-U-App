import React, { useState } from 'react';
import {
  Gamepad2,
  Music,
  MessageSquare,
  Compass,
  Trophy,
  Wifi,
  MapPin,
  Play,
  Globe,
  Grid,
  Sparkles,
  Image as ImageIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { TabletAppLauncherHub } from './TabletAppLauncherHub';
import { GoogleMapsApp } from './apps/GoogleMapsApp';
import { YouTubeApp } from './apps/YouTubeApp';
import { GoogleTranslateApp } from './apps/GoogleTranslateApp';
import { ComfortAndMessages } from './ComfortAndMessages';
import { CabinTrivia } from './CabinTrivia';
import { AmenitiesWifi } from './AmenitiesWifi';
import { CityGuide } from './CityGuide';
import { MoreAppsDrawerModal, AppDrawerItem } from './apps/MoreAppsDrawerModal';
import { WeatherAppModal } from './apps/WeatherAppModal';
import { FlightTrackerModal } from './apps/FlightTrackerModal';
import { FareCalculatorModal } from './apps/FareCalculatorModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { CARLOS_PHOTO_GALLERY } from '../data/mockData';
import { PlaylistTrack, SongRequest, CabinMessage, InstalledAppItem } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';

interface LeftAppsHubProps {
  tracks?: PlaylistTrack[];
  currentTrackIndex?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  songRequests: SongRequest[];
  onSubmitSongRequest: (request: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
  messages: CabinMessage[];
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
  onOpenGallery?: () => void;
  installedApps?: InstalledAppItem[];
}

export const LeftAppsHub: React.FC<LeftAppsHubProps> = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  songRequests,
  onSubmitSongRequest,
  messages,
  onSendMessage,
  onOpenGallery,
  installedApps = [],
}) => {
  const [activeApp, setActiveApp] = useState<'launcher' | 'maps' | 'youtube' | 'translate' | 'gallery' | 'comfort' | 'trivia' | 'guide'>('launcher');

  // Modals for "More Apps Available"
  const [isMoreAppsOpen, setIsMoreAppsOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isFlightOpen, setIsFlightOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [hubGalleryIndex, setHubGalleryIndex] = useState(0);
  const [isHubLightboxOpen, setIsHubLightboxOpen] = useState(false);

  const primaryTabs = [
    {
      id: 'launcher',
      name: 'Apps & Games',
      icon: <Gamepad2 className="w-4.5 h-4.5 text-indigo-500" />,
      activeColor: 'text-indigo-500',
    },
    {
      id: 'maps',
      name: 'Google Maps',
      icon: <MapPin className="w-4.5 h-4.5 text-blue-500" />,
      activeColor: 'text-blue-500',
    },
    {
      id: 'gallery',
      name: 'Photo Gallery',
      icon: <ImageIcon className="w-4.5 h-4.5 text-amber-500" />,
      activeColor: 'text-amber-500',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Play className="w-4.5 h-4.5 fill-red-500 text-red-500" />,
      activeColor: 'text-red-500',
    },
    {
      id: 'translate',
      name: 'Translate',
      icon: <Globe className="w-4.5 h-4.5 text-sky-400" />,
      activeColor: 'text-sky-400',
    },
    {
      id: 'comfort',
      name: 'Cabin Comfort',
      icon: <SlidersHorizontal className="w-4.5 h-4.5 text-teal-400" />,
      activeColor: 'text-teal-400',
    },
  ];

  const handleSelectDrawerApp = (app: AppDrawerItem) => {
    setIsMoreAppsOpen(false);
    if (app.actionType === 'tab' && app.targetTab) {
      setActiveApp(app.targetTab as typeof activeApp);
    } else if (app.actionType === 'modal') {
      if (app.targetModal === 'weather') setIsWeatherOpen(true);
      if (app.targetModal === 'flight') setIsFlightOpen(true);
      if (app.targetModal === 'calculator') setIsCalculatorOpen(true);
      if (app.targetModal === 'wifi') setIsWifiOpen(true);
      if (app.targetModal === 'gallery') {
        setActiveApp('gallery');
        if (onOpenGallery) onOpenGallery();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-4 md:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors overflow-hidden">
      {/* Top Apps Bar with Compact Square Icon for More Apps */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shrink-0 mb-3.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
          {primaryTabs.map((tab) => {
            const isActive = activeApp === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playCabinChime('tap');
                  setActiveApp(tab.id as typeof activeApp);
                }}
                className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Square Icon for "More Apps Available" */}
        <button
          onClick={() => {
            playCabinChime('tap');
            setIsMoreAppsOpen(true);
          }}
          className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
          aria-label="More apps available"
          title="More Apps Available"
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container for Selected App */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeApp === 'launcher' && (
          <TabletAppLauncherHub
            apps={installedApps}
            onSongRequest={onSubmitSongRequest}
            onOpenGallery={() => {
              setActiveApp('gallery');
              if (onOpenGallery) onOpenGallery();
            }}
            onOpenWifi={() => setIsWifiOpen(true)}
            onOpenComfort={() => setActiveApp('comfort')}
            onOpenWeather={() => setIsWeatherOpen(true)}
          />
        )}

        {activeApp === 'maps' && <GoogleMapsApp />}

        {activeApp === 'gallery' && (
          <div className="flex flex-col h-full space-y-3 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white font-display">
                  In-Cabin Photo Gallery
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                5 High-Resolution Photos
              </span>
            </div>

            {/* Featured Photo Frame */}
            <div
              onClick={() => {
                playCabinChime('tap');
                setIsHubLightboxOpen(true);
              }}
              className="relative h-48 rounded-xl overflow-hidden border border-slate-800 cursor-pointer group shrink-0"
            >
              <img
                src={CARLOS_PHOTO_GALLERY[hubGalleryIndex].imageUrl}
                alt={CARLOS_PHOTO_GALLERY[hubGalleryIndex].title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[9px] font-bold text-sky-400 px-2 py-0.5 rounded-full bg-black/60 border border-slate-700">
                  {CARLOS_PHOTO_GALLERY[hubGalleryIndex].tag}
                </span>
                <h4 className="text-sm font-bold mt-1 font-display">
                  {CARLOS_PHOTO_GALLERY[hubGalleryIndex].title}
                </h4>
                <p className="text-[10px] text-slate-300 truncate">
                  {CARLOS_PHOTO_GALLERY[hubGalleryIndex].subtitle}
                </p>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Photo
              </span>
              <div className="grid grid-cols-5 gap-2">
                {CARLOS_PHOTO_GALLERY.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      playCabinChime('tap');
                      setHubGalleryIndex(idx);
                    }}
                    className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      hubGalleryIndex === idx
                        ? 'border-sky-500 scale-103'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {CARLOS_PHOTO_GALLERY[hubGalleryIndex].description}
            </p>

            <PhotoLightboxModal
              photos={CARLOS_PHOTO_GALLERY}
              currentIndex={hubGalleryIndex}
              isOpen={isHubLightboxOpen}
              onClose={() => setIsHubLightboxOpen(false)}
              onSelectIndex={(idx) => setHubGalleryIndex(idx)}
            />
          </div>
        )}

        {activeApp === 'youtube' && <YouTubeApp />}

        {activeApp === 'translate' && <GoogleTranslateApp />}

        {activeApp === 'comfort' && (
          <ComfortAndMessages
            messages={messages}
            onSendMessage={onSendMessage}
          />
        )}

        {activeApp === 'trivia' && <CabinTrivia />}

        {activeApp === 'guide' && <CityGuide />}
      </div>

      {/* More Apps Drawer Modal */}
      <MoreAppsDrawerModal
        isOpen={isMoreAppsOpen}
        onClose={() => setIsMoreAppsOpen(false)}
        onSelectApp={handleSelectDrawerApp}
      />

      {/* Live Weather Modal */}
      <WeatherAppModal
        isOpen={isWeatherOpen}
        onClose={() => setIsWeatherOpen(false)}
        onSendMessage={onSendMessage}
      />

      {/* Flight Tracker Modal */}
      <FlightTrackerModal
        isOpen={isFlightOpen}
        onClose={() => setIsFlightOpen(false)}
      />

      {/* Fare Calculator Modal */}
      <FareCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Wi-Fi & Perks Modal */}
      {isWifiOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Cabin Amenities & Wi-Fi
              </span>
              <button
                onClick={() => setIsWifiOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <AmenitiesWifi />
          </div>
        </div>
      )}
    </div>
  );
};
