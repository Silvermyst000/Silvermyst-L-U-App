import React, { useState } from 'react';
import {
  X,
  Search,
  Music,
  MapPin,
  Play,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  CloudSun,
  Plane,
  Calculator,
  Trophy,
  Wifi,
  Sparkles,
  ExternalLink,
  Briefcase,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

export interface AppDrawerItem {
  id: string;
  name: string;
  category: 'Entertainment' | 'Navigation' | 'Utility' | 'Host & Services';
  icon: React.ReactNode;
  bgGradient: string;
  description: string;
  badge?: string;
  actionType: 'tab' | 'modal' | 'external';
  targetTab?: string;
  targetModal?: string;
  externalUrl?: string;
}

interface MoreAppsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: AppDrawerItem) => void;
}

export const MORE_APPS_LIST: AppDrawerItem[] = [
  {
    id: 'app-spotify',
    name: 'Spotify',
    category: 'Entertainment',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
      </svg>
    ),
    bgGradient: 'from-emerald-500 to-green-600',
    description: 'Listen to music & podcasts or queue songs for Carlos',
    badge: 'Popular',
    actionType: 'tab',
    targetTab: 'spotify',
  },
  {
    id: 'app-maps',
    name: 'Google Maps',
    category: 'Navigation',
    icon: <MapPin className="w-5 h-5 text-white" />,
    bgGradient: 'from-blue-500 to-indigo-600',
    description: 'Live in-cabin GPS route tracker, ETA, and landmark guide',
    badge: 'Live GPS',
    actionType: 'tab',
    targetTab: 'maps',
  },
  {
    id: 'app-youtube',
    name: 'YouTube',
    category: 'Entertainment',
    icon: <Play className="w-5 h-5 fill-white text-white" />,
    bgGradient: 'from-red-500 to-rose-600',
    description: 'Passenger 4K scenic videos, music hits, and local guides',
    badge: 'HD Video',
    actionType: 'tab',
    targetTab: 'youtube',
  },
  {
    id: 'app-translate',
    name: 'Google Translate',
    category: 'Utility',
    icon: <Globe className="w-5 h-5 text-white" />,
    bgGradient: 'from-sky-500 to-blue-600',
    description: 'Bilingual in-cabin translation with native voice speech',
    badge: 'Voice Audio',
    actionType: 'tab',
    targetTab: 'translate',
  },
  {
    id: 'app-gallery',
    name: 'Photo Gallery',
    category: 'Host & Services',
    icon: <ImageIcon className="w-5 h-5 text-white" />,
    bgGradient: 'from-amber-500 to-orange-600',
    description: 'Browse photos of Carlos, the executive vehicle, and road trips',
    badge: '5 Photos',
    actionType: 'modal',
    targetModal: 'gallery',
  },
  {
    id: 'app-weather',
    name: 'Live Weather',
    category: 'Utility',
    icon: <CloudSun className="w-5 h-5 text-white" />,
    bgGradient: 'from-sky-400 to-cyan-600',
    description: 'Hourly metro temperature, forecast & flight weather',
    actionType: 'modal',
    targetModal: 'weather',
  },
  {
    id: 'app-flight',
    name: 'Flight Tracker',
    category: 'Utility',
    icon: <Plane className="w-5 h-5 text-white" />,
    bgGradient: 'from-indigo-500 to-violet-600',
    description: 'Check airport arrivals, terminal departures, and delays',
    badge: 'Airport Info',
    actionType: 'modal',
    targetModal: 'flight',
  },
  {
    id: 'app-calculator',
    name: 'Fare & Tip Split',
    category: 'Utility',
    icon: <Calculator className="w-5 h-5 text-white" />,
    bgGradient: 'from-teal-500 to-emerald-600',
    description: 'Easily calculate and split ride fares and tips with friends',
    actionType: 'modal',
    targetModal: 'calculator',
  },
  {
    id: 'app-trivia',
    name: 'Cabin Trivia',
    category: 'Entertainment',
    icon: <Trophy className="w-5 h-5 text-white" />,
    bgGradient: 'from-purple-500 to-pink-600',
    description: 'Fun 60-second in-ride quiz to pass the time',
    actionType: 'tab',
    targetTab: 'trivia',
  },
  {
    id: 'app-comfort',
    name: 'Passenger Requests',
    category: 'Utility',
    icon: <SlidersHorizontal className="w-5 h-5 text-white" />,
    bgGradient: 'from-blue-600 to-indigo-800',
    description: 'Raise/lower volume, too cold/hot temp, or send custom note to Carlos',
    actionType: 'tab',
    targetTab: 'comfort',
  },
  {
    id: 'app-wifi',
    name: 'Wi-Fi & Perks',
    category: 'Utility',
    icon: <Wifi className="w-5 h-5 text-white" />,
    bgGradient: 'from-slate-700 to-slate-900',
    description: 'Connect to 5G vehicle hotspot and view complimentary amenities',
    actionType: 'modal',
    targetModal: 'wifi',
  },
  {
    id: 'app-services',
    name: 'Silvermyst Services',
    category: 'Host & Services',
    icon: <Briefcase className="w-5 h-5 text-white" />,
    bgGradient: 'from-slate-800 to-slate-950',
    description: 'Private airport chauffeur, computer repair, webmaster & design',
    badge: 'Book Direct',
    actionType: 'modal',
    targetModal: 'services',
  },
];

export const MoreAppsDrawerModal: React.FC<MoreAppsDrawerModalProps> = ({
  isOpen,
  onClose,
  onSelectApp,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Entertainment', 'Navigation', 'Utility', 'Host & Services'];

  const filteredApps = MORE_APPS_LIST.filter((app) => {
    const matchesCat = filterCategory === 'All' || app.category === filterCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                More Apps Available
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tablet Kiosk App Drawer • Tap Any App to Launch
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="my-3 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search available apps..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playCabinChime('tap');
                  setFilterCategory(cat);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1 min-h-0">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                playCabinChime('tap');
                onSelectApp(app);
              }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition-all active:scale-97 cursor-pointer flex flex-col justify-between group min-h-[105px]"
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${app.bgGradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  {app.icon}
                </div>
                {app.badge && (
                  <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 border border-sky-200/60 dark:border-sky-800/60">
                    {app.badge}
                  </span>
                )}
              </div>

              <div className="mt-2 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate font-display group-hover:text-sky-500 transition-colors">
                  {app.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {app.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
