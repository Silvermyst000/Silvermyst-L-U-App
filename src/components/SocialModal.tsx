import React, { useState } from 'react';
import { QRCodeView } from '../utils/qrCode';
import { X, ExternalLink, Copy, Check, Smartphone } from 'lucide-react';
import { playCabinChime } from '../utils/cabinAudio';

export interface SocialModalData {
  title: string;
  subtitle: string;
  handleOrValue: string;
  url: string;
  qrValue: string;
  type: 'linktree' | 'instagram' | 'contact' | 'whatsapp' | 'website';
  description: string;
}

interface SocialModalProps {
  data: SocialModalData | null;
  onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    playCabinChime('tap');
    navigator.clipboard?.writeText(data.url || data.handleOrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
      title="Tap outside to close"
    >
      {/* Modal card stops click propagation so tapping inside does not close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-slate-950 text-white rounded-3xl p-6 border border-slate-700/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] space-y-4 text-center relative"
      >
        {/* Header / Dismiss */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider font-display">
              Phone Camera Scan Ready
            </span>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Contrast Glare-Free Scanner Viewfinder Card */}
        <div className="relative mx-auto my-2 p-4 bg-white rounded-2xl shadow-2xl inline-block">
          {/* Target Corner Viewfinder Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-emerald-500" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-emerald-500" />
          <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-emerald-500" />
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-emerald-500" />

          {/* Crisp, Enlarged QR Code Matrix for Easy phone camera scanning from backseat */}
          <QRCodeView value={data.qrValue} size={220} className="shadow-none border-0 p-0" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Point phone camera here</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            {data.title}
          </h3>
          <p className="text-sm font-semibold text-sky-400 font-mono tracking-tight">
            {data.handleOrValue}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 px-2 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700 min-h-[48px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playCabinChime('tap')}
            className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm min-h-[48px]"
          >
            <span>Open Link</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-slate-400">
          Background dimmed low to eliminate glare for instant camera scan. Tap outside to dismiss.
        </p>
      </div>
    </div>
  );
};
