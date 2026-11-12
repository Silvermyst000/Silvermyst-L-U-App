import React, { useState } from 'react';
import { QRCodeView } from '../utils/qrCode';
import { X, ExternalLink, Copy, Check, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
import { playCabinChime } from '../utils/cabinAudio';

export interface SocialModalData {
  title: string;
  subtitle: string;
  handleOrValue: string;
  url: string;
  qrValue: string;
  type: string;
  description: string;
  accentColor?: string;
  badge?: string;
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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
      title="Tap outside to close"
    >
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-purple-500/30 shadow-[0_0_60px_rgba(147,51,234,0.25)] space-y-4 text-center relative"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {data.badge || 'Instant Scan Ready'}
            </span>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-Contrast Luxury Glare-Free QR Frame */}
        <div className="relative mx-auto my-1 p-4 bg-white rounded-3xl shadow-2xl inline-block ring-4 ring-purple-500/20">
          {/* Decorative Corner Focus Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-3 border-l-3 border-purple-500 rounded-tl-lg" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-3 border-r-3 border-purple-500 rounded-tr-lg" />
          <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-3 border-l-3 border-purple-500 rounded-bl-lg" />
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-3 border-r-3 border-purple-500 rounded-br-lg" />

          {/* Crisp QR Code */}
          <QRCodeView value={data.qrValue} size={210} className="shadow-none border-0 p-0" />
        </div>

        {/* Details & Copy */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Point smartphone camera to scan</span>
          </div>

          <h3 className="text-lg font-black text-white tracking-tight">
            {data.title}
          </h3>

          <p className="text-xs font-extrabold text-sky-400 font-mono tracking-tight bg-slate-900/80 px-3 py-1 rounded-xl inline-block border border-slate-800">
            {data.handleOrValue}
          </p>

          <p className="text-xs text-slate-300 px-2 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playCabinChime('tap')}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm min-h-[44px]"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-[10px] text-slate-500">
          High-contrast screen brightness optimized for instant phone camera scanning from backseat.
        </p>
      </div>
    </div>
  );
};
