import React, { useState, useEffect, useRef } from 'react';
import {
  HardDriveDownload,
  Upload,
  Download,
  CloudUpload,
  RotateCcw,
  CheckCircle2,
  FileJson,
  Database,
  History,
  Settings,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  AdminAndroidApp,
  CabinMessage,
  CabinThemeMode,
  DriverProfile,
  GalleryAlbum,
  GalleryItem,
  InstalledAppItem,
  QuickConnectItem,
  ScreensaverSettings,
  ServiceInquiry,
  SongRequest,
  SupportedLanguage,
  SystemBackupPayload,
  InternalAdminMessage,
} from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { getAdminTranslations } from '../../data/adminTranslations';
import { CABIN_THEMES } from '../../data/cabinThemes';
import { playCabinChime } from '../../utils/cabinAudio';

interface AdminBackupRestoreProps {
  adminLanguage: SupportedLanguage;
  passengerLanguage: SupportedLanguage;
  activeDriver: DriverProfile;
  drivers: DriverProfile[];
  installedApps: InstalledAppItem[];
  adminAndroidApps: AdminAndroidApp[];
  quickConnects: QuickConnectItem[];
  albums: GalleryAlbum[];
  photos: GalleryItem[];
  screensaverSettings: ScreensaverSettings;
  cabinTheme: CabinThemeMode;
  isDark: boolean;
  songRequests: SongRequest[];
  cabinMessages: CabinMessage[];
  inquiries: ServiceInquiry[];
  teamMessages: InternalAdminMessage[];
  onApplyBackup: (
    payload: SystemBackupPayload,
    options: { restoreConfig: boolean; restoreHistory: boolean }
  ) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AdminBackupRestore: React.FC<AdminBackupRestoreProps> = ({
  adminLanguage,
  passengerLanguage,
  activeDriver,
  drivers,
  installedApps,
  adminAndroidApps,
  quickConnects,
  albums,
  photos,
  screensaverSettings,
  cabinTheme,
  isDark,
  songRequests,
  cabinMessages,
  inquiries,
  teamMessages,
  onApplyBackup,
  onShowToast,
}) => {
  const at = getAdminTranslations(adminLanguage);
  const [backupScope, setBackupScope] = useState<'full' | 'config_only' | 'history_only'>('full');
  const [isExporting, setIsExporting] = useState(false);
  const [isCloudWorking, setIsCloudWorking] = useState(false);
  const [lastCloudMeta, setLastCloudMeta] = useState<{ exportedAt: string; exportedBy: string; backupScope: string } | null>(null);

  // External file upload & preview state
  const [uploadedPreview, setUploadedPreview] = useState<SystemBackupPayload | null>(null);
  const [restoreConfigOpt, setRestoreConfigOpt] = useState(true);
  const [restoreHistoryOpt, setRestoreHistoryOpt] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cloudSync.getLatestCompleteCloudBackup().then((snap) => {
      if (snap?.exportedAt) {
        setLastCloudMeta({
          exportedAt: snap.exportedAt,
          exportedBy: snap.exportedBy || 'Admin',
          backupScope: snap.backupScope || 'full',
        });
      }
    });
  }, []);

  const buildBackupPayload = async (): Promise<SystemBackupPayload> => {
    const cloudHist = await cloudSync.fetchAllHistoricalDataForBackup();

    const includeConfig = backupScope === 'full' || backupScope === 'config_only';
    const includeHistory = backupScope === 'full' || backupScope === 'history_only';

    const payload: SystemBackupPayload = {
      version: 'silvermyst-complete-backup-v2',
      backupScope,
      exportedAt: new Date().toISOString(),
      exportedBy: activeDriver.name,
      appVersion: 'v3.6.0-kiosk',
    };

    if (includeConfig) {
      payload.config = {
        activeDriverId: activeDriver.id,
        drivers,
        installedApps,
        adminAndroidApps,
        quickConnects,
        galleryAlbums: albums,
        galleryPhotos: photos,
        screensaverSettings,
        cabinTheme,
        isDark,
        passengerLanguage,
        adminLanguage,
        marketingPopups: cloudHist.marketingPopups,
      };
    }

    if (includeHistory) {
      payload.history = {
        workShifts: cloudHist.workShifts,
        shiftChangeRequests: cloudHist.shiftChangeRequests,
        songRequests: cloudHist.songRequests.length > 0 ? cloudHist.songRequests : songRequests,
        cabinMessages: cloudHist.cabinMessages.length > 0 ? cloudHist.cabinMessages : cabinMessages,
        serviceInquiries: cloudHist.serviceInquiries.length > 0 ? cloudHist.serviceInquiries : inquiries,
        teamMessages: cloudHist.teamMessages.length > 0 ? cloudHist.teamMessages : teamMessages,
        feedbackList: cloudHist.feedbackList,
        checklists: cloudHist.checklists,
        analyticsEvents: cloudHist.analyticsEvents,
        changeHistorySnapshots: cloudHist.changeHistorySnapshots,
      };
    }

    return payload;
  };

  const handleExportToDeviceStorage = async () => {
    playCabinChime('tap');
    setIsExporting(true);
    try {
      const payload = await buildBackupPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const suggestedName = `silvermyst-${backupScope}-backup-${stamp}.json`;

      // Try native File System Access API so admin can pick exact folder on device storage
      const winAny = window as any;
      let savedViaPicker = false;
      if (typeof winAny.showSaveFilePicker === 'function') {
        try {
          const handle = await winAny.showSaveFilePicker({
            suggestedName,
            types: [
              {
                description: 'Silvermyst System Backup JSON',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          savedViaPicker = true;
        } catch (pickerErr: any) {
          // If user cancelled vs blocked inside iframe: only abort if AbortError
          if (pickerErr?.name === 'AbortError') {
            setIsExporting(false);
            return;
          }
        }
      }

      if (!savedViaPicker) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      playCabinChime('acknowledged');
      onShowToast(`Saved ${suggestedName} to device storage!`);
    } catch (err) {
      onShowToast('Failed to generate backup export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCloudSnapshot = async () => {
    playCabinChime('tap');
    setIsCloudWorking(true);
    try {
      const payload = await buildBackupPayload();
      const ok = await cloudSync.saveCompleteCloudBackup(payload);
      if (ok) {
        setLastCloudMeta({
          exportedAt: payload.exportedAt,
          exportedBy: payload.exportedBy,
          backupScope: payload.backupScope,
        });
        playCabinChime('acknowledged');
        onShowToast('Full configuration & history backed up to Cloud!');
      } else {
        onShowToast('Cloud snapshot save failed — check connection.');
      }
    } finally {
      setIsCloudWorking(false);
    }
  };

  const handleLoadCloudSnapshot = async () => {
    playCabinChime('tap');
    setIsCloudWorking(true);
    try {
      const snap = await cloudSync.getLatestCompleteCloudBackup();
      if (!snap) {
        onShowToast(at.noCloudBackupYet);
        return;
      }
      setUploadedPreview(snap as SystemBackupPayload);
      setRestoreConfigOpt(Boolean(snap.config));
      setRestoreHistoryOpt(Boolean(snap.history));
      onShowToast('Loaded Cloud snapshot into preview — confirm to apply.');
    } finally {
      setIsCloudWorking(false);
    }
  };

  const parseIncomingBackupFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        // Support both v2 complete backups and legacy v1 profile-only backups
        if (raw.version === 'silvermyst-complete-backup-v2' || raw.config || raw.history) {
          const normalized = raw as SystemBackupPayload;
          setUploadedPreview(normalized);
          setRestoreConfigOpt(Boolean(normalized.config));
          setRestoreHistoryOpt(Boolean(normalized.history));
          playCabinChime('tap');
          onShowToast('Backup file verified and ready to load.');
        } else if (Array.isArray(raw.drivers)) {
          const converted: SystemBackupPayload = {
            version: 'silvermyst-backup-v1',
            backupScope: 'config_only',
            exportedAt: raw.exportedAt || new Date().toISOString(),
            exportedBy: 'Legacy Export',
            appVersion: 'v1',
            config: {
              activeDriverId: raw.activeDriverId || raw.drivers[0]?.id,
              drivers: raw.drivers,
              installedApps,
              adminAndroidApps,
              quickConnects,
              galleryAlbums: albums,
              galleryPhotos: photos,
              screensaverSettings,
              cabinTheme,
              isDark,
              passengerLanguage,
              adminLanguage,
            },
          };
          setUploadedPreview(converted);
          setRestoreConfigOpt(true);
          setRestoreHistoryOpt(false);
          playCabinChime('tap');
          onShowToast('Profile backup file loaded into preview.');
        } else {
          onShowToast('Unrecognized backup JSON format.');
        }
      } catch (e) {
        onShowToast('Could not read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmApply = async () => {
    if (!uploadedPreview) return;
    if (!restoreConfigOpt && !restoreHistoryOpt) {
      onShowToast('Select at least Configuration or Historical Records to restore.');
      return;
    }
    setIsApplying(true);
    try {
      await onApplyBackup(uploadedPreview, {
        restoreConfig: restoreConfigOpt && Boolean(uploadedPreview.config),
        restoreHistory: restoreHistoryOpt && Boolean(uploadedPreview.history),
      });
      setUploadedPreview(null);
      playCabinChime('acknowledged');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl cabin-card border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl cabin-primary-btn flex items-center justify-center shrink-0 shadow-md">
            <HardDriveDownload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{at.backupTitle}</h2>
            <p className="text-xs sm:text-sm cabin-text-muted mt-0.5">{at.backupSub}</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl cabin-panel border text-xs shrink-0">
          <div className="text-[10px] font-black uppercase tracking-wider cabin-text-muted">
            {at.cloudVaultTitle}
          </div>
          {lastCloudMeta ? (
            <div className="font-bold mt-0.5">
              {new Date(lastCloudMeta.exportedAt).toLocaleString()} • {lastCloudMeta.exportedBy}
            </div>
          ) : (
            <div className="cabin-text-muted mt-0.5">{at.noCloudBackupYet}</div>
          )}
        </div>
      </div>

      {/* Live Inventory Summary + Export Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-5 rounded-3xl cabin-card border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: 'var(--cabin-accent)' }} />
              <span>{at.backupScopeTitle}</span>
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full cabin-badge border">
              {CABIN_THEMES[cabinTheme]?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'full' as const, title: at.scopeFull, desc: at.scopeFullDesc, icon: Database },
              { id: 'config_only' as const, title: at.scopeConfig, desc: at.scopeConfigDesc, icon: Settings },
              { id: 'history_only' as const, title: at.scopeHistory, desc: at.scopeHistoryDesc, icon: History },
            ].map((opt) => {
              const Icon = opt.icon;
              const selected = backupScope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setBackupScope(opt.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    selected ? 'cabin-primary-btn shadow-md' : 'cabin-panel hover:brightness-105'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4" />
                    {selected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="font-extrabold text-xs leading-snug">{opt.title}</div>
                  <div className={`text-[10.5px] leading-snug ${selected ? 'opacity-90' : 'cabin-text-muted'}`}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Inventory Counts */}
          <div className="p-3.5 rounded-2xl cabin-panel border space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider cabin-text-muted">
              {at.includedSummaryTitle}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl cabin-card border">
                <div className="cabin-text-muted text-[10px]">Staff & PINs</div>
                <div className="font-black text-sm">{drivers.length}</div>
              </div>
              <div className="p-2 rounded-xl cabin-card border">
                <div className="cabin-text-muted text-[10px]">Tablet + Admin Apps</div>
                <div className="font-black text-sm">{installedApps.length + adminAndroidApps.length}</div>
              </div>
              <div className="p-2 rounded-xl cabin-card border">
                <div className="cabin-text-muted text-[10px]">Galleries / QR</div>
                <div className="font-black text-sm">{photos.length} / {quickConnects.length}</div>
              </div>
              <div className="p-2 rounded-xl cabin-card border">
                <div className="cabin-text-muted text-[10px]">Requests / Leads</div>
                <div className="font-black text-sm">{songRequests.length + cabinMessages.length + inquiries.length}</div>
              </div>
            </div>
          </div>

          {/* Export / Cloud Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExportToDeviceStorage}
              disabled={isExporting}
              className="flex-1 min-w-[220px] py-3 px-4 rounded-2xl cabin-primary-btn font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-md cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '...' : at.exportToDeviceBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCloudSnapshot}
              disabled={isCloudWorking}
              className="py-3 px-4 rounded-2xl cabin-badge border font-extrabold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer disabled:opacity-60"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{at.saveCloudSnapshotBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleLoadCloudSnapshot}
              disabled={isCloudWorking}
              className="py-3 px-4 rounded-2xl cabin-panel border font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{at.restoreCloudSnapshotBtn}</span>
            </button>
          </div>
        </div>

        {/* Upload & Load External Backup Card */}
        <div className="lg:col-span-5 p-5 rounded-3xl cabin-card border space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>{at.uploadExternalTitle}</span>
            </h3>
            <p className="text-xs cabin-text-muted">{at.uploadExternalSub}</p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              parseIncomingBackupFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-[190px] rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'cabin-panel hover:brightness-105'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl cabin-badge border flex items-center justify-center">
              <FileJson className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="px-4 py-2 rounded-xl cabin-primary-btn font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{at.selectBackupFileBtn}</span>
              </div>
              <p className="text-[11px] cabin-text-muted">{at.dropBackupHint}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                parseIncomingBackupFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview & Confirm Apply External Backup */}
      {uploadedPreview && (
        <div className="p-5 sm:p-6 rounded-3xl cabin-card border-2 border-emerald-500/60 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base">{at.previewLoadedBackup}</h3>
                <p className="text-xs cabin-text-muted">
                  Exported {new Date(uploadedPreview.exportedAt).toLocaleString()} by {uploadedPreview.exportedBy} ({uploadedPreview.version})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadedPreview(null)}
              className="p-1.5 rounded-xl cabin-panel border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl cabin-panel border">
              <div className="cabin-text-muted text-[10px]">Drivers / PINs</div>
              <div className="font-black">{uploadedPreview.config?.drivers?.length ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl cabin-panel border">
              <div className="cabin-text-muted text-[10px]">Tablet + Admin Apps</div>
              <div className="font-black">
                {(uploadedPreview.config?.installedApps?.length ?? 0) +
                  (uploadedPreview.config?.adminAndroidApps?.length ?? 0)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl cabin-panel border">
              <div className="cabin-text-muted text-[10px]">Work Shifts</div>
              <div className="font-black">{uploadedPreview.history?.workShifts?.length ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl cabin-panel border">
              <div className="cabin-text-muted text-[10px]">Requests / Reviews</div>
              <div className="font-black">
                {(uploadedPreview.history?.cabinMessages?.length ?? 0) +
                  (uploadedPreview.history?.songRequests?.length ?? 0) +
                  (uploadedPreview.history?.feedbackList?.length ?? 0)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl cabin-panel border">
              <div className="cabin-text-muted text-[10px]">Theme</div>
              <div className="font-black truncate">{uploadedPreview.config?.cabinTheme || '—'}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-bold">
            {uploadedPreview.config && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl cabin-panel border cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreConfigOpt}
                  onChange={(e) => setRestoreConfigOpt(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <span>{at.restoreConfigCheck}</span>
              </label>
            )}
            {uploadedPreview.history && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl cabin-panel border cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreHistoryOpt}
                  onChange={(e) => setRestoreHistoryOpt(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <span>{at.restoreHistoryCheck}</span>
              </label>
            )}
            {!uploadedPreview.history && (
              <div className="flex items-center gap-2 text-[11px] cabin-text-muted px-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>This file only contains Configuration settings (no Historical logs).</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
            <button
              type="button"
              onClick={() => setUploadedPreview(null)}
              className="px-4 py-2.5 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
            >
              {at.discardPreviewBtn}
            </button>
            <button
              type="button"
              onClick={handleConfirmApply}
              disabled={isApplying}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              <RotateCcw className={`w-4 h-4 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? '...' : at.applyExternalBackupBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
