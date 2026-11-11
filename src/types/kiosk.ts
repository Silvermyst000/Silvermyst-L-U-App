export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  genre: string;
  note?: string;
  requestedAt: number;
  status: 'pending' | 'accepted' | 'playing';
}

export interface CabinMessage {
  id: string;
  type: 'comfort' | 'custom';
  text: string;
  icon?: string;
  sentAt: number;
  status: 'sent' | 'acknowledged' | 'completed';
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  genre: string;
  vibe: string;
  bpm: number;
  synthesizedWave: 'ambient' | 'chill' | 'lofi' | 'smooth' | 'jazz';
}

export interface MultiserviceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  badge: string;
  highlights: string[];
  pricingHint: string;
  icon: string;
}

export interface FoodItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  carlosRecommendation: string;
  bestLocalSpot: string;
  rating: string;
}

export interface LocalAttraction {
  id: string;
  name: string;
  category: 'Dining' | 'Sightseeing' | 'Nightlife' | 'Coffee' | 'Culture';
  distance: string;
  description: string;
  carlosTip: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  category: 'advertising' | 'travel' | 'car' | 'custom';
  isHiddenFromPassengers: boolean;
  createdAt: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tag: string;
  albumId: string;
  createdAt?: number;
}

export interface DriverProfile {
  name: string;
  avatarUrl: string;
  title: string;
  companyName: string;
  tagline: string;
  rating: number;
  totalTrips: number;
  yearsDriving: number;
  languages: string[];
  vehicleModel: string;
  vehicleYear: string;
  cleanlinessScore: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  linktree: string;
  whatsapp: string;
  bio: string;
  funFact: string;
}

export interface ScreensaverSettings {
  isEnabled: boolean;
  idleTimeoutSeconds: number;
  slideDurationSeconds: number;
  selectedPhotoIds: string[];
  showQrCode: boolean;
  showBusinessInfo: boolean;
  showTouchToWake: boolean;
  customPromoText: string;
}

export interface ScreensaverSlideItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface InstalledAppItem {
  id: string;
  name: string;
  category: 'music' | 'google' | 'games' | 'entertainment' | 'utilities';
  packageName: string; // Android package name e.g. 'com.spotify.music'
  deepLinkUrl: string; // Intent or scheme e.g. 'spotify:', 'vnd.youtube:'
  webFallbackUrl: string; // Web URL fallback e.g. 'https://open.spotify.com'
  iconType: 'spotify' | 'youtube' | 'maps' | 'chrome' | 'translate' | 'games' | 'playstore' | 'netflix' | 'custom';
  iconUrl?: string; // Optional custom icon image or emoji
  accentColor: string; // Tailwind color e.g. '#1db954', 'bg-emerald-500'
  description: string;
  badge?: string; // e.g. 'Installed on Tablet', 'Download Games', 'Instant Play'
  isHiddenFromPassengers: boolean;
  isCustom?: boolean;
}


