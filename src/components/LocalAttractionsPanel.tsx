import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Trees,
  Landmark,
  Ticket,
  Sparkles,
  Utensils,
  Compass,
  Navigation,
  Search,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  LocateFixed,
  UserCheck,
  Mountain,
  Star,
  Map as MapIcon,
  LayoutGrid,
  Loader2,
} from 'lucide-react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { playCabinChime } from '../utils/cabinAudio';
import { openExternalUrl } from '../utils/appLauncher';
import {
  getMapsConfig,
  geocodeLocationQuery,
  searchGooglePlaces,
  GooglePlaceResult,
} from '../utils/mapsConfig';

export type AttractionCategory =
  | 'all'
  | 'attractions'
  | 'adventures'
  | 'parks'
  | 'museums'
  | 'events'
  | 'dining';

interface LocalAttraction {
  id: string;
  name: string;
  category: Exclude<AttractionCategory, 'all'>;
  area: string;
  distance: string;
  hours: string;
  address: string;
  description: string;
  highlightTag: string;
  rating: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

const CURATED_HIGHLIGHTS: LocalAttraction[] = [
  {
    id: 'east-race-waterway',
    name: 'East Race Waterway & Riverwalk',
    category: 'adventures',
    area: 'Downtown South Bend',
    distance: '1.3 mi',
    hours: 'Seasonal Rafting · Trails Dusk',
    address: '126 S Niles Ave, South Bend, IN 46617',
    description:
      'North America’s first man-made whitewater rafting course alongside riverfront trails, footbridges, and Howard Park.',
    highlightTag: 'Whitewater Adventure',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    lat: 41.6766,
    lng: -86.2454,
  },
  {
    id: 'rum-village-aerial-adventure',
    name: 'Edge Adventures Aerial Park',
    category: 'adventures',
    area: 'Rum Village Park, South Bend',
    distance: '3.2 mi',
    hours: 'Weekend Zip Lines & Ropes',
    address: '2626 S Gertrude St, South Bend, IN 46614',
    description:
      'Treetop obstacle courses, suspended bridges, zip lines through old-growth forest canopy, and mountain bike trails.',
    highlightTag: 'Zip Lines & Trails',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    lat: 41.6499,
    lng: -86.2712,
  },
  {
    id: 'potawatomi-park-zoo',
    name: 'Potawatomi Zoo & Botanical Park',
    category: 'attractions',
    area: 'South Bend, IN',
    distance: '2.6 mi',
    hours: 'Daily · 10 AM – 5 PM',
    address: '500 S Greenlawn Ave, South Bend, IN 46615',
    description:
      'Indiana’s oldest zoo featuring giraffe feeding experiences, train rides, botanical conservatory, and shaded picnic grounds.',
    highlightTag: 'Top Attraction',
    rating: '4.7 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    lat: 41.6673,
    lng: -86.2194,
  },
  {
    id: 'notre-dame-basilica-grotto',
    name: 'Notre Dame Golden Dome & Grotto',
    category: 'attractions',
    area: 'Notre Dame, IN',
    distance: '2.8 mi',
    hours: 'Campus Walks Daily',
    address: 'Notre Dame Ave, Notre Dame, IN 46556',
    description:
      'Iconic landmark campus walks past the Golden Dome, Basilica of the Sacred Heart, candlelit Grotto, and lakes.',
    highlightTag: 'Landmark Attraction',
    rating: '4.9 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    lat: 41.7031,
    lng: -86.239,
  },
  {
    id: 'st-patricks-kayak-adventure',
    name: 'St. Patrick’s County Park Kayak Run',
    category: 'adventures',
    area: 'North South Bend',
    distance: '5.4 mi',
    hours: '7 AM – Sunset',
    address: '50651 Laurel Rd, South Bend, IN 46637',
    description:
      'Scenic St. Joseph River canoe & kayak launches, bald eagle nesting views, meadow trails, and cross-country skiing.',
    highlightTag: 'Kayak & Paddling',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    lat: 41.7493,
    lng: -86.2718,
  },
  {
    id: 'studebaker-museum-local',
    name: 'Studebaker National Museum',
    category: 'museums',
    area: 'Downtown South Bend',
    distance: '2.1 mi',
    hours: 'Mon–Sat 10 AM – 5 PM · Sun 12–5 PM',
    address: '201 Chapin St, South Bend, IN 46601',
    description:
      'Three levels of rare vintage automobiles, historic carriages, presidential vehicles, and industrial design galleries.',
    highlightTag: 'Top Museum',
    rating: '4.9 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    lat: 41.6731,
    lng: -86.2591,
  },
  {
    id: 'snite-raclin-museum',
    name: 'Raclin Murphy Museum of Art',
    category: 'museums',
    area: 'Notre Dame, IN',
    distance: '3.0 mi',
    hours: 'Tue–Sun · Free Admission',
    address: '100 Raclin Murphy Dr, Notre Dame, IN 46556',
    description:
      'Expansive architectural art museum featuring 30,000+ works spanning global sculptures, modern painting, and sculpture park.',
    highlightTag: 'Art & Sculpture',
    rating: '4.9 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    lat: 41.6967,
    lng: -86.2348,
  },
  {
    id: 'morris-performing-arts-events',
    name: 'Morris Performing Arts Center',
    category: 'events',
    area: 'Downtown South Bend',
    distance: '1.4 mi',
    hours: 'Evening Shows & Matinees',
    address: '211 N Michigan St, South Bend, IN 46601',
    description:
      'Historic 1922 theatre hosting Broadway tours, symphony nights, touring concerts, and live comedy specials.',
    highlightTag: 'Concerts & Theatre',
    rating: '4.9 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    lat: 41.6783,
    lng: -86.2504,
  },
  {
    id: 'four-winds-field',
    name: 'Four Winds Field & Downtown Events',
    category: 'events',
    area: 'Downtown South Bend',
    distance: '1.7 mi',
    hours: 'Game Days & Weekend Festivals',
    address: '501 W South St, South Bend, IN 46601',
    description:
      'Home of the South Bend Cubs plus seasonal concerts, outdoor markets, splash pad fun, and rooftop social decks.',
    highlightTag: 'Sports & Live Events',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    lat: 41.6708,
    lng: -86.2557,
  },
  {
    id: 'potato-creek-park',
    name: 'Potato Creek State Park',
    category: 'parks',
    area: 'North Liberty, IN',
    distance: '12.5 mi',
    hours: '7 AM – Dusk',
    address: '25601 State Rd 4, North Liberty, IN 46554',
    description:
      'Over 3,800 acres of wooded trails, Worster Lake kayaking, wildlife observation towers, paved bike paths, and sandy beach.',
    highlightTag: 'State Park',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    lat: 41.5453,
    lng: -86.3422,
  },
  {
    id: 'tippecanoe-dining',
    name: 'Tippecanoe Place & Local Cafés',
    category: 'dining',
    area: 'West Washington Historic District',
    distance: '1.8 mi',
    hours: 'Lunch, Dinner & Brunch',
    address: '620 W Washington St, South Bend, IN 46601',
    description:
      'Iconic 1889 stone mansion dining alongside downtown bistros, artisan coffee roasters, and riverfront wineries.',
    highlightTag: 'Local Dining',
    rating: '4.8 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    lat: 41.6761,
    lng: -86.2588,
  },
  {
    id: 'indiana-dunes',
    name: 'Indiana Dunes National Park',
    category: 'parks',
    area: 'Lake Michigan Shore',
    distance: '38 mi',
    hours: 'Daily · 6 AM – 11 PM',
    address: '1215 N State Rd 49, Porter, IN 46304',
    description:
      'Towering coastal sand dunes, 15 miles of Lake Michigan beaches, panoramic boardwalks, and 50+ miles of trails.',
    highlightTag: 'National Park',
    rating: '4.9 ★',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    lat: 41.6533,
    lng: -87.0524,
  },
];

const QUICK_ZIP_PRESETS = [
  { zip: '46601', label: 'South Bend' },
  { zip: '60611', label: 'Chicago' },
  { zip: '90210', label: 'Beverly Hills' },
  { zip: '32801', label: 'Orlando' },
  { zip: '10001', label: 'New York' },
];

interface LocalAttractionsPanelProps {
  onRequestStop?: (destinationName: string) => void;
  onShowDriverInfo?: () => void;
  easyView?: boolean;
}

export const LocalAttractionsPanel: React.FC<LocalAttractionsPanelProps> = ({
  onRequestStop,
  onShowDriverInfo,
  easyView = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AttractionCategory>('all');
  const [locationLabel, setLocationLabel] = useState<string>('South Bend, IN 46601');
  const [locationInput, setLocationInput] = useState<string>('46601');
  const [areaCenter, setAreaCenter] = useState<{ lat: number; lng: number }>({
    lat: 41.6764,
    lng: -86.252,
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [requestedStopId, setRequestedStopId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [livePlaces, setLivePlaces] = useState<GooglePlaceResult[]>([]);
  const [placesConfigured, setPlacesConfigured] = useState<boolean>(false);
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState<string | null>(null);

  const categories: { id: AttractionCategory; label: string; searchTerm: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'All Explore',
      searchTerm: 'top tourist attractions adventures parks museums',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'attractions',
      label: 'Attractions',
      searchTerm: 'tourist attractions landmarks sightseeing',
      icon: <Sparkles className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'adventures',
      label: 'Adventures',
      searchTerm: 'outdoor adventures zip line kayaking recreation adventure park',
      icon: <Mountain className="w-4 h-4 text-orange-500" />,
    },
    {
      id: 'parks',
      label: 'Parks',
      searchTerm: 'parks botanical gardens nature trails',
      icon: <Trees className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'museums',
      label: 'Museums',
      searchTerm: 'museums art galleries science center',
      icon: <Landmark className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'events',
      label: 'Events',
      searchTerm: 'performing arts theater stadium concert venue',
      icon: <Ticket className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'dining',
      label: 'Dining',
      searchTerm: 'popular local restaurants cafes',
      icon: <Utensils className="w-4 h-4 text-rose-500" />,
    },
  ];

  const fetchLivePlacesForArea = useCallback(
    async (center: { lat: number; lng: number }, label: string, cat: AttractionCategory) => {
      const catEntry = categories.find((c) => c.id === cat) || categories[0];
      const textQuery = `${catEntry.searchTerm} near ${label}`;
      const res = await searchGooglePlaces({
        query: textQuery,
        lat: center.lat,
        lng: center.lng,
        category: cat,
      });
      setPlacesConfigured(Boolean(res.configured));
      if (res.places.length > 0) {
        setLivePlaces(res.places);
      } else {
        setLivePlaces([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    let mounted = true;
    getMapsConfig().then((cfg) => {
      if (!mounted) return;
      if (cfg.configured && cfg.apiKey) {
        setMapsApiKey(cfg.apiKey);
        setPlacesConfigured(true);
        fetchLivePlacesForArea(areaCenter, locationLabel, selectedCategory);
      }
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = async (cat: AttractionCategory) => {
    playCabinChime('tap');
    setSelectedCategory(cat);
    if (placesConfigured || mapsApiKey) {
      setSearchLoading(true);
      await fetchLivePlacesForArea(areaCenter, locationLabel, cat);
      setSearchLoading(false);
    }
  };

  const handleApplyLocation = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const cleaned = (overrideInput ?? locationInput).trim();
    if (!cleaned) return;
    playCabinChime('tap');
    setSearchLoading(true);
    setStatusError(null);
    setStatusMessage(`Looking up ${cleaned}...`);
    setLocationInput(cleaned);

    const geocoded = await geocodeLocationQuery(cleaned);
    if (!geocoded) {
      setSearchLoading(false);
      setStatusMessage(null);
      setStatusError(`Could not find "${cleaned}". Try a 5-digit US ZIP code (e.g. 46601, 60611) or City, State.`);
      return;
    }

    const nextCenter = { lat: geocoded.lat, lng: geocoded.lng };
    setAreaCenter(nextCenter);
    setLocationLabel(geocoded.label);
    setSelectedMapMarkerId(null);

    if (placesConfigured || mapsApiKey) {
      await fetchLivePlacesForArea(nextCenter, geocoded.label, selectedCategory);
    }
    setSearchLoading(false);
    setStatusMessage(`Area set to ${geocoded.label}`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUseMyGps = () => {
    playCabinChime('tap');
    setStatusError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatusError('GPS is unavailable on this browser — enter any ZIP code or city above.');
      return;
    }
    setGpsLoading(true);
    setStatusMessage('Detecting current passenger location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nextCenter = { lat: latitude, lng: longitude };
        setAreaCenter(nextCenter);

        let resolvedLabel = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
        try {
          const resp = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (resp.ok) {
            const data = await resp.json();
            const city = data.city || data.locality || '';
            const state = data.principalSubdivisionCode
              ? String(data.principalSubdivisionCode).replace('US-', '')
              : data.principalSubdivision || '';
            if (city) {
              resolvedLabel = state ? `${city}, ${state}` : city;
            }
          }
        } catch {
          // keep coordinate fallback
        }
        setLocationLabel(resolvedLabel);
        setLocationInput(resolvedLabel);
        if (placesConfigured || mapsApiKey) {
          await fetchLivePlacesForArea(nextCenter, resolvedLabel, selectedCategory);
        }
        setGpsLoading(false);
        setStatusMessage(`GPS centered on ${resolvedLabel}`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
      () => {
        setGpsLoading(false);
        setStatusError('Location permission declined — type any ZIP code or City above.');
        setTimeout(() => setStatusError(null), 4500);
      },
      { enableHighAccuracy: false, timeout: 7000 }
    );
  };

  const handleRequestStopName = (id: string, name: string, areaText: string) => {
    playCabinChime('acknowledged');
    onRequestStop?.(`${name}${areaText ? ` (${areaText})` : ''}`);
    setRequestedStopId(id);
    setTimeout(() => setRequestedStopId(null), 3200);
  };

  const isLocalSouthBendArea = /south bend|notre dame|mishawaka|466|465/i.test(locationLabel);
  const usingLiveGooglePlaces = livePlaces.length > 0;

  const filteredCurated = CURATED_HIGHLIGHTS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className={`flex-1 flex flex-col min-h-0 animate-fadeIn ${easyView ? 'space-y-3.5' : 'space-y-2.5'}`}>
      {/* Passenger Location & ZIP Code Search Bar */}
      <div className={`${easyView ? 'p-4 space-y-3' : 'p-3 space-y-2'} rounded-2xl cabin-panel border shrink-0`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`${easyView ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0`}>
              <MapPin className={`${easyView ? 'w-5 h-5' : 'w-4 h-4'} text-emerald-500`} />
            </div>
            <div className="min-w-0">
              <div className={`${easyView ? 'text-xs' : 'text-[10px]'} font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400`}>
                Area Discovery &amp; Adventures
              </div>
              <div className={`${easyView ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-extrabold truncate`}>
                Exploring: {locationLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Mode Toggle: Cards vs Interactive Google Map */}
            <div className="inline-flex p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  setViewMode('cards');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  easyView ? 'text-xs' : 'text-[11px]'
                } ${
                  viewMode === 'cards'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  setViewMode('map');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  easyView ? 'text-xs' : 'text-[11px]'
                } ${
                  viewMode === 'map'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleUseMyGps}
              disabled={gpsLoading}
              className={`${easyView ? 'px-3.5 py-2 text-xs' : 'px-2.5 py-1.5 text-[11px]'} rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-300 font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-60`}
              title="Center attractions on your current GPS location"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Locating...' : 'GPS'}</span>
            </button>

            {onShowDriverInfo && (
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onShowDriverInfo();
                }}
                className={`${easyView ? 'px-3.5 py-2 text-xs' : 'px-2.5 py-1.5 text-[11px]'} rounded-xl cabin-badge border font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all`}
                title="Switch back to driver profile, photos, and quick QR codes"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Driver Info</span>
              </button>
            )}
          </div>
        </div>

        {/* ZIP Code / City Search Input */}
        <form onSubmit={(e) => handleApplyLocation(e)} className="flex items-center gap-1.5">
          <div className="relative flex-1 min-w-0">
            <Search className={`${easyView ? 'w-4 h-4 left-3' : 'w-3.5 h-3.5 left-2.5'} absolute top-1/2 -translate-y-1/2 opacity-50`} />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setStatusError(null);
              }}
              placeholder="Enter 5-digit ZIP code (e.g. 46601, 60611) or City, State..."
              className={`w-full rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                easyView ? 'pl-9 pr-3 py-2.5 text-sm sm:text-base' : 'pl-8 pr-3 py-1.5 text-xs'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className={`rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
              easyView ? 'px-4 py-2.5 text-sm sm:text-base' : 'px-3.5 py-1.5 text-xs'
            }`}
          >
            {searchLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Search ZIP / City</span>
          </button>
        </form>

        {/* Quick ZIP Presets for 1-Tap Testing & Exploration */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          {QUICK_ZIP_PRESETS.map((preset) => (
            <button
              key={preset.zip}
              type="button"
              onClick={() => handleApplyLocation(undefined, preset.zip)}
              className={`rounded-lg bg-white/70 dark:bg-slate-900/70 hover:bg-emerald-500/15 border border-slate-300/80 dark:border-slate-700 font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                easyView ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10.5px]'
              }`}
            >
              {preset.zip} · {preset.label}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className={`${easyView ? 'text-xs sm:text-sm' : 'text-[11px]'} font-semibold text-emerald-600 dark:text-emerald-400`}>
            {statusMessage}
          </div>
        )}
        {statusError && (
          <div className={`${easyView ? 'text-xs sm:text-sm' : 'text-[11px]'} font-semibold text-rose-500`}>
            {statusError}
          </div>
        )}
      </div>

      {/* Category Filter Tabs (includes Attractions & Adventures) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 pb-0.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all border ${
              easyView ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'
            } ${
              selectedCategory === cat.id
                ? 'cabin-primary-btn border-transparent shadow-xs'
                : 'cabin-panel opacity-85 hover:opacity-100'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Google Map View OR Attractions Cards Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5">
        {viewMode === 'map' && (
          <div className="space-y-2.5">
            {mapsApiKey ? (
              <div className="relative h-[280px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900">
                <APIProvider apiKey={mapsApiKey}>
                  <GoogleMap
                    key={`${areaCenter.lat.toFixed(4)}-${areaCenter.lng.toFixed(4)}`}
                    defaultCenter={areaCenter}
                    center={areaCenter}
                    defaultZoom={12}
                    mapId="DEMO_MAP_ID"
                    gestureHandling="greedy"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    className="w-full h-full"
                  >
                    {/* Center Area / ZIP Pin */}
                    <AdvancedMarker
                      position={areaCenter}
                      onClick={() => setSelectedMapMarkerId('area-center')}
                    >
                      <Pin background="#10b981" glyphColor="#ffffff" borderColor="#065f46" />
                    </AdvancedMarker>

                    {selectedMapMarkerId === 'area-center' && (
                      <InfoWindow
                        position={areaCenter}
                        onCloseClick={() => setSelectedMapMarkerId(null)}
                      >
                        <div className="text-slate-900 p-1 max-w-[200px]">
                          <div className="font-bold text-xs">{locationLabel}</div>
                          <div className="text-[11px] text-slate-600">Search Center</div>
                        </div>
                      </InfoWindow>
                    )}

                    {/* Markers from Live Google Places OR Local South Bend Highlights */}
                    {usingLiveGooglePlaces
                      ? livePlaces.map((place) => (
                          <React.Fragment key={place.id}>
                            <AdvancedMarker
                              position={{ lat: place.lat, lng: place.lng }}
                              onClick={() => setSelectedMapMarkerId(place.id)}
                            >
                              <Pin background="#0284c7" glyphColor="#ffffff" borderColor="#0c4a6e" />
                            </AdvancedMarker>
                            {selectedMapMarkerId === place.id && (
                              <InfoWindow
                                position={{ lat: place.lat, lng: place.lng }}
                                onCloseClick={() => setSelectedMapMarkerId(null)}
                              >
                                <div className="text-slate-900 p-1 max-w-[220px] space-y-1">
                                  <div className="font-bold text-xs">{place.name}</div>
                                  {place.address && (
                                    <div className="text-[11px] text-slate-600">{place.address}</div>
                                  )}
                                  {typeof place.rating === 'number' && (
                                    <div className="text-[11px] font-bold text-amber-600">
                                      ★ {place.rating} ({place.userRatingCount || 0})
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRequestStopName(place.id, place.name, locationLabel)
                                    }
                                    className="mt-1 px-2.5 py-1 rounded-md bg-sky-600 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Request Driver Stop
                                  </button>
                                </div>
                              </InfoWindow>
                            )}
                          </React.Fragment>
                        ))
                      : isLocalSouthBendArea &&
                        filteredCurated.map((item) => (
                          <React.Fragment key={item.id}>
                            <AdvancedMarker
                              position={{ lat: item.lat, lng: item.lng }}
                              onClick={() => setSelectedMapMarkerId(item.id)}
                            >
                              <Pin background="#f59e0b" glyphColor="#0f172a" borderColor="#92400e" />
                            </AdvancedMarker>
                            {selectedMapMarkerId === item.id && (
                              <InfoWindow
                                position={{ lat: item.lat, lng: item.lng }}
                                onCloseClick={() => setSelectedMapMarkerId(null)}
                              >
                                <div className="text-slate-900 p-1 max-w-[220px] space-y-1">
                                  <div className="font-bold text-xs">{item.name}</div>
                                  <div className="text-[11px] text-slate-600">{item.address}</div>
                                  <button
                                    type="button"
                                    onClick={() => handleRequestStopName(item.id, item.name, item.area)}
                                    className="mt-1 px-2.5 py-1 rounded-md bg-sky-600 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Request Driver Stop
                                  </button>
                                </div>
                              </InfoWindow>
                            )}
                          </React.Fragment>
                        ))}
                  </GoogleMap>
                </APIProvider>
              </div>
            ) : (
              <div className="p-4 rounded-2xl cabin-panel border text-center space-y-2">
                <MapPin className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-extrabold">
                  Centered at {locationLabel} ({areaCenter.lat.toFixed(4)}, {areaCenter.lng.toFixed(4)})
                </div>
                <p className="text-xs opacity-75">
                  Open this area directly in Google Maps to browse pins for {selectedCategory === 'all' ? 'attractions & adventures' : selectedCategory}.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openExternalUrl(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedCategory === 'all' ? 'attractions adventures parks' : selectedCategory} near ${locationLabel}`
                      )}`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Area in Google Maps</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Google Places Results (when API returned live results for any searched ZIP/city) */}
        {usingLiveGooglePlaces && (
          <div className={`grid gap-2.5 ${easyView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {livePlaces.map((place) => (
              <div
                key={place.id}
                className={`rounded-2xl cabin-panel border hover:border-emerald-500/50 flex flex-col justify-between transition-all ${
                  easyView ? 'p-4 space-y-3' : 'p-3 space-y-2'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`${easyView ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-extrabold leading-snug`}>
                      {place.name}
                    </h4>
                    {typeof place.rating === 'number' && (
                      <span className={`px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shrink-0 flex items-center gap-0.5 ${
                        easyView ? 'text-xs' : 'text-[10px]'
                      }`}>
                        <Star className="w-3 h-3 fill-current" />
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {place.primaryType && (
                      <span className="px-2 py-0.5 rounded-md cabin-badge border text-[10px] font-bold">
                        {place.primaryType}
                      </span>
                    )}
                    {typeof place.openNow === 'boolean' && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          place.openNow
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {place.openNow ? 'Open Now' : 'Currently Closed'}
                      </span>
                    )}
                  </div>

                  {place.address && (
                    <div className={`flex items-start gap-1.5 opacity-80 ${easyView ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{place.address}</span>
                    </div>
                  )}

                  {place.summary && (
                    <p className={`opacity-85 leading-snug ${easyView ? 'text-sm' : 'text-[11px] line-clamp-2'}`}>
                      {place.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
                  {requestedStopId === place.id ? (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Stop Request Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestStopName(place.id, place.name, locationLabel)}
                      className={`rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        easyView ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-[11px]'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Stop</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      openExternalUrl(
                        place.googleMapsUri ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${place.name} ${place.address || locationLabel}`
                          )}`
                      );
                    }}
                    className={`rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      easyView ? 'px-3.5 py-2 text-sm' : 'px-2.5 py-1 text-[11px]'
                    }`}
                    title="Open in Google Maps"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback when Searching Non-Local City/ZIP Without Active Places Results OR Local Curated Highlights */}
        {!usingLiveGooglePlaces && !isLocalSouthBendArea && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-sky-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className={`${easyView ? 'text-base' : 'text-xs sm:text-sm'} font-extrabold text-emerald-700 dark:text-emerald-300`}>
                Area Ready: {locationLabel}
              </div>
              <p className={`${easyView ? 'text-sm' : 'text-[11px]'} opacity-85 leading-snug`}>
                Coordinates locked ({areaCenter.lat.toFixed(3)}, {areaCenter.lng.toFixed(3)}). Open live attractions, adventures, parks, and dining for {locationLabel} on Google Maps.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                openExternalUrl(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedCategory === 'all' ? 'best attractions and adventures' : selectedCategory} near ${locationLabel}`
                  )}`
                )
              }
              className={`rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                easyView ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore {locationLabel}</span>
            </button>
          </div>
        )}

        {!usingLiveGooglePlaces && (
          <div className={`grid gap-2.5 ${easyView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {filteredCurated.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl cabin-panel border hover:border-emerald-500/50 overflow-hidden flex flex-col transition-all group"
              >
                <div className={`relative bg-slate-900 overflow-hidden shrink-0 ${easyView ? 'h-36' : 'h-28'}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {!easyView && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                      {item.highlightTag}
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black ${easyView ? 'text-xs' : 'text-[10px]'}`}>
                    {item.rating}
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <div className={`${easyView ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-extrabold truncate leading-tight`}>
                      {item.name}
                    </div>
                    <div className={`${easyView ? 'text-xs' : 'text-[10.5px]'} text-sky-200 flex items-center justify-between gap-2 mt-0.5`}>
                      <span className="truncate">{item.area}</span>
                      <span className="font-bold shrink-0 flex items-center gap-0.5">
                        <Navigation className="w-3 h-3" />
                        {item.distance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`${easyView ? 'p-3.5 space-y-2.5' : 'p-2.5 space-y-2'} flex-1 flex flex-col justify-between`}>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 opacity-75 font-semibold ${easyView ? 'text-xs' : 'text-[10.5px]'}`}>
                      <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{item.hours}</span>
                    </div>
                    <p className={`leading-snug opacity-85 ${easyView ? 'text-sm' : 'text-[11px] line-clamp-2'}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
                    {requestedStopId === item.id ? (
                      <span className={`${easyView ? 'text-sm' : 'text-[11px]'} font-bold text-emerald-500 flex items-center gap-1`}>
                        <CheckCircle2 className="w-4 h-4" />
                        Stop Request Sent
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestStopName(item.id, item.name, item.area)}
                        className={`rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          easyView ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-[11px]'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Stop</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        playCabinChime('tap');
                        openExternalUrl(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${item.name} ${item.address}`
                          )}`
                        );
                      }}
                      className={`rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        easyView ? 'px-3.5 py-2 text-sm' : 'px-2 py-1 text-[11px]'
                      }`}
                      title="Open directions in Google Maps"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
