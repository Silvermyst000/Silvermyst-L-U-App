import React, { useState } from 'react';
import {
  X,
  Volume2,
  Volume1,
  VolumeX,
  Snowflake,
  Flame,
  Wind,
  BatteryCharging,
  Droplets,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  Clock,
  Sparkles,
  MapPin,
  Coffee,
} from 'lucide-react';
import { CabinMessage } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';

interface PassengerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
}

export const PassengerRequestModal: React.FC<PassengerRequestModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [customText, setCustomText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    playCabinChime('comfort');
    onSendMessage({
      type: 'comfort',
      text,
    });
    setSentNotice(`Sent to Carlos: "${text}"`);
    setTimeout(() => {
      setSentNotice(null);
    }, 3500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    handleSend(customText.trim());
    setCustomText('');
  };

  const quickChips = [
    'Quick stop at ATM / store',
    'Restroom break needed',
    'Aux cable / Bluetooth connect',
    'Luggage help at destination',
    'Smooth highway route',
  ];

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
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Passenger Cabin Requests
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-tap notifications sent instantly to driver Carlos
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Confirmation Alert Banner */}
        {sentNotice && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <span>{sentNotice}</span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
                Carlos will adjust the cabin shortly.
              </span>
            </div>
          </div>
        )}

        {/* 1. Volume Controls (Requested specifically by user) */}
        <div className="space-y-2.5">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-sky-500" />
            Music & Volume Requests
          </span>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSend('Request: Please Raise the Volume 🔊')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 group-hover:scale-108 transition-transform shrink-0">
                <Volume2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Raise Volume</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Make music louder</p>
              </div>
            </button>

            <button
              onClick={() => handleSend('Request: Please Lower the Volume 🔉')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 group-hover:scale-108 transition-transform shrink-0">
                <Volume1 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Lower Volume</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Make music softer</p>
              </div>
            </button>

            <button
              onClick={() => handleSend('Request: Quiet Ride / Mute Music 🤫')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 group-hover:scale-108 transition-transform shrink-0">
                <VolumeX className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Quiet Ride</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rest or phone call</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Temperature Controls (Requested specifically by user) */}
        <div className="space-y-2.5">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-sky-400" />
            Cabin Temperature & Climate
          </span>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSend("Request: It's Too Cold (Please Turn Up Heat) 🌡️")}
              className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-108 transition-transform shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">It's Too Cold</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Make warmer</p>
              </div>
            </button>

            <button
              onClick={() => handleSend("Request: It's Too Hot (Please Turn Up A/C) ❄️")}
              className="p-3.5 sm:p-4 rounded-2xl bg-sky-500/5 hover:bg-sky-500/10 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-108 transition-transform shrink-0">
                <Snowflake className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-sky-900 dark:text-sky-200">It's Too Hot</p>
                <p className="text-xs text-sky-700 dark:text-sky-400">Make cooler</p>
              </div>
            </button>

            <button
              onClick={() => handleSend('Request: Crack Rear Window for Fresh Air 🪟')}
              className="p-3.5 sm:p-4 rounded-2xl bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 transition-all active:scale-96 cursor-pointer text-left flex items-start gap-3.5 group min-h-[74px]"
            >
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 group-hover:scale-108 transition-transform shrink-0">
                <Wind className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200">Crack Window</p>
                <p className="text-xs text-teal-700 dark:text-teal-400">Fresh air breeze</p>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Amenities & Comfort Presets */}
        <div className="space-y-2.5">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
            In-Cabin Amenities
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSend('Request: Need Phone Charging Cable (USB-C / iPhone) 🔌')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-left transition-all active:scale-97 cursor-pointer flex items-center gap-3 min-h-[60px]"
            >
              <BatteryCharging className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Phone Charging Cable</p>
                <p className="text-xs text-slate-400">USB-C or iPhone Lightning</p>
              </div>
            </button>

            <button
              onClick={() => handleSend('Request: Bottled Water Request 💧')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-left transition-all active:scale-97 cursor-pointer flex items-center gap-3 min-h-[60px]"
            >
              <Droplets className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Chilled Bottled Water</p>
                <p className="text-xs text-slate-400">Complimentary spring water</p>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Or Any Other Request (Custom input & quick chips) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Or Any Other Request</span>
          </div>

          {/* Quick suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(`Request: ${chip}`)}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer min-h-[36px]"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Custom text form */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2.5 pt-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type any other request (e.g. Can we stop by an ATM?)..."
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 min-h-[48px]"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 font-extrabold text-sm tracking-tight transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
