import React, { useState, useEffect, useRef } from 'react';
import {
  DriverProfile,
  SongRequest,
  CabinMessage,
  ScreensaverSettings,
  GalleryAlbum,
  GalleryItem,
  InstalledAppItem,
  TabletDevice,
  ServiceInquiry,
  InternalAdminMessage,
  QuickConnectItem,
  ButtonActionType,
  LicenseInquiry,
  PlatformLicense,
} from '../../types/kiosk';
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  Tablet,
  Gamepad2,
  Tv,
  Folder,
  Briefcase,
  Users,
  Send,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Smartphone,
  Wifi,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Car,
  Laptop,
  Maximize2,
  Play,
  Lock,
  Unlock,
  QrCode,
  Share2,
  Camera,
  Layers,
  Compass,
  KeyRound,
  X,
  Upload,
  Heart,
  CheckSquare,
  BarChart3,
  Wrench,
  History,
  Languages,
  Palette,
  Download,
  RotateCcw,
  Smile,
  Mic,
  MicOff,
  Calendar,
  Sun,
  Moon,
  HardDriveDownload,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { cloudSync } from '../../services/cloudSync';
import { INITIAL_DRIVERS_LIST, INITIAL_INSTALLED_APPS, INITIAL_QUICK_CONNECT_ITEMS } from '../../data/mockData';
import { QRCodeView } from '../../utils/qrCode';
import { HeaderBar } from '../HeaderBar';
import { DashboardClockButton } from '../DashboardClockButton';
import { LeftAppsHub } from '../LeftAppsHub';
import { RightDriverHub } from '../RightDriverHub';
import { AdminExperienceController } from './AdminExperienceController';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminShiftChecklist } from './AdminShiftChecklist';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminKioskRecovery } from './AdminKioskRecovery';
import { AdminChangeHistory } from './AdminChangeHistory';
import { AdminTranslationManager } from './AdminTranslationManager';
import { AdminFeedbackManager } from './AdminFeedbackManager';
import { AdminMarketingManager } from './AdminMarketingManager';
import { AdminShiftCalendar } from './AdminShiftCalendar';
import { AdminQuickAppsBar } from './AdminQuickAppsBar';
import { AdminBackupRestore } from './AdminBackupRestore';
import { AdminEnrollmentManager } from './AdminEnrollmentManager';
import { enrollmentAdminApi } from '../../services/authEnrollment';
import { User } from 'firebase/auth';
import {
  AdminAndroidApp,
  ChangeHistorySnapshot,
  CabinThemeMode,
  DriverRole,
  MarketingPopup,
  SupportedLanguage,
  SystemBackupPayload,
} from '../../types/kiosk';
import {
  CABIN_THEMES,
  DEFAULT_ADMIN_ANDROID_APPS,
  KIOSK_TRANSLATIONS,
  STAFF_ROLE_META,
  getStaffRoleMeta,
} from '../../data/cabinThemes';
import { getAdminSubLabels, getAdminTranslations } from '../../data/adminTranslations';

interface AdminDashboardProps {
  currentDriver: DriverProfile;
  onSelectDriver: (driver: DriverProfile) => void;
  onBackToKiosk: () => void;
  onSignOut?: () => void;
  songRequests: SongRequest[];
  onUpdateSongStatus: (id: string, status: SongRequest['status']) => void;
  cabinMessages: CabinMessage[];
  onUpdateMessageStatus: (id: string, status: CabinMessage['status']) => void;
  onClearCompletedRequests: () => void;
  screensaverSettings: ScreensaverSettings;
  onUpdateScreensaverSettings: (settings: ScreensaverSettings) => void;
  onTriggerScreensaverNow: () => void;
  albums: GalleryAlbum[];
  onUpdateAlbums: (albums: GalleryAlbum[]) => void;
  photos: GalleryItem[];
  onUpdatePhotos: (photos: GalleryItem[]) => void;
  installedApps: InstalledAppItem[];
  onUpdateInstalledApps: (apps: InstalledAppItem[]) => void;
  quickConnects?: QuickConnectItem[];
  onUpdateQuickConnects?: (items: QuickConnectItem[]) => void;
  driversList?: DriverProfile[];
  onUpdateDriversList?: (drivers: DriverProfile[]) => void;
  adminPin?: string;
  onUpdateAdminPin?: (newPin: string) => void;
  onBroadcastAnnouncement?: (text: string) => void;
  onClearAllRequests?: () => void;
  cabinTheme?: CabinThemeMode;
  onUpdateCabinTheme?: (theme: CabinThemeMode) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  onSetDarkMode?: (val: boolean) => void;
  onRestoreSongRequests?: (reqs: SongRequest[]) => void;
  onRestoreCabinMessages?: (msgs: CabinMessage[]) => void;
  onPreviewMarketingPopup?: (popup: MarketingPopup) => void;
  passengerLanguage?: SupportedLanguage;
  onUpdatePassengerLanguage?: (lang: SupportedLanguage) => void;
  firebaseUser?: User | null;
  isMasterOwner?: boolean;
  isAdminAccount?: boolean;
  onLockToPublicPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentDriver,
  onSelectDriver,
  onBackToKiosk,
  onSignOut,
  songRequests,
  onUpdateSongStatus,
  cabinMessages,
  onUpdateMessageStatus,
  onClearCompletedRequests,
  screensaverSettings,
  onUpdateScreensaverSettings,
  onTriggerScreensaverNow,
  albums,
  onUpdateAlbums,
  photos,
  onUpdatePhotos,
  installedApps,
  onUpdateInstalledApps,
  quickConnects = INITIAL_QUICK_CONNECT_ITEMS,
  onUpdateQuickConnects,
  driversList = INITIAL_DRIVERS_LIST,
  onUpdateDriversList,
  adminPin = '0000',
  onUpdateAdminPin,
  onBroadcastAnnouncement,
  onClearAllRequests,
  cabinTheme = 'royal_purple',
  onUpdateCabinTheme,
  isDark = true,
  onToggleDark,
  onSetDarkMode,
  onRestoreSongRequests,
  onRestoreCabinMessages,
  onPreviewMarketingPopup,
  passengerLanguage = 'en',
  onUpdatePassengerLanguage,
  firebaseUser = null,
  isMasterOwner = false,
  isAdminAccount = isMasterOwner,
  onLockToPublicPortal,
}) => {
  // Navigation tabs
  type NavTab =
    | 'overview'
    | 'enrollment'
    | 'controller'
    | 'requests'
    | 'shifts'
    | 'feedback'
    | 'announcements'
    | 'marketing'
    | 'apps'
    | 'quick_connect'
    | 'galleries'
    | 'drivers'
    | 'checklists'
    | 'analytics'
    | 'recovery'
    | 'backup'
    | 'history'
    | 'translations'
    | 'sandbox'
    | 'screensaver'
    | 'tablets'
    | 'inquiries'
    | 'team_chat'
    | 'security';

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [adminLanguage, setAdminLanguage] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_admin_language_v1') as SupportedLanguage;
      if (stored && KIOSK_TRANSLATIONS[stored]) return stored;
    } catch (e) {}
    return 'en';
  });
  const handleChangeAdminLanguage = (lang: SupportedLanguage) => {
    setAdminLanguage(lang);
    try {
      localStorage.setItem('silvermyst_admin_language_v1', lang);
    } catch (e) {}
  };
  const t = KIOSK_TRANSLATIONS[adminLanguage] || KIOSK_TRANSLATIONS.en;
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const adminHeaderScrollRef = useRef<HTMLDivElement>(null);

  const scrollAdminHeader = (dir: 'left' | 'right') => {
    playCabinChime('tap');
    if (!adminHeaderScrollRef.current) return;
    adminHeaderScrollRef.current.scrollBy({
      left: dir === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  };

  // Customizable Admin / Driver Android Quick-Launch Apps (Spotify, YouTube, Maps, Waze, etc.)
  const [adminAndroidApps, setAdminAndroidApps] = useState<AdminAndroidApp[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_admin_apps_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_ADMIN_ANDROID_APPS;
  });

  const handleUpdateAdminApps = async (nextApps: AdminAndroidApp[]) => {
    setAdminAndroidApps(nextApps);
    try {
      localStorage.setItem('silvermyst_admin_apps_v1', JSON.stringify(nextApps));
    } catch (e) {}
    await cloudSync.saveSystemSetting('admin_android_apps', { apps: nextApps });
  };

  const handleRollback = (snapshot: ChangeHistorySnapshot) => {
    if (snapshot.apps && snapshot.apps.length > 0) {
      onUpdateInstalledApps(snapshot.apps);
    }
    if (snapshot.drivers && snapshot.drivers.length > 0) {
      setDrivers(snapshot.drivers);
      onUpdateDriversList?.(snapshot.drivers);
    }
    if (snapshot.quickConnects && snapshot.quickConnects.length > 0) {
      setQuickConnectList(snapshot.quickConnects);
      onUpdateQuickConnects?.(snapshot.quickConnects);
    }
    showToast(`Restored snapshot: ${snapshot.description}`);
  };

  // Multi-driver registry
  const [drivers, setDrivers] = useState<DriverProfile[]>(driversList);
  const [activeDriverId, setActiveDriverId] = useState<string>(currentDriver.id);

  useEffect(() => {
    setDrivers(driversList);
  }, [driversList]);

  // Quick Connect links
  const [quickConnectList, setQuickConnectList] = useState<QuickConnectItem[]>(quickConnects);

  // Tablet fleet
  const [tablets, setTablets] = useState<TabletDevice[]>([
    {
      id: 'tablet-samsung-10-01',
      name: 'Tablet 1 (Cadillac Escalade)',
      assignedDriverId: 'driver-carlos',
      vehicleModel: 'Cadillac Escalade ESV',
      status: 'online',
      lastSeen: Date.now(),
      appVersion: 'v3.2.0-kiosk',
      resolution: '1280 × 800 (10-inch)',
      isLocked: true,
    },
    {
      id: 'tablet-samsung-10-02',
      name: 'Tablet 2 (Executive Suburban)',
      assignedDriverId: 'driver-manyell',
      vehicleModel: 'Chevrolet Suburban Premier',
      status: 'online',
      lastSeen: Date.now() - 1000 * 60 * 4,
      appVersion: 'v3.2.0-kiosk',
      resolution: '1280 × 800 (10-inch)',
      isLocked: true,
    },
  ]);

  // Passenger Service Inquiries
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([
    {
      id: 'inq-demo-1',
      serviceId: 'private-chauffeur',
      serviceTitle: 'Private Airport & VIP Chauffeur',
      passengerName: 'David L. (Corporate Client)',
      phoneOrContact: '(574) 555-0192',
      notes: 'Interested in booking weekly airport round-trips for executive team.',
      submittedAt: Date.now() - 1000 * 60 * 35,
      status: 'new',
      driverId: 'driver-carlos',
      tabletId: 'tablet-samsung-10-01',
    },
    {
      id: 'inq-demo-2',
      serviceId: 'computer-repair',
      serviceTitle: 'Computer & Device Repair (PC & Mac)',
      passengerName: 'Maria S.',
      phoneOrContact: 'maria.tech@gmail.com',
      notes: 'Has a MacBook Pro with liquid spill / keyboard issue. Wants diagnostic quote.',
      submittedAt: Date.now() - 1000 * 60 * 120,
      status: 'contacted',
      driverId: 'driver-carlos',
      tabletId: 'tablet-samsung-10-01',
    },
  ]);
  const [licenseInquiries, setLicenseInquiries] = useState<LicenseInquiry[]>([]);
  const [platformLicenses, setPlatformLicenses] = useState<PlatformLicense[]>([]);

  // Internal team messages
  const [teamMessages, setTeamMessages] = useState<InternalAdminMessage[]>([
    {
      id: 'msg-1',
      senderId: 'driver-carlos',
      senderName: 'Carlos R.',
      senderRole: 'owner',
      text: 'Good morning team! Samsung tablets have been updated with the new in-seat charging and payment promotional screensavers.',
      sentAt: Date.now() - 1000 * 60 * 180,
      readBy: ['driver-carlos', 'driver-manyell'],
    },
    {
      id: 'msg-2',
      senderId: 'driver-manyell',
      senderName: 'Manyell M.',
      senderRole: 'driver',
      text: 'Got it Carlos! Passengers have been loving the interactive game buttons and Spotify link.',
      sentAt: Date.now() - 1000 * 60 * 90,
      readBy: ['driver-carlos', 'driver-manyell'],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [announcementInput, setAnnouncementInput] = useState('');

  // Modals & form states
  const [isAddButtonModalOpen, setIsAddButtonModalOpen] = useState(false);
  const [buttonFilter, setButtonFilter] = useState<string>('all');

  // New Button Form State
  const [newBtnName, setNewBtnName] = useState('');
  const [newBtnCategory, setNewBtnCategory] = useState<InstalledAppItem['category']>('games');
  const [newBtnPackage, setNewBtnPackage] = useState('');
  const [newBtnDeepLink, setNewBtnDeepLink] = useState('');
  const [newBtnWeb, setNewBtnWeb] = useState('');
  const [newBtnDesc, setNewBtnDesc] = useState('');
  const [newBtnBadge, setNewBtnBadge] = useState('Installed App');
  const [newBtnAccent, setNewBtnAccent] = useState('#6366f1');
  const [newBtnActionType, setNewBtnActionType] = useState<ButtonActionType>('launch_app');
  const [newBtnHidden, setNewBtnHidden] = useState(false);

  // Driver Management States
  const [editingDriver, setEditingDriver] = useState<DriverProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | DriverRole>('all');
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverTitle, setNewDriverTitle] = useState('Executive Chauffeur');
  const [newDriverRole, setNewDriverRole] = useState<DriverProfile['role']>('driver');
  const [newDriverVehicle, setNewDriverVehicle] = useState('Luxury SUV');
  const [newDriverPhone, setNewDriverPhone] = useState('(574) 387-6229');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [newDriverWebsite, setNewDriverWebsite] = useState('https://silvermyst.com/');
  const [newDriverBio, setNewDriverBio] = useState('');
  const [newDriverAvatar, setNewDriverAvatar] = useState('/assets/aistudio/1672373005387_54b82b85.jpg');
  const [newDriverPin, setNewDriverPin] = useState('0000');

  // Album & Photo Management States
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState<GalleryAlbum['category']>('custom');
  const [newAlbumHidden, setNewAlbumHidden] = useState(false);
  const [newAlbumDriver, setNewAlbumDriver] = useState('all');

  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoSubtitle, setNewPhotoSubtitle] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState('In-Cabin');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoAlbumId, setNewPhotoAlbumId] = useState<string>(albums[0]?.id || 'travel-photography');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Quick Connect Management States
  const [isAddQuickConnectOpen, setIsAddQuickConnectOpen] = useState(false);
  const [editingQuickConnect, setEditingQuickConnect] = useState<QuickConnectItem | null>(null);
  const [newQcTitle, setNewQcTitle] = useState('');
  const [newQcSubtitle, setNewQcSubtitle] = useState('');
  const [newQcType, setNewQcType] = useState<QuickConnectItem['type']>('custom');
  const [newQcHandle, setNewQcHandle] = useState('');
  const [newQcUrl, setNewQcUrl] = useState('');
  const [newQcQrValue, setNewQcQrValue] = useState('');
  const [newQcAccent, setNewQcAccent] = useState('#8b5cf6');
  const [newQcBadge, setNewQcBadge] = useState('Scan to Pay');
  const [newQcDesc, setNewQcDesc] = useState('');

  // Profile-Specific PIN Management State
  const [selectedSecurityDriverId, setSelectedSecurityDriverId] = useState<string>(currentDriver.id);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Compact Driver Pop-Up Notification for incoming passenger messages/requests while on Admin
  const [driverPopupAlert, setDriverPopupAlert] = useState<{
    id: string;
    title: string;
    text: string;
    kind: 'message' | 'song';
    audioDuration?: number;
  } | null>(null);
  const seenRequestIdsRef = useRef<Set<string>>(
    new Set([
      ...cabinMessages.map((m) => m.id),
      ...songRequests.map((s) => s.id),
    ])
  );

  // Team chat emoji & audio note states
  const [showTeamEmojis, setShowTeamEmojis] = useState(false);
  const [isRecordingTeamVoice, setIsRecordingTeamVoice] = useState(false);
  const [teamVoiceSeconds, setTeamVoiceSeconds] = useState(0);
  const teamVoiceTimerRef = useRef<any>(null);

  // Sandbox Live View Driver Selection
  const [sandboxDriverId, setSandboxDriverId] = useState<string>(currentDriver.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const editAvatarFileRef = useRef<HTMLInputElement>(null);
  const addAvatarFileRef = useRef<HTMLInputElement>(null);

  // Cloud synchronization subscribers
  useEffect(() => {
    const unsubDrivers = cloudSync.subscribeToDrivers((cloudDrivers) => {
      if (cloudDrivers && cloudDrivers.length > 0) {
        setDrivers(cloudDrivers);
      }
    });

    const unsubTablets = cloudSync.subscribeToTablets((cloudTablets) => {
      if (cloudTablets && cloudTablets.length > 0) {
        setTablets(cloudTablets);
      }
    });

    const unsubInquiries = cloudSync.subscribeToInquiries((cloudInquiries) => {
      if (cloudInquiries && cloudInquiries.length > 0) {
        setInquiries(cloudInquiries);
      }
    });

    const unsubMsgs = cloudSync.subscribeToAdminMessages((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setTeamMessages(cloudMsgs);
      }
    });

    const unsubSystem = cloudSync.subscribeToSystemSettings((settings) => {
      if (settings.admin_android_apps && Array.isArray(settings.admin_android_apps.apps)) {
        setAdminAndroidApps(settings.admin_android_apps.apps);
      }
    });

    const isAdminCapable = isMasterOwner || isAdminAccount;

    const unsubLicenseInquiries = isAdminCapable
      ? enrollmentAdminApi.subscribeLicenseInquiries((items) => {
          setLicenseInquiries(items);
        })
      : () => {};

    const unsubPlatformLicenses = isAdminCapable
      ? enrollmentAdminApi.subscribePlatformLicenses((items) => {
          setPlatformLicenses(items);
        })
      : () => {};

    return () => {
      unsubDrivers();
      unsubTablets();
      unsubInquiries();
      unsubMsgs();
      unsubSystem();
      unsubLicenseInquiries();
      unsubPlatformLicenses();
    };
  }, [isMasterOwner, isAdminAccount]);

  const handleApplyFullBackup = async (
    payload: SystemBackupPayload,
    options: { restoreConfig: boolean; restoreHistory: boolean }
  ) => {
    if (options.restoreConfig && payload.config) {
      const cfg = payload.config;
      if (Array.isArray(cfg.drivers) && cfg.drivers.length > 0) {
        setDrivers(cfg.drivers);
        onUpdateDriversList?.(cfg.drivers);
        await cloudSync.saveDriversList(cfg.drivers);
        const target =
          cfg.drivers.find((d) => d.id === cfg.activeDriverId) || cfg.drivers[0];
        if (target) {
          setActiveDriverId(target.id);
          onSelectDriver(target);
        }
      }
      if (Array.isArray(cfg.installedApps)) {
        onUpdateInstalledApps(cfg.installedApps);
        await cloudSync.saveAppsList(cfg.installedApps);
      }
      if (Array.isArray(cfg.adminAndroidApps)) {
        await handleUpdateAdminApps(cfg.adminAndroidApps);
      }
      if (Array.isArray(cfg.quickConnects)) {
        setQuickConnectList(cfg.quickConnects);
        onUpdateQuickConnects?.(cfg.quickConnects);
        await cloudSync.saveQuickConnects(cfg.quickConnects);
      }
      if (Array.isArray(cfg.galleryAlbums)) {
        onUpdateAlbums(cfg.galleryAlbums);
        await cloudSync.saveAlbums(cfg.galleryAlbums);
      }
      if (Array.isArray(cfg.galleryPhotos)) {
        onUpdatePhotos(cfg.galleryPhotos);
        await cloudSync.savePhotos(cfg.galleryPhotos);
      }
      if (cfg.screensaverSettings) {
        onUpdateScreensaverSettings(cfg.screensaverSettings);
        await cloudSync.saveSystemSetting('screensaver_config', cfg.screensaverSettings);
      }
      if (cfg.cabinTheme && CABIN_THEMES[cfg.cabinTheme]) {
        onUpdateCabinTheme?.(cfg.cabinTheme);
      }
      if (typeof cfg.isDark === 'boolean') {
        onSetDarkMode?.(cfg.isDark);
      }
      if (cfg.passengerLanguage && KIOSK_TRANSLATIONS[cfg.passengerLanguage]) {
        onUpdatePassengerLanguage?.(cfg.passengerLanguage);
      }
      if (cfg.adminLanguage && KIOSK_TRANSLATIONS[cfg.adminLanguage]) {
        handleChangeAdminLanguage(cfg.adminLanguage);
      }
      if (Array.isArray(cfg.marketingPopups)) {
        await Promise.allSettled(cfg.marketingPopups.map((p) => cloudSync.saveMarketingPopup(p)));
      }
    }

    if (options.restoreHistory && payload.history) {
      const hist = payload.history;
      if (Array.isArray(hist.songRequests)) {
        onRestoreSongRequests?.(hist.songRequests);
      }
      if (Array.isArray(hist.cabinMessages)) {
        onRestoreCabinMessages?.(hist.cabinMessages);
      }
      if (Array.isArray(hist.serviceInquiries)) {
        setInquiries(hist.serviceInquiries);
      }
      if (Array.isArray(hist.teamMessages)) {
        setTeamMessages(hist.teamMessages);
      }
      await cloudSync.restoreHistoricalCollections(hist);
    }

    showToast('Backup restored across device and Cloud!');
  };

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingRequestsTotal =
    songRequests.filter((s) => s.status === 'pending').length +
    cabinMessages.filter((m) => m.status === 'sent').length;

  const newInquiriesCount =
    inquiries.filter((i) => i.status === 'new').length +
    licenseInquiries.filter((l) => l.status === 'new').length;

  // Sound chime & compact driver alert pop-up when new passenger message/request arrives while on Admin
  useEffect(() => {
    const newestPendingMsg = cabinMessages.find(
      (m) => m.status === 'sent' && !seenRequestIdsRef.current.has(m.id)
    );
    const newestPendingSong = songRequests.find(
      (s) => s.status === 'pending' && !seenRequestIdsRef.current.has(s.id)
    );

    if (newestPendingMsg) {
      seenRequestIdsRef.current.add(newestPendingMsg.id);
      if (soundAlerts) playCabinChime('comfort');
      setDriverPopupAlert({
        id: newestPendingMsg.id,
        title: 'Passenger Message / Request',
        text: newestPendingMsg.text,
        kind: 'message',
        audioDuration: newestPendingMsg.audioDuration,
      });
    } else if (newestPendingSong) {
      seenRequestIdsRef.current.add(newestPendingSong.id);
      if (soundAlerts) playCabinChime('song');
      setDriverPopupAlert({
        id: newestPendingSong.id,
        title: 'New Song Request',
        text: `"${newestPendingSong.title}" by ${newestPendingSong.artist}`,
        kind: 'song',
      });
    }
  }, [cabinMessages, songRequests, soundAlerts]);

  useEffect(() => {
    return () => {
      if (teamVoiceTimerRef.current) clearInterval(teamVoiceTimerRef.current);
    };
  }, []);

  // Handle Driver Availability change
  const handleUpdateDriverAvailability = async (driverId: string, availability: DriverProfile['availability']) => {
    playCabinChime('tap');
    const updated = drivers.map((d) => (d.id === driverId ? { ...d, availability } : d));
    setDrivers(updated);
    onUpdateDriversList?.(updated);
    const target = updated.find((d) => d.id === driverId);
    if (target) {
      await cloudSync.saveDriverProfile(target);
      if (driverId === currentDriver.id) {
        onSelectDriver(target);
      }
      showToast(`${target.name} status: ${availability.toUpperCase()}`);
    }
  };

  // Switch Active Driver
  const handleSwitchActiveDriver = (driverId: string) => {
    playCabinChime('acknowledged');
    setActiveDriverId(driverId);
    const selected = drivers.find((d) => d.id === driverId);
    if (selected) {
      onSelectDriver(selected);
      showToast(`Switched active kiosk driver to ${selected.name}`);
    }
  };

  // Upload Photo Helper for Driver Profiles (reads local image to data URL)
  const handleAvatarFileUpload = (
    file: File | undefined,
    onResult: (dataUrl: string) => void
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onResult(reader.result);
        showToast('Photo uploaded and ready!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Backup & Restore Profile Settings Helpers
  const handleDownloadBackupJson = () => {
    playCabinChime('tap');
    const payload = {
      version: 'silvermyst-backup-v1',
      exportedAt: new Date().toISOString(),
      activeDriverId,
      drivers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silvermyst-profiles-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Profile backup JSON downloaded!');
  };

  const handleRestoreBackupJson = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.drivers) && parsed.drivers.length > 0) {
          playCabinChime('acknowledged');
          setDrivers(parsed.drivers);
          onUpdateDriversList?.(parsed.drivers);
          await cloudSync.saveDriversList(parsed.drivers);
          const restoredActive =
            parsed.drivers.find((d: DriverProfile) => d.id === parsed.activeDriverId) ||
            parsed.drivers[0];
          if (restoredActive) {
            setActiveDriverId(restoredActive.id);
            onSelectDriver(restoredActive);
          }
          showToast(`Restored ${parsed.drivers.length} driver profiles from backup!`);
        } else {
          showToast('Invalid backup file: no driver profiles found.');
        }
      } catch (err) {
        showToast('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCloudProfileBackup = async () => {
    playCabinChime('acknowledged');
    const ok = await cloudSync.saveProfileBackup({
      drivers,
      activeDriverId,
      savedBy: activeDriver.name,
    });
    if (ok) showToast('Driver profiles & PINs backed up to Cloud!');
    else showToast('Cloud backup failed — check connection.');
  };

  const handleRestoreCloudProfileBackup = async () => {
    playCabinChime('tap');
    const backup = await cloudSync.getLatestProfileBackup();
    if (!backup || !Array.isArray(backup.drivers) || backup.drivers.length === 0) {
      showToast('No cloud profile backup found yet.');
      return;
    }
    setDrivers(backup.drivers);
    onUpdateDriversList?.(backup.drivers);
    await cloudSync.saveDriversList(backup.drivers);
    const restoredActive =
      backup.drivers.find((d) => d.id === backup.activeDriverId) || backup.drivers[0];
    if (restoredActive) {
      setActiveDriverId(restoredActive.id);
      onSelectDriver(restoredActive);
    }
    playCabinChime('acknowledged');
    showToast(`Restored ${backup.drivers.length} profiles from Cloud backup!`);
  };

  // Add New Driver
  const handleCreateDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) {
      showToast('Please provide a driver name.');
      return;
    }
    const cleanPin = newDriverPin.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 4) {
      showToast('Please set a 4-digit PIN (e.g. 0000) for this driver profile.');
      return;
    }
    playCabinChime('acknowledged');
    const newId = `driver-${Date.now()}`;
    const newProf: DriverProfile = {
      id: newId,
      name: newDriverName.trim(),
      avatarUrl: newDriverAvatar.trim() || '/assets/aistudio/1672373005387_54b82b85.jpg',
      title: newDriverTitle.trim(),
      companyName: 'Silvermyst Multiservices',
      tagline: 'VIP Chauffeur • Executive Hospitality',
      rating: 5.0,
      totalTrips: 120,
      yearsDriving: 3,
      languages: ['English', 'Español'],
      vehicleModel: newDriverVehicle.trim(),
      vehicleYear: '2025 Edition',
      cleanlinessScore: '100% Sanitized & Spotless',
      phone: newDriverPhone.trim() || '(574) 387-6229',
      email: newDriverEmail.trim() || 'contact@silvermyst.com',
      website: newDriverWebsite.trim() || 'https://silvermyst.com/',
      instagram: 'silvermyst_multiservices',
      linktree: 'silvermyst',
      whatsapp: '+15743876229',
      bio: newDriverBio.trim() || 'Welcome aboard! Committed to safe, punctual, and executive-level transportation.',
      funFact: 'Professional chauffeur and route navigator dedicated to five-star passenger comfort.',
      role: newDriverRole,
      availability: 'available',
      assignedTabletId: 'tablet-samsung-10-01',
      isVisibleToPassengers: true,
      adminPin: cleanPin,
    };

    const updated = [...drivers, newProf];
    setDrivers(updated);
    onUpdateDriversList?.(updated);
    await cloudSync.saveDriverProfile(newProf);
    setIsAddDriverModalOpen(false);
    setNewDriverName('');
    setNewDriverBio('');
    setNewDriverPin('0000');
    showToast(`Added ${newProf.name} to driver fleet with PIN ${cleanPin}!`);
  };

  // Delete Driver
  const handleDeleteDriver = async (driverId: string) => {
    if (drivers.length <= 1) {
      showToast('Cannot delete the last remaining driver profile.');
      return;
    }
    const target = drivers.find((d) => d.id === driverId);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete profile for ${target.name}?`)) return;

    playCabinChime('tap');
    const updated = drivers.filter((d) => d.id !== driverId);
    setDrivers(updated);
    onUpdateDriversList?.(updated);
    if (activeDriverId === driverId) {
      setActiveDriverId(updated[0].id);
      onSelectDriver(updated[0]);
    }
    showToast(`Deleted profile for ${target.name}`);
  };

  // Reorder Driver
  const handleMoveDriver = (index: number, direction: 'up' | 'down') => {
    playCabinChime('tap');
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= drivers.length) return;
    const updated = [...drivers];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setDrivers(updated);
    onUpdateDriversList?.(updated);
  };

  // Handle Save Driver Profile Changes
  const handleSaveDriverProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    playCabinChime('acknowledged');
    const updated = drivers.map((d) => (d.id === editingDriver.id ? editingDriver : d));
    setDrivers(updated);
    onUpdateDriversList?.(updated);
    await cloudSync.saveDriverProfile(editingDriver);
    if (editingDriver.id === currentDriver.id) {
      onSelectDriver(editingDriver);
    }
    setEditingDriver(null);
    showToast(`Profile for ${editingDriver.name} saved!`);
  };

  // Album Management
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      showToast('Please enter an album title.');
      return;
    }
    playCabinChime('acknowledged');
    const newAlbum: GalleryAlbum = {
      id: `album-${Date.now()}`,
      title: newAlbumTitle.trim(),
      description: newAlbumDesc.trim() || 'Custom in-cabin album',
      category: newAlbumCategory,
      isHiddenFromPassengers: newAlbumHidden,
      assignedDriverId: newAlbumDriver,
      createdAt: Date.now(),
    };
    const updated = [...albums, newAlbum];
    onUpdateAlbums(updated);
    setIsCreateAlbumModalOpen(false);
    setNewAlbumTitle('');
    setNewAlbumDesc('');
    showToast(`Created gallery album "${newAlbum.title}"!`);
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (albums.length <= 1) {
      showToast('Cannot delete the last remaining album.');
      return;
    }
    const target = albums.find((a) => a.id === albumId);
    if (!target) return;
    if (!window.confirm(`Delete album "${target.title}"? Photos inside will also be removed.`)) return;

    playCabinChime('tap');
    const updatedAlbums = albums.filter((a) => a.id !== albumId);
    const updatedPhotos = photos.filter((p) => p.albumId !== albumId);
    onUpdateAlbums(updatedAlbums);
    onUpdatePhotos(updatedPhotos);
    showToast(`Deleted album "${target.title}".`);
  };

  const handleMoveAlbum = (index: number, direction: 'up' | 'down') => {
    playCabinChime('tap');
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= albums.length) return;
    const updated = [...albums];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    onUpdateAlbums(updated);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) {
      showToast('Please provide a photo title and image URL.');
      return;
    }
    playCabinChime('acknowledged');
    const newPhoto: GalleryItem = {
      id: `photo-${Date.now()}`,
      title: newPhotoTitle.trim(),
      subtitle: newPhotoSubtitle.trim() || 'Silvermyst Experience',
      description: newPhotoDesc.trim() || 'In-cabin high resolution photo',
      imageUrl: newPhotoUrl.trim(),
      tag: newPhotoTag.trim(),
      albumId: newPhotoAlbumId,
      createdAt: Date.now(),
    };
    const updated = [...photos, newPhoto];
    onUpdatePhotos(updated);
    setIsAddPhotoModalOpen(false);
    setNewPhotoTitle('');
    setNewPhotoSubtitle('');
    setNewPhotoUrl('');
    setNewPhotoDesc('');
    showToast(`Added photo "${newPhoto.title}" to gallery!`);
  };

  const handleDeletePhoto = (photoId: string) => {
    const target = photos.find((p) => p.id === photoId);
    if (!target) return;
    if (!window.confirm(`Delete photo "${target.title}"?`)) return;

    playCabinChime('tap');
    const updated = photos.filter((p) => p.id !== photoId);
    onUpdatePhotos(updated);
    showToast(`Deleted photo "${target.title}".`);
  };

  const handleMovePhotoAlbum = (photoId: string, targetAlbumId: string) => {
    playCabinChime('tap');
    const updated = photos.map((p) => (p.id === photoId ? { ...p, albumId: targetAlbumId } : p));
    onUpdatePhotos(updated);
    showToast('Moved photo to selected album.');
  };

  // Quick Connect Management
  const handleSaveQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQcTitle.trim() || !newQcUrl.trim()) {
      showToast('Please provide a title and link/destination URL.');
      return;
    }
    playCabinChime('acknowledged');
    const newItem: QuickConnectItem = {
      id: editingQuickConnect ? editingQuickConnect.id : `qc-${Date.now()}`,
      title: newQcTitle.trim(),
      subtitle: newQcSubtitle.trim() || 'Scan to Connect',
      type: newQcType,
      handleOrValue: newQcHandle.trim() || newQcTitle.trim(),
      url: newQcUrl.trim(),
      qrValue: newQcQrValue.trim() || newQcUrl.trim(),
      iconType: newQcType,
      accentColor: newQcAccent,
      badge: newQcBadge.trim(),
      description: newQcDesc.trim() || `Scan with camera to open ${newQcTitle.trim()} on your phone.`,
      isVisible: true,
      order: editingQuickConnect ? editingQuickConnect.order : quickConnectList.length + 1,
    };

    let updated: QuickConnectItem[];
    if (editingQuickConnect) {
      updated = quickConnectList.map((q) => (q.id === editingQuickConnect.id ? newItem : q));
    } else {
      updated = [...quickConnectList, newItem];
    }
    setQuickConnectList(updated);
    onUpdateQuickConnects?.(updated);
    setIsAddQuickConnectOpen(false);
    setEditingQuickConnect(null);
    setNewQcTitle('');
    setNewQcSubtitle('');
    setNewQcUrl('');
    setNewQcQrValue('');
    setNewQcDesc('');
    showToast(`Saved quick connect link "${newItem.title}"!`);
  };

  const handleDeleteQuickConnect = (id: string) => {
    const target = quickConnectList.find((q) => q.id === id);
    if (!target) return;
    if (!window.confirm(`Delete "${target.title}"?`)) return;

    playCabinChime('tap');
    const updated = quickConnectList.filter((q) => q.id !== id);
    setQuickConnectList(updated);
    onUpdateQuickConnects?.(updated);
    showToast(`Removed "${target.title}".`);
  };

  const handleToggleQuickConnectVisibility = (id: string) => {
    playCabinChime('tap');
    const updated = quickConnectList.map((q) => (q.id === id ? { ...q, isVisible: !q.isVisible } : q));
    setQuickConnectList(updated);
    onUpdateQuickConnects?.(updated);
    showToast('Updated quick connect visibility.');
  };

  const handleMoveQuickConnect = (index: number, direction: 'up' | 'down') => {
    playCabinChime('tap');
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= quickConnectList.length) return;
    const updated = [...quickConnectList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setQuickConnectList(updated);
    onUpdateQuickConnects?.(updated);
  };

  // Change profile-specific 4-digit PIN
  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || isNaN(Number(newPinInput))) {
      showToast('PIN must be exactly 4 numbers.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      showToast('New PIN and confirmation do not match.');
      return;
    }
    playCabinChime('acknowledged');
    const targetDriver = drivers.find((d) => d.id === selectedSecurityDriverId) || activeDriver;
    const updatedDriver: DriverProfile = { ...targetDriver, adminPin: newPinInput };
    const updatedList = drivers.map((d) => (d.id === updatedDriver.id ? updatedDriver : d));
    setDrivers(updatedList);
    onUpdateDriversList?.(updatedList);
    await cloudSync.saveDriverProfile(updatedDriver);
    if (updatedDriver.id === currentDriver.id) {
      onSelectDriver(updatedDriver);
      onUpdateAdminPin?.(newPinInput);
    }
    setNewPinInput('');
    setConfirmPinInput('');
    showToast(`Security PIN for ${updatedDriver.name} saved!`);
  };

  // Push Broadcast Announcement
  const handlePushAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementInput.trim()) return;
    playCabinChime('acknowledged');
    if (onBroadcastAnnouncement) {
      onBroadcastAnnouncement(announcementInput.trim());
    }
    showToast(`Pushed announcement banner to passenger tablets!`);
    setAnnouncementInput('');
  };

  const activeDriver = drivers.find((d) => d.id === activeDriverId) || currentDriver;
  const sandboxDriver = drivers.find((d) => d.id === sandboxDriverId) || activeDriver;
  const activeThemeCfg = CABIN_THEMES[cabinTheme] || CABIN_THEMES.royal_purple;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-purple-600 selection:text-white cabin-shell bg-gradient-to-br ${
        isDark ? activeThemeCfg.bgGradient : activeThemeCfg.lightBgGradient
      }`}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-purple-400/40 animate-fade-in text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Compact Driver Pop-Up Notification for Incoming Passenger Actions (Safe for Driving) */}
      {driverPopupAlert && (
        <div className="fixed top-20 right-4 z-50 w-84 sm:w-96 bg-slate-900 text-white rounded-2xl p-4 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.45)] space-y-2.5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  {driverPopupAlert.title}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white leading-snug mt-0.5">
                  {driverPopupAlert.text}
                </div>
              </div>
            </div>
            <button
              onClick={() => setDriverPopupAlert(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                playCabinChime('acknowledged');
                if (driverPopupAlert.kind === 'message') {
                  onUpdateMessageStatus(driverPopupAlert.id, 'acknowledged');
                  cloudSync.updateRequestStatus(driverPopupAlert.id, 'acknowledged');
                } else {
                  onUpdateSongStatus(driverPopupAlert.id, 'accepted');
                }
                setDriverPopupAlert(null);
                showToast('Acknowledged passenger request');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{at.acknowledge}</span>
            </button>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) {
                  const u = new SpeechSynthesisUtterance(driverPopupAlert.text);
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(u);
                }
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              title={at.speakAloud}
            >
              <Volume2 className="w-4 h-4" />
              <span>{at.speakAloud}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar - Consistent 3-zone Scrollable & Centered Navigation matching Passenger Portal */}
      <header className="min-h-16 sm:h-18 px-2.5 sm:px-4 py-1.5 sm:py-0 border-b cabin-header backdrop-blur-md flex items-center justify-center sticky top-0 z-30 no-print relative">
        <div className="w-full max-w-[2400px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Zone 1: Admin Shield/Title & Clickable Live Clock */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl cabin-primary-btn flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap">
                  {at.adminTitle}
                </h1>
                <span className="hidden 2xl:flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 items-center gap-1 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {at.pinSecured}
                </span>
              </div>
              <p className="text-[10.5px] cabin-text-muted hidden xl:block truncate max-w-[220px]">
                {at.adminSub}
              </p>
            </div>
            <DashboardClockButton />
          </div>

          {/* Zone 2: Centered & Expandable Horizontal Scrollable Admin Navigation Bar */}
          <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => scrollAdminHeader('left')}
              className="flex p-1.5 rounded-lg cabin-panel border hover:opacity-90 shrink-0 cursor-pointer"
              aria-label="Scroll left"
              title="Scroll toolbar left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              ref={adminHeaderScrollRef}
              className="flex-1 min-w-0 flex overflow-x-auto scrollbar-none py-1 scroll-smooth"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium mx-auto w-max px-1">
                {/* Passenger Portal Switch Button */}
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    onBackToKiosk();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl cabin-primary-btn hover:brightness-110 transition-all text-xs font-extrabold cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title={at.backToKiosk}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>{at.backToKiosk}</span>
                </button>

                {/* Public Portal Button */}
                {onLockToPublicPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      onLockToPublicPortal();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl cabin-panel border hover:border-amber-500/50 transition-all text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                    title={at.publicPortal}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{at.publicPortal}</span>
                  </button>
                )}

                {/* Independent Admin UI Language Switcher */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs shrink-0"
                  title={at.adminLangLabel}
                >
                  <Languages className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="hidden xl:inline text-slate-400 text-[11px]">{at.adminLangLabel}:</span>
                  <select
                    value={adminLanguage}
                    onChange={(e) => {
                      playCabinChime('tap');
                      handleChangeAdminLanguage(e.target.value as SupportedLanguage);
                    }}
                    className="bg-transparent font-bold text-purple-300 focus:outline-hidden cursor-pointer uppercase text-[11px]"
                  >
                    <option value="en" className="bg-slate-900 text-white">EN</option>
                    <option value="es" className="bg-slate-900 text-white">ES</option>
                    <option value="fr" className="bg-slate-900 text-white">FR</option>
                    <option value="de" className="bg-slate-900 text-white">DE</option>
                  </select>
                </div>

                {/* Remote Passenger Tablet Language Control */}
                {onUpdatePassengerLanguage && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/60 border border-sky-700/50 text-xs shrink-0"
                    title={at.passengerLangLabel}
                  >
                    <Tablet className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="hidden xl:inline text-sky-300 text-[11px]">{at.passengerLangLabel}:</span>
                    <select
                      value={passengerLanguage}
                      onChange={(e) => {
                        const nextLang = e.target.value as SupportedLanguage;
                        playCabinChime('acknowledged');
                        onUpdatePassengerLanguage(nextLang);
                        showToast(`${at.passengerLangLabel}: ${nextLang.toUpperCase()}`);
                      }}
                      className="bg-transparent font-bold text-sky-300 focus:outline-hidden cursor-pointer uppercase text-[11px]"
                    >
                      <option value="en" className="bg-slate-900 text-white">EN</option>
                      <option value="es" className="bg-slate-900 text-white">ES</option>
                      <option value="fr" className="bg-slate-900 text-white">FR</option>
                      <option value="de" className="bg-slate-900 text-white">DE</option>
                    </select>
                  </div>
                )}

                {/* Active Driver Profile Switcher */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cabin-panel border text-xs shrink-0">
                  <span className="hidden xl:inline cabin-text-muted">{at.activeProfile}:</span>
                  <select
                    value={activeDriverId}
                    onChange={(e) => handleSwitchActiveDriver(e.target.value)}
                    className="bg-transparent font-bold focus:outline-hidden cursor-pointer max-w-[140px]"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                        {d.name} ({getStaffRoleMeta(d.role).shortLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Theme Quick Switcher */}
                {onUpdateCabinTheme && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cabin-panel border text-xs shrink-0"
                    title="System Color Theme"
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cabin-accent)' }} />
                    <select
                      value={cabinTheme}
                      onChange={(e) => {
                        const nextTheme = e.target.value as CabinThemeMode;
                        playCabinChime('acknowledged');
                        onUpdateCabinTheme(nextTheme);
                        showToast(`${CABIN_THEMES[nextTheme].name}`);
                      }}
                      className="bg-transparent font-bold focus:outline-hidden cursor-pointer text-[11px] max-w-[115px]"
                    >
                      {(Object.values(CABIN_THEMES) as typeof CABIN_THEMES[CabinThemeMode][]).map((th) => (
                        <option
                          key={th.id}
                          value={th.id}
                          className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                        >
                          {th.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setSoundAlerts(!soundAlerts);
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    soundAlerts
                      ? 'cabin-badge'
                      : 'cabin-panel opacity-60'
                  }`}
                  title={soundAlerts ? at.soundEnabled : at.soundMuted}
                >
                  {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* CLEAR REQUEST Button for switching between passengers */}
                {onClearAllRequests && (
                  <button
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      onClearAllRequests();
                      setDriverPopupAlert(null);
                      showToast('Requests cleared for next passenger');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-500 font-extrabold transition-all text-xs cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                    title={at.clearRequest}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{at.clearRequest}</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollAdminHeader('right')}
              className="flex p-1.5 rounded-lg cabin-panel border hover:opacity-90 shrink-0 cursor-pointer"
              aria-label="Scroll right"
              title="Scroll toolbar right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zone 3: Day/Night Toggle & Lock/Sign Out */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleDark && (
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onToggleDark();
                }}
                className="p-2 rounded-xl cabin-panel border transition-colors cursor-pointer"
                title={isDark ? at.daylightMode : at.nightMode}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-700" />}
              </button>
            )}

            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onSignOut();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-500 transition-all text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap"
                title={at.signOut}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{at.signOut}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar Navigation + Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 border-r cabin-header p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-print">
          {/* Driver Mini Card */}
          <div className="hidden md:flex items-center gap-3 p-3 mb-2 rounded-2xl bg-purple-950/40 border border-purple-800/30">
            <img
              src={activeDriver.avatarUrl}
              alt={activeDriver.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-400/60 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate">{activeDriver.name}</div>
              <div className="text-[11px] text-purple-300 capitalize">{activeDriver.availability}</div>
            </div>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                activeDriver.availability === 'available'
                  ? 'bg-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-amber-400 ring-2 ring-amber-400/20'
              }`}
            />
          </div>

          {/* Navigation Items */}
          {[
            { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
            { id: 'enrollment', label: t.navEnrollment || 'Employee Enrollment', icon: ShieldCheck, badge: 'ACCESS', badgeColor: 'bg-amber-500 text-slate-950' },
            { id: 'controller', label: t.navController, icon: Sliders, badge: 'Remote', badgeColor: 'bg-purple-500 text-white' },
            {
              id: 'requests',
              label: t.navRequests,
              icon: MessageSquare,
              badge: pendingRequestsTotal > 0 ? pendingRequestsTotal : undefined,
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            { id: 'shifts', label: t.navShifts, icon: Calendar, badge: 'NEW', badgeColor: 'bg-emerald-500 text-slate-950' },
            { id: 'analytics', label: t.navAnalytics, icon: BarChart3 },
            { id: 'feedback', label: t.navFeedback, icon: Heart },
            { id: 'announcements', label: t.navAnnouncements, icon: Bell },
            { id: 'marketing', label: t.navMarketing, icon: Palette },
            { id: 'apps', label: t.navApps, icon: Gamepad2 },
            { id: 'quick_connect', label: t.navQuickConnect, icon: QrCode },
            { id: 'galleries', label: t.navGalleries, icon: Folder },
            { id: 'drivers', label: t.navDrivers, icon: Users },
            { id: 'checklists', label: t.navChecklists, icon: CheckSquare },
            { id: 'backup', label: t.navBackup, icon: HardDriveDownload, badge: 'NEW', badgeColor: 'bg-sky-500 text-white' },
            { id: 'recovery', label: t.navRecovery, icon: Wrench },
            { id: 'history', label: t.navHistory, icon: History },
            { id: 'translations', label: t.navTranslations, icon: Languages },
            { id: 'sandbox', label: t.navSandbox, icon: Tablet },
            { id: 'screensaver', label: t.navScreensaver, icon: Tv },
            {
              id: 'inquiries',
              label: t.navInquiries,
              icon: Briefcase,
              badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
              badgeColor: 'bg-indigo-500 text-white',
            },
            { id: 'tablets', label: t.navTablets, icon: Tablet },
            { id: 'team_chat', label: t.navTeamChat, icon: Send },
            { id: 'security', label: t.navSecurity, icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playCabinChime('tap');
                  setActiveTab(item.id as NavTab);
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'cabin-primary-btn shadow-md'
                    : 'cabin-text-muted hover:opacity-100 hover:bg-slate-500/15'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-purple-500 text-white'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW (RESUMEN) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {at.overviewWelcome}, {activeDriver.name}
                  </h2>
                  <p className="text-xs sm:text-sm cabin-text-muted">
                    {at.fleetOperatingNormal}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setActiveTab('backup');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl cabin-panel border hover:brightness-110 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <HardDriveDownload className="w-4 h-4" style={{ color: 'var(--cabin-accent)' }} />
                    <span>{t.navBackup}</span>
                  </button>
                  <button
                    onClick={() => {
                      playCabinChime('acknowledged');
                      onTriggerScreensaverNow();
                      showToast(at.launchScreensaver);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl cabin-badge border hover:brightness-110 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Tv className="w-4 h-4" />
                    <span>{at.launchScreensaver}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl cabin-primary-btn hover:brightness-110 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Tablet className="w-4 h-4" />
                    <span>{at.openSandbox}</span>
                  </button>
                </div>
              </div>

              {/* Driver & Admin Android Quick Apps Launcher right on Overview (Resumen) */}
              <AdminQuickAppsBar
                apps={adminAndroidApps}
                onUpdateApps={handleUpdateAdminApps}
                adminLanguage={adminLanguage}
                onShowToast={showToast}
              />

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl cabin-card border shadow-sm">
                  <div className="flex items-center justify-between cabin-text-muted text-xs mb-2">
                    <span>{at.statActiveDrivers}</span>
                    <Users className="w-4 h-4" style={{ color: 'var(--cabin-accent)' }} />
                  </div>
                  <div className="text-2xl font-black">{drivers.length} {at.statProfilesSuffix}</div>
                  <div className="text-[11px] cabin-text-muted mt-1">
                    {at.statDriversDesc}
                  </div>
                </div>

                <div className="p-4 rounded-2xl cabin-card border shadow-sm">
                  <div className="flex items-center justify-between cabin-text-muted text-xs mb-2">
                    <span>{at.statPassengerReqs}</span>
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black">{pendingRequestsTotal} {at.statPendingSuffix}</div>
                  <div className="text-[11px] text-amber-500 font-semibold mt-1">
                    {pendingRequestsTotal === 0 ? at.statAllCompleted : at.statImmediateAttn}
                  </div>
                </div>

                <div className="p-4 rounded-2xl cabin-card border shadow-sm">
                  <div className="flex items-center justify-between cabin-text-muted text-xs mb-2">
                    <span>{at.statGalleries}</span>
                    <Folder className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black">{albums.length} {at.statAlbumsSuffix}</div>
                  <div className="text-[11px] cabin-text-muted mt-1">
                    {photos.length} {at.statPhotosOrganized}
                  </div>
                </div>

                <div className="p-4 rounded-2xl cabin-card border shadow-sm">
                  <div className="flex items-center justify-between cabin-text-muted text-xs mb-2">
                    <span>{at.statQuickConnects}</span>
                    <QrCode className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black">{quickConnectList.length} {at.statPortalsSuffix}</div>
                  <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                    {quickConnectList.filter((q) => q.isVisible).length} {at.statVisiblePassengers}
                  </div>
                </div>
              </div>

              {/* Push Announcement Form */}
              <div className="p-4 sm:p-5 rounded-2xl cabin-card border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold">{at.pushAnnouncementTitle}</h3>
                </div>
                <p className="text-xs cabin-text-muted mb-3">
                  {at.pushAnnouncementSub}
                </p>
                <form onSubmit={handlePushAnnouncement} className="flex gap-2">
                  <input
                    type="text"
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder={at.pushAnnouncementPlaceholder}
                    className="flex-1 px-4 py-2.5 rounded-xl cabin-panel border text-xs sm:text-sm focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl cabin-primary-btn font-bold text-xs sm:text-sm hover:brightness-110 cursor-pointer shrink-0"
                  >
                    {at.broadcastToTablets}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEE ENROLLMENT & APPROVE LIST */}
          {activeTab === 'enrollment' && (
            <AdminEnrollmentManager
              currentUser={firebaseUser}
              isMasterOwner={isMasterOwner}
              isAdminAccount={isAdminAccount}
              isDark={isDark}
              onToast={showToast}
            />
          )}

          {/* TAB: FLEET & PASSENGER EXPERIENCE CONTROLLER */}
          {activeTab === 'controller' && (
            <AdminExperienceController
              drivers={drivers}
              activeDriverId={activeDriverId}
              onSelectDriver={(id) => handleSwitchActiveDriver(id)}
              tablets={tablets}
              installedApps={installedApps}
              onUpdateInstalledApps={onUpdateInstalledApps}
              quickConnects={quickConnectList}
              onUpdateQuickConnects={(items) => {
                setQuickConnectList(items);
                onUpdateQuickConnects?.(items);
              }}
              screensaverSettings={screensaverSettings}
              onUpdateScreensaverSettings={onUpdateScreensaverSettings}
              onBroadcastAnnouncement={onBroadcastAnnouncement || ((t) => showToast(t))}
              songRequests={songRequests}
              cabinMessages={cabinMessages}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: PASSENGER FEEDBACK */}
          {activeTab === 'feedback' && (
            <AdminFeedbackManager
              drivers={drivers}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: ANNOUNCEMENTS & SCHEDULED CONTENT */}
          {activeTab === 'announcements' && (
            <AdminAnnouncements
              tablets={tablets}
              onBroadcastAnnouncement={onBroadcastAnnouncement || ((t) => showToast(t))}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: DRIVER WORKING SHIFT CALENDAR */}
          {activeTab === 'shifts' && (
            <AdminShiftCalendar
              drivers={drivers}
              currentDriver={activeDriver}
              onShowToast={showToast}
              isDark={isDark}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: SHIFT CHECKLISTS */}
          {activeTab === 'checklists' && (
            <AdminShiftChecklist
              drivers={drivers}
              currentDriver={activeDriver}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: USAGE ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <AdminAnalytics
              songRequests={songRequests}
              cabinMessages={cabinMessages}
              inquiries={inquiries}
              drivers={drivers}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: CONFIGURATION & HISTORICAL BACKUPS */}
          {activeTab === 'backup' && (
            <AdminBackupRestore
              adminLanguage={adminLanguage}
              passengerLanguage={passengerLanguage}
              activeDriver={activeDriver}
              drivers={drivers}
              installedApps={installedApps}
              adminAndroidApps={adminAndroidApps}
              quickConnects={quickConnectList}
              albums={albums}
              photos={photos}
              screensaverSettings={screensaverSettings}
              cabinTheme={cabinTheme}
              isDark={isDark}
              songRequests={songRequests}
              cabinMessages={cabinMessages}
              inquiries={inquiries}
              teamMessages={teamMessages}
              onApplyBackup={handleApplyFullBackup}
              onShowToast={showToast}
            />
          )}

          {/* TAB: KIOSK RECOVERY & HEALTH */}
          {activeTab === 'recovery' && (
            <AdminKioskRecovery
              tablets={tablets}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: CHANGE HISTORY & ROLLBACK */}
          {activeTab === 'history' && (
            <AdminChangeHistory
              onRollback={handleRollback}
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: TRANSLATIONS (EN / ES) */}
          {activeTab === 'translations' && (
            <AdminTranslationManager
              onShowToast={showToast}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: MARKETING POP-UPS & CABIN THEMES */}
          {activeTab === 'marketing' && (
            <AdminMarketingManager
              cabinTheme={cabinTheme}
              onUpdateCabinTheme={(t) => onUpdateCabinTheme?.(t)}
              onShowToast={showToast}
              onPreviewPopup={onPreviewMarketingPopup}
              adminLanguage={adminLanguage}
            />
          )}

          {/* TAB: PHOTO GALLERIES & ALBUMS (CREATE, DELETE, ORGANIZE) */}
          {activeTab === 'galleries' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-400" />
                    <span>{at.galleriesTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {at.galleriesSub}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setIsAddPhotoModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-sky-400" />
                    <span>{at.addPhoto}</span>
                  </button>
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setIsCreateAlbumModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-extrabold hover:brightness-110 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{at.createNewAlbum}</span>
                  </button>
                </div>
              </div>

              {/* Albums Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {at.activeAlbums} ({albums.length})
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setSelectedAlbumId('all')}
                      className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                        selectedAlbumId === 'all'
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {at.allAlbums}
                    </button>
                    {albums.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAlbumId(a.id)}
                        className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors truncate max-w-[140px] ${
                          selectedAlbumId === a.id
                            ? 'bg-amber-500 text-slate-950 font-extrabold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {a.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {albums.map((album, index) => {
                    const albumPhotoCount = photos.filter((p) => p.albumId === album.id).length;
                    return (
                      <div
                        key={album.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              <span>{album.title}</span>
                              {album.isHiddenFromPassengers && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 capitalize">{album.category} category</div>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveAlbum(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveAlbum(index, 'down')}
                              disabled={index === albums.length - 1}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 min-h-[32px]">
                          {album.description}
                        </p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-amber-400 font-bold">{albumPhotoCount} Photos</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const updated = albums.map((a) =>
                                  a.id === album.id ? { ...a, isHiddenFromPassengers: !a.isHiddenFromPassengers } : a
                                );
                                onUpdateAlbums(updated);
                                showToast(`Updated visibility for ${album.title}`);
                              }}
                              className="text-slate-400 hover:text-white cursor-pointer font-bold"
                            >
                              {album.isHiddenFromPassengers ? at.showBtn : at.hideBtn}
                            </button>
                            <button
                              onClick={() => handleDeleteAlbum(album.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="Delete Album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photos Gallery List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {at.photosIn} {selectedAlbumId === 'all' ? at.allAlbums : albums.find((a) => a.id === selectedAlbumId)?.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {photos.filter((p) => selectedAlbumId === 'all' || p.albumId === selectedAlbumId).length} photos
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos
                    .filter((p) => selectedAlbumId === 'all' || p.albumId === selectedAlbumId)
                    .map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden space-y-2 p-2 shadow-sm flex flex-col justify-between"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-sky-300 text-[10px] font-bold">
                            {photo.tag}
                          </span>
                        </div>

                        <div className="px-1 space-y-0.5">
                          <div className="font-bold text-xs text-white truncate">{photo.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{photo.subtitle}</div>
                        </div>

                        {/* Move album selector & delete */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[11px]">
                          <select
                            value={photo.albumId}
                            onChange={(e) => handleMovePhotoAlbum(photo.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-[10px] cursor-pointer max-w-[110px] truncate"
                          >
                            {albums.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Create Album Modal */}
              {isCreateAlbumModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">Create New Photo Album</h3>
                      <button onClick={() => setIsCreateAlbumModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleCreateAlbum} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Album Title</label>
                        <input
                          type="text"
                          required
                          value={newAlbumTitle}
                          onChange={(e) => setNewAlbumTitle(e.target.value)}
                          placeholder="e.g. VIP Airport Rides, Luxury Interiors"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Category</label>
                        <select
                          value={newAlbumCategory}
                          onChange={(e) => setNewAlbumCategory(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                        >
                          <option value="advertising">Advertising & Posters</option>
                          <option value="travel">Travel & Photography</option>
                          <option value="car">Vehicle & Cabin</option>
                          <option value="custom">Custom Portfolio</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={newAlbumDesc}
                          onChange={(e) => setNewAlbumDesc(e.target.value)}
                          placeholder="Album description shown in gallery..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="albumHidden"
                          checked={newAlbumHidden}
                          onChange={(e) => setNewAlbumHidden(e.target.checked)}
                          className="rounded cursor-pointer"
                        />
                        <label htmlFor="albumHidden" className="text-slate-300 font-bold cursor-pointer">
                          Hide album from passenger kiosk (Admin only)
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsCreateAlbumModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold cursor-pointer hover:brightness-110"
                        >
                          Create Album
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Photo Modal */}
              {isAddPhotoModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">Add Photo to Gallery</h3>
                      <button onClick={() => setIsAddPhotoModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Target Album</label>
                        <select
                          value={newPhotoAlbumId}
                          onChange={(e) => setNewPhotoAlbumId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                        >
                          {albums.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Photo Title</label>
                        <input
                          type="text"
                          required
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          placeholder="e.g. Skyline Highway Sunset"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Subtitle / Location</label>
                        <input
                          type="text"
                          value={newPhotoSubtitle}
                          onChange={(e) => setNewPhotoSubtitle(e.target.value)}
                          placeholder="e.g. Pacific Coastline Overlook"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Image URL or Path</label>
                        <input
                          type="text"
                          required
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="e.g. /assets/aistudio/... or https://..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAddPhotoModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold cursor-pointer hover:brightness-110"
                        >
                          Save Photo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DRIVER PROFILES (ADD, DELETE, ORGANIZE) */}
          {activeTab === 'drivers' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>{at.driversTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.driversSub}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCabinChime('tap');
                    setNewDriverPin('0000');
                    setIsAddDriverModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl cabin-primary-btn text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{at.addAdditionalDriver}</span>
                </button>
              </div>

              {/* Backup & Restore Driver Profile Settings Card */}
              <div className="p-4 rounded-2xl cabin-card border flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--cabin-accent)' }}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{at.profileBackupTitle}</span>
                  </div>
                  <p className="text-[11px] cabin-text-muted mt-0.5">
                    {at.profileBackupSub}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={handleSaveCloudProfileBackup}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{sl.cloudBackup}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRestoreCloudProfileBackup}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{sl.restoreCloud}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackupJson}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{sl.exportJson}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => backupFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{sl.importJson}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('backup')}
                    className="px-3 py-2 rounded-xl cabin-primary-btn hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    <span>{sl.fullBackupShortcut}</span>
                  </button>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      handleRestoreBackupJson(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>

              {/* Organized Staff Roles Filter & Permissions Guide */}
              <div className="p-4 rounded-2xl cabin-card border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider cabin-text-muted">
                    {at.staffRolesHierarchy} ({drivers.length})
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                    <button
                      onClick={() => setRoleFilter('all')}
                      className={`px-2.5 py-1 rounded-lg border cursor-pointer ${
                        roleFilter === 'all' ? 'cabin-primary-btn' : 'cabin-panel'
                      }`}
                    >
                      {at.allRolesFilter} ({drivers.length})
                    </button>
                    {(['owner', 'manager', 'admin', 'driver', 'editor'] as DriverRole[]).map((r) => {
                      const meta = STAFF_ROLE_META[r];
                      const count = drivers.filter((d) => d.role === r).length;
                      return (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r)}
                          className={`px-2.5 py-1 rounded-lg border cursor-pointer ${
                            roleFilter === r ? 'cabin-primary-btn' : 'cabin-panel'
                          }`}
                          title={meta.description}
                        >
                          {meta.shortLabel} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {(['owner', 'manager', 'admin', 'driver', 'editor'] as DriverRole[]).map((r) => {
                    const meta = STAFF_ROLE_META[r];
                    return (
                      <div key={r} className="p-2.5 rounded-xl cabin-panel border text-[10.5px] space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-black uppercase border text-[9.5px] ${
                            isDark ? meta.darkBadge : meta.lightBadge
                          }`}
                        >
                          {meta.label}
                        </span>
                        <p className="cabin-text-muted leading-snug">{meta.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {drivers
                  .filter((d) => roleFilter === 'all' || d.role === roleFilter)
                  .map((driver, index) => {
                    const roleMeta = getStaffRoleMeta(driver.role);
                    return (
                  <div
                    key={driver.id}
                    className="p-5 rounded-2xl cabin-card border space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={driver.avatarUrl}
                          alt={driver.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/60 shadow-md"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base">{driver.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                isDark ? roleMeta.darkBadge : roleMeta.lightBadge
                              }`}
                            >
                              {roleMeta.label}
                            </span>
                            {driver.id === activeDriverId && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
                                {at.activeOnKiosk}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold cabin-text-muted">{driver.title}</div>
                          <div className="text-xs cabin-text-muted mt-0.5">
                            {driver.vehicleModel} • {driver.cleanlinessScore}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Reorder, Edit, Delete, Switch */}
                      <div className="flex items-center gap-2">
                        {/* Order buttons */}
                        <div className="flex items-center gap-1 mr-1">
                          <button
                            onClick={() => handleMoveDriver(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDriver(index, 'down')}
                            disabled={index === drivers.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => setEditingDriver(driver)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold cursor-pointer"
                        >
                          {at.editProfile}
                        </button>

                        <button
                          onClick={() => handleSwitchActiveDriver(driver.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                            driver.id === activeDriverId
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {driver.id === activeDriverId ? sl.activeStatus : at.setAsActive}
                        </button>

                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          disabled={drivers.length <= 1}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
                          title={at.deleteBtn}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs cabin-text-muted leading-relaxed cabin-panel p-3 rounded-xl border">
                      <span className="font-bold">{at.bioLabel} </span>
                      {driver.bio}
                    </p>
                  </div>
                    );
                  })}
              </div>

              {/* Add Driver Modal */}
              {isAddDriverModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">Add New Fleet Driver</h3>
                      <button onClick={() => setIsAddDriverModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleCreateDriverSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newDriverName}
                          onChange={(e) => setNewDriverName(e.target.value)}
                          placeholder="e.g. Alex Martinez"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Title</label>
                          <input
                            type="text"
                            value={newDriverTitle}
                            onChange={(e) => setNewDriverTitle(e.target.value)}
                            placeholder="e.g. Senior Executive Chauffeur"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Staff Role</label>
                          <select
                            value={newDriverRole}
                            onChange={(e) => setNewDriverRole(e.target.value as DriverRole)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                          >
                            <option value="driver">Executive Chauffeur / Driver</option>
                            <option value="manager">Operations Manager</option>
                            <option value="admin">System Administrator</option>
                            <option value="owner">Owner & Founder</option>
                            <option value="editor">Content & Media Editor</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Vehicle Model</label>
                          <input
                            type="text"
                            value={newDriverVehicle}
                            onChange={(e) => setNewDriverVehicle(e.target.value)}
                            placeholder="e.g. Lincoln Navigator L"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Phone</label>
                          <input
                            type="text"
                            value={newDriverPhone}
                            onChange={(e) => setNewDriverPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Driver Photo (Upload Photo or Keep URL)
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={newDriverAvatar || '/assets/aistudio/1672373005387_54b82b85.jpg'}
                            alt="Preview"
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => addAvatarFileRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                          </button>
                          <input
                            ref={addAvatarFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAvatarFileUpload(e.target.files?.[0], setNewDriverAvatar)}
                          />
                          <input
                            type="text"
                            value={newDriverAvatar}
                            onChange={(e) => setNewDriverAvatar(e.target.value)}
                            placeholder="Or paste Avatar / Photo URL..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Profile 4-Digit Admin PIN (Default: 0000)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          required
                          value={newDriverPin}
                          onChange={(e) => setNewDriverPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                          placeholder="0000"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm tracking-widest"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Driver Bio</label>
                        <textarea
                          rows={3}
                          value={newDriverBio}
                          onChange={(e) => setNewDriverBio(e.target.value)}
                          placeholder="Passenger greeting and background..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAddDriverModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold cursor-pointer hover:brightness-110"
                        >
                          Add Driver
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Driver Modal */}
              {editingDriver && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">
                        Edit Driver Profile: {editingDriver.name}
                      </h3>
                      <button
                        onClick={() => setEditingDriver(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveDriverProfile} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={editingDriver.name}
                            onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">4-Digit Profile PIN</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={editingDriver.adminPin || '0000'}
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                adminPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4),
                              })
                            }
                            placeholder="0000"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tracking-widest"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Title</label>
                          <input
                            type="text"
                            value={editingDriver.title}
                            onChange={(e) => setEditingDriver({ ...editingDriver, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Staff Role</label>
                          <select
                            value={editingDriver.role}
                            onChange={(e) =>
                              setEditingDriver({ ...editingDriver, role: e.target.value as DriverProfile['role'] })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                          >
                            <option value="driver">Executive Chauffeur / Driver</option>
                            <option value="manager">Operations Manager</option>
                            <option value="admin">System Administrator</option>
                            <option value="owner">Owner & Founder</option>
                            <option value="editor">Content & Media Editor</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Vehicle Model</label>
                          <input
                            type="text"
                            value={editingDriver.vehicleModel}
                            onChange={(e) => setEditingDriver({ ...editingDriver, vehicleModel: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Phone</label>
                          <input
                            type="text"
                            value={editingDriver.phone}
                            onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Email</label>
                          <input
                            type="email"
                            value={editingDriver.email}
                            onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Website</label>
                          <input
                            type="text"
                            value={editingDriver.website}
                            onChange={(e) => setEditingDriver({ ...editingDriver, website: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Driver Photo (Upload Photo or Keep URL)
                        </label>
                        <div className="flex items-center gap-2">
                          <img
                            src={editingDriver.avatarUrl || '/assets/aistudio/1672373005387_54b82b85.jpg'}
                            alt={editingDriver.name}
                            className="w-12 h-12 rounded-xl object-cover border border-purple-500/40 shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => editAvatarFileRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                          </button>
                          <input
                            ref={editAvatarFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleAvatarFileUpload(e.target.files?.[0], (url) =>
                                setEditingDriver((prev) => (prev ? { ...prev, avatarUrl: url } : null))
                              )
                            }
                          />
                          <input
                            type="text"
                            value={editingDriver.avatarUrl}
                            onChange={(e) => setEditingDriver({ ...editingDriver, avatarUrl: e.target.value })}
                            placeholder="Or paste Avatar / Photo URL..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Driver Bio</label>
                        <textarea
                          rows={3}
                          value={editingDriver.bio}
                          onChange={(e) => setEditingDriver({ ...editingDriver, bio: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingDriver(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold cursor-pointer hover:brightness-110"
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: QUICK CONNECT & TAP-TO-SCAN MANAGER */}
          {activeTab === 'quick_connect' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span>{at.quickConnectManagerTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.quickConnectManagerSub}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCabinChime('tap');
                    setEditingQuickConnect(null);
                    setNewQcTitle('');
                    setNewQcSubtitle('');
                    setNewQcHandle('');
                    setNewQcUrl('');
                    setNewQcQrValue('');
                    setNewQcDesc('');
                    setIsAddQuickConnectOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl cabin-primary-btn text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{at.addQuickConnect}</span>
                </button>
              </div>

              {/* Quick Connect List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickConnectList.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.isVisible
                        ? 'bg-slate-900 border-slate-800 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                          style={{ backgroundColor: item.accentColor || '#6366f1' }}
                        >
                          {item.title.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {!item.isVisible && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{item.handleOrValue}</div>
                        </div>
                      </div>

                      {/* Order Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveQuickConnect(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveQuickConnect(index, 'down')}
                          disabled={index === quickConnectList.length - 1}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3 min-h-[32px]">
                      {item.description}
                    </p>

                    <div className="text-[11px] font-mono text-sky-400 truncate mb-3">
                      {item.url}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => handleToggleQuickConnectVisibility(item.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {item.isVisible ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Show</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingQuickConnect(item);
                            setNewQcTitle(item.title);
                            setNewQcSubtitle(item.subtitle);
                            setNewQcType(item.type);
                            setNewQcHandle(item.handleOrValue);
                            setNewQcUrl(item.url);
                            setNewQcQrValue(item.qrValue);
                            setNewQcAccent(item.accentColor);
                            setNewQcBadge(item.badge || '');
                            setNewQcDesc(item.description);
                            setIsAddQuickConnectOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-purple-400 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuickConnect(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Quick Connect Modal */}
              {isAddQuickConnectOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">
                        {editingQuickConnect ? 'Edit Quick Connect' : 'Add New Quick Connect & Pay'}
                      </h3>
                      <button onClick={() => setIsAddQuickConnectOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSaveQuickConnect} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={newQcTitle}
                          onChange={(e) => setNewQcTitle(e.target.value)}
                          placeholder="e.g. Venmo, Zelle, TikTok, Booking Link"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Handle / Display Text</label>
                          <input
                            type="text"
                            value={newQcHandle}
                            onChange={(e) => setNewQcHandle(e.target.value)}
                            placeholder="e.g. @carlos881672"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Accent Color</label>
                          <input
                            type="color"
                            value={newQcAccent}
                            onChange={(e) => setNewQcAccent(e.target.value)}
                            className="w-full h-9 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Destination Web Link (URL)</label>
                        <input
                          type="url"
                          required
                          value={newQcUrl}
                          onChange={(e) => setNewQcUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">QR Value (defaults to URL)</label>
                        <input
                          type="text"
                          value={newQcQrValue}
                          onChange={(e) => setNewQcQrValue(e.target.value)}
                          placeholder="Leave blank to use Destination URL"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Description (shown in scanner)</label>
                        <textarea
                          rows={2}
                          value={newQcDesc}
                          onChange={(e) => setNewQcDesc(e.target.value)}
                          placeholder="Scan to pay or tip directly..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAddQuickConnectOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold cursor-pointer hover:brightness-110"
                        >
                          Save Quick Connect
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SANDBOX & LIVE KIOSK SIMULATOR */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Tablet className="w-5 h-5 text-indigo-400" />
                      <span>{at.sandboxTitle}</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      1280 × 800 Samsung Galaxy Tab Simulator
                    </span>
                  </div>
                  <p className="text-xs cabin-text-muted">
                    {at.sandboxSub}
                  </p>
                </div>

                {/* Driver Sandbox Switcher */}
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 px-2 font-bold">Simulate Driver:</span>
                  {drivers.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        playCabinChime('tap');
                        setSandboxDriverId(d.id);
                        showToast(`Sandbox switched to ${d.name}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        sandboxDriverId === d.id
                          ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scaled 1280x800 Kiosk Viewport Frame */}
              <div className="rounded-3xl border-4 border-slate-800 bg-slate-900/90 p-2 sm:p-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  <span>📱 Samsung Galaxy Tab A (1280 × 800) • Active Sandbox: {sandboxDriver.name}</span>
                  <span className="text-emerald-400 font-bold">● Interactive Preview</span>
                </div>

                {/* Scaled Preview Frame */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 min-h-[580px] flex flex-col">
                  <div className="p-2 sm:p-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <span className="font-extrabold text-xs text-purple-300">
                      Silvermyst Passenger Suite Simulator
                    </span>
                    <button
                      onClick={onBackToKiosk}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      {at.sandboxLaunchFullscreen}
                    </button>
                  </div>

                  {/* Kiosk Content Inside Sandbox */}
                  <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    <div className="lg:col-span-5 h-full min-h-0 flex flex-col">
                      <LeftAppsHub
                        tracks={[]}
                        currentTrackIndex={0}
                        isPlaying={false}
                        onTogglePlay={() => {}}
                        onNextTrack={() => {}}
                        onPrevTrack={() => {}}
                        songRequests={songRequests}
                        onSubmitSongRequest={() => {}}
                        messages={cabinMessages}
                        onSendMessage={() => {}}
                        onOpenGallery={() => {}}
                        installedApps={installedApps}
                        activeDriverName={sandboxDriver.name}
                        activeDriverId={sandboxDriver.id}
                        language={passengerLanguage}
                      />
                    </div>
                    <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
                      <RightDriverHub
                        profile={sandboxDriver}
                        drivers={drivers}
                        albums={albums}
                        photos={photos}
                        quickConnects={quickConnectList}
                        language={passengerLanguage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PIN & SECURITY SETTINGS (PROFILE-SPECIFIC) */}
          {activeTab === 'security' && (() => {
            const targetSecDriver = drivers.find((d) => d.id === selectedSecurityDriverId) || activeDriver;
            const effectivePin = targetSecDriver.adminPin || '0000';
            return (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-400" />
                    <span>{at.securityTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.securitySub}
                  </p>
                </div>

                {/* Profile Selector & Current PIN Card */}
                <div className="p-5 rounded-2xl cabin-card border space-y-4">
                  <div>
                    <label className="block text-xs cabin-text-muted font-bold mb-1.5">
                      {at.selectProfilePin}
                    </label>
                    <select
                      value={targetSecDriver.id}
                      onChange={(e) => setSelectedSecurityDriverId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                          {d.name} ({d.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
                    <div>
                      <div className="text-xs cabin-text-muted font-bold uppercase">
                        {at.activePinFor} {targetSecDriver.name}
                      </div>
                      <div className="text-3xl font-black font-mono tracking-widest mt-1" style={{ color: 'var(--cabin-accent)' }}>
                        {effectivePin}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full cabin-badge text-xs font-bold border">
                      {at.pinSecured}
                    </span>
                  </div>
                </div>

                {/* Change PIN Form */}
                <div className="p-5 rounded-2xl cabin-card border space-y-4">
                  <h3 className="font-extrabold text-sm">
                    {at.updatePinFor} {targetSecDriver.name}
                  </h3>
                  <form onSubmit={handleUpdatePinSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block cabin-text-muted font-bold mb-1">New 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0000"
                        className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-mono text-center text-lg tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="block cabin-text-muted font-bold mb-1">Confirm New 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0000"
                        className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-mono text-center text-lg tracking-widest"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl cabin-primary-btn font-extrabold text-xs tracking-tight hover:brightness-110 cursor-pointer shadow-md"
                    >
                      {at.savePinToProfile} ({targetSecDriver.name})
                    </button>
                  </form>
                </div>

                {/* Sign Out CTA */}
                {onSignOut && (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold">{at.finishedAdminTitle}</div>
                      <div className="text-xs text-rose-400">
                        {at.finishedAdminSub}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playCabinChime('tap');
                        onSignOut();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs cursor-pointer shadow-sm shrink-0"
                    >
                      {at.lockAndSignOut}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB: PASSENGER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <span>{at.requestsTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.requestsSub}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pendingRequestsTotal > 0 && (
                    <button
                      onClick={onClearCompletedRequests}
                      className="px-3.5 py-2 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
                    >
                      {at.clearResolved}
                    </button>
                  )}
                  {onClearAllRequests && (
                    <button
                      onClick={() => {
                        playCabinChime('tap');
                        onClearAllRequests();
                        showToast('All passenger requests cleared for next ride!');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{at.clearRequestsAll}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cabin Messages Section */}
              <div className="rounded-2xl cabin-card border p-5 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>{at.cabinComfortTitle}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold cabin-badge border">
                    {cabinMessages.length} {at.totalLabel}
                  </span>
                </h3>

                {cabinMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">{at.noCabinRequests}</div>
                ) : (
                  <div className="space-y-3">
                    {cabinMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border transition-all ${
                          msg.status === 'sent'
                            ? 'bg-purple-950/40 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                            : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                  msg.status === 'sent'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {msg.status === 'sent' ? at.newRequestBadge : at.acknowledgedBadge}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(msg.sentAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">{msg.text}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {msg.status === 'sent' ? (
                              <button
                                onClick={() => {
                                  playCabinChime('acknowledged');
                                  onUpdateMessageStatus(msg.id, 'acknowledged');
                                  cloudSync.updateRequestStatus(msg.id, 'acknowledged');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{at.acknowledge}</span>
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{at.handled}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Reply Presets */}
                        {msg.status === 'sent' && (
                          <div className="mt-3 pt-3 border-t border-purple-900/40 flex flex-wrap gap-1.5 text-xs">
                            <span className="text-slate-400 text-[11px] self-center mr-1">{at.quickReplyLabel}</span>
                            {['Adjusting A/C now! ❄️', 'Cold water coming up! 💧', 'Right away! 👍'].map(
                              (reply) => (
                                <button
                                  key={reply}
                                  onClick={() => {
                                    playCabinChime('acknowledged');
                                    onUpdateMessageStatus(msg.id, 'acknowledged');
                                    cloudSync.updateRequestStatus(msg.id, 'acknowledged');
                                    showToast(`Sent response: "${reply}"`);
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 text-[11px] font-semibold cursor-pointer"
                                >
                                  {reply}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Song Requests Section */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <span>{at.jukeboxRequestsTitle}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300">
                    {songRequests.length} {at.totalLabel}
                  </span>
                </h3>

                {songRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">{at.noSongRequests}</div>
                ) : (
                  <div className="space-y-3">
                    {songRequests.map((song) => (
                      <div
                        key={song.id}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{song.title}</span>
                            <span className="text-slate-400 font-normal">by {song.artist}</span>
                          </div>
                          <div className="text-xs text-purple-300 mt-0.5">
                            Genre: {song.genre} {song.note ? `• "${song.note}"` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {song.status === 'pending' && (
                            <button
                              onClick={() => {
                                playCabinChime('acknowledged');
                                onUpdateSongStatus(song.id, 'accepted');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                            >
                              {at.acceptAndQueue}
                            </button>
                          )}
                          {song.status === 'accepted' && (
                            <button
                              onClick={() => {
                                playCabinChime('tap');
                                onUpdateSongStatus(song.id, 'completed');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer"
                            >
                              {at.markPlayed}
                            </button>
                          )}
                          {song.status === 'completed' && (
                            <span className="text-xs text-slate-500 font-bold">{at.playedBadge}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: APP & BUTTON MANAGER */}
          {activeTab === 'apps' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-indigo-400" />
                    <span>{at.appsManagerTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.appsManagerSub}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Restore default launcher buttons?')) {
                        onUpdateInstalledApps(INITIAL_INSTALLED_APPS);
                        cloudSync.saveAppsList(INITIAL_INSTALLED_APPS);
                        showToast('Default launcher buttons restored!');
                      }
                    }}
                    className="px-3 py-2 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
                  >
                    {at.restoreDefaults}
                  </button>
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setIsAddButtonModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl cabin-primary-btn text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{at.addNewButton}</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                {['all', 'games', 'entertainment', 'google', 'music', 'utilities'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setButtonFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-colors ${
                      buttonFilter === cat
                        ? 'bg-purple-600 text-white font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Apps List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {installedApps
                  .filter((app) => buttonFilter === 'all' || app.category === buttonFilter)
                  .map((app, index) => (
                    <div
                      key={app.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        app.isHiddenFromPassengers
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          : 'bg-slate-900 border-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                            style={{ backgroundColor: app.accentColor || '#6366f1' }}
                          >
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{app.name}</span>
                              {app.isHiddenFromPassengers && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 capitalize">{app.category}</div>
                          </div>
                        </div>

                        {/* Order Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const newIdx = index - 1;
                              if (newIdx < 0) return;
                              const updated = [...installedApps];
                              const [m] = updated.splice(index, 1);
                              updated.splice(newIdx, 0, m);
                              onUpdateInstalledApps(updated);
                              cloudSync.saveAppsList(updated);
                            }}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const newIdx = index + 1;
                              if (newIdx >= installedApps.length) return;
                              const updated = [...installedApps];
                              const [m] = updated.splice(index, 1);
                              updated.splice(newIdx, 0, m);
                              onUpdateInstalledApps(updated);
                              cloudSync.saveAppsList(updated);
                            }}
                            disabled={index === installedApps.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer text-slate-300"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mb-3 min-h-[32px]">
                        {app.description}
                      </p>

                      <div className="text-[11px] font-mono text-slate-500 truncate mb-3">
                        {app.packageName || app.deepLinkUrl || 'Internal Action'}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <button
                          onClick={() => {
                            const updated = installedApps.map((a) =>
                              a.id === app.id ? { ...a, isHiddenFromPassengers: !a.isHiddenFromPassengers } : a
                            );
                            onUpdateInstalledApps(updated);
                            cloudSync.saveAppsList(updated);
                            showToast(`Updated visibility for ${app.name}`);
                          }}
                          className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {app.isHiddenFromPassengers ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>{at.showBtn}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>{at.hideBtn}</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const duplicated = { ...app, id: `app-copy-${Date.now()}`, name: `${app.name} (Copy)` };
                              const updated = [...installedApps, duplicated];
                              onUpdateInstalledApps(updated);
                              cloudSync.saveAppsList(updated);
                              showToast(`Duplicated ${app.name}`);
                            }}
                            className="p-1 text-slate-400 hover:text-purple-400 cursor-pointer"
                            title="Duplicate Button"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete button "${app.name}"?`)) {
                                const updated = installedApps.filter((a) => a.id !== app.id);
                                onUpdateInstalledApps(updated);
                                cloudSync.saveAppsList(updated);
                                showToast(`Removed "${app.name}"`);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete Button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Button Modal */}
              {isAddButtonModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-base">Add New Launcher Button</h3>
                      <button onClick={() => setIsAddButtonModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newBtnName.trim()) return;
                        const newBtn: InstalledAppItem = {
                          id: `app-custom-${Date.now()}`,
                          name: newBtnName.trim(),
                          category: newBtnCategory,
                          packageName: newBtnPackage.trim(),
                          deepLinkUrl: newBtnDeepLink.trim(),
                          webFallbackUrl: newBtnWeb.trim(),
                          iconType: 'custom',
                          accentColor: newBtnAccent,
                          description: newBtnDesc.trim() || 'Tap to launch',
                          badge: newBtnBadge.trim(),
                          isHiddenFromPassengers: newBtnHidden,
                          isCustom: true,
                          actionType: newBtnActionType,
                          order: installedApps.length + 1,
                        };
                        const updated = [...installedApps, newBtn];
                        onUpdateInstalledApps(updated);
                        cloudSync.saveAppsList(updated);
                        setIsAddButtonModalOpen(false);
                        setNewBtnName('');
                        setNewBtnPackage('');
                        setNewBtnDeepLink('');
                        setNewBtnWeb('');
                        setNewBtnDesc('');
                        showToast(`Added "${newBtn.name}"!`);
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Button Name</label>
                        <input
                          type="text"
                          required
                          value={newBtnName}
                          onChange={(e) => setNewBtnName(e.target.value)}
                          placeholder="e.g. Roblox, Netflix, Board Games"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Category</label>
                          <select
                            value={newBtnCategory}
                            onChange={(e) => setNewBtnCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                          >
                            <option value="games">Games</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="music">Music</option>
                            <option value="google">Google Apps</option>
                            <option value="utilities">Utilities</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Accent Color</label>
                          <input
                            type="color"
                            value={newBtnAccent}
                            onChange={(e) => setNewBtnAccent(e.target.value)}
                            className="w-full h-9 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Android Package Name (for intent)</label>
                        <input
                          type="text"
                          value={newBtnPackage}
                          onChange={(e) => setNewBtnPackage(e.target.value)}
                          placeholder="e.g. com.roblox.client"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Deep Link / Intent URI</label>
                        <input
                          type="text"
                          value={newBtnDeepLink}
                          onChange={(e) => setNewBtnDeepLink(e.target.value)}
                          placeholder="e.g. roblox:// or market://details?id=..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Web Fallback URL</label>
                        <input
                          type="url"
                          value={newBtnWeb}
                          onChange={(e) => setNewBtnWeb(e.target.value)}
                          placeholder="e.g. https://www.roblox.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Short Description</label>
                        <input
                          type="text"
                          value={newBtnDesc}
                          onChange={(e) => setNewBtnDesc(e.target.value)}
                          placeholder="Short description on tablet"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAddButtonModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold cursor-pointer hover:brightness-110"
                        >
                          Save & Publish Button
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SCREENSAVER */}
          {activeTab === 'screensaver' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-sky-400" />
                    <span>{at.screensaverTitle}</span>
                  </h2>
                  <p className="text-xs cabin-text-muted">
                    {at.screensaverSub}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCabinChime('acknowledged');
                    onTriggerScreensaverNow();
                    showToast('Screensaver launched on tablet!');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl cabin-primary-btn text-xs font-bold cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{at.previewScreensaver}</span>
                </button>
              </div>

              {/* Settings Form */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Screensaver Active</label>
                    <select
                      value={screensaverSettings.isEnabled ? 'true' : 'false'}
                      onChange={(e) =>
                        onUpdateScreensaverSettings({
                          ...screensaverSettings,
                          isEnabled: e.target.value === 'true',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                    >
                      <option value="true">Enabled (Auto-start)</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Inactivity Timeout</label>
                    <select
                      value={screensaverSettings.idleTimeoutSeconds}
                      onChange={(e) =>
                        onUpdateScreensaverSettings({
                          ...screensaverSettings,
                          idleTimeoutSeconds: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                    >
                      <option value="15">15 Seconds</option>
                      <option value="30">30 Seconds</option>
                      <option value="45">45 Seconds (Recommended)</option>
                      <option value="60">1 Minute</option>
                      <option value="120">2 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Slide Duration</label>
                    <select
                      value={screensaverSettings.slideDurationSeconds}
                      onChange={(e) =>
                        onUpdateScreensaverSettings({
                          ...screensaverSettings,
                          slideDurationSeconds: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                    >
                      <option value="5">5 Seconds per slide</option>
                      <option value="8">8 Seconds (Smooth)</option>
                      <option value="12">12 Seconds</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                  <input
                    type="checkbox"
                    id="touchWake"
                    checked={screensaverSettings.showTouchToWake}
                    onChange={(e) =>
                      onUpdateScreensaverSettings({
                        ...screensaverSettings,
                        showTouchToWake: e.target.checked,
                      })
                    }
                    className="rounded cursor-pointer"
                  />
                  <label htmlFor="touchWake" className="text-slate-300 font-bold cursor-pointer">
                    Show "Touch anywhere to start the screen" button banner
                  </label>
                </div>
              </div>

              {/* Photo Slides Grid */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-white">
                  Active Advertising Slides ({screensaverSettings.selectedPhotoIds.length} Selected)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {photos
                    .filter((p) => p.albumId === 'advertising-promo')
                    .map((photo) => {
                      const isSelected = screensaverSettings.selectedPhotoIds.includes(photo.id);
                      return (
                        <div
                          key={photo.id}
                          onClick={() => {
                            playCabinChime('tap');
                            const nextIds = isSelected
                              ? screensaverSettings.selectedPhotoIds.filter((id) => id !== photo.id)
                              : [...screensaverSettings.selectedPhotoIds, photo.id];
                            onUpdateScreensaverSettings({
                              ...screensaverSettings,
                              selectedPhotoIds: nextIds,
                            });
                          }}
                          className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video sm:aspect-4/3 ${
                            isSelected
                              ? 'border-sky-400 ring-2 ring-sky-400/30'
                              : 'border-slate-800 opacity-50 grayscale hover:grayscale-0'
                          }`}
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-2.5">
                            <span className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shadow-md">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLEET TABLETS */}
          {activeTab === 'tablets' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Tablet className="w-5 h-5 text-emerald-400" />
                  <span>{at.fleetTabletsTitle}</span>
                </h2>
                <p className="text-xs cabin-text-muted">
                  {at.fleetTabletsSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tablets.map((tab) => {
                  const assignedDriver = drivers.find((d) => d.id === tab.assignedDriverId);
                  return (
                    <div
                      key={tab.id}
                      className="p-5 rounded-2xl cabin-card border space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-extrabold text-base">{tab.name}</div>
                          <div className="text-xs cabin-text-muted">{tab.vehicleModel}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online
                        </span>
                      </div>

                      <div className="p-3 rounded-xl cabin-panel border space-y-2 text-xs">
                        <div className="flex justify-between cabin-text-muted">
                          <span>Target Resolution:</span>
                          <span className="font-bold">{tab.resolution}</span>
                        </div>
                        <div className="flex justify-between cabin-text-muted">
                          <span>Assigned Driver:</span>
                          <span className="font-bold" style={{ color: 'var(--cabin-accent)' }}>{assignedDriver?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between cabin-text-muted">
                          <span>Kiosk Software:</span>
                          <span className="font-mono">{tab.appVersion}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                          onClick={() => {
                            playCabinChime('acknowledged');
                            onTriggerScreensaverNow();
                            showToast(`Screensaver triggered on ${tab.name}!`);
                          }}
                          className="py-2.5 px-3 rounded-xl cabin-badge border cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Tv className="w-4 h-4" />
                          <span>{at.triggerScreensaver}</span>
                        </button>

                        <button
                          onClick={() => {
                            playCabinChime('tap');
                            showToast(`Refreshed telemetry for ${tab.name}`);
                          }}
                          className="py-2.5 px-3 rounded-xl cabin-panel border cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>{at.pingTablet}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SERVICE INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                  <span>{at.inquiriesTitle}</span>
                </h2>
                <p className="text-xs cabin-text-muted">
                  {at.inquiriesSub}
                </p>
              </div>

              {licenseInquiries.length > 0 && (
                <div className="space-y-3 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-400">
                      Commercial Purchase Orders &amp; License Leads ({licenseInquiries.length})
                    </h3>
                  </div>
                  {licenseInquiries.map((lead) => {
                    const matchedLicense = lead.licenseKey
                      ? platformLicenses.find((l) => l.id === lead.licenseKey)
                      : undefined;
                    return (
                      <div
                        key={lead.id}
                        className="p-5 rounded-2xl cabin-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                lead.status === 'new'
                                  ? 'bg-amber-500 text-slate-950'
                                  : lead.status === 'contacted'
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {lead.status === 'licensed' ? 'Paid & Licensed' : lead.status}
                            </span>
                            <span className="font-extrabold text-sm">{lead.companyName}</span>
                            <span className="text-xs font-mono text-amber-400 uppercase">
                              {lead.packageTier.replace('_', ' ')} ({lead.billingCycle || 'monthly'}) ·{' '}
                              {lead.fleetSize} vehicles
                            </span>
                          </div>
                          <div className="text-xs font-bold" style={{ color: 'var(--cabin-accent)' }}>
                            Buyer: {lead.contactName} · {lead.email} · {lead.phone}
                          </div>
                          {lead.licenseKey && (
                            <div className="text-xs font-mono font-bold text-emerald-400 flex flex-wrap items-center gap-2">
                              <span>Issued License Key: {lead.licenseKey}</span>
                              {matchedLicense && (
                                <span className="uppercase">
                                  ({matchedLicense.paymentStatus})
                                </span>
                              )}
                            </div>
                          )}
                          {lead.notes && (
                            <p className="text-xs cabin-panel p-2.5 rounded-xl border">{lead.notes}</p>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          {!lead.licenseKey ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const created = await enrollmentAdminApi.issueLicenseForInquiry(lead);
                                showToast(
                                  `Payment confirmed! Issued License Key ${created.id} for ${lead.companyName}`
                                );
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                            >
                              Confirm Payment &amp; Issue License
                            </button>
                          ) : matchedLicense ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const next =
                                  matchedLicense.paymentStatus === 'paid' ? 'revoked' : 'paid';
                                await enrollmentAdminApi.revokePlatformLicense(matchedLicense.id, next);
                                showToast(`License ${matchedLicense.id} set to ${next.toUpperCase()}`);
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                                matchedLicense.paymentStatus === 'paid'
                                  ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                                  : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {matchedLicense.paymentStatus === 'paid'
                                ? 'Revoke License Key'
                                : 'Restore License Key'}
                            </button>
                          ) : null}

                          <div className="flex items-center gap-2">
                            <select
                              value={lead.status}
                              onChange={async (e) => {
                                const nextStatus = e.target.value as LicenseInquiry['status'];
                                setLicenseInquiries((prev) =>
                                  prev.map((item) =>
                                    item.id === lead.id ? { ...item, status: nextStatus } : item
                                  )
                                );
                                await enrollmentAdminApi.updateLicenseInquiryStatus(lead.id, nextStatus);
                                showToast(`Updated platform lead status to ${nextStatus.toUpperCase()}`);
                              }}
                              className="px-3 py-1.5 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
                            >
                              <option value="new" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>New Order</option>
                              <option value="contacted" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Contacted</option>
                              <option value="licensed" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Paid &amp; Licensed</option>
                            </select>
                            <a
                              href={`mailto:${lead.email}?subject=${encodeURIComponent(
                                `Silvermyst CabinOS License${lead.licenseKey ? ` Key: ${lead.licenseKey}` : ''} — ${lead.companyName}`
                              )}&body=${encodeURIComponent(
                                lead.licenseKey
                                  ? `Hello ${lead.contactName},\n\nYour Silvermyst CabinOS purchase is complete.\n\nLicense Key: ${lead.licenseKey}\nPackage: ${lead.packageTier}\n\nVisit the Silvermyst Portal to verify your license status and sign in with your approved administrator email for managed tablet provisioning.\n\nThank you,\nSilvermyst Multiservices · (574) 387-6229`
                                  : `Hello ${lead.contactName},\n\nThank you for your Silvermyst CabinOS order for ${lead.companyName}.`
                              )}`}
                              className="px-3 py-1.5 rounded-xl cabin-badge border text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>Email Buyer</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl cabin-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            inq.status === 'new'
                              ? 'bg-amber-500 text-slate-950'
                              : inq.status === 'contacted'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {inq.status}
                        </span>
                        <span className="font-extrabold text-sm">{inq.serviceTitle}</span>
                      </div>
                      <div className="text-xs font-bold" style={{ color: 'var(--cabin-accent)' }}>
                        Client: {inq.passengerName || 'Passenger'} • Contact: {inq.phoneOrContact}
                      </div>
                      <p className="text-xs cabin-panel p-2.5 rounded-xl border">
                        {inq.notes}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <select
                        value={inq.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as ServiceInquiry['status'];
                          setInquiries((prev) =>
                            prev.map((item) => (item.id === inq.id ? { ...item, status: nextStatus } : item))
                          );
                          cloudSync.updateInquiryStatus(inq.id, nextStatus);
                          showToast(`Updated inquiry status to ${nextStatus.toUpperCase()}`);
                        }}
                        className="px-3 py-1.5 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
                      >
                        <option value="new" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>New Lead</option>
                        <option value="contacted" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Contacted</option>
                        <option value="resolved" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Resolved / Booked</option>
                      </select>

                      <a
                        href={
                          inq.phoneOrContact.includes('@')
                            ? `mailto:${inq.phoneOrContact}`
                            : `tel:${inq.phoneOrContact}`
                        }
                        className="px-3 py-1.5 rounded-xl cabin-badge border text-xs font-bold flex items-center gap-1.5"
                      >
                        {inq.phoneOrContact.includes('@') ? (
                          <Mail className="w-3.5 h-3.5" />
                        ) : (
                          <Phone className="w-3.5 h-3.5" />
                        )}
                        <span>{inq.phoneOrContact.includes('@') ? 'Email' : at.callClient}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TEAM CHAT */}
          {activeTab === 'team_chat' && (
            <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Send className="w-5 h-5" style={{ color: 'var(--cabin-accent)' }} />
                  <span>{at.teamChatTitle}</span>
                </h2>
                <p className="text-xs cabin-text-muted">
                  {at.teamChatSub}
                </p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                {teamMessages.map((msg) => {
                  const isMine = msg.senderId === activeDriverId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="text-[11px] text-slate-400 font-bold px-1">
                        {msg.senderName} ({msg.senderRole === 'owner' ? 'Owner' : 'Driver'}) •{' '}
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                            : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/60'
                        }`}
                      >
                        <div>{msg.text}</div>
                        {msg.audioDuration && (
                          <button
                            type="button"
                            onClick={() => {
                              playCabinChime('acknowledged');
                              if ('speechSynthesis' in window) {
                                const u = new SpeechSynthesisUtterance(
                                  `Voice note from ${msg.senderName}, ${msg.audioDuration} seconds`
                                );
                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(u);
                              }
                            }}
                            className="mt-1.5 pt-1.5 border-t border-white/20 flex items-center gap-1.5 text-[11px] text-purple-200 hover:text-white cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                            <span>Play Audio Note ({msg.audioDuration}s)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Emoji Picker Bar */}
              {showTeamEmojis && (
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                  {['👍', '🚗', '🙏', '😊', '🔥', '❄️', '🎵', '✈️', '⭐', '💯', '☕', '🚨'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        playCabinChime('tap');
                        setChatInput((prev) => prev + em);
                      }}
                      className="text-lg px-1.5 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Form with Emojis & Audio Voice Note */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  playCabinChime('tap');
                  const text = chatInput.trim();
                  const res = await cloudSync.sendAdminMessage({
                    senderId: activeDriver.id,
                    senderName: activeDriver.name,
                    senderRole: activeDriver.role,
                    text,
                  });
                  if (res.success) {
                    setTeamMessages((prev) => [
                      ...prev,
                      {
                        id: res.id || `msg-${Date.now()}`,
                        senderId: activeDriver.id,
                        senderName: activeDriver.name,
                        senderRole: activeDriver.role,
                        text,
                        sentAt: Date.now(),
                        readBy: [activeDriver.id],
                      },
                    ]);
                    setChatInput('');
                    setShowTeamEmojis(false);
                  }
                }}
                className="flex gap-2 items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setShowTeamEmojis(!showTeamEmojis);
                  }}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
                    showTeamEmojis
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Add Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!isRecordingTeamVoice) {
                      playCabinChime('tap');
                      setIsRecordingTeamVoice(true);
                      setTeamVoiceSeconds(0);
                      teamVoiceTimerRef.current = setInterval(() => {
                        setTeamVoiceSeconds((s) => s + 1);
                      }, 1000);
                    } else {
                      clearInterval(teamVoiceTimerRef.current);
                      setIsRecordingTeamVoice(false);
                      const dur = teamVoiceSeconds || 2;
                      playCabinChime('acknowledged');
                      const voiceText = `🎤 Voice Audio Note (${dur}s)`;
                      const res = await cloudSync.sendAdminMessage({
                        senderId: activeDriver.id,
                        senderName: activeDriver.name,
                        senderRole: activeDriver.role,
                        text: voiceText,
                        audioDuration: dur,
                      });
                      setTeamMessages((prev) => [
                        ...prev,
                        {
                          id: res.id || `msg-${Date.now()}`,
                          senderId: activeDriver.id,
                          senderName: activeDriver.name,
                          senderRole: activeDriver.role,
                          text: voiceText,
                          audioDuration: dur,
                          sentAt: Date.now(),
                          readBy: [activeDriver.id],
                        },
                      ]);
                      setTeamVoiceSeconds(0);
                    }
                  }}
                  className={`px-3 py-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isRecordingTeamVoice
                      ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-indigo-400 hover:text-white'
                  }`}
                  title={isRecordingTeamVoice ? 'Tap to stop & send audio' : 'Record Voice Note for Team (hands-free)'}
                >
                  {isRecordingTeamVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isRecordingTeamVoice && <span>{teamVoiceSeconds}s</span>}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message team as ${activeDriver.name} (supports emojis & audio)...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{at.sendMessage}</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
