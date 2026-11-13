import React, { useEffect } from 'react';
import {
  Sparkles,
  X,
  ArrowUpRight,
  Gift,
  Volume2,
  Calendar,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react';
import { MarketingPopup } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';

interface MarketingPopupModalProps {
  popup: MarketingPopup | null;
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (url?: string) => void;
}

export const MarketingPopupModal: React.FC<MarketingPopupModalProps> = ({
  popup,
  isOpen,
  onClose,
  onActionClick,
}) => {
  useEffect(() => {
    if (isOpen && popup) {
      if (popup.audioSound === 'celebrate') {
        playCabinChime('comfort');
      } else if (popup.audioSound === 'jingle' || popup.audioSound === 'chime') {
        playCabinChime('song');
      }
    }
  }, [isOpen, popup]);

  if (!isOpen || !popup) return null;

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-amber-400/50 shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-5 text-center relative overflow-hidden bg-gradient-to-b ${
          popup.backgroundColor || 'from-slate-900 via-purple-950 to-slate-950'
        } text-white`}
      >
        {/* Subtle festive particle effect / ring */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
          title="Close promotional announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{popup.badgeText || 'Silvermyst VIP Special'}</span>
          </span>
        </div>

        {/* Optional Flyer Image */}
        {popup.imageUrl && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/20 shadow-md">
            <img
              src={popup.imageUrl}
              alt={popup.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header Text */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            {popup.title}
          </h2>
          {popup.subtitle && (
            <p className="text-sm font-bold text-amber-300">
              {popup.subtitle}
            </p>
          )}
        </div>

        {/* Body Text */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md mx-auto">
          {popup.bodyText}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          {popup.callToActionLabel && (
            <button
              onClick={() => {
                playCabinChime('acknowledged');
                if (onActionClick) onActionClick(popup.callToActionUrl);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm tracking-tight shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{popup.callToActionLabel}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Continue Kiosk Experience
          </button>
        </div>
      </div>
    </div>
  );
};
