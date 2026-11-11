import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  ExternalLink,
  Layers,
  Clock,
  Car,
  Plane,
  Building,
  Utensils,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface MapDestination {
  id: string;
  name: string;
  category: 'Airport' | 'Downtown' | 'Dining' | 'Attraction';
  eta: string;
  distance: string;
  address: string;
  lat: number;
  lng: number;
}

const CITY_DESTINATIONS: MapDestination[] = [
  {
    id: 'm1',
    name: 'Metro International Airport (Terminal 1 & 2)',
    category: 'Airport',
    eta: '18 min',
    distance: '14.2 mi',
    address: 'International Airport Pkwy',
    lat: 34.05,
    lng: -118.25,
  },
  {
    id: 'm2',
    name: 'Downtown Financial & Arts Plaza',
    category: 'Downtown',
    eta: '9 min',
    distance: '4.8 mi',
    address: 'Grand Ave & 5th St',
    lat: 34.052,
    lng: -118.245,
  },
  {
    id: 'm3',
    name: 'Taqueria El Sol (Carlos’s Top Pick)',
    category: 'Dining',
    eta: '6 min',
    distance: '2.1 mi',
    address: '4th & Main Street',
    lat: 34.048,
    lng: -118.248,
  },
  {
    id: 'm4',
    name: 'City Convention & Exhibition Center',
    category: 'Attraction',
    eta: '12 min',
    distance: '6.4 mi',
    address: '1201 S Figueroa St',
    lat: 34.04,
    lng: -118.269,
  },
];

export const GoogleMapsApp: React.FC = () => {
  const [selectedDest, setSelectedDest] = useState<MapDestination>(CITY_DESTINATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState<'traffic' | 'satellite' | 'standard'>('traffic');

  const handleLaunchGoogleMaps = (query?: string) => {
    playCabinChime('tap');
    const destinationName = query || selectedDest.name;
    const encoded = encodeURIComponent(destinationName);

    // Check if on Android to open Android Maps Intent, fallback to Google Maps Web
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = `google.navigation:q=${encoded}`;
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    }
  };

  const filteredDests = searchQuery.trim()
    ? CITY_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CITY_DESTINATIONS;

  return (
    <div className="flex flex-col h-full space-y-3.5 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
      {/* Google Maps Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md p-1.5">
            {/* Google Maps Pin Icon */}
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-display">
              Google Maps Live Route
            </h3>
            <p className="text-[10px] text-slate-400">
              In-Cabin GPS Navigation & ETA Explorer
            </p>
          </div>
        </div>

        <button
          onClick={() => handleLaunchGoogleMaps()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Open Google Maps App on tablet"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any destination, airport terminal, or address..."
          className="w-full pl-9 pr-24 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        {searchQuery && (
          <button
            onClick={() => handleLaunchGoogleMaps(searchQuery)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 text-[10px] font-bold cursor-pointer"
          >
            Go
          </button>
        )}
      </div>

      {/* Interactive Map Visual Simulation Canvas */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
        {/* Vector Stylized Map Grid */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="#090d16" />
          <rect width="100%" height="100%" fill="url(#mapGrid)" />

          {/* Simulated Highways & Boulevards */}
          <path d="M-20 60 Q 140 100 280 40 T 600 90" fill="none" stroke="#1e293b" strokeWidth="12" />
          <path d="M-20 60 Q 140 100 280 40 T 600 90" fill="none" stroke="#334155" strokeWidth="6" />

          <path d="M80 180 Q 200 90 320 150 T 540 60" fill="none" stroke="#1e293b" strokeWidth="10" />
          <path d="M80 180 Q 200 90 320 150 T 540 60" fill="none" stroke="#334155" strokeWidth="5" />

          {/* Active Navigation Route Line (Animated Green / Cyan) */}
          <path
            d="M 60 130 C 120 110, 180 80, 240 90 S 340 120, 420 50"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6,4"
            className="animate-pulse"
          />

          {/* Vehicle Indicator (Carlos's Sedan) */}
          <g transform="translate(60, 130)">
            <circle cx="0" cy="0" r="12" fill="#38bdf8" fillOpacity="0.25" className="animate-ping" />
            <circle cx="0" cy="0" r="7" fill="#38bdf8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* Destination Pin */}
          <g transform="translate(420, 50)">
            <path
              d="M0 -18 C -7 -18 -11 -13 -11 -7 C -11 1 0 10 0 10 C 0 10 11 1 11 -7 C 11 -13 7 -18 0 -18 Z"
              fill="#ef4444"
            />
            <circle cx="0" cy="-8" r="4" fill="#ffffff" />
          </g>
        </svg>

        {/* Live GPS HUD Overlay */}
        <div className="absolute top-2.5 left-2.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs flex items-center gap-2">
          <Car className="w-4 h-4 text-sky-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">Current In-Transit Vehicle</span>
            <span className="font-bold text-white text-xs">Silvermyst Sedan • GPS Locked</span>
          </div>
        </div>

        {/* Selected Destination ETA Chip */}
        <div className="absolute bottom-2.5 right-2.5 px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">To {selectedDest.name.split('(')[0]}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-emerald-400 text-sm tabular-nums">{selectedDest.eta}</span>
              <span className="text-slate-400 text-[11px] tabular-nums">({selectedDest.distance})</span>
            </div>
          </div>
          <button
            onClick={() => handleLaunchGoogleMaps(selectedDest.name)}
            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer"
            title="Start Navigation in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Popular Metro Destinations Quick List */}
      <div className="space-y-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-display">
          Tap Destination for Route & ETA
        </span>
        <div className="flex-1 overflow-y-auto space-y-2 max-h-36 pr-1">
          {filteredDests.map((dest) => {
            const isSelected = selectedDest.id === dest.id;
            return (
              <div
                key={dest.id}
                onClick={() => {
                  playCabinChime('tap');
                  setSelectedDest(dest);
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500/70 shadow-xs'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-sky-400">
                    {dest.category === 'Airport' && <Plane className="w-4 h-4 text-sky-400" />}
                    {dest.category === 'Downtown' && <Building className="w-4 h-4 text-amber-400" />}
                    {dest.category === 'Dining' && <Utensils className="w-4 h-4 text-emerald-400" />}
                    {dest.category === 'Attraction' && <Compass className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {dest.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {dest.address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400 tabular-nums block">
                    {dest.eta}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {dest.distance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
