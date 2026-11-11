import React, { useState } from 'react';
import { Wifi, Copy, Check, BatteryCharging, ShieldCheck, HeartHandshake } from 'lucide-react';
import { QRCodeView } from '../utils/qrCode';
import { playCabinChime } from '../utils/cabinAudio';

export const AmenitiesWifi: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const wifiSSID = 'SilverMist_ExecutiveGuest';
  const wifiPass = 'SmoothRide5Star';

  // Wi-Fi QR string standard format: WIFI:S:MySSID;T:WPA;P:MyPass;;
  const wifiQrValue = `WIFI:S:${wifiSSID};T:WPA;P:${wifiPass};;`;

  const handleCopy = () => {
    playCabinChime('tap');
    navigator.clipboard?.writeText(wifiPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Wi-Fi Card with QR */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
              Vehicle High-Speed 5G Wi-Fi
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Network: <span className="font-semibold text-slate-800 dark:text-slate-200">{wifiSSID}</span>
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Password:</span>
            <code className="text-xs font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              {wifiPass}
            </code>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors"
              title="Copy password"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Scannable Wi-Fi QR */}
        <div className="shrink-0 text-center">
          <QRCodeView value={wifiQrValue} size={88} className="p-1.5 shadow-xs" />
          <span className="block text-[10px] text-slate-400 mt-1 font-medium">Scan to Connect</span>
        </div>
      </div>

      {/* Cabin Amenities Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <BatteryCharging className="w-5 h-5 text-sky-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fast Charging</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">USB-C & iPhone</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily Sanitized</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">HEPA Air Filtered</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <HeartHandshake className="w-5 h-5 text-amber-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Free Bottled Water</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Mints & Napkins</p>
        </div>
      </div>
    </div>
  );
};
