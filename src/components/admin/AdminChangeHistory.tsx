import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { ChangeHistorySnapshot, InstalledAppItem, DriverProfile, QuickConnectItem, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminChangeHistoryProps {
  onRollback: (snapshot: ChangeHistorySnapshot) => void;
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

export const AdminChangeHistory: React.FC<AdminChangeHistoryProps> = ({
  onRollback,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [historyList, setHistoryList] = useState<ChangeHistorySnapshot[]>([]);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudSync.subscribeToChangeHistory((list) => {
      setHistoryList(list);
    });
    return () => unsub();
  }, []);

  const handleRestore = (item: ChangeHistorySnapshot) => {
    if (!window.confirm(`Are you sure you want to rollback to configuration from ${new Date(item.timestamp).toLocaleString()}?`)) {
      return;
    }
    playCabinChime('acknowledged');
    setIsRollingBack(item.id);

    setTimeout(() => {
      onRollback(item);
      setIsRollingBack(null);
      onShowToast(`Configuration restored to snapshot "${item.summary}"!`);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.historyTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.historySub}
          </p>
        </div>
      </div>

      {/* History Timeline */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.historicalSnapshots}</h3>
          <span className="text-xs text-slate-400">{historyList.length}</span>
        </div>

        {historyList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No previous rollback snapshots found. As you make changes in the command center, automatic version snapshots are saved here.
          </div>
        ) : (
          <div className="space-y-3">
            {historyList.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{entry.summary}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                      {entry.changeType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Saved by <strong>{entry.author}</strong> • {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  {entry.snapshotData && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                      <span>Buttons: <strong>{entry.snapshotData.installedAppsCount || 10}</strong></span>
                      <span>Quick Connects: <strong>{entry.snapshotData.quickConnectsCount || 7}</strong></span>
                      <span>Albums: <strong>{entry.snapshotData.albumsCount || 3}</strong></span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(entry)}
                  disabled={isRollingBack === entry.id}
                  className="px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-600/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRollingBack === entry.id ? 'animate-spin' : ''}`} />
                  <span>{sl.restoreThisVersion}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
