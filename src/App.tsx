import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { LeftAppsHub } from './components/LeftAppsHub';
import { RightDriverHub } from './components/RightDriverHub';
import { DriverQueueModal } from './components/DriverQueueModal';
import { WifiModal } from './components/WifiModal';
import { PassengerRequestModal } from './components/PassengerRequestModal';
import { TabletInstallModal } from './components/TabletInstallModal';
import { Screensaver } from './components/Screensaver';
import { WeatherAppModal } from './components/apps/WeatherAppModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { cloudSync } from './services/cloudSync';
import { AdminPinModal } from './components/admin/AdminPinModal';
import { DraggableChatBubble } from './components/DraggableChatBubble';
import { GoogleTranslateModal } from './components/apps/GoogleTranslateModal';
import { PassengerFeedbackModal } from './components/apps/PassengerFeedbackModal';
import { ExploreNearbyModal } from './components/apps/ExploreNearbyModal';
import { MarketingPopupModal } from './components/MarketingPopupModal';
import { PublicAccessPortal } from './components/PublicAccessPortal';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { PortalAccessResolution, resolveUserPortalAccess } from './services/authEnrollment';
import { CABIN_THEMES, KIOSK_TRANSLATIONS, DEFAULT_MARKETING_POPUPS, applyCabinThemeToDocument } from './data/cabinThemes';
import {
  INITIAL_DRIVER_PROFILE,
  INITIAL_DRIVERS_LIST,
  INITIAL_PLAYLIST_TRACKS,
  DEFAULT_SCREENSAVER_SETTINGS,
  INITIAL_GALLERY_ALBUMS,
  CARLOS_PHOTO_GALLERY,
  INITIAL_INSTALLED_APPS,
  INITIAL_QUICK_CONNECT_ITEMS,
} from './data/mockData';
import {
  SongRequest,
  CabinMessage,
  ScreensaverSettings,
  DriverProfile,
  GalleryAlbum,
  GalleryItem,
  InstalledAppItem,
  QuickConnectItem,
  CloudSyncState,
  CabinThemeMode,
  SupportedLanguage,
  MarketingPopup,
} from './types/kiosk';
import { ScreenShare, Sparkles, X, Megaphone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { playCabinChime } from './utils/cabinAudio';
import { openExternalUrl } from './utils/appLauncher';

export default function App() {
  // Theme state: defaults to dark for luxury vehicle cabin aesthetic
  const [isDark, setIsDark] = useState<boolean>(true);

  // Multi-Color Cabin Theme & Event Background
  const [cabinTheme, setCabinTheme] = useState<CabinThemeMode>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_cabin_theme_v1') as CabinThemeMode;
      if (stored && CABIN_THEMES[stored]) return stored;
    } catch (e) {}
    return 'royal_purple';
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_cabin_theme_v1', cabinTheme);
    } catch (e) {}
  }, [cabinTheme]);

  // System Language state (EN / ES / FR / DE)
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_language_v1') as SupportedLanguage;
      if (stored && KIOSK_TRANSLATIONS[stored]) return stored;
    } catch (e) {}
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_language_v1', language);
    } catch (e) {}
  }, [language]);

  // Easy View Accessibility ("Big & Clean") mode
  const [easyView, setEasyView] = useState<boolean>(() => {
    try {
      return localStorage.getItem('silvermyst_easy_view_v1') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_easy_view_v1', String(easyView));
    } catch {}
  }, [easyView]);

  // Google Maps Platform Two-Tier Quota Exhaustion Banner State (Section 8 Case A)
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Layout mode: defaults to carlos-expanded so Driver Showcase has extra prominence
  const [viewMode, setViewMode] = useState<'balanced' | 'carlos-expanded' | 'carlos-full'>('carlos-expanded');

  // Tablet orientation check
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  // Access Control & Portal Mode: All visitors start at Public Portal unless authorized
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [accessResolution, setAccessResolution] = useState<PortalAccessResolution>({ status: 'loading' });
  const [interfaceMode, setInterfaceMode] = useState<'portal' | 'kiosk' | 'admin'>('portal');

  const refreshPortalAccess = async (targetUser: User | null = auth.currentUser) => {
    try {
      const resolved = await resolveUserPortalAccess(targetUser);
      setAccessResolution(resolved);
      if (resolved.status !== 'authorized') {
        setInterfaceMode('portal');
      } else {
        // Keep active driver profile aligned with signed-in employee's PIN if matched
        const matched = driversList.find(
          (d) => d.email?.toLowerCase() === resolved.account.email.toLowerCase()
        );
        if (matched && resolved.account.assignedPin) {
          setDriverProfile({ ...matched, adminPin: resolved.account.assignedPin });
        }
      }
    } catch (e) {
      setAccessResolution({ status: 'public_locked' });
      setInterfaceMode('portal');
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAccessResolution({ status: 'public_locked' });
        setInterfaceMode('portal');
        return;
      }
      setAccessResolution({ status: 'loading' });
      await refreshPortalAccess(user);
    });
    return () => unsubAuth();
  }, []);

  // Broadcast announcement banner from Admin to Kiosk tablets
  const [broadcastAnnouncement, setBroadcastAnnouncement] = useState<string | null>(null);
  const [isReplyingToBroadcast, setIsReplyingToBroadcast] = useState<boolean>(false);
  const [broadcastReplyText, setBroadcastReplyText] = useState<string>('');
  const [broadcastReplySent, setBroadcastReplySent] = useState<boolean>(false);
  const lastHandledBroadcastIdRef = useRef<string | null>(null);

  // Driver Profile with persistent storage
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_driver_profile_v3');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_DRIVER_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_driver_profile_v3', JSON.stringify(driverProfile));
    } catch (e) {}
  }, [driverProfile]);

  // 4-Digit Security PIN for Administrator Portal (First-time default: 0000)
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_admin_pin_v1');
      if (stored && /^\d{4}$/.test(stored)) return stored;
    } catch (e) {}
    return '0000';
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_admin_pin_v1', adminPin);
    } catch (e) {}
  }, [adminPin]);

  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);

  // Quick Connect & Tap-to-Scan Dock Items
  const [quickConnects, setQuickConnects] = useState<QuickConnectItem[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_quick_connects_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_QUICK_CONNECT_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_quick_connects_v1', JSON.stringify(quickConnects));
    } catch (e) {}
  }, [quickConnects]);

  // Multiple Driver Profiles list (each with profile-specific adminPin defaulting to '0000')
  const [driversList, setDriversList] = useState<DriverProfile[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_drivers_list_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_DRIVERS_LIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_drivers_list_v1', JSON.stringify(driversList));
    } catch (e) {}
  }, [driversList]);

  // Live Cloud Sync State: synced, saving, offline, error
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState>('synced');

  // Music state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Driver / Passenger communication queues
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);
  const [cabinMessages, setCabinMessages] = useState<CabinMessage[]>([]);

  // Gallery Albums
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_gallery_albums_v3');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_GALLERY_ALBUMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_gallery_albums_v3', JSON.stringify(galleryAlbums));
    } catch (e) {}
  }, [galleryAlbums]);

  // Gallery Photos
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryItem[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_gallery_photos_v3');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return CARLOS_PHOTO_GALLERY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_gallery_photos_v3', JSON.stringify(galleryPhotos));
    } catch (e) {}
  }, [galleryPhotos]);

  // Installed Apps & Games Launcher
  const [installedApps, setInstalledApps] = useState<InstalledAppItem[]>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_installed_apps_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_INSTALLED_APPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_installed_apps_v1', JSON.stringify(installedApps));
    } catch (e) {}
  }, [installedApps]);

  // Modals state
  const [isDriverQueueOpen, setIsDriverQueueOpen] = useState<boolean>(false);
  const [driverModalInitialTab, setDriverModalInitialTab] = useState<'queue' | 'apps' | 'galleries' | 'screensaver' | 'profile' | 'install'>('queue');
  const [isWifiModalOpen, setIsWifiModalOpen] = useState<boolean>(false);
  const [isPassengerRequestModalOpen, setIsPassengerRequestModalOpen] = useState<boolean>(false);
  const [isTabletInstallOpen, setIsTabletInstallOpen] = useState<boolean>(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isChatDismissed, setIsChatDismissed] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Marketing Pop-Up State (passenger kiosk only; never shown in Admin or Public Portal)
  const [marketingPopupsList, setMarketingPopupsList] = useState<MarketingPopup[]>(DEFAULT_MARKETING_POPUPS);
  const [activeMarketingPopup, setActiveMarketingPopup] = useState<MarketingPopup | null>(null);
  const [isPromoExploreOpen, setIsPromoExploreOpen] = useState<boolean>(false);
  const lastPopupShownAtRef = useRef<Record<string, number>>({});
  const handledManualTriggerAtRef = useRef<Record<string, number>>({});

  // Screensaver Settings & State
  const [screensaverSettings, setScreensaverSettings] = useState<ScreensaverSettings>(() => {
    try {
      const stored = localStorage.getItem('silvermyst_screensaver_settings_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_SCREENSAVER_SETTINGS;
  });
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);

  // Persist screensaver settings
  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_screensaver_settings_v2', JSON.stringify(screensaverSettings));
    } catch (e) {}
  }, [screensaverSettings]);

  // Cloud Synchronization Listeners — attached ONLY when visitor is an authorized enrolled user
  useEffect(() => {
    if (accessResolution.status !== 'authorized') {
      return;
    }

    const unsubSyncState = cloudSync.subscribeSyncState((state) => {
      setCloudSyncState(state);
    });

    const unsubRequests = cloudSync.subscribeToRequests((cloudReqs) => {
      const songs: SongRequest[] = [];
      const msgs: CabinMessage[] = [];
      (cloudReqs || []).forEach((item: any) => {
        if (item.title && item.artist) {
          songs.push(item as SongRequest);
        } else if (item.text) {
          msgs.push(item as CabinMessage);
        }
      });
      setSongRequests(songs);
      setCabinMessages(msgs);
    });

    const unsubDrivers = cloudSync.subscribeToDrivers((cloudDrivers) => {
      if (cloudDrivers && cloudDrivers.length > 0) {
        setDriversList(cloudDrivers);
        const found = cloudDrivers.find((d) => d.id === driverProfile.id);
        if (found) setDriverProfile(found);
      }
    });

    const unsubApps = cloudSync.subscribeToApps((cloudApps) => {
      if (cloudApps && cloudApps.length > 0) {
        setInstalledApps(cloudApps);
      }
    });

    const unsubQuickConnects = cloudSync.subscribeToQuickConnects((items) => {
      if (items && items.length > 0) {
        setQuickConnects(items);
      }
    });

    const unsubAlbums = cloudSync.subscribeToAlbums((albums) => {
      if (albums && albums.length > 0) {
        setGalleryAlbums(albums);
      }
    });

    const unsubPhotos = cloudSync.subscribeToPhotos((photos) => {
      if (photos && photos.length > 0) {
        setGalleryPhotos(photos);
      }
    });

    const unsubSystem = cloudSync.subscribeToSystemSettings((settings) => {
      if (settings.cabin_theme?.mode && CABIN_THEMES[settings.cabin_theme.mode as CabinThemeMode]) {
        setCabinTheme(settings.cabin_theme.mode as CabinThemeMode);
      }
      if (settings.kiosk_language?.language && KIOSK_TRANSLATIONS[settings.kiosk_language.language as SupportedLanguage]) {
        setLanguage(settings.kiosk_language.language as SupportedLanguage);
      }
      if (settings.screensaver_config) {
        setScreensaverSettings((prev) => ({ ...prev, ...settings.screensaver_config }));
      }
      if (settings.live_broadcast?.text && settings.live_broadcast?.id) {
        const ageMs = Date.now() - Number(settings.live_broadcast.sentAt || 0);
        if (
          settings.live_broadcast.id !== lastHandledBroadcastIdRef.current &&
          ageMs < 120_000
        ) {
          lastHandledBroadcastIdRef.current = settings.live_broadcast.id;
          setBroadcastAnnouncement(settings.live_broadcast.text);
          setIsReplyingToBroadcast(false);
          setBroadcastReplyText('');
          setBroadcastReplySent(false);
        }
      }
    });

    const unsubMarketing = cloudSync.subscribeToMarketingPopups((popups) => {
      setMarketingPopupsList(popups && popups.length > 0 ? popups : DEFAULT_MARKETING_POPUPS);
    });

    const unsubCommands = cloudSync.subscribeToCommands('tablet-samsung-10-01', (cmd) => {
      if (cmd.status === 'pending') {
        if (cmd.tabletId === 'all' || cmd.tabletId === 'tablet-samsung-10-01') {
          if (cmd.action === 'reload_kiosk') {
            cloudSync.markCommandCompleted(cmd.id);
            window.location.reload();
          } else if (cmd.action === 'test_chime') {
            cloudSync.markCommandCompleted(cmd.id);
            playCabinChime('comfort');
          } else if (cmd.action === 'force_resync') {
            cloudSync.markCommandCompleted(cmd.id);
            cloudSync.syncAllData();
          } else if (cmd.action === 'clear_cache') {
            cloudSync.markCommandCompleted(cmd.id);
            localStorage.clear();
            window.location.reload();
          }
        }
      }
    });

    // Report tablet heartbeat
    cloudSync.reportTabletHeartbeat({
      id: 'tablet-samsung-10-01',
      name: 'Tablet 1 (Cadillac Escalade)',
      assignedDriverId: driverProfile.id,
      vehicleModel: driverProfile.vehicleModel,
      status: 'online',
      lastSeen: Date.now(),
      appVersion: 'v3.5.0-kiosk',
      resolution: `${window.innerWidth} × ${window.innerHeight}`,
      isLocked: true,
    });

    return () => {
      unsubSyncState();
      unsubRequests();
      unsubDrivers();
      unsubApps();
      unsubQuickConnects();
      unsubAlbums();
      unsubPhotos();
      unsubSystem();
      unsubMarketing();
      unsubCommands();
    };
  }, [driverProfile.id, accessResolution.status]);

  // Auto-dismiss broadcast banner after 45s (paused while passenger is typing a reply)
  useEffect(() => {
    if (!broadcastAnnouncement || isReplyingToBroadcast) return;
    const timer = setTimeout(() => {
      setBroadcastAnnouncement(null);
      setIsReplyingToBroadcast(false);
      setBroadcastReplyText('');
      setBroadcastReplySent(false);
    }, 45000);
    return () => clearTimeout(timer);
  }, [broadcastAnnouncement, isReplyingToBroadcast]);

  // Ensure marketing pop-ups NEVER stay visible inside Admin Console or Public Portal
  useEffect(() => {
    if (interfaceMode !== 'kiosk') {
      setActiveMarketingPopup(null);
    }
  }, [interfaceMode]);

  // Passenger-only Marketing Pop-Up Scheduler (manual pushes, periodic intervals, scheduled windows, startup)
  useEffect(() => {
    if (accessResolution.status !== 'authorized' || interfaceMode !== 'kiosk') {
      return;
    }

    const isPopupWithinWindow = (popup: MarketingPopup, nowMs: number): boolean => {
      if (popup.triggerType !== 'scheduled') return true;
      const nowDate = new Date(nowMs);
      const pad = (n: number) => String(n).padStart(2, '0');
      const todayStr = `${nowDate.getFullYear()}-${pad(nowDate.getMonth() + 1)}-${pad(nowDate.getDate())}`;

      if (popup.startDate && todayStr < popup.startDate) return false;
      if (popup.endDate && todayStr > popup.endDate) return false;

      if (popup.startTime || popup.endTime) {
        const currentHHMM = `${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`;
        if (popup.startTime && currentHHMM < popup.startTime) return false;
        if (popup.endTime && currentHHMM > popup.endTime) return false;
      }
      return true;
    };

    const evaluateMarketingPopups = () => {
      if (isScreensaverActive || activeMarketingPopup) return;
      const now = Date.now();

      // 1. Fresh manual push triggered by Admin within last 3 minutes
      const manualPush = marketingPopupsList.find(
        (p) =>
          p.isActive &&
          p.lastTriggeredAt &&
          now - p.lastTriggeredAt < 180_000 &&
          p.lastTriggeredAt > (handledManualTriggerAtRef.current[p.id] || 0)
      );
      if (manualPush) {
        handledManualTriggerAtRef.current[manualPush.id] = manualPush.lastTriggeredAt!;
        lastPopupShownAtRef.current[manualPush.id] = now;
        setActiveMarketingPopup(manualPush);
        return;
      }

      // 2. Periodic or repeating scheduled pop-ups
      const periodicDue = marketingPopupsList.find((p) => {
        if (!p.isActive || !isPopupWithinWindow(p, now)) return false;
        const isRepeating =
          p.triggerType === 'periodic' ||
          (p.triggerType === 'scheduled' && (p.repeatIntervalMinutes ?? 0) > 0);
        if (!isRepeating) return false;
        const intervalMs = Math.max(1, p.repeatIntervalMinutes || 5) * 60_000;
        const lastShown = lastPopupShownAtRef.current[p.id] || 0;
        return lastShown === 0 || now - lastShown >= intervalMs;
      });
      if (periodicDue) {
        lastPopupShownAtRef.current[periodicDue.id] = now;
        setActiveMarketingPopup(periodicDue);
        return;
      }

      // 3. One-time startup or non-repeating scheduled pop-ups
      const oneTimeDue = marketingPopupsList.find((p) => {
        if (!p.isActive || !isPopupWithinWindow(p, now)) return false;
        const isOneTimeScheduled =
          p.triggerType === 'scheduled' && !(p.repeatIntervalMinutes && p.repeatIntervalMinutes > 0);
        if (p.triggerType !== 'startup' && !isOneTimeScheduled) {
          return false;
        }
        return !lastPopupShownAtRef.current[p.id];
      });
      if (oneTimeDue) {
        lastPopupShownAtRef.current[oneTimeDue.id] = now;
        setActiveMarketingPopup(oneTimeDue);
      }
    };

    evaluateMarketingPopups();
    const intervalId = setInterval(evaluateMarketingPopups, 15_000);
    return () => clearInterval(intervalId);
  }, [
    accessResolution.status,
    interfaceMode,
    marketingPopupsList,
    isScreensaverActive,
    activeMarketingPopup,
  ]);

  // Auto-expand Showcase & attempt fullscreen whenever returning to the app in kiosk mode
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && interfaceMode === 'kiosk') {
        setViewMode('carlos-expanded');
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [interfaceMode]);

  // Inactivity detection: trigger screensaver when idle (strictly in authorized kiosk mode)
  useEffect(() => {
    if (
      accessResolution.status !== 'authorized' ||
      interfaceMode !== 'kiosk' ||
      !screensaverSettings.isEnabled ||
      screensaverSettings.idleTimeoutSeconds <= 0
    ) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (!isScreensaverActive) {
        timeoutId = setTimeout(() => {
          setIsScreensaverActive(true);
        }, screensaverSettings.idleTimeoutSeconds * 1000);
      }
    };

    const activityEvents = ['pointerdown', 'touchstart', 'mousemove', 'keydown', 'scroll'];
    activityEvents.forEach((ev) => {
      window.addEventListener(ev, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, resetTimer);
      });
    };
  }, [
    accessResolution.status,
    interfaceMode,
    screensaverSettings.isEnabled,
    screensaverSettings.idleTimeoutSeconds,
    isScreensaverActive,
  ]);

  // Apply dark class & system-wide color theme CSS variables to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyCabinThemeToDocument(cabinTheme, isDark);
  }, [isDark, cabinTheme]);

  // Monitor orientation for tablet landscape guidance
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSelectCabinTheme = async (theme: CabinThemeMode) => {
    setCabinTheme(theme);
    await cloudSync.saveSystemSetting('cabin_theme', { mode: theme });
  };

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    await cloudSync.saveSystemSetting('kiosk_language', { language: lang });
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % INITIAL_PLAYLIST_TRACKS.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? INITIAL_PLAYLIST_TRACKS.length - 1 : prev - 1
    );
  };

  const handleSubmitSongRequest = async (
    req: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>
  ) => {
    const newRequest: SongRequest = {
      ...req,
      id: `sr-${Date.now()}`,
      requestedAt: Date.now(),
      status: 'pending',
      driverId: driverProfile.id,
    };
    setSongRequests((prev) => [newRequest, ...prev]);
    await cloudSync.submitPassengerRequest({
      ...newRequest,
      sentAt: newRequest.requestedAt,
      text: `Song Request: "${newRequest.title}" by ${newRequest.artist}${newRequest.note ? ` (${newRequest.note})` : ''}`,
    });
  };

  const handleSendMessage = async (
    msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>
  ) => {
    const newMsg: CabinMessage = {
      ...msg,
      id: `cm-${Date.now()}`,
      sentAt: Date.now(),
      status: 'sent',
      driverId: driverProfile.id,
    };
    setCabinMessages((prev) => [newMsg, ...prev]);
    await cloudSync.submitPassengerRequest(newMsg);
  };

  const handleUpdateSongStatus = async (id: string, status: SongRequest['status']) => {
    setSongRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    await cloudSync.updateRequestStatus(id, status);
  };

  const handleUpdateMessageStatus = async (
    id: string,
    status: CabinMessage['status']
  ) => {
    setCabinMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    await cloudSync.updateRequestStatus(id, status);
  };

  const handleClearCompleted = () => {
    setSongRequests((prev) => prev.filter((s) => s.status === 'pending'));
    setCabinMessages((prev) => prev.filter((m) => m.status === 'sent'));
  };

  const handleClearAllRequests = async () => {
    setSongRequests([]);
    setCabinMessages([]);
    await cloudSync.clearAllPassengerRequests();
  };

  // Exiting Admin automatically expands Showcase, returns to Kiosk, and requests Fullscreen Mode;
  // On Sign Out, also automatically clears passenger requests for the next passenger.
  const handleReturnToKiosk = async (clearRequests: boolean) => {
    if (clearRequests) {
      await handleClearAllRequests();
    }
    setInterfaceMode('kiosk');
    setViewMode('carlos-expanded');
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      }
    } catch (e) {}
  };

  const pendingRequestsCount =
    songRequests.filter((s) => s.status === 'pending').length +
    cabinMessages.filter((m) => m.status === 'sent').length;

  // External gallery trigger from App Drawer
  const [isGalleryExternalOpen, setIsGalleryExternalOpen] = useState<boolean>(false);

  const activeThemeCfg = CABIN_THEMES[cabinTheme] || CABIN_THEMES.royal_purple;
  const t = KIOSK_TRANSLATIONS[language] || KIOSK_TRANSLATIONS.en;

  // Default Public Portal & Employee Enrollment Gate (Blocks unauthorized access to Kiosk & Admin)
  if (accessResolution.status !== 'authorized' || interfaceMode === 'portal') {
    return (
      <>
        <PublicAccessPortal
          isDark={isDark}
          onToggleDark={handleToggleTheme}
          firebaseUser={firebaseUser}
          accessResolution={accessResolution}
          onRefreshAccess={() => refreshPortalAccess(auth.currentUser)}
          onLaunchKiosk={async () => {
            setInterfaceMode('kiosk');
            setViewMode('carlos-expanded');
            try {
              if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen?.();
              }
            } catch (e) {}
          }}
          onOpenAdmin={() => setIsAdminPinModalOpen(true)}
        />
        <AdminPinModal
          isOpen={isAdminPinModalOpen}
          onClose={() => setIsAdminPinModalOpen(false)}
          onSuccess={(matchedDriver) => {
            if (matchedDriver) {
              setDriverProfile(matchedDriver);
            }
            setIsAdminPinModalOpen(false);
            setInterfaceMode('admin');
          }}
          savedPin={
            accessResolution.status === 'authorized'
              ? accessResolution.account.assignedPin || adminPin
              : adminPin
          }
          drivers={driversList}
          activeDriverId={driverProfile.id}
        />
      </>
    );
  }

  // If in Remote Web Administration Dashboard Mode (requires authorized user + PIN)
  if (interfaceMode === 'admin') {
    return (
      <AdminDashboard
        currentDriver={driverProfile}
        onSelectDriver={(newDriver) => setDriverProfile(newDriver)}
        onBackToKiosk={() => handleReturnToKiosk(false)}
        onSignOut={() => handleReturnToKiosk(true)}
        onLockToPublicPortal={() => setInterfaceMode('portal')}
        firebaseUser={firebaseUser}
        isMasterOwner={accessResolution.status === 'authorized' && accessResolution.isOwner}
        isAdminAccount={accessResolution.status === 'authorized' && accessResolution.isAdminRole}
        songRequests={songRequests}
        onUpdateSongStatus={handleUpdateSongStatus}
        cabinMessages={cabinMessages}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onClearCompletedRequests={handleClearCompleted}
        onClearAllRequests={handleClearAllRequests}
        screensaverSettings={screensaverSettings}
        onUpdateScreensaverSettings={setScreensaverSettings}
        onTriggerScreensaverNow={() => setIsScreensaverActive(true)}
        albums={galleryAlbums}
        onUpdateAlbums={setGalleryAlbums}
        photos={galleryPhotos}
        onUpdatePhotos={setGalleryPhotos}
        installedApps={installedApps}
        onUpdateInstalledApps={setInstalledApps}
        quickConnects={quickConnects}
        onUpdateQuickConnects={setQuickConnects}
        driversList={driversList}
        onUpdateDriversList={setDriversList}
        adminPin={adminPin}
        onUpdateAdminPin={setAdminPin}
        cabinTheme={cabinTheme}
        onUpdateCabinTheme={handleSelectCabinTheme}
        isDark={isDark}
        onToggleDark={handleToggleTheme}
        onSetDarkMode={setIsDark}
        onRestoreSongRequests={setSongRequests}
        onRestoreCabinMessages={setCabinMessages}
        passengerLanguage={language}
        onUpdatePassengerLanguage={handleSelectLanguage}
        onPreviewMarketingPopup={(popup) => {
          // Keep admin inside Admin Console; queue this pop-up exclusively for Passenger Kiosk views
          setMarketingPopupsList((prev) => {
            const exists = prev.some((item) => item.id === popup.id);
            return exists ? prev.map((item) => (item.id === popup.id ? popup : item)) : [popup, ...prev];
          });
        }}
        onBroadcastAnnouncement={async (text) => {
          const broadcastId = `bc-${Date.now()}`;
          lastHandledBroadcastIdRef.current = broadcastId;
          setBroadcastAnnouncement(text);
          setIsReplyingToBroadcast(false);
          setBroadcastReplyText('');
          setBroadcastReplySent(false);
          await cloudSync.saveSystemSetting('live_broadcast', {
            id: broadcastId,
            text,
            sentAt: Date.now(),
          });
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen lg:h-screen relative flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden lg:overflow-hidden cabin-shell bg-gradient-to-br ${
        isDark ? activeThemeCfg.bgGradient : activeThemeCfg.lightBgGradient
      } ${easyView ? 'easy-view-mode' : ''}`}
    >
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Faded Ambient Event / Holiday Background Watermark (hidden in Easy View for cleaner contrast) */}
      {!easyView && activeThemeCfg.fadedPattern === 'notre_dame' && (
        <div
          className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none flex items-center justify-center ${
            isDark ? 'opacity-[0.07] text-amber-300' : 'opacity-[0.06] text-[#0c2340]'
          }`}
        >
          <div className="grid grid-cols-3 gap-24 rotate-[-12deg] scale-125 text-amber-300 text-8xl font-black">
            <span>☘️</span>
            <span className="tracking-tighter">ND</span>
            <span>☘️</span>
            <span className="tracking-tighter">IRISH</span>
            <span>🏈</span>
            <span className="tracking-tighter">GOLD</span>
          </div>
        </div>
      )}
      {!easyView && activeThemeCfg.fadedPattern === 'holiday_snow' && (
        <div
          className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none flex items-center justify-center ${
            isDark ? 'opacity-[0.08] text-amber-200' : 'opacity-[0.06] text-rose-500'
          }`}
        >
          <div className="grid grid-cols-4 gap-20 text-amber-200 text-7xl">
            <span>❄️</span>
            <span>✨</span>
            <span>🎉</span>
            <span>❄️</span>
            <span>🥂</span>
            <span>❄️</span>
            <span>✨</span>
            <span>🎁</span>
          </div>
        </div>
      )}

      {/* Executive Header Bar */}
      <HeaderBar
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        pendingRequestsCount={pendingRequestsCount}
        onOpenDriverQueue={() => {
          setDriverModalInitialTab('queue');
          setIsDriverQueueOpen(true);
        }}
        onOpenWifiModal={() => setIsWifiModalOpen(true)}
        onOpenPassengerRequests={() => setIsPassengerRequestModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAdminDashboard={() => setIsAdminPinModalOpen(true)}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        onOpenTranslateModal={() => setIsTranslateModalOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        onOpenDriverChat={() => {
          setIsChatDismissed(false);
          setIsChatOpen(true);
        }}
        isChatDismissed={isChatDismissed}
        language={language}
        cabinTheme={cabinTheme}
        onSelectCabinTheme={handleSelectCabinTheme}
        cloudSyncState={cloudSyncState}
        easyView={easyView}
        onToggleEasyView={() => setEasyView((prev) => !prev)}
      />

      {/* Double-Size Broadcast Announcement Banner pushed from Remote Admin */}
      {broadcastAnnouncement && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-fuchsia-700 text-white px-4 sm:px-6 py-4 sm:py-5 shadow-2xl z-30 shrink-0 border-b-2 border-amber-400/60 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                <Megaphone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.broadcastLabel}</span>
                </div>
                <p className="text-base sm:text-xl font-black leading-snug break-words">{broadcastAnnouncement}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {broadcastReplySent ? (
                <span className="px-3.5 py-2 rounded-2xl bg-emerald-500/25 border border-emerald-300/50 text-emerald-100 text-xs sm:text-sm font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {language === 'es'
                      ? 'Respuesta enviada'
                      : language === 'fr'
                      ? 'Réponse envoyée'
                      : language === 'de'
                      ? 'Antwort gesendet'
                      : 'Reply Sent'}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setIsReplyingToBroadcast((prev) => !prev);
                  }}
                  className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {language === 'es'
                      ? 'Responder'
                      : language === 'fr'
                      ? 'Répondre'
                      : language === 'de'
                      ? 'Antworten'
                      : 'Reply'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  setBroadcastAnnouncement(null);
                  setIsReplyingToBroadcast(false);
                  setBroadcastReplyText('');
                  setBroadcastReplySent(false);
                }}
                className="p-2.5 rounded-2xl bg-black/30 hover:bg-black/50 text-white cursor-pointer shrink-0 border border-white/20"
                title="Dismiss announcement"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {isReplyingToBroadcast && !broadcastReplySent && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const trimmed = broadcastReplyText.trim();
                if (!trimmed) return;
                playCabinChime('acknowledged');
                const snippet =
                  broadcastAnnouncement.length > 48
                    ? `${broadcastAnnouncement.slice(0, 48)}...`
                    : broadcastAnnouncement;
                await handleSendMessage({
                  type: 'custom',
                  text: `Reply to broadcast ("${snippet}"): ${trimmed}`,
                  category: 'other',
                });
                setBroadcastReplyText('');
                setIsReplyingToBroadcast(false);
                setBroadcastReplySent(true);
              }}
              className="mt-3 pt-3 border-t border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <button
                type="button"
                onClick={async () => {
                  playCabinChime('acknowledged');
                  const snippet =
                    broadcastAnnouncement.length > 48
                      ? `${broadcastAnnouncement.slice(0, 48)}...`
                      : broadcastAnnouncement;
                  await handleSendMessage({
                    type: 'custom',
                    text: `Reply to broadcast ("${snippet}"): Got it, thank you!`,
                    category: 'other',
                  });
                  setBroadcastReplyText('');
                  setIsReplyingToBroadcast(false);
                  setBroadcastReplySent(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
              >
                {language === 'es'
                  ? '👍 ¡Entendido, gracias!'
                  : language === 'fr'
                  ? '👍 Bien reçu, merci !'
                  : language === 'de'
                  ? '👍 Verstanden, danke!'
                  : '👍 Got it, thank you!'}
              </button>

              <input
                type="text"
                value={broadcastReplyText}
                onChange={(e) => setBroadcastReplyText(e.target.value)}
                placeholder={
                  language === 'es'
                    ? 'Escribe tu respuesta al conductor...'
                    : language === 'fr'
                    ? 'Écrivez votre réponse au chauffeur...'
                    : language === 'de'
                    ? 'Antwort an den Fahrer schreiben...'
                    : 'Type a quick reply to your driver...'
                }
                autoFocus
                className="flex-1 px-4 py-2 rounded-xl bg-black/35 border border-white/30 text-white placeholder:text-white/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <button
                type="submit"
                disabled={!broadcastReplyText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.send}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Portrait helper alert if tablet is held vertically */}
      {isPortrait && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm shrink-0 z-20">
          <ScreenShare className="w-4 h-4 animate-bounce" />
          <span>For best experience on your 10-inch Android Tablet, please turn horizontal to Landscape mode</span>
        </div>
      )}

      {/* Main Kiosk Content Area - Responsive across Phones, Tablets, Laptops & TVs */}
      <main className="flex-1 p-2 sm:p-3 md:p-4 lg:overflow-hidden relative z-10 min-h-0">
        <div className="h-auto lg:h-full max-w-[2400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          {/* Left Side: Passenger Experience & Apps */}
          <div
            className={`min-h-[540px] sm:min-h-[600px] lg:min-h-0 lg:h-full flex flex-col transition-all duration-300 ${
              viewMode === 'carlos-expanded'
                ? 'lg:col-span-5'
                : 'lg:col-span-6'
            }`}
          >
            <LeftAppsHub
              tracks={INITIAL_PLAYLIST_TRACKS}
              currentTrackIndex={currentTrackIndex}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextTrack={handleNextTrack}
              onPrevTrack={handlePrevTrack}
              songRequests={songRequests}
              onSubmitSongRequest={handleSubmitSongRequest}
              messages={cabinMessages}
              onSendMessage={handleSendMessage}
              onOpenGallery={() => setIsGalleryExternalOpen(true)}
              installedApps={installedApps}
              activeDriverName={driverProfile.name}
              activeDriverId={driverProfile.id}
              onSubmitFeedback={(fb) => cloudSync.submitPassengerFeedback(fb)}
              language={language}
              easyView={easyView}
            />
          </div>

          {/* Right Side: Driver Showcase & Quick Connect */}
          <div
            className={`min-h-[540px] sm:min-h-[600px] lg:min-h-0 lg:h-full flex flex-col transition-all duration-300 ${
              viewMode === 'carlos-expanded'
                ? 'lg:col-span-7'
                : 'lg:col-span-6'
            }`}
          >
            <RightDriverHub
              profile={driverProfile}
              drivers={driversList}
              onSelectDriver={(driverId) => {
                const selected = driversList.find((d) => d.id === driverId);
                if (selected) setDriverProfile(selected);
              }}
              albums={galleryAlbums}
              photos={galleryPhotos}
              quickConnects={quickConnects}
              externalGalleryOpen={isGalleryExternalOpen}
              onCloseExternalGallery={() => setIsGalleryExternalOpen(false)}
              language={language}
              easyView={easyView}
              onRequestStop={(dest) =>
                handleSendMessage({
                  type: 'custom',
                  text: `Passenger requested route stop at: "${dest}"`,
                })
              }
            />
          </div>
        </div>
      </main>

      {/* Bottom-Left Draggable Startup Chat Bubble */}
      <DraggableChatBubble
        driver={driverProfile}
        messages={cabinMessages}
        onSendMessage={handleSendMessage}
        language={language}
        isDismissed={isChatDismissed}
        onDismiss={() => {
          setIsChatDismissed(true);
          setIsChatOpen(false);
        }}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      {/* Driver Queue & Quick Settings Modal */}
      <DriverQueueModal
        isOpen={isDriverQueueOpen}
        onClose={() => setIsDriverQueueOpen(false)}
        songRequests={songRequests}
        onUpdateSongStatus={handleUpdateSongStatus}
        cabinMessages={cabinMessages}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onClearCompleted={handleClearCompleted}
        screensaverSettings={screensaverSettings}
        onUpdateScreensaverSettings={setScreensaverSettings}
        onTriggerScreensaverNow={() => setIsScreensaverActive(true)}
        albums={galleryAlbums}
        onUpdateAlbums={setGalleryAlbums}
        photos={galleryPhotos}
        onUpdatePhotos={setGalleryPhotos}
        installedApps={installedApps}
        onUpdateInstalledApps={setInstalledApps}
        profile={driverProfile}
        onUpdateProfile={setDriverProfile}
        initialTab={driverModalInitialTab}
      />

      {/* Dedicated Wi-Fi Connection Modal */}
      <WifiModal
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
      />

      {/* Unified Passenger Cabin Requests & Driver Chat Modal */}
      <PassengerRequestModal
        isOpen={isPassengerRequestModalOpen}
        onClose={() => setIsPassengerRequestModalOpen(false)}
        onSendMessage={handleSendMessage}
        messages={cabinMessages}
        driverName={driverProfile.name}
        driverAvatarUrl={driverProfile.avatarUrl}
        language={language}
      />

      {/* Android Tablet App & APK Installation Guide Modal */}
      <TabletInstallModal
        isOpen={isTabletInstallOpen}
        onClose={() => setIsTabletInstallOpen(false)}
      />

      {/* Interactive Live Weather & 7-Day Forecast Modal */}
      <WeatherAppModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        onSendMessage={handleSendMessage}
      />

      {/* Google Translate & System Language Switcher Modal */}
      <GoogleTranslateModal
        isOpen={isTranslateModalOpen}
        onClose={() => setIsTranslateModalOpen(false)}
        currentLanguage={language}
        onSelectLanguage={(lang) => handleSelectLanguage(lang)}
        onSendCabinMessage={(text) =>
          handleSendMessage({
            type: 'custom',
            text,
            category: 'other',
          })
        }
      />

      {/* Top-Bar Request Feature / Passenger Feedback Pop-up Modal */}
      <PassengerFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        driverId={driverProfile.id}
        driverName={driverProfile.name}
        onSubmitFeedback={(fb) => {
          cloudSync.submitPassengerFeedback(fb);
        }}
      />

      {/* Holiday / Event Marketing Pop-Up Modal (Passenger Kiosk Only) */}
      <MarketingPopupModal
        popup={activeMarketingPopup}
        isOpen={Boolean(activeMarketingPopup) && interfaceMode === 'kiosk'}
        onClose={() => {
          if (activeMarketingPopup) {
            lastPopupShownAtRef.current[activeMarketingPopup.id] = Date.now();
            if (activeMarketingPopup.lastTriggeredAt) {
              handledManualTriggerAtRef.current[activeMarketingPopup.id] =
                activeMarketingPopup.lastTriggeredAt;
            }
          }
          setActiveMarketingPopup(null);
        }}
        onActionClick={(url) => {
          if (url === 'internal:requests') {
            setIsPassengerRequestModalOpen(true);
          } else if (url === 'internal:feedback') {
            setIsFeedbackModalOpen(true);
          } else if (url === 'internal:explore') {
            setIsPromoExploreOpen(true);
          } else if (url && /^https?:\/\//i.test(url)) {
            openExternalUrl(url);
          }
        }}
      />

      {/* Explore Nearby Modal triggered from Marketing Pop-Up CTA */}
      <ExploreNearbyModal
        isOpen={isPromoExploreOpen}
        onClose={() => setIsPromoExploreOpen(false)}
        driverName={driverProfile.name}
        onRequestStop={(dest) => {
          handleSendMessage({
            type: 'custom',
            text: `Passenger requested route stop at: "${dest}"`,
          });
        }}
      />

      {/* Full-Screen Inactivity Advertising Screensaver */}
      <Screensaver
        isActive={isScreensaverActive}
        settings={screensaverSettings}
        onDismiss={() => setIsScreensaverActive(false)}
        onOpenAdminSettings={() => {
          setIsScreensaverActive(false);
          setDriverModalInitialTab('screensaver');
          setIsDriverQueueOpen(true);
        }}
        websiteUrl={driverProfile.website}
        phoneNumber={driverProfile.phone}
      />

      {/* 4-Digit Security PIN Modal for Remote Admin Dashboard */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={(matchedDriver) => {
          if (matchedDriver) {
            setDriverProfile(matchedDriver);
          }
          setIsAdminPinModalOpen(false);
          setInterfaceMode('admin');
        }}
        savedPin={adminPin}
        drivers={driversList}
        activeDriverId={driverProfile.id}
      />
    </div>
  );
}

