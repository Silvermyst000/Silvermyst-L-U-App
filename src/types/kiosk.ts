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
  audioUrl?: string;
  audioDuration?: number;
  emojis?: string[];
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

export type DriverRole = 'owner' | 'manager' | 'admin' | 'driver' | 'editor';
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
  adminPin?: string; // Profile-specific 4-digit PIN (default '0000')
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
  audioUrl?: string;
  audioDuration?: number;
  emojis?: string[];
  attachmentUrl?: string;
  sentAt: number;
  readBy: string[]; // user IDs who read it
}

export interface MarketingPopup {
  id: string;
  title: string;
  subtitle?: string;
  bodyText: string;
  imageUrl?: string;
  badgeText?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
  audioSound?: 'jingle' | 'celebrate' | 'chime' | 'none';
  backgroundColor?: string;
  isActive: boolean;
  priority?: number;
  triggerType?: 'startup' | 'periodic' | 'scheduled' | 'manual';
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  repeatIntervalMinutes?: number;
  lastTriggeredAt?: number;
  createdAt: number;
}

export type CabinThemeMode = 'royal_purple' | 'notre_dame' | 'emerald_luxury' | 'crimson_holiday' | 'cyberpunk' | 'champagne';

export interface CabinThemePalette {
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}

export interface CabinThemeConfig {
  id: CabinThemeMode;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  lightBgGradient: string;
  cardBg: string;
  fadedPattern?: 'notre_dame' | 'holiday_snow' | 'luxury_mesh' | 'geometric' | 'none';
  darkPalette: CabinThemePalette;
  lightPalette: CabinThemePalette;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de';

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

// 1. Ride Preferences
export interface RidePreferenceSelection {
  id?: string;
  atmosphere: 'quiet' | 'conversation' | 'tour_guide' | 'standard';
  musicVibe: 'passenger_choice' | 'synthwave' | 'jazz' | 'top_hits' | 'silent' | 'driver_choice';
  temperature: 'cooler' | 'standard' | 'warmer';
  targetTempF?: number;
  windowSetting: 'closed_ac' | 'cracked_fresh_air' | 'open';
  refreshments: ('cold_water' | 'charger_lightning' | 'charger_usbc' | 'mints')[];
  additionalNotes?: string;
  submittedAt?: number;
  driverId?: string;
  tabletId?: string;
}

// 2. Passenger Feedback & Compliments
export interface PassengerFeedback {
  id: string;
  rating: number; // 1 to 5 stars
  compliments: string[]; // e.g. 'Smooth Ride', 'Clean Vehicle', 'Great Conversation', etc.
  category: 'compliment' | 'suggestion' | 'concern' | 'general';
  message?: string;
  driverId: string;
  driverName?: string;
  tabletId?: string;
  submittedAt: number;
  isRead?: boolean;
}

// 3. Driver Shift Readiness Checklist
export interface ChecklistTask {
  id: string;
  label: string;
  category: 'tablet' | 'vehicle' | 'supplies' | 'connectivity';
  isChecked: boolean;
  notes?: string;
}

export interface DriverShiftChecklist {
  id: string;
  driverId: string;
  driverName: string;
  dateStr: string; // YYYY-MM-DD
  tasks: ChecklistTask[];
  isFullyCompleted: boolean;
  completedAt?: number;
}

// 4. Scheduled Content
export interface ScheduledContentItem {
  id: string;
  title: string;
  type: 'screensaver' | 'announcement' | 'quick_connect' | 'button_promo';
  targetTabletId: 'all' | string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;
  endTime: string;
  isActive: boolean;
  contentPayload: string;
  createdAt: number;
}

// 5. Remote Kiosk Device Command & Status
export interface RemoteKioskCommand {
  id: string;
  tabletId: string; // 'all' or tablet ID
  action: 'reload_kiosk' | 'force_resync' | 'test_chime' | 'clear_cache' | 'set_kiosk_lock';
  payload?: any;
  issuedAt: number;
  issuedBy: string;
  executedAt?: number;
  status: 'pending' | 'completed' | 'failed';
}

// 6. Translation Item (English & Spanish)
export interface TranslationItem {
  key: string;
  en: string;
  es: string;
  category: 'navigation' | 'requests' | 'buttons' | 'announcements' | 'general';
}

// 7. Usage Analytics Event & Summary
export interface AnalyticsEvent {
  id: string;
  type: 'button_launch' | 'song_request' | 'comfort_request' | 'game_play' | 'gallery_view' | 'service_inquiry' | 'feedback_submit';
  targetId: string;
  targetName: string;
  driverId?: string;
  tabletId?: string;
  timestamp: number;
}

export interface ChangeHistorySnapshot {
  id: string;
  timestamp: number;
  author: string;
  summary: string;
  description?: string;
  changeType: 'buttons' | 'driver' | 'screensaver' | 'system' | 'rollback';
  apps?: InstalledAppItem[];
  drivers?: DriverProfile[];
  quickConnects?: QuickConnectItem[];
  snapshotData?: {
    activeDriverId?: string;
    installedAppsCount?: number;
    quickConnectsCount?: number;
    albumsCount?: number;
    screensaverSettings?: ScreensaverSettings;
    apps?: InstalledAppItem[];
    drivers?: DriverProfile[];
    quickConnects?: QuickConnectItem[];
  };
}

// 9. Sync Status State for UI
export type CloudSyncState = 'synced' | 'saving' | 'offline' | 'error';

// 10. Driver Working Shift Calendar Entry
export interface WorkShift {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar?: string;
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timeZone: string; // e.g. 'America/Indiana/Indianapolis (ET)'
  locationZone: string; // e.g. 'South Bend / Notre Dame'
  vehicleModel?: string;
  status: 'scheduled' | 'active' | 'completed' | 'time_off';
  notes?: string;
  createdAt: number;
}

// 11. Driver Shift Swap / Schedule Change Request
export interface ShiftChangeRequest {
  id: string;
  shiftId: string;
  shiftDateStr: string;
  shiftHours: string;
  locationZone?: string;
  requesterId: string;
  requesterName: string;
  targetDriverId?: string;
  targetDriverName?: string;
  targetRole: 'driver' | 'manager';
  requestType: 'swap' | 'cover' | 'time_change' | 'drop';
  proposedStartTime?: string;
  proposedEndTime?: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
}

// 12. Admin Customizable Android Quick-Launch Apps (Spotify, YouTube, Maps, etc.)
export interface AdminAndroidApp {
  id: string;
  name: string;
  subtitle?: string;
  emoji: string;
  iconPreset: 'spotify' | 'youtube' | 'maps' | 'waze' | 'ytmusic' | 'whatsapp' | 'audible' | 'phone' | 'custom';
  packageName: string;
  deepLinkUrl: string;
  webFallbackUrl: string;
  accentColor: string;
  isVisible: boolean;
  order: number;
}

// 13. Full Configuration & Historical System Backup Payload
export interface SystemBackupPayload {
  version: 'silvermyst-complete-backup-v2' | 'silvermyst-backup-v1';
  backupScope: 'full' | 'config_only' | 'history_only';
  exportedAt: string;
  exportedBy: string;
  appVersion: string;
  config?: {
    activeDriverId: string;
    drivers: DriverProfile[];
    installedApps: InstalledAppItem[];
    adminAndroidApps: AdminAndroidApp[];
    quickConnects: QuickConnectItem[];
    galleryAlbums: GalleryAlbum[];
    galleryPhotos: GalleryItem[];
    screensaverSettings: ScreensaverSettings;
    cabinTheme: CabinThemeMode;
    isDark: boolean;
    passengerLanguage: SupportedLanguage;
    adminLanguage: SupportedLanguage;
    marketingPopups?: MarketingPopup[];
  };
  history?: {
    workShifts: WorkShift[];
    shiftChangeRequests: ShiftChangeRequest[];
    songRequests: SongRequest[];
    cabinMessages: CabinMessage[];
    serviceInquiries: ServiceInquiry[];
    teamMessages: InternalAdminMessage[];
    feedbackList: PassengerFeedback[];
    checklists: DriverShiftChecklist[];
    analyticsEvents: AnalyticsEvent[];
    changeHistorySnapshots: ChangeHistorySnapshot[];
  };
}

// 14. Admin Enrollment & Pre-Approved Allowlist Access Control
export interface ApprovedEnrollment {
  id: string; // normalized lowercase email
  email: string;
  role: DriverRole;
  displayName: string;
  vehicleAssignment?: string;
  notes?: string;
  status: 'pending_enrollment' | 'enrolled' | 'revoked';
  addedByUid: string;
  addedByEmail: string;
  enrolledUid?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthorizedUserAccount {
  uid: string;
  email: string;
  fullName: string;
  title?: string;
  phone?: string;
  vehicleModel?: string;
  assignedPin: string;
  role: DriverRole;
  status: 'active' | 'suspended';
  approvedBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnrollmentAccessRequest {
  id: string; // matches uid
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  requestedRole: Exclude<DriverRole, 'owner'>;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: number;
  updatedAt: number;
}

// 15. Commercial Platform License / Fleet Demo Inquiry from Public Website
export interface LicenseInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  fleetSize: '1' | '2-5' | '6-20' | '21+';
  packageTier: 'single_vehicle' | 'fleet_pro' | 'enterprise_whitelabel';
  billingCycle?: 'monthly' | 'annual';
  licenseKey?: string;
  notes: string;
  status: 'new' | 'contacted' | 'licensed';
  submittedAt: number;
}

// 16. Issued Platform License unlocking device installation after completed purchase
export interface PlatformLicense {
  id: string; // e.g. SLV-PRO-XXXX-XXXX
  companyName: string;
  packageTier: 'single_vehicle' | 'fleet_pro' | 'enterprise_whitelabel';
  maxVehicles: number;
  paymentStatus: 'paid' | 'revoked';
  createdAt: number;
  updatedAt: number;
}




