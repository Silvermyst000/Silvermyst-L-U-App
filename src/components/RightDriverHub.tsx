import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Languages,
  Car,
  Utensils,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  Image as ImageIcon,
  User,
  Maximize2,
  Award,
  CheckCircle,
  ExternalLink,
  QrCode,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DriverProfile, FoodItem, MultiserviceItem, GalleryItem, GalleryAlbum, QuickConnectItem } from '../types/kiosk';
import { FAVORITE_FOODS, MULTISERVICES_LIST, CARLOS_PHOTO_GALLERY, INITIAL_GALLERY_ALBUMS, INITIAL_QUICK_CONNECT_ITEMS } from '../data/mockData';
import { QRCodeView } from '../utils/qrCode';
import { SocialModal, SocialModalData } from './SocialModal';
import { DirectBookingModal } from './DirectBookingModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { playCabinChime } from '../utils/cabinAudio';

interface RightDriverHubProps {
  profile: DriverProfile;
  drivers?: DriverProfile[];
  onSelectDriver?: (driverId: string) => void;
  albums?: GalleryAlbum[];
  photos?: GalleryItem[];
  quickConnects?: QuickConnectItem[];
  externalGalleryOpen?: boolean;
  onCloseExternalGallery?: () => void;
}

export const RightDriverHub: React.FC<RightDriverHubProps> = ({
  profile,
  drivers = [],
  onSelectDriver,
  albums = INITIAL_GALLERY_ALBUMS,
  photos = CARLOS_PHOTO_GALLERY,
  quickConnects = INITIAL_QUICK_CONNECT_ITEMS,
  externalGalleryOpen = false,
  onCloseExternalGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'about' | 'foods' | 'services'>('gallery');
  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(false);
  const [socialModalData, setSocialModalData] = useState<SocialModalData | null>(null);
  const [selectedService, setSelectedService] = useState<MultiserviceItem | null>(null);

  // Gallery filtering state
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Determine non-hidden albums (hidden albums are strictly kept private for Carlos in the admin console)
  const activeAlbums = albums || INITIAL_GALLERY_ALBUMS;
  const visibleAlbums = activeAlbums.filter((a) => !a.isHiddenFromPassengers);
  const hiddenAlbumIds = new Set(activeAlbums.filter((a) => a.isHiddenFromPassengers).map((a) => a.id));

  // Determine visible photos for passengers
  const allPhotos = photos || CARLOS_PHOTO_GALLERY;
  const visiblePhotos = allPhotos.filter((p) => {
    if (hiddenAlbumIds.has(p.albumId)) return false;
    if (selectedAlbumId !== 'all' && p.albumId !== selectedAlbumId) return false;
    return true;
  });

  // Fallback if current index is out of bounds
  const currentGalleryItem = visiblePhotos[galleryIndex] || visiblePhotos[0];

  // Sync external gallery request from App Drawer
  React.useEffect(() => {
    if (externalGalleryOpen) {
      setIsLightboxOpen(true);
      setActiveTab('gallery');
    }
  }, [externalGalleryOpen]);

  // vCard format for instant contact saving
  const vCardString = `BEGIN:VCARD\nVERSION:3.0\nN:R.;Carlos;;;\nFN:Carlos - Silvermyst Multiservices\nORG:Silvermyst Multiservices\nTITLE:Founder & Chauffeur\nTEL;TYPE=CELL:${profile.phone}\nEMAIL:${profile.email}\nURL:${profile.website}\nNOTE:Computer Repair, Webmaster, Photography & Chauffeur (silvermyst.com)\nEND:VCARD`;

  const handleOpenSocial = (type: 'linktree' | 'instagram' | 'contact' | 'whatsapp' | 'website') => {
    playCabinChime('tap');
    if (type === 'website') {
      setSocialModalData({
        title: 'Silvermyst Multiservices',
        subtitle: 'Official Website • silvermyst.com',
        handleOrValue: 'silvermyst.com',
        url: profile.website,
        qrValue: profile.website,
        type: 'website',
        description: 'Explore all of Carlos’s business divisions: Computer & Device Repair (silvermystrepair.com), Webmaster Services, Social Media Marketing, and Professional Photography (silvermystphotography.com).',
      });
    } else if (type === 'linktree') {
      setSocialModalData({
        title: 'Silvermyst Linktree & Services',
        subtitle: 'All services, rates & direct links',
        handleOrValue: `silvermyst.com`,
        url: profile.website,
        qrValue: profile.website,
        type: 'linktree',
        description: 'Scan with your camera to view all business services, PC/Mac repairs, photography booking, and private airport rides on your phone.',
      });
    } else if (type === 'instagram') {
      setSocialModalData({
        title: 'Follow Carlos on Instagram',
        subtitle: 'Behind the scenes & customer spotlights',
        handleOrValue: `@${profile.instagram}`,
        url: `https://instagram.com/${profile.instagram}`,
        qrValue: `https://instagram.com/${profile.instagram}`,
        type: 'instagram',
        description: 'Follow for luxury vehicle tours, tech updates, photography showcases, and exclusive ride voucher promotions.',
      });
    } else if (type === 'contact') {
      setSocialModalData({
        title: 'Save Carlos to Contacts',
        subtitle: 'Carlos R. • Silvermyst Multiservices',
        handleOrValue: profile.phone,
        url: `tel:${profile.phone}`,
        qrValue: vCardString,
        type: 'contact',
        description: `Scan to automatically save Carlos’s executive phone (${profile.phone}), email, and website into your smartphone address book.`,
      });
    } else if (type === 'whatsapp') {
      setSocialModalData({
        title: 'Direct WhatsApp Line',
        subtitle: 'Instant messaging & quote requests',
        handleOrValue: profile.whatsapp,
        url: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`,
        qrValue: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`,
        type: 'whatsapp',
        description: `Text Carlos directly at ${profile.phone} to schedule your return airport ride or request computer repair and photography services.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-3xl p-4 md:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Compact & Collapsible Driver Profile Header with Driver Switcher and Expand Toggle */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Driver identity & thumbnail */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => {
                playCabinChime('tap');
                setIsLightboxOpen(true);
              }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer group"
              title="Tap to view photo gallery"
            >
              <img
                src={profile.avatarUrl}
                alt={`${profile.name} - Driver`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-tl-lg shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate font-display tracking-tight">
                  {profile.name}
                </h2>
                <span className="text-[10px] sm:text-xs font-bold text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800/80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-500" />
                  Verified Host
                </span>
                {drivers.length > 1 && onSelectDriver && (
                  <select
                    value={profile.id}
                    onChange={(e) => onSelectDriver(e.target.value)}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                    title="Switch active driver"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        Driver: {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {profile.companyName}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-slate-900 dark:text-white">{profile.rating}</span>
                  <span className="text-slate-400 font-normal">({profile.totalTrips.toLocaleString()}+)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Collapse Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View All Services Offered button moved toward available space on left */}
            <button
              onClick={() => {
                playCabinChime('tap');
                setActiveTab('services');
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight transition-all active:scale-97 cursor-pointer shadow-xs flex items-center gap-1.5 border border-slate-700/50 dark:border-sky-400/50"
              title="Browse all Silvermyst services"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Services (5)</span>
              <span className="sm:hidden">Services</span>
            </button>

            {/* QR Pop-up trigger */}
            <button
              onClick={() => {
                playCabinChime('tap');
                handleOpenSocial('website');
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 cursor-pointer"
              title="Scan QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Expand / Collapse profile toggle button */}
            <button
              onClick={() => {
                playCabinChime('tap');
                setIsProfileExpanded(!isProfileExpanded);
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
              title={isProfileExpanded ? "Hide extended profile" : "Expand driver bio and vehicle details"}
            >
              {isProfileExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Extended Profile Tray */}
        {isProfileExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs space-y-2 animate-fadeIn">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {profile.bio}
            </p>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 flex-wrap pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-sky-500" />
                <span>{profile.vehicleYear} {profile.vehicleModel}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-sky-500" />
                <span>{profile.languages.join(' & ')}</span>
              </span>
              <span>·</span>
              <span className="text-emerald-500 font-bold">{profile.cleanlinessScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Tab Controls (Photo Gallery | About Me | Favorite Foods | My Services) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 my-3.5 shrink-0 overflow-x-auto">
        <button
          onClick={() => {
            playCabinChime('tap');
            setActiveTab('gallery');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'gallery'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4.5 h-4.5 text-sky-500" />
          <span>My Photos ({visiblePhotos.length})</span>
        </button>

        <button
          onClick={() => {
            playCabinChime('tap');
            setActiveTab('about');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'about'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <img
            src={profile.avatarUrl}
            alt="Carlos"
            className="w-5 h-5 rounded-full object-cover ring-1.5 ring-amber-500/80 shrink-0"
          />
          <span>About Me</span>
        </button>

        <button
          onClick={() => {
            playCabinChime('tap');
            setActiveTab('foods');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'foods'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-4.5 h-4.5 text-emerald-500" />
          <span>Favorite Foods 🌮</span>
        </button>

        <button
          onClick={() => {
            playCabinChime('tap');
            setActiveTab('services');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'services'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5 text-purple-500" />
          <span>My Services (5)</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
        {/* TAB 1: PICTURE GALLERY (NEW & PROMINENT) */}
        {activeTab === 'gallery' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Album Categories Filter Bar (Only showing visible, passenger-accessible albums) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
              <button
                onClick={() => {
                  playCabinChime('tap');
                  setSelectedAlbumId('all');
                  setGalleryIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                  selectedAlbumId === 'all'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>All Visible ({allPhotos.filter(p => !hiddenAlbumIds.has(p.albumId)).length})</span>
              </button>

              {visibleAlbums.map((album) => {
                const count = allPhotos.filter(p => p.albumId === album.id).length;
                return (
                  <button
                    key={album.id}
                    onClick={() => {
                      playCabinChime('tap');
                      setSelectedAlbumId(album.id);
                      setGalleryIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                      selectedAlbumId === album.id
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{album.title}</span>
                    <span className="text-[10px] opacity-75 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>

            {visiblePhotos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                No visible photos in this album yet.
              </div>
            ) : (
              <>
                {/* Featured Large Slide Card */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md group">
                  <div
                    onClick={() => {
                      playCabinChime('tap');
                      setIsLightboxOpen(true);
                    }}
                    className="relative h-44 sm:h-52 w-full overflow-hidden cursor-pointer"
                  >
                    <img
                      src={currentGalleryItem.imageUrl}
                      alt={currentGalleryItem.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Badge Tag */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-sky-400 border border-slate-700">
                      {currentGalleryItem.tag}
                    </div>

                    {/* Fullscreen icon */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white/80 hover:text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    {/* Nav Arrows */}
                    {visiblePhotos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playCabinChime('tap');
                            setGalleryIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-90 cursor-pointer"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playCabinChime('tap');
                            setGalleryIndex((prev) => (prev + 1) % visiblePhotos.length);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-90 cursor-pointer"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold font-display">
                          {currentGalleryItem.title}
                        </h3>
                        <span className="text-[11px] text-sky-300 font-medium">
                          {galleryIndex + 1} of {visiblePhotos.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {currentGalleryItem.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Story text under slide */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentGalleryItem.description}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Row */}
                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-display">
                    Tap Any Photo to View Details
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {visiblePhotos.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          playCabinChime('tap');
                          setGalleryIndex(idx);
                        }}
                        className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          galleryIndex === idx
                            ? 'border-sky-500 scale-102 shadow-md shadow-sky-500/20'
                            : 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white px-1 rounded bg-black/60">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: ABOUT CARLOS & HOSPITALITY */}
        {activeTab === 'about' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={profile.avatarUrl}
                    alt="Carlos"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/70 shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-display">
                      Welcome to My Ride
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Carlos R. • Host & Founder</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" /> 5-Star Hospitality
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {profile.bio}
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 italic">
                "{profile.funFact}"
              </div>
            </div>

            {/* Quick Vehicle / Safety Spec Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                <Car className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">
                    {profile.vehicleModel}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Executive Dual Climate</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">
                    Safe Driver Award
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">6+ Years Flawless Record</p>
                </div>
              </div>
            </div>

            {/* Prompt to explore services */}
            <div
              onClick={() => {
                playCabinChime('tap');
                setActiveTab('services');
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white flex items-center justify-between cursor-pointer hover:opacity-95 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display">Planning an Airport Return Trip?</h4>
                  <p className="text-[11px] text-slate-300">Book direct with Carlos — guaranteed on-time with zero surge pricing.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}

        {/* TAB 3: FAVORITE FOODS (ENLARGED) */}
        {activeTab === 'foods' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Flat-Lay Culinary Hero Banner */}
            <div
              onClick={() => {
                playCabinChime('tap');
                setGalleryIndex(4);
                setIsLightboxOpen(true);
              }}
              className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer group"
            >
              <img
                src="/src/assets/images/gourmet_favorite_foods_1794247173141.jpg"
                alt="Carlos's Favorite Foods"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-3.5">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    Carlos's Local Culinary Passions
                  </h4>
                  <p className="text-xs text-slate-200">
                    "I drive across the entire metro area every day — here are my absolute favorite bites!"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {FAVORITE_FOODS.map((food) => (
                <div
                  key={food.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                        {food.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        {food.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60">
                      {food.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {food.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span>💡 <strong className="text-slate-700 dark:text-slate-300">Carlos’s Tip:</strong> {food.carlosRecommendation}</span>
                    <span className="shrink-0 font-semibold text-sky-600 dark:text-sky-400">{food.bestLocalSpot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MULTISERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-3 animate-fadeIn">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Beyond rideshare, Carlos operates <strong className="text-slate-900 dark:text-white">Silvermyst Multiservices</strong>. Tap any service below to request a flat-rate direct quote:
            </p>

            <div className="space-y-3">
              {MULTISERVICES_LIST.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                          {srv.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                          {srv.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {srv.shortDesc}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        playCabinChime('tap');
                        setSelectedService(srv);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold tracking-tight shrink-0 transition-all cursor-pointer shadow-xs min-h-[44px] flex items-center justify-center"
                    >
                      Book / Inquire
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{srv.pricingHint}</span>
                    <span className="text-sky-500 dark:text-sky-400 font-medium">No Surge Fees Ever</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM APPS DOCK ON DRIVER'S SIDE (Linktree, Venmo, Cash App, Instagram, WhatsApp, Phone) */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Quick Connect & Pay (Tap to Scan QR)
            </span>
          </div>
          <span className="text-[11px] text-sky-500 font-extrabold">Instant Phone Camera Scan</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {quickConnects
            .filter((item) => item.isVisible)
            .map((item) => {
              const renderQuickIcon = () => {
                if (item.type === 'venmo') {
                  return <span className="font-black text-sm">V</span>;
                }
                if (item.type === 'cashapp') {
                  return <span className="font-black text-sm">$</span>;
                }
                if (item.type === 'linktree') {
                  return <span className="text-sm">🌲</span>;
                }
                if (item.type === 'instagram') {
                  return <span className="text-sm">📸</span>;
                }
                if (item.type === 'whatsapp') {
                  return <span className="text-sm">💬</span>;
                }
                if (item.type === 'phone') {
                  return <Phone className="w-4 h-4" />;
                }
                if (item.type === 'website') {
                  return <Globe className="w-4 h-4" />;
                }
                return <QrCode className="w-4 h-4" />;
              };

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playCabinChime('tap');
                    setSocialModalData({
                      title: item.title,
                      subtitle: item.subtitle,
                      handleOrValue: item.handleOrValue,
                      url: item.url,
                      qrValue: item.qrValue,
                      type: item.type,
                      description: item.description,
                      badge: item.badge,
                      accentColor: item.accentColor,
                    });
                  }}
                  className="flex-1 min-w-[76px] sm:min-w-[84px] flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all cursor-pointer min-h-[64px] sm:min-h-[68px] group active:scale-95 shadow-xs"
                >
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1 text-white shadow-xs group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.accentColor || '#6366f1' }}
                  >
                    {renderQuickIcon()}
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[8.5px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoLightboxModal
        photos={visiblePhotos}
        currentIndex={galleryIndex}
        isOpen={isLightboxOpen}
        onClose={() => {
          setIsLightboxOpen(false);
          onCloseExternalGallery?.();
        }}
        onSelectIndex={(idx) => setGalleryIndex(idx)}
      />

      {/* Social QR Modal */}
      <SocialModal
        data={socialModalData}
        onClose={() => setSocialModalData(null)}
      />

      {/* Direct Booking Modal */}
      <DirectBookingModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};
