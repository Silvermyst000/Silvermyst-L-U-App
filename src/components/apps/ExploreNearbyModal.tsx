import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Utensils,
  Coffee,
  Landmark,
  Wine,
  Sparkles,
  Send,
  X,
  Star,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';

interface ExploreItem {
  id: string;
  name: string;
  category: 'dining' | 'landmarks' | 'nightlife' | 'coffee' | 'shopping';
  subtitle: string;
  distance: string;
  address: string;
  description: string;
  driverTip: string;
  imageUrl: string;
  tag: string;
  rating: string;
}

const LOCAL_DESTINATIONS: ExploreItem[] = [
  {
    id: 'nd-campus',
    name: 'University of Notre Dame & Grotto',
    category: 'landmarks',
    subtitle: 'World-Renowned Historic University Campus',
    distance: '3.2 miles away',
    address: 'Notre Dame, IN 46556',
    description: 'Iconic Golden Dome, Basilica of the Sacred Heart, Touchdown Jesus mural, and serene candlelit Grotto of Our Lady of Lourdes.',
    driverTip: 'Best photos are at the Grotto just after sunset. Ask me to drop you right near the Main Building.',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    tag: 'Must-See Landmark',
    rating: '4.9 ★',
  },
  {
    id: 'tippecanoe',
    name: 'Tippecanoe Place Restaurant',
    category: 'dining',
    subtitle: 'Historic 1889 Studebaker Mansion & Fine Dining',
    distance: '1.8 miles away',
    address: '620 W Washington St, South Bend, IN 46601',
    description: 'Dine inside the historic 40-room stone mansion built by Clement Studebaker. Renowned for prime rib, crab cakes, and artisan cocktails.',
    driverTip: 'Their weekend prime rib is unmatched. Ask for a table near one of the carved wooden fireplaces.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tag: 'Historic Dining',
    rating: '4.8 ★',
  },
  {
    id: 'studebaker-museum',
    name: 'Studebaker National Museum',
    category: 'landmarks',
    subtitle: 'Classic American Automotive Heritage',
    distance: '2.1 miles away',
    address: '201 Chapin St, South Bend, IN 46601',
    description: 'Celebrates South Bend’s automotive history with pristine classic cars, Presidential carriages (including Lincoln’s barouche), and military vehicles.',
    driverTip: 'An absolute must for any car enthusiast. Give yourself 90 minutes to enjoy all 3 floors.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    tag: 'Automotive History',
    rating: '4.9 ★',
  },
  {
    id: 'cafe-navarre',
    name: 'Café Navarre',
    category: 'dining',
    subtitle: 'Upscale Downtown French-American Bistro',
    distance: '1.5 miles away',
    address: '101 N Michigan St, South Bend, IN 46601',
    description: 'Located in a restored bank building with vaulted ceilings. Exceptional dry-aged steaks, fresh seafood, and craft cocktails.',
    driverTip: 'Try the truffle fries and duck breast. Valet parking is tight, so I can drop you off right at the front doors.',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    tag: 'Upscale Dinner',
    rating: '4.7 ★',
  },
  {
    id: 'ironhand-wine',
    name: 'Ironhand Winebar & River Walk',
    category: 'nightlife',
    subtitle: 'Scenic St. Joseph Riverfront Wine & Charcuterie',
    distance: '2.4 miles away',
    address: '1025 Northside Blvd, South Bend, IN 46615',
    description: 'Charming riverside winery with patio views of the St. Joseph River, live acoustic music, local estate wines, and artisanal boards.',
    driverTip: 'Perfect sunset destination for couples. Beautiful lighted patio overlooking the water.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    tag: 'Scenic Sunset',
    rating: '4.8 ★',
  },
  {
    id: 'morris-arts',
    name: 'Morris Performing Arts Center',
    category: 'landmarks',
    subtitle: 'Historic 1922 Vaudeville & Broadway Palace',
    distance: '1.4 miles away',
    address: '211 N Michigan St, South Bend, IN 46601',
    description: 'Gilded age theater hosting touring Broadway shows, concerts, symphony performances, and top comedians.',
    driverTip: 'If attending a show, let me schedule your pickup right at the marquee after final curtain.',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    tag: 'Broadway & Shows',
    rating: '4.9 ★',
  },
  {
    id: 'kodachrome-coffee',
    name: 'Kodachrome Coffee & Roastery',
    category: 'coffee',
    subtitle: 'Specialty Espresso & Artisan Pastries',
    distance: '1.9 miles away',
    address: '1410 E Mishawaka Ave, South Bend, IN 46615',
    description: 'Craft micro-roaster serving pour-overs, nitro cold brew, and house-made breakfast pastries in a retro-inspired space.',
    driverTip: 'Their lavender honey latte and sourdough croissants make the perfect morning highway pick-me-up.',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    tag: 'Craft Coffee',
    rating: '4.8 ★',
  },
];

interface ExploreNearbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestStop?: (destinationName: string) => void;
  driverName?: string;
}

export const ExploreNearbyModal: React.FC<ExploreNearbyModalProps> = ({
  isOpen,
  onClose,
  onRequestStop,
  driverName = 'Carlos',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);
  const [notifiedStop, setNotifiedStop] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Sights' },
    { id: 'dining', label: 'Fine Dining 🍷' },
    { id: 'landmarks', label: 'Landmarks 🏛️' },
    { id: 'coffee', label: 'Coffee & Cafés ☕' },
    { id: 'nightlife', label: 'Wineries & Lounges 🍸' },
  ];

  const filteredItems = LOCAL_DESTINATIONS.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleNotifyStop = (item: ExploreItem) => {
    playCabinChime('acknowledged');
    if (onRequestStop) {
      onRequestStop(item.name);
    }
    setNotifiedStop(item.name);
    setTimeout(() => setNotifiedStop(null), 3000);
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-slate-950 text-white rounded-3xl border border-sky-500/40 shadow-[0_0_50px_rgba(14,165,233,0.2)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-b border-sky-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Explore Nearby & Local Highlights</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Curated by {driverName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Top destinations, historic sights, and dining along our route.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playCabinChime('tap');
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 flex flex-col overflow-hidden transition-all duration-200 group"
            >
              {/* Photo Frame */}
              <div className="relative h-40 overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-bold text-sky-300 border border-sky-400/30">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-sm">
                    {item.rating}
                  </span>
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-extrabold text-sm">{item.name}</span>
                  <span className="text-sky-300 font-bold text-[11px]">{item.distance}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{item.address}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Carlos Insider Tip Box */}
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30 text-[11px] text-purple-200 space-y-0.5">
                  <div className="font-extrabold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{driverName}'s Recommendation:</span>
                  </div>
                  <p className="text-purple-200/90 leading-snug">{item.driverTip}</p>
                </div>

                {/* Actions */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
                  {notifiedStop === item.name ? (
                    <span className="text-xs font-bold text-emerald-400 animate-pulse">
                      ✓ Driver Notified of Request!
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNotifyStop(item)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Stop Here</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
