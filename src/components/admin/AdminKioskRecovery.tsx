import React, { useState } from 'react';
import {
  Wrench,
  RefreshCw,
  RotateCcw,
  Volume2,
  Trash2,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Cpu,
  Wifi,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { TabletDevice, RemoteKioskCommand, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminKioskRecoveryProps {
  tablets: TabletDevice[];
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

export const AdminKioskRecovery: React.FC<AdminKioskRecoveryProps> = ({
  tablets,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [selectedTabletId, setSelectedTabletId] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const handleDispatchCommand = async (
    action: RemoteKioskCommand['action'],
    label: string,
    isNativeAndroidOnly: boolean = false
  ) => {
    playCabinChime('tap');
    setIsExecuting(action);

    await cloudSync.sendKioskCommand({
      tabletId: selectedTabletId,
      action,
      issuedBy: 'Admin Kiosk Recovery Terminal',
    });

    setTimeout(() => {
      setIsExecuting(null);
      playCabinChime('acknowledged');
      onShowToast(
        `Dispatched "${label}" to ${selectedTabletId === 'all' ? 'all fleet tablets' : selectedTabletId}${
          isNativeAndroidOnly ? ' (Executed via Fully Kiosk / Native Controller)' : ''
        }`
      );
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-purple-950/80 border border-rose-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.recoveryTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.recoverySub}
          </p>
        </div>

        {/* Target tablet dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs shrink-0">
          <Tablet className="w-4 h-4 text-rose-400" />
          <span className="text-slate-400 font-bold">{sl.device}:</span>
          <select
            value={selectedTabletId}
            onChange={(e) => setSelectedTabletId(e.target.value)}
            className="bg-transparent font-extrabold text-rose-300 focus:outline-none cursor-pointer"
          >
            <option value="all">{sl.allTablets}</option>
            {tablets.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Device Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tablets.map((tab) => {
          const isOnline = Date.now() - tab.lastSeen < 1000 * 60 * 10;
          return (
            <div
              key={tab.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{tab.name}</h4>
                    <p className="text-[11px] text-slate-400">{tab.vehicleModel}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                    isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{sl.screenResolution}</span>
                  <span className="font-bold text-white">{tab.resolution}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{sl.appVersion}</span>
                  <span className="font-bold text-white">{tab.appVersion}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recovery Command Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.remoteRecoveryProc}</h3>
          </div>
          <span className="text-xs text-slate-400">{selectedTabletId === 'all' ? sl.allTablets : selectedTabletId}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Action 1: Force Cloud Resync */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>{sl.forceResync}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Web & Tablet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Commands passenger tablet to immediately re-pull all driver profiles, button configs, and albums from Firestore.
              </p>
            </div>
            <button
              onClick={() => handleDispatchCommand('force_resync', 'Force Cloud Resync')}
              disabled={isExecuting === 'force_resync'}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              {sl.executeResync}
            </button>
          </div>

          {/* Action 2: Reload Kiosk Display */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  <span>{sl.executeReload}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Web & Tablet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Remotely reloads the client webview if the passenger tablet appears frozen or stuck on an external URL.
              </p>
            </div>
            <button
              onClick={() => handleDispatchCommand('reload_kiosk', 'Reload Kiosk Display')}
              disabled={isExecuting === 'reload_kiosk'}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs transition-colors cursor-pointer"
            >
              {sl.executeReload}
            </button>
          </div>

          {/* Action 3: Test Cabin Chime */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>{sl.soundChimeNow}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Web & Tablet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plays a gentle synthesized chime on the tablet speaker to verify sound volume and hardware responsiveness.
              </p>
            </div>
            <button
              onClick={() => handleDispatchCommand('test_chime', 'Test Audio Chime')}
              disabled={isExecuting === 'test_chime'}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              {sl.soundChimeNow}
            </button>
          </div>

          {/* Action 4: Clear Client Cache */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>{sl.wipeLocalCache}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Android APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wipes stale webview browser cache and resets IndexedDB offline storage back to clean production Firestore data.
              </p>
            </div>
            <button
              onClick={() => handleDispatchCommand('clear_cache', 'Clear Client Cache', true)}
              disabled={isExecuting === 'clear_cache'}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs transition-colors cursor-pointer"
            >
              {sl.wipeLocalCache}
            </button>
          </div>
        </div>

        {/* Android Native Integration Notice */}
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-xs text-purple-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-purple-200">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Native Android 7.1 / Fully Kiosk Compatibility Notice:</span>
          </div>
          <p className="text-[11px] text-purple-300/80 leading-relaxed">
            Actions marked <strong>Web & Tablet</strong> work instantly over live WebSockets and Firebase Firestore. Actions marked <strong>Requires Android APK</strong> utilize the JavaScript JavascriptInterface bridge (`window.fully.clearCache()`) when operating on the dedicated Samsung Android tablet.
          </p>
        </div>
      </div>
    </div>
  );
};
