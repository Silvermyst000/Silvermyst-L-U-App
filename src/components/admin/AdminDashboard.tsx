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
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { cloudSync } from '../../services/cloudSync';
import { INITIAL_DRIVERS_LIST, INITIAL_INSTALLED_APPS, INITIAL_QUICK_CONNECT_ITEMS } from '../../data/mockData';
import { QRCodeView } from '../../utils/qrCode';
import { HeaderBar } from '../HeaderBar';
import { LeftAppsHub } from '../LeftAppsHub';
import { RightDriverHub } from '../RightDriverHub';

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
  adminPin = '1229',
  onUpdateAdminPin,
  onBroadcastAnnouncement,
}) => {
  // Navigation tabs
  type NavTab =
    | 'overview'
    | 'requests'
    | 'apps'
    | 'quick_connect'
    | 'galleries'
    | 'drivers'
    | 'sandbox'
    | 'screensaver'
    | 'tablets'
    | 'inquiries'
    | 'team_chat'
    | 'security';

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-driver registry
  const [drivers, setDrivers] = useState<DriverProfile[]>(driversList);
  const [activeDriverId, setActiveDriverId] = useState<string>(currentDriver.id);

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

  // PIN Management State
  const [currentPinInput, setCurrentPinInput] = useState(adminPin);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Sandbox Live View Driver Selection
  const [sandboxDriverId, setSandboxDriverId] = useState<string>(currentDriver.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const driverAvatarInputRef = useRef<HTMLInputElement>(null);

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

    return () => {
      unsubDrivers();
      unsubTablets();
      unsubInquiries();
      unsubMsgs();
    };
  }, []);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingRequestsTotal =
    songRequests.filter((s) => s.status === 'pending').length +
    cabinMessages.filter((m) => m.status === 'sent').length;

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  // Sound chime when new request arrives
  useEffect(() => {
    if (pendingRequestsTotal > 0 && soundAlerts) {
      playCabinChime('comfort');
    }
  }, [pendingRequestsTotal, soundAlerts]);

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

  // Add New Driver
  const handleCreateDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) {
      showToast('Please provide a driver name.');
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
    };

    const updated = [...drivers, newProf];
    setDrivers(updated);
    onUpdateDriversList?.(updated);
    await cloudSync.saveDriverProfile(newProf);
    setIsAddDriverModalOpen(false);
    setNewDriverName('');
    setNewDriverBio('');
    showToast(`Added ${newProf.name} to driver fleet!`);
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

  // Change 4-digit PIN
  const handleUpdatePinSubmit = (e: React.FormEvent) => {
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
    onUpdateAdminPin?.(newPinInput);
    setCurrentPinInput(newPinInput);
    setNewPinInput('');
    setConfirmPinInput('');
    showToast(`Admin PIN updated successfully to: ${newPinInput}`);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-purple-400/40 animate-fade-in text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-18 px-4 sm:px-8 border-b border-purple-900/30 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              playCabinChime('tap');
              onBackToKiosk();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 hover:text-white transition-all text-xs font-bold cursor-pointer shadow-xs"
            title="Return to Passenger Kiosk Screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Passenger Kiosk</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Silvermyst Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  4-PIN Secured
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Remote Fleet Administration & Content Management
              </p>
            </div>
          </div>
        </div>

        {/* Profile Switcher, Sound & Sign Out */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Active Profile:</span>
            <select
              value={activeDriverId}
              onChange={(e) => handleSwitchActiveDriver(e.target.value)}
              className="bg-transparent font-bold text-purple-300 focus:outline-hidden cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name} ({d.role === 'owner' ? 'Founder' : 'Chauffeur'})
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setSoundAlerts(!soundAlerts);
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              soundAlerts
                ? 'bg-purple-950/60 border-purple-800/50 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundAlerts ? 'Sound Chimes Enabled' : 'Sound Muted'}
          >
            {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Sign Out / Lock Admin Button */}
          {onSignOut && (
            <button
              onClick={() => {
                playCabinChime('tap');
                onSignOut();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-white transition-all text-xs font-bold cursor-pointer shadow-xs"
              title="Sign out of Administration and lock with 4-digit PIN"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Layout: Sidebar Navigation + Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 border-r border-slate-800/80 bg-slate-900/60 p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto">
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
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            {
              id: 'requests',
              label: 'Passenger Requests',
              icon: MessageSquare,
              badge: pendingRequestsTotal > 0 ? pendingRequestsTotal : undefined,
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            { id: 'apps', label: 'App & Button Manager', icon: Gamepad2 },
            { id: 'quick_connect', label: 'Quick Connect & Pay', icon: QrCode },
            { id: 'galleries', label: 'Galleries & Albums', icon: Folder },
            { id: 'drivers', label: 'Driver Profiles', icon: Users },
            { id: 'sandbox', label: 'Sandbox Tablet View', icon: Tablet },
            { id: 'screensaver', label: 'Screensaver Media', icon: Tv },
            {
              id: 'inquiries',
              label: 'Service Inquiries',
              icon: Briefcase,
              badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
              badgeColor: 'bg-indigo-500 text-white',
            },
            { id: 'tablets', label: 'Tablet Kiosks (Fleet)', icon: Tablet },
            { id: 'team_chat', label: 'Team Communication', icon: Send },
            { id: 'security', label: 'PIN & Security', icon: KeyRound },
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
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
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
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Welcome back, {activeDriver.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Silvermyst Multiservices in-cabin passenger fleet is operating normally.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playCabinChime('acknowledged');
                      onTriggerScreensaverNow();
                      showToast('Screensaver launched on tablet!');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Launch Screensaver</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Tablet className="w-4 h-4" />
                    <span>Open Sandbox Simulator</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Active Drivers</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{drivers.length} Profiles</div>
                  <div className="text-[11px] text-purple-300 mt-1">
                    Carlos, Manyell + Customizable
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Passenger Requests</span>
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{pendingRequestsTotal} Pending</div>
                  <div className="text-[11px] text-amber-300 mt-1">
                    {pendingRequestsTotal === 0 ? 'All requests completed' : 'Immediate attention needed'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Photo Galleries</span>
                    <Folder className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{albums.length} Albums</div>
                  <div className="text-[11px] text-amber-300 mt-1">
                    {photos.length} total organized pictures
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Quick Connects</span>
                    <QrCode className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{quickConnectList.length} Portals</div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    {quickConnectList.filter((q) => q.isVisible).length} visible to passengers
                  </div>
                </div>
              </div>

              {/* Push Announcement Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-extrabold text-white">Push Passenger Announcement</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Broadcast an in-cabin message banner directly to all passenger 10-inch tablets in real-time.
                </p>
                <form onSubmit={handlePushAnnouncement} className="flex gap-2">
                  <input
                    type="text"
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder="e.g. Welcome aboard! Chilled spring water and phone chargers are right behind the front seats."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-purple-800/50 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 cursor-pointer shrink-0"
                  >
                    Broadcast to Tablets
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: PHOTO GALLERIES & ALBUMS (CREATE, DELETE, ORGANIZE) */}
          {activeTab === 'galleries' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-400" />
                    <span>Photo Galleries & Album Organizer</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Create customized photo albums, delete albums, reorder them, and organize in-cabin photos.
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
                    <span>Add Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setIsCreateAlbumModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-extrabold hover:brightness-110 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Album</span>
                  </button>
                </div>
              </div>

              {/* Albums Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Active Albums ({albums.length})
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
                      All Albums
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
                              {album.isHiddenFromPassengers ? 'Show' : 'Hide'}
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
                    Photos in {selectedAlbumId === 'all' ? 'All Albums' : albums.find((a) => a.id === selectedAlbumId)?.title}
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
                    <span>Driver Profiles & Fleet Roster</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add unlimited driver profiles, delete or organize drivers, and control active kiosk assignments.
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCabinChime('tap');
                    setIsAddDriverModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Additional Driver</span>
                </button>
              </div>

              <div className="space-y-3">
                {drivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={driver.avatarUrl}
                          alt={driver.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/60 shadow-md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-white">{driver.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300">
                              {driver.role}
                            </span>
                            {driver.id === activeDriverId && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Active on Kiosk
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-purple-300 font-semibold">{driver.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
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
                          Edit Profile
                        </button>

                        <button
                          onClick={() => handleSwitchActiveDriver(driver.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                            driver.id === activeDriverId
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {driver.id === activeDriverId ? 'Active' : 'Set as Active'}
                        </button>

                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          disabled={drivers.length <= 1}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
                          title="Delete driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-slate-400">Bio: </span>
                      {driver.bio}
                    </p>
                  </div>
                ))}
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
                          <label className="block text-slate-400 font-bold mb-1">Role</label>
                          <select
                            value={newDriverRole}
                            onChange={(e) => setNewDriverRole(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                          >
                            <option value="driver">Driver / Chauffeur</option>
                            <option value="admin">Administrator</option>
                            <option value="owner">Owner</option>
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
                        <label className="block text-slate-400 font-bold mb-1">Avatar / Photo URL</label>
                        <input
                          type="text"
                          value={newDriverAvatar}
                          onChange={(e) => setNewDriverAvatar(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
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
            </div>
          )}

          {/* TAB: QUICK CONNECT & TAP-TO-SCAN MANAGER */}
          {activeTab === 'quick_connect' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span>Quick Connect & Tap-to-Scan Manager</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add custom payment options, social links, and scannable QR cards displayed in the passenger dock.
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Quick Connect</span>
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
                      <span>Live Kiosk Sandbox Environment</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      1280 × 800 Samsung Galaxy Tab Simulator
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Switch between driver profiles to verify how all buttons, photos, and QR codes will look to passengers before publishing.
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
                      Launch Fullscreen on This Screen →
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
                      />
                    </div>
                    <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
                      <RightDriverHub
                        profile={sandboxDriver}
                        drivers={drivers}
                        albums={albums}
                        photos={photos}
                        quickConnects={quickConnectList}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PIN & SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-400" />
                  <span>Admin Portal Security & 4-PIN Access</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Protect the administration dashboard from unauthorized passenger access on the in-cabin tablet.
                </p>
              </div>

              {/* Current PIN Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Current Active PIN</div>
                    <div className="text-3xl font-black text-purple-400 font-mono tracking-widest mt-1">
                      {currentPinInput}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Active & Enforced
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  This 4-digit PIN is required whenever the "Admin Portal" button is clicked on the passenger screen.
                </p>
              </div>

              {/* Change PIN Form */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-white">Change Security PIN</h3>
                <form onSubmit={handleUpdatePinSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1229"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-lg tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Confirm New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1229"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-lg tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs tracking-tight hover:brightness-110 cursor-pointer shadow-md"
                  >
                    Save & Update Security PIN
                  </button>
                </form>
              </div>

              {/* Sign Out CTA */}
              {onSignOut && (
                <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/40 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-extrabold text-white">Finished with Administration?</div>
                    <div className="text-xs text-rose-300">
                      Sign out now to lock the portal and return to the passenger kiosk.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      onSignOut();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs cursor-pointer shadow-sm shrink-0"
                  >
                    Lock & Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: PASSENGER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <span>Real-Time Passenger Requests</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live stream of passenger song requests and comfort adjustments from the 10-inch kiosk.
                  </p>
                </div>
                {pendingRequestsTotal > 0 && (
                  <button
                    onClick={onClearCompletedRequests}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Clear Resolved
                  </button>
                )}
              </div>

              {/* Cabin Messages Section */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <span>Cabin Comfort & Assistance</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300">
                    {cabinMessages.length} total
                  </span>
                </h3>

                {cabinMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">No cabin requests yet.</div>
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
                                {msg.status === 'sent' ? 'New Request' : 'Acknowledged'}
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
                                <span>Acknowledge</span>
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Handled</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Reply Presets */}
                        {msg.status === 'sent' && (
                          <div className="mt-3 pt-3 border-t border-purple-900/40 flex flex-wrap gap-1.5 text-xs">
                            <span className="text-slate-400 text-[11px] self-center mr-1">Quick Reply:</span>
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
                  <span>In-Cabin Jukebox Song Requests</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300">
                    {songRequests.length} total
                  </span>
                </h3>

                {songRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">No song requests queued.</div>
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
                              Accept & Queue
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
                              Mark Played
                            </button>
                          )}
                          {song.status === 'completed' && (
                            <span className="text-xs text-slate-500 font-bold">Played</span>
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
                    <span>Tablet App & Button Manager</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add unlimited buttons, edit existing apps, reorder launcher layout, and control passenger visibility.
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
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                  <button
                    onClick={() => {
                      playCabinChime('tap');
                      setIsAddButtonModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Button</span>
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
                              <span>Show</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide</span>
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
                    <span>Inactivity Screensaver & Advertising</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Controls the full-screen photo slideshow shown on tablets when passenger touch activity stops.
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCabinChime('acknowledged');
                    onTriggerScreensaverNow();
                    showToast('Screensaver launched on tablet!');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Preview Screensaver</span>
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
                  <span>Passenger Tablet Kiosks & Fleet</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Monitor and remotely control Samsung 10-inch Android 7.1 tablets installed in passenger cabins.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tablets.map((tab) => {
                  const assignedDriver = drivers.find((d) => d.id === tab.assignedDriverId);
                  return (
                    <div
                      key={tab.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-extrabold text-base text-white">{tab.name}</div>
                          <div className="text-xs text-slate-400">{tab.vehicleModel}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Target Resolution:</span>
                          <span className="text-white font-bold">{tab.resolution}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Assigned Driver:</span>
                          <span className="text-purple-300 font-bold">{assignedDriver?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Kiosk Software:</span>
                          <span className="text-white font-mono">{tab.appVersion}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                          onClick={() => {
                            playCabinChime('acknowledged');
                            onTriggerScreensaverNow();
                            showToast(`Screensaver triggered on ${tab.name}!`);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Tv className="w-4 h-4" />
                          <span>Trigger Screensaver</span>
                        </button>

                        <button
                          onClick={() => {
                            playCabinChime('tap');
                            showToast(`Refreshed telemetry for ${tab.name}`);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Ping Tablet</span>
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
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                  <span>Passenger Multiservice Inquiries</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track direct passenger booking requests and IT/web/notary service leads submitted from the kiosk.
                </p>
              </div>

              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
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
                        <span className="font-extrabold text-sm text-white">{inq.serviceTitle}</span>
                      </div>
                      <div className="text-xs text-purple-300 font-bold">
                        Client: {inq.passengerName || 'Passenger'} • Contact: {inq.phoneOrContact}
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
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
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white cursor-pointer"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved / Booked</option>
                      </select>

                      <a
                        href={`tel:${inq.phoneOrContact}`}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
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
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  <span>Internal Driver & Admin Communication</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time coordination channel between Carlos R. and Manyell M.
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
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  playCabinChime('tap');
                  const res = await cloudSync.sendAdminMessage({
                    senderId: activeDriver.id,
                    senderName: activeDriver.name,
                    senderRole: activeDriver.role,
                    text: chatInput.trim(),
                  });
                  if (res.success) {
                    setTeamMessages((prev) => [
                      ...prev,
                      {
                        id: res.id || `msg-${Date.now()}`,
                        senderId: activeDriver.id,
                        senderName: activeDriver.name,
                        senderRole: activeDriver.role,
                        text: chatInput.trim(),
                        sentAt: Date.now(),
                        readBy: [activeDriver.id],
                      },
                    ]);
                    setChatInput('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message team as ${activeDriver.name}...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
