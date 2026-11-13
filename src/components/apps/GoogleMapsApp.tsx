import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  ExternalLink,
  Car,
  Plane,
  Building,
  Utensils,
  Loader2,
  Star,
} from 'lucide-react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';
import {
  getMapsConfig,
  geocodeLocationQuery,
  searchGooglePlaces,
} from '../../utils/mapsConfig';

interface MapDestination {
  id: string;
  name: string;
  category: 'Airport' | 'Downtown' | 'Dining' | 'Attraction';
  eta?: string;
  distance?: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  googleMapsUri?: string;
}

const DEFAULT_DESTINATIONS: MapDestination[] = [
  {
    id: 'm1',
    name: 'South Bend International Airport (SBN)',
    category: 'Airport',
    eta: '12 min',
    distance: '4.6 mi',
    address: '4477 Progress Dr, South Bend, IN 46628',
    lat: 41.7089,
    lng: -86.3172,
  },
  {
    id: 'm2',
    name: 'Downtown South Bend & Morris Center',
    category: 'Downtown',
    eta: '6 min',
    distance: '1.5 mi',
    address: '211 N Michigan St, South Bend, IN 46601',
    lat: 41.6783,
    lng: -86.2504,
  },
  {
    id: 'm3',
    name: 'Notre Dame Stadium & Golden Dome',
    category: 'Attraction',
    eta: '9 min',
    distance: '2.8 mi',
    address: '2010 Moose Krause Cir, Notre Dame, IN 46556',
    lat: 41.6984,
    lng: -86.2339,
  },
  {
    id: 'm4',
    name: 'Tippecanoe Place Restaurant',
    category: 'Dining',
    eta: '7 min',
    distance: '1.8 mi',
    address: '620 W Washington St, South Bend, IN 46601',
    lat: 41.6761,
    lng: -86.2588,
  },
];

interface GoogleMapsAppProps {
  easyView?: boolean;
}

export const GoogleMapsApp: React.FC<GoogleMapsAppProps> = ({ easyView = false }) => {
  const [destinations, setDestinations] = useState<MapDestination[]>(DEFAULT_DESTINATIONS);
  const [selectedDest, setSelectedDest] = useState<MapDestination>(DEFAULT_DESTINATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [infoOpenId, setInfoOpenId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_DESTINATIONS[0].lat,
    lng: DEFAULT_DESTINATIONS[0].lng,
  });

  useEffect(() => {
    let mounted = true;
    getMapsConfig().then((cfg) => {
      if (mounted && cfg.configured && cfg.apiKey) {
        setMapsApiKey(cfg.apiKey);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLaunchGoogleMaps = (dest?: MapDestination, rawQuery?: string) => {
    playCabinChime('tap');
    if (dest?.googleMapsUri) {
      openExternalUrl(dest.googleMapsUri);
      return;
    }
    const target = rawQuery || (dest ? `${dest.name} ${dest.address}` : selectedDest.name);
    const encoded = encodeURIComponent(target);

    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = `google.navigation:q=${encoded}`;
    } else {
      openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setDestinations(DEFAULT_DESTINATIONS);
      return;
    }
    playCabinChime('tap');
    setSearching(true);

    // First try geocoding if it looks like a ZIP code or city, then run Places API (New) text search
    let centerBias = mapCenter;
    if (/^\d{5}$/.test(q) || q.includes(',')) {
      const geo = await geocodeLocationQuery(q);
      if (geo) {
        centerBias = { lat: geo.lat, lng: geo.lng };
        setMapCenter(centerBias);
      }
    }

    const placesRes = await searchGooglePlaces({
      query: q,
      lat: centerBias.lat,
      lng: centerBias.lng,
    });

    if (placesRes.places.length > 0) {
      const mapped: MapDestination[] = placesRes.places.map((p) => ({
        id: p.id,
        name: p.name,
        category: 'Attraction',
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        rating: p.rating,
        googleMapsUri: p.googleMapsUri,
      }));
      setDestinations(mapped);
      setSelectedDest(mapped[0]);
      setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng });
      setInfoOpenId(mapped[0].id);
    }
    setSearching(false);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden ${easyView ? 'p-4 space-y-4' : 'p-4 space-y-3'}`}>
      {/* Google Maps Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`${easyView ? 'w-10 h-10 p-2' : 'w-8 h-8 p-1.5'} rounded-full bg-white flex items-center justify-center shadow-md shrink-0`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#EA4335" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className={`${easyView ? 'text-base sm:text-lg' : 'text-sm'} font-bold tracking-tight text-white font-display truncate`}>
              Google Maps Live Route
            </h3>
            {!easyView && (
              <p className="text-[10px] text-slate-400 truncate">
                In-Cabin GPS Navigation &amp; Place Explorer
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchGoogleMaps(selectedDest)}
          className={`flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 ${
            easyView ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
          }`}
          title="Open Google Maps App on tablet"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input Bar (Geocoding + Places API New via proxy) */}
      <form onSubmit={handleSearchSubmit} className="relative shrink-0 flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination, ZIP code, airport, or restaurant..."
            className={`w-full pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 ${
              easyView ? 'py-2.5 text-sm' : 'py-2 text-xs'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className={`rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-extrabold cursor-pointer shrink-0 flex items-center gap-1.5 ${
            easyView ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-2 text-xs'
          }`}
        >
          {searching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Find</span>
        </button>
      </form>

      {/* Interactive Google Map Canvas with explicit height */}
      <div className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0 ${easyView ? 'h-56 sm:h-64' : 'h-48 sm:h-56'}`}>
        {mapsApiKey ? (
          <APIProvider apiKey={mapsApiKey}>
            <GoogleMap
              key={`${mapCenter.lat.toFixed(4)}-${mapCenter.lng.toFixed(4)}`}
              defaultCenter={mapCenter}
              center={mapCenter}
              defaultZoom={12}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
            >
              {destinations.map((dest) => {
                const isSelected = selectedDest.id === dest.id;
                return (
                  <React.Fragment key={dest.id}>
                    <AdvancedMarker
                      position={{ lat: dest.lat, lng: dest.lng }}
                      onClick={() => {
                        setSelectedDest(dest);
                        setMapCenter({ lat: dest.lat, lng: dest.lng });
                        setInfoOpenId(dest.id);
                      }}
                    >
                      <Pin
                        background={isSelected ? '#0ea5e9' : '#f59e0b'}
                        glyphColor="#ffffff"
                        borderColor={isSelected ? '#0369a1' : '#92400e'}
                      />
                    </AdvancedMarker>
                    {infoOpenId === dest.id && (
                      <InfoWindow
                        position={{ lat: dest.lat, lng: dest.lng }}
                        onCloseClick={() => setInfoOpenId(null)}
                      >
                        <div className="text-slate-900 p-1 max-w-[200px] space-y-1">
                          <div className="font-bold text-xs">{dest.name}</div>
                          <div className="text-[11px] text-slate-600">{dest.address}</div>
                          <button
                            type="button"
                            onClick={() => handleLaunchGoogleMaps(dest)}
                            className="mt-1 px-2.5 py-1 rounded bg-sky-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Start Route
                          </button>
                        </div>
                      </InfoWindow>
                    )}
                  </React.Fragment>
                );
              })}
            </GoogleMap>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-900">
            <Car className="w-8 h-8 text-sky-400" />
            <div className="text-sm font-bold text-white">{selectedDest.name}</div>
            <div className="text-xs text-slate-400">{selectedDest.address}</div>
          </div>
        )}

        {/* Selected Destination HUD Bar */}
        <div className="absolute bottom-2.5 right-2.5 px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs flex items-center gap-3 z-10 max-w-[90%]">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block leading-tight truncate">
              {selectedDest.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {selectedDest.eta && (
                <span className="font-extrabold text-emerald-400 text-xs tabular-nums">
                  {selectedDest.eta}
                </span>
              )}
              {selectedDest.distance && (
                <span className="text-slate-400 text-[11px] tabular-nums">
                  ({selectedDest.distance})
                </span>
              )}
              {typeof selectedDest.rating === 'number' && (
                <span className="text-amber-400 text-[11px] font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {selectedDest.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleLaunchGoogleMaps(selectedDest)}
            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shrink-0"
            title="Start Navigation in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Destinations Quick List */}
      <div className="flex-1 min-h-0 flex flex-col space-y-1.5 overflow-hidden">
        <span className={`${easyView ? 'text-xs' : 'text-[10.5px]'} font-bold uppercase tracking-wider text-slate-400 font-display shrink-0`}>
          Tap Destination to Focus Map &amp; Navigate
        </span>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {destinations.map((dest) => {
            const isSelected = selectedDest.id === dest.id;
            return (
              <div
                key={dest.id}
                onClick={() => {
                  playCabinChime('tap');
                  setSelectedDest(dest);
                  setMapCenter({ lat: dest.lat, lng: dest.lng });
                  setInfoOpenId(dest.id);
                }}
                className={`rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  easyView ? 'p-3.5' : 'p-2.5'
                } ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500/70 shadow-xs'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`${easyView ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-sky-400`}>
                    {dest.category === 'Airport' && <Plane className="w-4 h-4 text-sky-400" />}
                    {dest.category === 'Downtown' && <Building className="w-4 h-4 text-amber-400" />}
                    {dest.category === 'Dining' && <Utensils className="w-4 h-4 text-emerald-400" />}
                    {dest.category === 'Attraction' && <Compass className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`${easyView ? 'text-sm sm:text-base' : 'text-xs'} font-bold text-white truncate`}>
                      {dest.name}
                    </p>
                    <p className={`${easyView ? 'text-xs' : 'text-[10px]'} text-slate-400 truncate`}>
                      {dest.address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {dest.eta && (
                    <span className="text-xs font-bold text-emerald-400 tabular-nums block">
                      {dest.eta}
                    </span>
                  )}
                  {dest.distance && (
                    <span className="text-[10px] text-slate-500 tabular-nums">
                      {dest.distance}
                    </span>
                  )}
                  {typeof dest.rating === 'number' && (
                    <span className="text-xs font-bold text-amber-400 tabular-nums">
                      {dest.rating.toFixed(1)} ★
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
