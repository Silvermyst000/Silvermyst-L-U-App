import React, { useState, useEffect } from 'react';
import {
  Tablet,
  Sliders,
  Send,
  Sparkles,
  CheckCircle2,
  Tv,
  RefreshCw,
  Bell,
  Eye,
  EyeOff,
  Users,
  ShieldCheck,
  Music,
  Gamepad2,
  Compass,
  Heart,
  QrCode,
  Radio,
  Clock,
  Zap,
} from 'lucide-react';
import {
  DriverProfile,
  TabletDevice,
  InstalledAppItem,
  QuickConnectItem,
  ScreensaverSettings,
  SongRequest,
  CabinMessage,
  SupportedLanguage,
} from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminExperienceControllerProps {
  drivers: DriverProfile[];
  activeDriverId: string;
  onSelectDriver: (driverId: string) => void;
  tablets: TabletDevice[];
  installedApps: InstalledAppItem[];
  onUpdateInstalledApps: (apps: InstalledAppItem[]) => void;
  quickConnects: QuickConnectItem[];
  onUpdateQuickConnects: (items: QuickConnectItem[]) => void;
  screensaverSettings: ScreensaverSettings;
  onUpdateScreensaverSettings: (settings: ScreensaverSettings) => void;
  onBroadcastAnnouncement: (text: string) => void;
  songRequests: SongRequest[];
  cabinMessages: CabinMessage[];
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

export const AdminExperienceController: React.FC<AdminExperienceControllerProps> = ({
  drivers,
  activeDriverId,
  onSelectDriver,
  tablets,
  installedApps,
  onUpdateInstalledApps,
  quickConnects,
  onUpdateQuickConnects,
  screensaverSettings,
  onUpdateScreensaverSettings,
  onBroadcastAnnouncement,
  songRequests,
  cabinMessages,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [selectedTabletId, setSelectedTabletId] = useState<string>('all');
  const [quickAnnouncement, setQuickAnnouncement] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastAppliedTime, setLastAppliedTime] = useState<string>('Just now');
  const [syncConfirmed, setSyncConfirmed] = useState<boolean>(true);

  // Quick Preset Announcements
  const announcementTemplates = [
    'Welcome aboard Silvermyst Ride Experience!',
    'Complimentary high-speed charging cables available at your seat.',
    'Ask about our private airport chauffeur booking for your return trip.',
    'Chilled bottled water available upon request.',
    'Traffic delay ahead — estimated 10 minute addition to arrival.',
  ];

  const handlePushAnnouncement = (text: string) => {
    if (!text.trim()) return;
    playCabinChime('acknowledged');
    onBroadcastAnnouncement(text.trim());
    setQuickAnnouncement('');
    setLastAppliedTime('Just now');
    setSyncConfirmed(true);
    onShowToast(`Dispatched announcement to ${selectedTabletId === 'all' ? 'all passenger tablets' : selectedTabletId}!`);
  };

  const handleToggleAppVisibility = (appId: string) => {
    playCabinChime('tap');
    const updated = installedApps.map((a) =>
      a.id === appId ? { ...a, isHiddenFromPassengers: !a.isHiddenFromPassengers } : a
    );
    onUpdateInstalledApps(updated);
    cloudSync.saveAppsList(updated);
    setLastAppliedTime('Just now');
    onShowToast('Button visibility synchronized with passenger tablets');
  };

  const handleToggleQuickConnectVisibility = (qcId: string) => {
    playCabinChime('tap');
    const updated = quickConnects.map((q) =>
      q.id === qcId ? { ...q, isVisible: !q.isVisible } : q
    );
    onUpdateQuickConnects(updated);
    cloudSync.saveQuickConnects(updated);
    setLastAppliedTime('Just now');
    onShowToast('Quick Connect dock updated in real time');
  };

  const handleForceSync = async () => {
    playCabinChime('tap');
    setIsSyncing(true);
    setSyncConfirmed(false);

    await cloudSync.sendKioskCommand({
      tabletId: selectedTabletId,
      action: 'force_resync',
      issuedBy: 'Admin Experience Controller',
    });

    setTimeout(() => {
      setIsSyncing(false);
      setSyncConfirmed(true);
      setLastAppliedTime('Just now');
      onShowToast('All passenger tablets reported sync acknowledged!');
    }, 1200);
  };

  const currentActiveDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner: Central Remote Experience Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.controllerTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.controllerSub}
          </p>
        </div>

        {/* Real-time Applied Confirmation Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-xs">
            {syncConfirmed ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{sl.appliedOnTablets} ({lastAppliedTime})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{sl.syncing}</span>
              </span>
            )}
          </div>

          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{sl.forceResync}</span>
          </button>
        </div>
      </div>

      {/* Target Tablet / Vehicle Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Tablet className="w-4 h-4 text-purple-400" />
          <span>{sl.targetTablet}:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playCabinChime('tap');
              setSelectedTabletId('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTabletId === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sl.allTablets}
          </button>
          {tablets.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playCabinChime('tap');
                setSelectedTabletId(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTabletId === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Active Driver Profile Controller */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.activeDriverProfile}</h3>
            </div>
            <span className="text-[11px] font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              {sl.liveKioskProfile}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select which driver is currently hosting the vehicle. This updates the name, photo, bio, vehicle details, and credentials displayed to passengers immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {drivers.map((d) => {
              const isCurrent = d.id === activeDriverId;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    playCabinChime('acknowledged');
                    onSelectDriver(d.id);
                    onShowToast(`Switched active kiosk driver to ${d.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={d.avatarUrl}
                    alt={d.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/60"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>{d.name}</span>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-purple-300 truncate">{d.vehicleModel}</div>
                    <div className="text-[10px] text-slate-400">{d.rating} ★ • {d.totalTrips} Trips</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Instant Remote Announcement Dispatcher */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.pushFleetAnnouncement}</h3>
            </div>
            <span className="text-[11px] font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              Top Banner
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickAnnouncement}
                onChange={(e) => setQuickAnnouncement(e.target.value)}
                placeholder={at.pushAnnouncementPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handlePushAnnouncement(quickAnnouncement)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sl.broadcast}</span>
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {sl.predefinedTemplates}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {announcementTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePushAnnouncement(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-slate-300 hover:text-white transition-all text-left cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 3: Passenger Feature & Button Visibility Manager */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {sl.appFeatureToggles}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {at.showBtn} / {at.hideBtn}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {installedApps.slice(0, 8).map((app) => {
            const isVisible = !app.isHiddenFromPassengers;
            return (
              <div
                key={app.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isVisible
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{app.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{app.category}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleAppVisibility(app.id)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isVisible
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={isVisible ? at.showBtn : at.hideBtn}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel 4: Quick Connect Dock Management */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {sl.quickConnectDockItems}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {quickConnects.filter((q) => q.isVisible).length} / {quickConnects.length} {sl.activeStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickConnects.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                item.isVisible
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-950/30 border-slate-900 opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{item.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.handleOrValue}</div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleQuickConnectVisibility(item.id)}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  item.isVisible
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={item.isVisible ? 'Visible in bottom dock' : 'Hidden from bottom dock'}
              >
                {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
