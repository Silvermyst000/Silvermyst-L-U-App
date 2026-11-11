import React, { useState, useRef } from 'react';
import {
  SongRequest,
  CabinMessage,
  ScreensaverSettings,
  GalleryAlbum,
  GalleryItem,
  DriverProfile,
  InstalledAppItem,
} from '../types/kiosk';
import {
  X,
  Check,
  Music,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Tv,
  Image as ImageIcon,
  Play,
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Upload,
  User,
  Folder,
  Tablet,
  Download,
  ExternalLink,
  Copy,
  RotateCcw,
  Camera,
  ShieldCheck,
  Sliders,
  Layers,
  Gamepad2,
  ArrowUpRight,
} from 'lucide-react';
import { INITIAL_INSTALLED_APPS } from '../data/mockData';
import { playCabinChime } from '../utils/cabinAudio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { QRCodeView } from '../utils/qrCode';
import { launchTabletApp } from '../utils/appLauncher';

interface DriverQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Queues
  songRequests: SongRequest[];
  onUpdateSongStatus: (id: string, status: SongRequest['status']) => void;
  cabinMessages: CabinMessage[];
  onUpdateMessageStatus: (id: string, status: CabinMessage['status']) => void;
  onClearCompleted: () => void;
  // Screensaver
  screensaverSettings: ScreensaverSettings;
  onUpdateScreensaverSettings: (settings: ScreensaverSettings) => void;
  onTriggerScreensaverNow: () => void;
  // Galleries & Albums
  albums: GalleryAlbum[];
  onUpdateAlbums: (albums: GalleryAlbum[]) => void;
  photos: GalleryItem[];
  onUpdatePhotos: (photos: GalleryItem[]) => void;
  // Installed Apps & Games Launcher
  installedApps: InstalledAppItem[];
  onUpdateInstalledApps: (apps: InstalledAppItem[]) => void;
  // Driver Profile & Avatar
  profile: DriverProfile;
  onUpdateProfile: (profile: DriverProfile) => void;
  // Initial tab
  initialTab?: 'queue' | 'apps' | 'galleries' | 'screensaver' | 'profile' | 'install';
}

export const DriverQueueModal: React.FC<DriverQueueModalProps> = ({
  isOpen,
  onClose,
  songRequests,
  onUpdateSongStatus,
  cabinMessages,
  onUpdateMessageStatus,
  onClearCompleted,
  screensaverSettings,
  onUpdateScreensaverSettings,
  onTriggerScreensaverNow,
  albums,
  onUpdateAlbums,
  photos,
  onUpdatePhotos,
  installedApps = INITIAL_INSTALLED_APPS,
  onUpdateInstalledApps,
  profile,
  onUpdateProfile,
  initialTab = 'queue',
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'apps' | 'galleries' | 'screensaver' | 'profile' | 'install'>(initialTab);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Gallery admin states
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);

  // New Album Form
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState<'advertising' | 'travel' | 'custom'>('custom');
  const [newAlbumHidden, setNewAlbumHidden] = useState(false);

  // New Photo Form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoSubtitle, setPhotoSubtitle] = useState('');
  const [photoTag, setPhotoTag] = useState('Personal');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoAlbumId, setPhotoAlbumId] = useState(albums[0]?.id || 'travel-photography');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(profile.name);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(profile.avatarUrl);
  const [profileCompany, setProfileCompany] = useState(profile.companyName);
  const [profileTagline, setProfileTagline] = useState(profile.tagline);
  const [profilePhone, setProfilePhone] = useState(profile.phone);
  const [profileWebsite, setProfileWebsite] = useState(profile.website);
  const [profileBio, setProfileBio] = useState(profile.bio);

  // App & Game Launcher Administration States
  const POPULAR_APP_PRESETS = [
    { name: 'Roblox', packageName: 'com.roblox.client', deepLink: 'roblox://', category: 'games' as const, badge: 'Popular 3D', accentColor: '#ef4444', desc: 'Infinite immersive multiplayer virtual worlds and user-created games' },
    { name: 'Minecraft', packageName: 'com.mojang.minecraftpe', deepLink: 'minecraft://', category: 'games' as const, badge: 'Adventure', accentColor: '#10b981', desc: 'Endless creativity, building, and survival exploration' },
    { name: 'PUBG Mobile', packageName: 'com.tencent.ig', deepLink: 'market://details?id=com.tencent.ig', category: 'games' as const, badge: 'Battle Royale', accentColor: '#f97316', desc: 'Tactical multiplayer battle royale combat on tablet' },
    { name: 'Brawl Stars', packageName: 'com.supercell.brawlstars', deepLink: 'market://details?id=com.supercell.brawlstars', category: 'games' as const, badge: 'Fast 3v3', accentColor: '#eab308', desc: 'Fast-paced real-time 3v3 team battles and special events' },
    { name: 'Among Us', packageName: 'com.innersloth.spacemafia', deepLink: 'market://details?id=com.innersloth.spacemafia', category: 'games' as const, badge: 'Social Fun', accentColor: '#3b82f6', desc: 'Uncover the impostor on board before the spaceship is sabotaged' },
    { name: 'Call of Duty: Mobile', packageName: 'com.activision.callofduty.shooter', deepLink: 'market://details?id=com.activision.callofduty.shooter', category: 'games' as const, badge: 'FPS Action', accentColor: '#6366f1', desc: 'Console-quality HD multiplayer shooter action' },
    { name: 'Temple Run 2', packageName: 'com.imangi.templerun2', deepLink: 'market://details?id=com.imangi.templerun2', category: 'games' as const, badge: 'Arcade Runner', accentColor: '#84cc16', desc: 'Dodge obstacles, slide, and leap across dangerous cliffs' },
    { name: 'Disney+', packageName: 'com.disney.disneyplus', deepLink: 'disneyplus://', category: 'entertainment' as const, badge: 'Streaming', accentColor: '#0ea5e9', desc: 'Stream Disney, Pixar, Marvel, Star Wars & National Geographic' },
    { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', deepLink: 'snssdk1233://', category: 'entertainment' as const, badge: 'Viral Video', accentColor: '#ec4899', desc: 'Watch trending videos, entertainment clips, and creators' },
  ];

  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [appFilterCategory, setAppFilterCategory] = useState<string>('all');
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<InstalledAppItem['category']>('games');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppDeepLink, setNewAppDeepLink] = useState('');
  const [newAppWeb, setNewAppWeb] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppBadge, setNewAppBadge] = useState('Installed Game');
  const [newAppHidden, setNewAppHidden] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install hook for administrator install
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleToggleAppHidden = (appId: string) => {
    playCabinChime('tap');
    const updated = installedApps.map((a) => {
      if (a.id === appId) {
        const nextHidden = !a.isHiddenFromPassengers;
        showToast(nextHidden ? `"${a.name}" is now HIDDEN from passengers` : `"${a.name}" is now VISIBLE to passengers`);
        return { ...a, isHiddenFromPassengers: nextHidden };
      }
      return a;
    });
    onUpdateInstalledApps(updated);
  };

  const handleDeleteApp = (appId: string) => {
    playCabinChime('tap');
    const appToDelete = installedApps.find((a) => a.id === appId);
    if (!appToDelete) return;
    const updated = installedApps.filter((a) => a.id !== appId);
    onUpdateInstalledApps(updated);
    showToast(`Removed "${appToDelete.name}" from tablet launcher.`);
  };

  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPackage.trim()) {
      showToast('Please provide an App Name and Android Package Name.');
      return;
    }
    playCabinChime('acknowledged');
    const newApp: InstalledAppItem = {
      id: `app-custom-${Date.now()}`,
      name: newAppName.trim(),
      category: newAppCategory,
      packageName: newAppPackage.trim(),
      deepLinkUrl: newAppDeepLink.trim() || `market://details?id=${newAppPackage.trim()}`,
      webFallbackUrl: newAppWeb.trim() || `https://play.google.com/store/apps/details?id=${newAppPackage.trim()}`,
      iconType: newAppCategory === 'games' ? 'games' : newAppCategory === 'entertainment' ? 'netflix' : 'custom',
      accentColor: newAppCategory === 'games' ? '#f97316' : '#3b82f6',
      description: newAppDesc.trim() || 'Custom tablet app installed for passenger entertainment.',
      badge: newAppBadge.trim() || (newAppCategory === 'games' ? 'Tablet Game' : 'Installed App'),
      isHiddenFromPassengers: newAppHidden,
      isCustom: true,
    };
    onUpdateInstalledApps([...installedApps, newApp]);
    setIsAddAppOpen(false);
    setNewAppName('');
    setNewAppPackage('');
    setNewAppDeepLink('');
    setNewAppWeb('');
    setNewAppDesc('');
    showToast(`Added "${newApp.name}" to tablet launcher!`);
  };

  const handleSelectPreset = (preset: typeof POPULAR_APP_PRESETS[0]) => {
    setNewAppName(preset.name);
    setNewAppPackage(preset.packageName);
    setNewAppDeepLink(preset.deepLink);
    setNewAppWeb(`https://play.google.com/store/apps/details?id=${preset.packageName}`);
    setNewAppCategory(preset.category);
    setNewAppBadge(preset.badge);
    setNewAppDesc(preset.desc);
  };

  const handleResetAppsToDefault = () => {
    playCabinChime('tap');
    onUpdateInstalledApps(INITIAL_INSTALLED_APPS);
    showToast('Reset all launcher apps to factory defaults.');
  };

  const handleAdminTestLaunch = (app: InstalledAppItem) => {
    launchTabletApp(app, {
      onNotifyLaunch: (appName, msg) => {
        showToast(msg);
      },
    });
  };

  const pendingSongs = songRequests.filter((s) => s.status === 'pending');
  const pendingMessages = cabinMessages.filter((m) => m.status === 'sent');
  const totalPending = pendingSongs.length + pendingMessages.length;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://silvermyst.com';

  // --- Queue Handlers ---
  const handleAcknowledgeMessage = (id: string) => {
    playCabinChime('acknowledged');
    onUpdateMessageStatus(id, 'acknowledged');
  };

  const handleSetSongPlaying = (id: string) => {
    playCabinChime('acknowledged');
    onUpdateSongStatus(id, 'playing');
  };

  // --- Screensaver Handlers ---
  const handleTogglePhoto = (id: string) => {
    playCabinChime('tap');
    const current = screensaverSettings.selectedPhotoIds;
    let updated: string[];
    if (current.includes(id)) {
      if (current.length === 1) {
        showToast('Please keep at least 1 picture selected for the screensaver.');
        return;
      }
      updated = current.filter((item) => item !== id);
    } else {
      updated = [...current, id];
    }
    onUpdateScreensaverSettings({ ...screensaverSettings, selectedPhotoIds: updated });
  };

  const handleSelectAllPhotos = () => {
    playCabinChime('tap');
    const allIds = photos.map((p) => p.id);
    onUpdateScreensaverSettings({ ...screensaverSettings, selectedPhotoIds: allIds });
  };

  // --- Album Handlers ---
  const handleToggleAlbumVisibility = (albumId: string) => {
    playCabinChime('tap');
    const updated = albums.map((alb) => {
      if (alb.id === albumId) {
        const nextState = !alb.isHiddenFromPassengers;
        showToast(
          nextState
            ? `Album "${alb.title}" is now HIDDEN from passengers (Admin Only).`
            : `Album "${alb.title}" is now VISIBLE to passengers.`
        );
        return { ...alb, isHiddenFromPassengers: nextState };
      }
      return alb;
    });
    onUpdateAlbums(updated);
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    playCabinChime('acknowledged');

    const id = `custom-${Date.now()}`;
    const newAlbum: GalleryAlbum = {
      id,
      title: newAlbumTitle.trim(),
      description: newAlbumDesc.trim() || 'Custom photo collection',
      category: newAlbumCategory,
      isHiddenFromPassengers: newAlbumHidden,
      createdAt: Date.now(),
    };

    onUpdateAlbums([...albums, newAlbum]);
    setNewAlbumTitle('');
    setNewAlbumDesc('');
    setIsCreateAlbumOpen(false);
    showToast(`Created gallery "${newAlbum.title}"!`);
  };

  const handleDeleteAlbum = (albumId: string) => {
    playCabinChime('tap');
    const alb = albums.find((a) => a.id === albumId);
    if (!alb) return;
    if (alb.id === 'advertising-promo' || alb.id === 'travel-photography') {
      showToast('Core system albums cannot be deleted, but you can hide them anytime.');
      return;
    }
    const filteredAlbums = albums.filter((a) => a.id !== albumId);
    // Reassign photos to travel
    const reassignedPhotos = photos.map((p) =>
      p.albumId === albumId ? { ...p, albumId: 'travel-photography' } : p
    );
    onUpdateAlbums(filteredAlbums);
    onUpdatePhotos(reassignedPhotos);
    showToast(`Deleted album "${alb.title}".`);
  };

  // --- Photo Upload Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoUrlInput(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = photoPreview || photoUrlInput.trim();
    if (!finalUrl || !photoTitle.trim()) {
      showToast('Please provide a photo image and a title.');
      return;
    }
    playCabinChime('acknowledged');

    const newPhoto: GalleryItem = {
      id: `photo-${Date.now()}`,
      title: photoTitle.trim(),
      subtitle: photoSubtitle.trim() || 'Uploaded Photo',
      tag: photoTag.trim() || 'Gallery',
      description: photoDesc.trim() || 'Added by Carlos',
      imageUrl: finalUrl,
      albumId: photoAlbumId,
      createdAt: Date.now(),
    };

    onUpdatePhotos([newPhoto, ...photos]);
    setPhotoTitle('');
    setPhotoSubtitle('');
    setPhotoDesc('');
    setPhotoUrlInput('');
    setPhotoPreview(null);
    setIsUploadPhotoOpen(false);
    showToast(`Added photo "${newPhoto.title}"!`);
  };

  const handleDeletePhoto = (photoId: string) => {
    playCabinChime('tap');
    const updated = photos.filter((p) => p.id !== photoId);
    onUpdatePhotos(updated);
    showToast('Photo removed.');
  };

  const handleSetPhotoAsAvatar = (imageUrl: string) => {
    playCabinChime('acknowledged');
    const updatedProfile = { ...profile, avatarUrl: imageUrl };
    onUpdateProfile(updatedProfile);
    setProfileAvatarUrl(imageUrl);
    showToast('Updated your profile picture icon!');
  };

  // --- Avatar Direct Upload ---
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfileAvatarUrl(result);
      const updatedProfile = { ...profile, avatarUrl: result };
      onUpdateProfile(updatedProfile);
      playCabinChime('acknowledged');
      showToast('Updated your profile icon successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    playCabinChime('acknowledged');
    const updated: DriverProfile = {
      ...profile,
      name: profileName.trim() || profile.name,
      avatarUrl: profileAvatarUrl.trim() || profile.avatarUrl,
      companyName: profileCompany.trim() || profile.companyName,
      tagline: profileTagline.trim() || profile.tagline,
      phone: profilePhone.trim() || profile.phone,
      website: profileWebsite.trim() || profile.website,
      bio: profileBio.trim() || profile.bio,
    };
    onUpdateProfile(updated);
    showToast('Saved profile changes!');
  };

  const handleResetAvatar = () => {
    playCabinChime('tap');
    const defaultAvatar = '/src/assets/images/driver_carlos_portrait_1794247172029.jpg';
    setProfileAvatarUrl(defaultAvatar);
    onUpdateProfile({ ...profile, avatarUrl: defaultAvatar });
    showToast('Restored default portrait.');
  };

  // Filtered photos for gallery admin view
  const displayPhotos = selectedAlbumId === 'all'
    ? photos
    : photos.filter((p) => p.albumId === selectedAlbumId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 font-display">
                Silvermyst Multiservices
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Administrator Console
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display">
              Carlos Driver Operations & Settings
            </h3>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (6 Tabs) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shrink-0 text-xs font-bold">
          {/* Tab 1: Requests */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('queue');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'queue'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Requests</span>
            {totalPending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {totalPending}
              </span>
            )}
          </button>

          {/* Tab 2: Apps & Games Launcher */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('apps');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'apps'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4 shrink-0 text-indigo-500" />
            <span className="truncate">Apps & Games</span>
          </button>

          {/* Tab 3: Galleries & Albums */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('galleries');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'galleries'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="truncate">Galleries</span>
          </button>

          {/* Tab 4: Screensaver */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('screensaver');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'screensaver'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4 shrink-0 text-sky-500" />
            <span className="truncate">Screensaver</span>
          </button>

          {/* Tab 5: Profile & Avatar */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('profile');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-purple-500" />
            <span className="truncate">Profile Icon</span>
          </button>

          {/* Tab 6: Tablet App / APK */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('install');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="truncate">Tablet App</span>
          </button>
        </div>

        {/* Toast Alert */}
        {saveToast && (
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 text-xs font-semibold animate-fadeIn shrink-0 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: PASSENGER REQUESTS QUEUE */}
        {/* ============================================================== */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  playCabinChime('tap');
                  onClearCompleted();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer bg-slate-100 dark:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Completed Requests</span>
              </button>
            </div>

            {/* Comfort Messages */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-500" />
                Cabin Comfort & Messages ({cabinMessages.length})
              </span>
              {cabinMessages.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No active passenger requests.
                </div>
              ) : (
                <div className="space-y-2">
                  {cabinMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {msg.text}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.status === 'sent' ? (
                        <button
                          onClick={() => handleAcknowledgeMessage(msg.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-xs"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Song Requests */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-sky-500" />
                Music Requests ({songRequests.length})
              </span>
              {songRequests.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No song requests queued yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {songRequests.map((song) => (
                    <div
                      key={song.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {song.title} — {song.artist}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Genre: {song.genre} {song.note && `• "${song.note}"`}
                        </p>
                      </div>
                      {song.status === 'pending' ? (
                        <button
                          onClick={() => handleSetSongPlaying(song.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-xs"
                        >
                          Play Next
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-sky-500 flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" /> Playing
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: APPS & GAMES LAUNCHER MANAGER (ADMINISTRATION) */}
        {/* ============================================================== */}
        {activeTab === 'apps' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            {/* Header / Intro */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Control Tablet Apps & Downloaded Games
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage apps and games shown on the cabin launcher. You can hide any app or add games you download from Google Play.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAppsToDefault}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Reset all launcher apps to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  onClick={() => setIsAddAppOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Game / App</span>
                </button>
              </div>
            </div>

            {/* Add App Form / Preset Picker */}
            {isAddAppOpen && (
              <form onSubmit={handleAddAppSubmit} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-indigo-500/50 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-indigo-500" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-500 font-display">
                      Add Downloaded Game or Android App
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAppOpen(false)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    1-Tap Popular Tablet Games & Apps Presets:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {POPULAR_APP_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      App or Game Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Subway Surfers, Netflix, Roblox"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newAppCategory}
                      onChange={(e) => setNewAppCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="games">Games & Gaming</option>
                      <option value="music">Music & Audio</option>
                      <option value="google">Google & Web</option>
                      <option value="entertainment">Video & Entertainment</option>
                      <option value="utilities">Cabin Utilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Android Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. com.spotify.music or com.kiloo.subwaysurf"
                      value={newAppPackage}
                      onChange={(e) => setNewAppPackage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Popular Game, Installed, Top Hit"
                      value={newAppBadge}
                      onChange={(e) => setNewAppBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deep Link Intent URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. spotify: or market://details?id=..."
                      value={newAppDeepLink}
                      onChange={(e) => setNewAppDeepLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Web Fallback URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                      value={newAppWeb}
                      onChange={(e) => setNewAppWeb(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description displayed on the tablet tile..."
                    value={newAppDesc}
                    onChange={(e) => setNewAppDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={newAppHidden}
                      onChange={(e) => setNewAppHidden(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Hide from passengers initially (Only visible in Administrator Console)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAppOpen(false)}
                      className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs cursor-pointer shadow-sm"
                    >
                      Add to Tablet Launcher
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
              <button
                onClick={() => setAppFilterCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  appFilterCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Apps ({installedApps.length})
              </button>

              <button
                onClick={() => setAppFilterCategory('games')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  appFilterCategory === 'games'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Games ({installedApps.filter((a) => a.category === 'games').length})
              </button>

              <button
                onClick={() => setAppFilterCategory('music')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  appFilterCategory === 'music'
                    ? 'bg-[#1db954] text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Music ({installedApps.filter((a) => a.category === 'music').length})
              </button>

              <button
                onClick={() => setAppFilterCategory('google')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  appFilterCategory === 'google'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Google Apps ({installedApps.filter((a) => a.category === 'google').length})
              </button>

              <button
                onClick={() => setAppFilterCategory('entertainment')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  appFilterCategory === 'entertainment'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Video ({installedApps.filter((a) => a.category === 'entertainment').length})
              </button>
            </div>

            {/* Apps List */}
            <div className="space-y-2.5">
              {installedApps
                .filter((app) => appFilterCategory === 'all' || app.category === appFilterCategory)
                .map((app) => (
                  <div
                    key={app.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      app.isHiddenFromPassengers
                        ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-70'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: app.accentColor || '#4f46e5' }}
                      >
                        {app.iconType === 'spotify' ? (
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-950">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
                          </svg>
                        ) : app.category === 'games' ? (
                          <Gamepad2 className="w-5 h-5 text-white" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 dark:text-white truncate">
                            {app.name}
                          </h5>
                          {app.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {app.badge}
                            </span>
                          )}
                          {app.isHiddenFromPassengers ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Hidden from Passengers
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Visible in Cabin
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          Package: {app.packageName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Test Launch Button */}
                      <button
                        onClick={() => handleAdminTestLaunch(app)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Test launch this app on the tablet"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Test Launch</span>
                      </button>

                      {/* Hide/Show Toggle */}
                      <button
                        onClick={() => handleToggleAppHidden(app.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                          app.isHiddenFromPassengers
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        }`}
                        title={app.isHiddenFromPassengers ? 'Show this app to passengers' : 'Hide this app from passengers'}
                      >
                        {app.isHiddenFromPassengers ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visible</span>
                          </>
                        )}
                      </button>

                      {/* Delete Custom App */}
                      {app.isCustom && (
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete custom app"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GALLERIES & ALBUMS MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'galleries' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Separate & Control Your Photo Albums
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hidden albums are strictly private for you; visible albums are shown to passengers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateAlbumOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Album</span>
                </button>

                <button
                  onClick={() => setIsUploadPhotoOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Create New Album Modal/Card */}
            {isCreateAlbumOpen && (
              <form onSubmit={handleCreateAlbum} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-sky-400/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-sky-500 font-display">
                    Create New Photo Gallery / Album
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsCreateAlbumOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Album Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP Events, Travel 2026, Client Rides"
                      value={newAlbumTitle}
                      onChange={(e) => setNewAlbumTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newAlbumCategory}
                      onChange={(e) => setNewAlbumCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="travel">Traveling Photography</option>
                      <option value="advertising">Advertising & Promo</option>
                      <option value="custom">Custom Experience</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Album Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short summary of this gallery..."
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newAlbumHidden}
                      onChange={(e) => setNewAlbumHidden(e.target.checked)}
                      className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Hide this album from passengers (Admin Only)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Save Album
                  </button>
                </div>
              </form>
            )}

            {/* Upload Photo Drawer/Card */}
            {isUploadPhotoOpen && (
              <form onSubmit={handleAddPhotoSubmit} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-sky-400/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-sky-500 font-display">
                    Upload & Add Photo to Gallery
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadPhotoOpen(false);
                      setPhotoPreview(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Choose Photo from Device / Tablet *
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500 file:text-slate-950 hover:file:bg-sky-400 cursor-pointer"
                    />
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Select any photo from your Android tablet gallery or camera.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Or Paste Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrlInput}
                      onChange={(e) => {
                        setPhotoUrlInput(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {photoPreview && (
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl">
                    <img src={photoPreview} alt="Preview" className="w-16 h-12 rounded-lg object-cover" />
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Image ready
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunset Over Ocean"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tag / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scenic Travel, VIP Ride"
                      value={photoTag}
                      onChange={(e) => setPhotoTag(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Album *
                    </label>
                    <select
                      value={photoAlbumId}
                      onChange={(e) => setPhotoAlbumId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>
                          {alb.title} {alb.isHiddenFromPassengers ? '(Hidden)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    Add Photo to Album
                  </button>
                </div>
              </form>
            )}

            {/* Albums List Cards with Visibility Controls */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                Configured Albums ({albums.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {albums.map((alb) => {
                  const count = photos.filter((p) => p.albumId === alb.id).length;
                  return (
                    <div
                      key={alb.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        alb.isHiddenFromPassengers
                          ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/60'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {alb.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {alb.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                          {count} photos
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        {/* Visibility status */}
                        <button
                          type="button"
                          onClick={() => handleToggleAlbumVisibility(alb.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            alb.isHiddenFromPassengers
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                          }`}
                          title="Click to toggle passenger visibility"
                        >
                          {alb.isHiddenFromPassengers ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden (Admin)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible to Clients</span>
                            </>
                          )}
                        </button>

                        {/* Filter to this album */}
                        <button
                          type="button"
                          onClick={() => setSelectedAlbumId(alb.id)}
                          className="text-[10.5px] font-bold text-sky-500 hover:underline cursor-pointer"
                        >
                          View Photos &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Pills for Photos in Admin View */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  Photos in Selected View ({displayPhotos.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAlbumId('all')}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAlbumId === 'all'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    All ({photos.length})
                  </button>
                  {albums.map((alb) => (
                    <button
                      key={alb.id}
                      onClick={() => setSelectedAlbumId(alb.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                        selectedAlbumId === alb.id
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {alb.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {displayPhotos.map((photo) => {
                  const album = albums.find((a) => a.id === photo.albumId);
                  const isCurrentAvatar = profile.avatarUrl === photo.imageUrl;
                  return (
                    <div
                      key={photo.id}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 group"
                    >
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">
                          {photo.tag}
                        </span>
                        {isCurrentAvatar && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 shadow-sm">
                            Avatar ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {photo.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Album: {album?.title || photo.albumId}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetPhotoAsAvatar(photo.imageUrl)}
                          className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                          title="Set this photo as your profile icon"
                        >
                          <User className="w-3 h-3" />
                          <span>Set Avatar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SCREENSAVER SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'screensaver' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  In-Cabin Inactivity Advertising Screensaver
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Activates automatically when the tablet is not in use. Shows only the pictures you select below.
                </p>
              </div>

              <button
                onClick={() => {
                  playCabinChime('acknowledged');
                  onClose();
                  onTriggerScreensaverNow();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs tracking-tight shadow-md cursor-pointer shrink-0"
              >
                Start Screensaver Now 🚀
              </button>
            </div>

            {/* Timing Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Inactivity Timeout
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={screensaverSettings.idleTimeoutSeconds}
                    onChange={(e) => {
                      const sec = parseInt(e.target.value);
                      onUpdateScreensaverSettings({
                        ...screensaverSettings,
                        idleTimeoutSeconds: sec,
                        isEnabled: sec > 0,
                      });
                      playCabinChime('tap');
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="15">15 seconds (Testing)</option>
                    <option value="30">30 seconds</option>
                    <option value="45">45 seconds (Recommended)</option>
                    <option value="60">1 minute</option>
                    <option value="120">2 minutes</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Slide Switch Duration
                </span>
                <select
                  value={screensaverSettings.slideDurationSeconds}
                  onChange={(e) => {
                    const sec = parseInt(e.target.value);
                    onUpdateScreensaverSettings({
                      ...screensaverSettings,
                      slideDurationSeconds: sec,
                    });
                    playCabinChime('tap');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="5">5 seconds per picture</option>
                  <option value="8">8 seconds (Recommended)</option>
                  <option value="12">12 seconds</option>
                  <option value="15">15 seconds</option>
                </select>
              </div>
            </div>

            {/* Select Photos to Include */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Pictures for Screensaver ({screensaverSettings.selectedPhotoIds.length} active)
                </span>
                <button
                  onClick={handleSelectAllPhotos}
                  className="text-xs font-bold text-sky-500 hover:underline cursor-pointer"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {photos.map((item) => {
                  const isSelected = screensaverSettings.selectedPhotoIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTogglePhoto(item.id)}
                      className={`p-2 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                        {item.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PROFILE & AVATAR ICON SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfileChanges} className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            {/* Live Profile Visual Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 font-display">
                Live Driver Card Preview (As Seen by Passengers)
              </span>

              <div className="flex items-center gap-4">
                {/* Big Portrait */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-sky-400 shrink-0 shadow-lg relative">
                  <img src={profileAvatarUrl} alt={profileName} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-tl-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* The little tiny icon Carlos asked for */}
                    <div className="flex items-center gap-2">
                      <img
                        src={profileAvatarUrl}
                        alt="Tiny Avatar"
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-sky-400 shrink-0"
                      />
                      <h4 className="text-lg font-extrabold text-white font-display truncate">
                        {profileName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/40">
                      Verified Host
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">{profileCompany}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profileTagline}</p>
                </div>
              </div>
            </div>

            {/* Profile Avatar Upload / Selection Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sky-500" />
                    Change Profile Icon & Picture
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload your picture directly from your tablet, or choose from your gallery photos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* File picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Upload from Tablet / Phone Camera *
                  </label>
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500 file:text-slate-950 hover:file:bg-sky-400 cursor-pointer"
                  />
                </div>

                {/* URL input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="text"
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Quick Pick from Carlos's existing Photos */}
              <div className="pt-2">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Or Tap Any Photo from Your Albums to Set as Avatar:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {photos.slice(0, 8).map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleSetPhotoAsAvatar(p.imageUrl)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        profileAvatarUrl === p.imageUrl
                          ? 'border-sky-500 scale-105 shadow-md'
                          : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                      title={`Use "${p.title}" as avatar`}
                    >
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Details Form */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                Driver & Business Details
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline & Services
                </label>
                <input
                  type="text"
                  value={profileTagline}
                  onChange={(e) => setProfileTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={profileWebsite}
                    onChange={(e) => setProfileWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  About Me / Bio
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* TAB 5: INSTALL TABLET APP / APK (ADMINISTRATOR ONLY) */}
        {/* ============================================================== */}
        {activeTab === 'install' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Tablet className="w-5 h-5 text-sky-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Administrator App Installation & APK Generation
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This installation control is strictly placed here in the Administrator panel so passengers cannot trigger or modify it.
              </p>
            </div>

            {/* Method 1: WebAPK */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border border-sky-400/40 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
                    1. Instant 1-Tap Android WebAPK Installation
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Creates a real native Android app with the Silvermyst star icon in your tablet app drawer.
                  </p>
                </div>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      playCabinChime('tap');
                      const ok = await install();
                      if (ok) playCabinChime('acknowledged');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs cursor-pointer shadow-md shrink-0"
                  >
                    Install WebAPK Now
                  </button>
                )}
              </div>

              {isInstalled && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Already installed as a standalone tablet application!</span>
                </div>
              )}
            </div>

            {/* Scan URL with Tablet Camera */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0">
                <QRCodeView value={currentUrl} size={110} className="border-0 p-0 shadow-none" />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h5 className="text-xs sm:text-sm font-bold font-display">
                  Scan to Open on 10-Inch Tablet
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Point your Android tablet's camera at this QR code to load the kiosk immediately on your vehicle screen.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono truncate"
                  />
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      navigator.clipboard?.writeText(currentUrl);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Download Standalone .APK File (PWABuilder) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  2. Download Standalone Signed .APK File (PWABuilder)
                </h5>
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Build .APK File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                PWABuilder packages your Silvermyst manifest, service worker, and icons directly into a signed <code>.apk</code> package that can be sideloaded onto your Android tablet via USB or file manager.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            Close Admin Console
          </button>
        </div>
      </div>
    </div>
  );
};
