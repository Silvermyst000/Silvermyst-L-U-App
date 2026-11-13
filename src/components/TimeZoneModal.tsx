import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  Globe,
  MapPin,
  Search,
  X,
  Check,
  RotateCcw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  US_TIMEZONES,
  GLOBAL_TIMEZONES,
  formatTimeInZone,
  getDeviceTimeZone,
  lookupZipCodeTimezone,
  ZipLookupResult,
} from '../utils/timezones';
import { playCabinChime } from '../utils/cabinAudio';

interface TimeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimeZone?: string;
  onSelectTimeZone?: (tz: string | undefined) => void;
}

const SAMPLE_ZIPS = [
  { zip: '46601', label: 'South Bend, IN' },
  { zip: '10001', label: 'New York, NY' },
  { zip: '60601', label: 'Chicago, IL' },
  { zip: '85001', label: 'Phoenix, AZ' },
  { zip: '80202', label: 'Denver, CO' },
  { zip: '90210', label: 'Beverly Hills, CA' },
  { zip: '96801', label: 'Honolulu, HI' },
];

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({
  isOpen,
  onClose,
  activeTimeZone,
  onSelectTimeZone,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [regionTab, setRegionTab] = useState<'us' | 'global'>('us');
  const [zipInput, setZipInput] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipResult, setZipResult] = useState<ZipLookupResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const deviceZone = getDeviceTimeZone();
  const displayZone = activeTimeZone || deviceZone;
  const currentInfo = formatTimeInZone(now, displayZone);

  const handleZipLookup = async (zipToQuery?: string) => {
    const targetZip = (zipToQuery ?? zipInput).trim();
    if (!targetZip) return;
    playCabinChime('tap');
    setZipLoading(true);
    setZipError(null);

    const res = await lookupZipCodeTimezone(targetZip);
    setZipLoading(false);

    if ('error' in res) {
      setZipError(res.error);
      setZipResult(null);
    } else {
      setZipInput(res.zip);
      setZipResult(res);
    }
  };

  const zonesList = regionTab === 'us' ? US_TIMEZONES : GLOBAL_TIMEZONES;

  const modalContent = (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 text-white border-b border-sky-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>World &amp; US Time Zones + ZIP Lookup</span>
              </h3>
              <p className="text-xs text-slate-300">
                Current clock: <strong className="text-sky-300">{currentInfo.timeWithSeconds} {currentInfo.zoneAbbr}</strong> · {currentInfo.ianaTimeZone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Close timezone popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Active Dashboard Clock Card */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {activeTimeZone ? 'Selected Dashboard Time Zone' : 'Current Local Time Zone'}
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums">
                  {currentInfo.timeWithSeconds}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500 text-white">
                  {currentInfo.zoneAbbr}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentInfo.dateStr} · {currentInfo.ianaTimeZone}
              </div>
            </div>

            {onSelectTimeZone && activeTimeZone && activeTimeZone !== deviceZone && (
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onSelectTimeZone(undefined);
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:brightness-105 self-start sm:self-center"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
                <span>Reset to Device Time</span>
              </button>
            )}
          </div>

          {/* US ZIP Code Time Zone Lookup */}
          <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>Look Up Time Zone by US ZIP Code</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant US postal code clock converter
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleZipLookup();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZipInput(digits);
                    setZipError(null);
                  }}
                  placeholder="Enter 5-digit US ZIP code (e.g. 46601, 60601, 90210)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={zipLoading || zipInput.length < 5}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {zipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check ZIP Time</span>
              </button>
            </form>

            {/* Quick Sample ZIP Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_ZIPS.map((s) => (
                <button
                  key={s.zip}
                  type="button"
                  onClick={() => handleZipLookup(s.zip)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  {s.zip} · {s.label}
                </button>
              ))}
            </div>

            {zipError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                {zipError}
              </div>
            )}

            {zipResult && (() => {
              const zipTime = formatTimeInZone(now, zipResult.timeZone);
              return (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="text-xs font-extrabold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ZIP {zipResult.zip} — {zipResult.regionLabel}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black tabular-nums">{zipTime.timeWithSeconds}</span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-300 text-xs font-black">
                        {zipTime.zoneAbbr}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {zipResult.zoneName} · {zipTime.dateStr} ({zipResult.timeZone})
                    </div>
                  </div>

                  {onSelectTimeZone && (
                    <button
                      type="button"
                      onClick={() => {
                        playCabinChime('acknowledged');
                        onSelectTimeZone(zipResult.timeZone);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Set Dashboard Clock</span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* US & Global Time Zone Switcher Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setRegionTab('us');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                    regionTab === 'us'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🇺🇸 United States Zones
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setRegionTab('global');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                    regionTab === 'global'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Global World Zones</span>
                </button>
              </div>
              {onSelectTimeZone && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap any card to switch dashboard clock
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {zonesList.map((zone) => {
                const info = formatTimeInZone(now, zone.timeZone);
                const isSelected = displayZone === zone.timeZone;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      onSelectTimeZone?.(zone.timeZone);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      onSelectTimeZone ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 ring-1 ring-sky-500/40'
                        : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span className="truncate">{zone.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {zone.cities}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{info.dateStr}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black tabular-nums">{info.timeStr}</div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-black text-sky-600 dark:text-sky-400">
                        {info.zoneAbbr}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document === 'undefined' ? null : createPortal(modalContent, document.body);
};

