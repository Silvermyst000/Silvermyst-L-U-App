import React, { useState } from 'react';
import { Wifi, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { QRCodeView } from '../utils/qrCode';
import { playCabinChime } from '../utils/cabinAudio';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WifiModal: React.FC<WifiModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const wifiSSID = 'SilverMist_ExecutiveGuest';
  const wifiPass = 'SmoothRide5Star';
  const wifiQrValue = `WIFI:S:${wifiSSID};T:WPA;P:${wifiPass};;`;

  if (!isOpen) return null;

  const handleCopy = () => {
    playCabinChime('tap');
    navigator.clipboard?.writeText(wifiPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold font-display uppercase tracking-wider">
            <Wifi className="w-4 h-4" />
            <span>Complimentary High-Speed Wi-Fi</span>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center py-2">
          <QRCodeView value={wifiQrValue} size={150} />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Point your phone camera to auto-connect</p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">SSID:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{wifiSSID}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Password:</span>
              <div className="flex items-center gap-1.5">
                <code className="font-mono font-bold text-slate-900 dark:text-white">{wifiPass}</code>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
