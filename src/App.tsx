import React, { useState, useEffect } from 'react';
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
} from './types/kiosk';
import { ScreenShare, RotateCcw, Sparkles, X } from 'lucide-react';

export default function App() {
  // Theme state: defaults to dark for luxury vehicle cabin aesthetic
  const [isDark, setIsDark] = useState<boolean>(true);

  // Layout mode: defaults to carlos-expanded so Carlos's pictures and info have extra prominence
  const [viewMode, setViewMode] = useState<'balanced' | 'carlos-expanded' | 'carlos-full'>('carlos-expanded');

  // Tablet orientation check
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  // Interface Mode: Passenger Kiosk vs Remote Web Administration Dashboard
  const [interfaceMode, setInterfaceMode] = useState<'kiosk' | 'admin'>('kiosk');

  // Broadcast announcement banner from Admin to Kiosk tablets
  const [broadcastAnnouncement, setBroadcastAnnouncement] = useState<string | null>(null);

  // Driver Profile with persistent storage (avatar icon, bio, vehicle, stats)
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

  // 4-Digit Security PIN for Administrator Portal (Default: 1229)
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem('silvermyst_admin_pin_v1') || '1229';
    } catch (e) {
      return '1229';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('silvermyst_admin_pin_v1', adminPin);
    } catch (e) {}
  }, [adminPin]);

  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);

  // Quick Connect & Tap-to-Scan Dock Items (Linktree, Venmo, Cash App, Instagram, etc.)
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

  // Multiple Driver Profiles list (Carlos, Manyell, and additional custom drivers)
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

  // Cloud Synchronization Listeners
  useEffect(() => {
    const unsubRequests = cloudSync.subscribeToRequests((cloudReqs) => {
      if (cloudReqs && cloudReqs.length > 0) {
        const songs: SongRequest[] = [];
        const msgs: CabinMessage[] = [];
        cloudReqs.forEach((item: any) => {
          if (item.title && item.artist) {
            songs.push(item as SongRequest);
          } else if (item.text) {
            msgs.push(item as CabinMessage);
          }
        });
        if (songs.length > 0) setSongRequests(songs);
        if (msgs.length > 0) setCabinMessages(msgs);
      }
    });

    const unsubDrivers = cloudSync.subscribeToDrivers((cloudDrivers) => {
      if (cloudDrivers && cloudDrivers.length > 0) {
        const found = cloudDrivers.find((d) => d.id === driverProfile.id);
        if (found) setDriverProfile(found);
      }
    });

    const unsubApps = cloudSync.subscribeToApps((cloudApps) => {
      if (cloudApps && cloudApps.length > 0) {
        setInstalledApps(cloudApps);
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
      appVersion: 'v3.2.0-kiosk',
      resolution: `${window.innerWidth} × ${window.innerHeight}`,
      isLocked: true,
    });

    return () => {
      unsubRequests();
      unsubDrivers();
      unsubApps();
    };
  }, [driverProfile.id]);

  // Gallery Albums with persistent storage (Categories, hidden flags)
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

  // Gallery Photos with persistent storage (Uploaded pictures, custom albums)
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

  // Music state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Driver / Passenger communication queues
  const [songRequests, setSongRequests] = useState<SongRequest[]>([
    {
      id: 'sr-demo-1',
      title: 'Midnight City',
      artist: 'M83',
      genre: 'Synthwave / Chill',
      note: 'Love this track for night highway drives!',
      requestedAt: Date.now() - 1000 * 60 * 12,
      status: 'accepted',
    },
  ]);

  const [cabinMessages, setCabinMessages] = useState<CabinMessage[]>([
    {
      id: 'cm-demo-1',
      type: 'comfort',
      text: 'Request: Passenger requested A/C cooler ❄️',
      sentAt: Date.now() - 1000 * 60 * 5,
      status: 'acknowledged',
    },
  ]);

  // Installed Apps & Games Launcher with persistent storage
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

  // Inactivity detection: trigger screensaver when idle
  useEffect(() => {
    if (!screensaverSettings.isEnabled || screensaverSettings.idleTimeoutSeconds <= 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Only set timer if screensaver is not already active
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
  }, [screensaverSettings.isEnabled, screensaverSettings.idleTimeoutSeconds, isScreensaverActive]);

  // Apply dark class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
      id: newRequest.id,
      type: 'custom',
      text: `Song Request: "${newRequest.title}" by ${newRequest.artist}${newRequest.note ? ` (${newRequest.note})` : ''}`,
      driverId: driverProfile.id,
    } as any);
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

  const handleUpdateSongStatus = (id: string, status: SongRequest['status']) => {
    setSongRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleUpdateMessageStatus = (
    id: string,
    status: CabinMessage['status']
  ) => {
    setCabinMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleClearCompleted = () => {
    setSongRequests((prev) => prev.filter((s) => s.status === 'pending'));
    setCabinMessages((prev) => prev.filter((m) => m.status === 'sent'));
  };

  const pendingRequestsCount =
    songRequests.filter((s) => s.status === 'pending').length +
    cabinMessages.filter((m) => m.status === 'sent').length;

  // External gallery trigger from App Drawer
  const [isGalleryExternalOpen, setIsGalleryExternalOpen] = useState<boolean>(false);

  // If in Remote Web Administration Dashboard Mode
  if (interfaceMode === 'admin') {
    return (
      <AdminDashboard
        currentDriver={driverProfile}
        onSelectDriver={(newDriver) => setDriverProfile(newDriver)}
        onBackToKiosk={() => setInterfaceMode('kiosk')}
        onSignOut={() => setInterfaceMode('kiosk')}
        songRequests={songRequests}
        onUpdateSongStatus={handleUpdateSongStatus}
        cabinMessages={cabinMessages}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onClearCompletedRequests={handleClearCompleted}
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
        onBroadcastAnnouncement={(text) => {
          setBroadcastAnnouncement(text);
          setTimeout(() => setBroadcastAnnouncement(null), 14000);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-sky-500 selection:text-white overflow-hidden">
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
        onOpenAdminDashboard={() => setInterfaceMode('admin')}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
      />

      {/* Broadcast Announcement Banner pushed from Remote Admin */}
      {broadcastAnnouncement && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-5 py-2.5 text-xs sm:text-sm font-extrabold flex items-center justify-between shadow-lg z-30 shrink-0 border-b border-purple-400/40 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{broadcastAnnouncement}</span>
          </div>
          <button
            onClick={() => setBroadcastAnnouncement(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Portrait helper alert if tablet is held vertically */}
      {isPortrait && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm shrink-0">
          <ScreenShare className="w-4 h-4 animate-bounce" />
          <span>For best experience on your 10-inch Android Tablet, please turn horizontal to Landscape mode</span>
        </div>
      )}

      {/* Main Kiosk Content Area: Horizontal Split Screen with Expanded Carlos Showcase */}
      <main className="flex-1 p-3 md:p-4 overflow-hidden">
        <div className="h-[calc(100vh-5rem)] max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          {/* Left Side: Passenger Experience & Apps (Music, Song Requests, Messages, City Guide, Trivia, Wi-Fi) */}
          <div
            className={`h-full min-h-0 flex flex-col transition-all duration-300 ${
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
            />
          </div>

          {/* Right Side: Driver Carlos & Silver Mist Multiservices Hub (Picture, Expanded Gallery, About Me, Foods, Services, Bottom Apps Dock) */}
          <div
            className={`h-full min-h-0 flex flex-col transition-all duration-300 ${
              viewMode === 'carlos-expanded'
                ? 'lg:col-span-7'
                : 'lg:col-span-6'
            }`}
          >
            <RightDriverHub
              profile={driverProfile}
              albums={galleryAlbums}
              photos={galleryPhotos}
              externalGalleryOpen={isGalleryExternalOpen}
              onCloseExternalGallery={() => setIsGalleryExternalOpen(false)}
            />
          </div>
        </div>
      </main>

      {/* Driver Queue & Admin Screensaver Modal for Carlos */}
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

      {/* 1-Tap Passenger Cabin Requests Modal (Volume up/down, too cold/hot, custom notes) */}
      <PassengerRequestModal
        isOpen={isPassengerRequestModalOpen}
        onClose={() => setIsPassengerRequestModalOpen(false)}
        onSendMessage={handleSendMessage}
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
    </div>
  );
}
