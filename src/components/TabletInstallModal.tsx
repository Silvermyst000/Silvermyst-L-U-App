import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Tablet,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Car,
  QrCode,
  Sparkles,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { QRCodeView } from '../utils/qrCode';
import { playCabinChime } from '../utils/cabinAudio';

interface TabletInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TabletInstallModal: React.FC<TabletInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'webapk' | 'kiosk' | 'apk'>('webapk');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://silvermyst.com';

  const handleCopyUrl = () => {
    playCabinChime('tap');
    navigator.clipboard?.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const handleDirectInstall = async () => {
    playCabinChime('tap');
    const success = await install();
    if (success) {
      playCabinChime('acknowledged');
    }
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display">
                  Install on Android Tablet
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-sky-500/10 text-sky-500 border border-sky-500/30">
                  10" Landscape
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn your in-cabin tablet into a dedicated, full-screen kiosk app
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span>This kiosk is already running as an installed standalone app!</span>
              <p className="font-normal text-[11px] text-emerald-700 dark:text-emerald-300">
                It operates without browser address bars, caches offline assets, and boots automatically from the home screen.
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border border-sky-400/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-sky-500 shrink-0 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  1-Tap Instant Installation Available
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap to install the Silvermyst Android WebAPK directly to your tablet's home screen.
                </p>
              </div>
            </div>
            <button
              onClick={handleDirectInstall}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-tight shadow-md cursor-pointer shrink-0 min-h-[44px]"
            >
              Install Now 🚀
            </button>
          </div>
        ) : null}

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('webapk');
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === 'webapk'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold text-sky-600 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Chrome WebAPK</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('kiosk');
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === 'kiosk'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold text-sky-600 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>2. Fully Kiosk (Pro)</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('apk');
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold text-sky-600 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Raw .APK File</span>
          </button>
        </div>

        {/* Tab 1: Chrome Native WebAPK (Fastest, zero sideloading) */}
        {activeTab === 'webapk' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                How Android Native WebAPK Works (No APK File Needed)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Modern Android OS automatically generates a real native APK package (called a <strong>WebAPK</strong>) directly on your tablet:
              </p>

              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
                <li>
                  On your 10-inch Android tablet, open <strong>Google Chrome</strong> (or Samsung Internet).
                </li>
                <li>
                  Open this kiosk URL (or scan the tablet QR code below with your tablet's camera).
                </li>
                <li>
                  Tap the Chrome menu (<strong>⋮</strong> in the top right corner) and tap <strong className="text-sky-500 dark:text-sky-400">"Install app"</strong> or <strong className="text-sky-500 dark:text-sky-400">"Add to Home screen"</strong>.
                </li>
                <li>
                  Android packages it into a native app with the <strong>Silvermyst star icon</strong> in your tablet's app drawer!
                </li>
                <li>
                  When launched, it automatically locks into <strong>landscape full-screen</strong> with no browser tabs, address bar, or navigation buttons.
                </li>
              </ol>
            </div>

            {/* Quick QR code to open URL on the tablet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0">
                <QRCodeView value={currentUrl} size={110} className="border-0 p-0 shadow-none" />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="text-xs sm:text-sm font-bold font-display">
                  Scan with Tablet Camera to Open
                </h4>
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
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 min-h-[36px]"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fully Kiosk Browser (Commercial in-cabin vehicle standard) */}
        {activeTab === 'kiosk' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-500" />
                  Vehicle Headrest / Console Lockdown (Recommended for Rideshare)
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  Fleet Standard
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                If you leave the 10-inch tablet mounted in the backseat for passengers, you want to prevent passengers from closing the app or messing with Android system settings. <strong>Fully Kiosk Browser</strong> is the industry standard APK for vehicle tablets:
              </p>

              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
                <li>
                  Install <strong>Fully Kiosk Browser</strong> from Google Play Store on your tablet.
                </li>
                <li>
                  In Fully Kiosk settings, set <strong>Start URL</strong> to your Silvermyst Kiosk URL.
                </li>
                <li>
                  Enable <strong>Kiosk Mode</strong> (PIN protected, locks status bar, volume bar, and home button).
                </li>
                <li>
                  Enable <strong>Auto-start on Boot / Power Connect</strong> (turns on when your vehicle starts, sleeps when parked).
                </li>
              </ol>

              <div className="pt-2">
                <a
                  href="https://play.google.com/store/apps/details?id=de.ozerov.fully"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer border border-slate-700"
                >
                  <span>View Fully Kiosk on Google Play</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Raw Standalone .APK File (PWABuilder / Bubblewrap) */}
        {activeTab === 'apk' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Generate a Standalone Signed .APK File
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Because we have already configured the full <strong>Web App Manifest</strong>, <strong>Service Worker</strong>, and <strong>512x512 adaptive icons</strong>, your kiosk app is 100% compliant with Google's Trusted Web Activity (TWA) standard.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                You can download a raw signed <code>.apk</code> file in under 60 seconds using <strong>PWABuilder</strong> (Microsoft's open-source tool, developed with the Google Chrome team):
              </p>

              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
                <li>
                  Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline font-semibold">PWABuilder.com</a> on your computer.
                </li>
                <li>
                  Paste your kiosk URL (<span className="font-mono text-xs">{currentUrl}</span>).
                </li>
                <li>
                  Click <strong>Package for Stores</strong> &rarr; <strong>Android</strong>.
                </li>
                <li>
                  Click <strong>Download Package / APK</strong>. It will package the signed <code>.apk</code> ready to install on your Android tablet via USB or direct download!
                </li>
              </ol>

              <div className="pt-2">
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  <span>Open in PWABuilder to Download .APK</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
