export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  genre: string;
  note?: string;
  requestedAt: number;
  status: 'pending' | 'accepted' | 'playing' | 'completed';
  driverId?: string;
  tabletId?: string;
}

export interface CabinMessage {
  id: string;
  type: 'comfort' | 'custom';
  text: string;
  category?: 'volume-up' | 'volume-down' | 'too-hot' | 'too-cold' | 'window' | 'quiet' | 'charging' | 'water' | 'other';
  icon?: string;
  sentAt: number;
  status: 'sent' | 'acknowledged' | 'completed';
  driverId?: string;
  tabletId?: string;
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
  photoUrl?: string;
  contactMethod?: string;
  qrDestination?: string;
  isActive?: boolean;
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
  assignedDriverId?: string; // carlos, manyell, or 'all'
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
  driverId?: string;
  caption?: string;
  createdAt?: number;
}

export type DriverRole = 'owner' | 'admin' | 'driver' | 'editor';
export type DriverAvailability = 'available' | 'driving' | 'break' | 'offline';

export interface DriverProfile {
  id: string;
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
  vehiclePlate?: string;
  cleanlinessScore: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  linktree: string;
  whatsapp: string;
  bio: string;
  funFact: string;
  role: DriverRole;
  availability: DriverAvailability;
  assignedTabletId?: string;
  isVisibleToPassengers: boolean;
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
  assignedTabletId?: string;
}

export interface ScreensaverSlideItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  order?: number;
  isEnabled?: boolean;
}

export type ButtonActionType =
  | 'launch_app'
  | 'open_url'
  | 'open_internal'
  | 'show_popup'
  | 'open_gallery'
  | 'passenger_request'
  | 'service_inquiry'
  | 'show_info';

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
  actionType?: ButtonActionType;
  actionPayload?: string;
  order?: number;
}

export interface TabletDevice {
  id: string;
  name: string;
  assignedDriverId: string;
  vehicleModel: string;
  status: 'online' | 'offline';
  lastSeen: number;
  appVersion: string;
  resolution: string;
  ipAddress?: string;
  isLocked: boolean;
}

export interface ServiceInquiry {
  id: string;
  serviceId: string;
  serviceTitle: string;
  passengerName?: string;
  phoneOrContact: string;
  notes: string;
  submittedAt: number;
  status: 'new' | 'contacted' | 'resolved';
  driverId: string;
  tabletId?: string;
}

export interface InternalAdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: DriverRole;
  recipientId?: string; // if null, public to all authorized drivers/admins
  isAnnouncement?: boolean;
  text: string;
  attachmentUrl?: string;
  sentAt: number;
  readBy: string[]; // user IDs who read it
}

export interface ActivityAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface QuickConnectItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  type: 'venmo' | 'cashapp' | 'linktree' | 'instagram' | 'whatsapp' | 'phone' | 'sms' | 'website' | 'custom';
  handleOrValue: string;
  url: string;
  qrValue: string;
  iconType: string;
  accentColor: string;
  description: string;
  isVisible: boolean;
  order?: number;
}

