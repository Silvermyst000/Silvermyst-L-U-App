import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Thermometer,
  Wind,
  Coffee,
  MessageSquare,
  Check,
  Send,
  X,
  Compass,
  Zap,
  Music,
  Smile,
} from 'lucide-react';
import { RidePreferenceSelection } from '../../types/kiosk';
import { playCabinChime } from '../../utils/cabinAudio';

interface RidePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prefs: RidePreferenceSelection) => void;
  driverName?: string;
}

export const RidePreferencesModal: React.FC<RidePreferencesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  driverName = 'Carlos',
}) => {
  const [atmosphere, setAtmosphere] = useState<RidePreferenceSelection['atmosphere']>('quiet');
  const [musicVibe, setMusicVibe] = useState<RidePreferenceSelection['musicVibe']>('synthwave');
  const [temperature, setTemperature] = useState<RidePreferenceSelection['temperature']>('standard');
  const [windowSetting, setWindowSetting] = useState<RidePreferenceSelection['windowSetting']>('closed_ac');
  const [refreshments, setRefreshments] = useState<RidePreferenceSelection['refreshments']>(['cold_water']);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleRefreshment = (item: 'cold_water' | 'charger_lightning' | 'charger_usbc' | 'mints') => {
    playCabinChime('tap');
    setRefreshments((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCabinChime('acknowledged');
    const prefs: RidePreferenceSelection = {
      atmosphere,
      musicVibe,
      temperature,
      targetTempF: temperature === 'cooler' ? 68 : temperature === 'warmer' ? 74 : 71,
      windowSetting,
      refreshments,
      additionalNotes: additionalNotes.trim(),
      submittedAt: Date.now(),
    };
    onSubmit(prefs);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] bg-slate-950 text-white rounded-3xl border border-purple-800/60 shadow-[0_0_50px_rgba(147,51,234,0.25)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Personalize Your Ride</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Cabin Concierge
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Let {driverName} tailor your in-cabin comfort, music vibe, and atmosphere.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-white">Preferences Dispatched!</h4>
            <p className="text-sm text-slate-300 max-w-md">
              {driverName} has received your ride comfort selections. Sit back, relax, and enjoy the Silvermyst Ride Experience.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. In-Cabin Atmosphere */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Smile className="w-4 h-4 text-purple-400" />
                <span>1. In-Cabin Atmosphere</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'quiet',
                    label: 'Quiet Ride',
                    desc: 'Rest, work, or relax in tranquil quiet.',
                    icon: <VolumeX className="w-5 h-5 text-indigo-400" />,
                  },
                  {
                    id: 'conversation',
                    label: 'Conversation Welcome',
                    desc: 'Friendly chat & local highlights.',
                    icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
                  },
                  {
                    id: 'tour_guide',
                    label: 'Tour Guide Mode',
                    desc: 'Insights into South Bend & landmark spots.',
                    icon: <Compass className="w-5 h-5 text-amber-400" />,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setAtmosphere(item.id as any);
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      atmosphere === item.id
                        ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {item.icon}
                      {atmosphere === item.id && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <span className="text-[11px] text-slate-400 leading-snug">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Music & Sound Vibe */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>2. Cabin Music Vibe</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'synthwave', label: 'Silvermyst Synthwave 🌌' },
                  { id: 'top_hits', label: 'Top Hits 2026 🎵' },
                  { id: 'jazz', label: 'Smooth Jazz & Lo-Fi 🎷' },
                  { id: 'passenger_choice', label: 'My Spotify Request 📱' },
                  { id: 'driver_choice', label: "Driver's Favorites 📻" },
                  { id: 'silent', label: 'No Music / Silent 🔇' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setMusicVibe(item.id as any);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                      musicVibe === item.id
                        ? 'bg-purple-900/50 border-purple-400 text-white ring-1 ring-purple-400/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    {musicVibe === item.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Climate & Temperature */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-purple-400" />
                <span>3. Climate Adjustment</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'cooler', label: 'Cooler ❄️', temp: '68°F (Fresh A/C)' },
                  { id: 'standard', label: 'Comfortable 🌤️', temp: '71°F (Preset Standard)' },
                  { id: 'warmer', label: 'Warmer 🔥', temp: '74°F (Cozy Warmth)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setTemperature(item.id as any);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      temperature === item.id
                        ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.temp}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Windows & Fresh Air */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Wind className="w-4 h-4 text-purple-400" />
                <span>4. Windows & Fresh Air</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'closed_ac', label: 'Windows Closed / A/C 🪟', desc: 'Quiet cabin aerodynamic flow' },
                  { id: 'cracked_fresh_air', label: 'Cracked for Fresh Air 🍃', desc: 'Slight breeze & outdoor air' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setWindowSetting(item.id as any);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      windowSetting === item.id
                        ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. In-Seat Amenities */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>5. In-Seat Amenities Available</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cold_water', label: 'Cold Bottled Water 💧' },
                  { id: 'charger_usbc', label: 'USB-C Fast Cable ⚡' },
                  { id: 'charger_lightning', label: 'Apple Lightning ⚡' },
                  { id: 'mints', label: 'Refreshing Mints 🍬' },
                ].map((item) => {
                  const isChecked = refreshments.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRefreshment(item.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-purple-900/40 border-purple-400 text-purple-200 ring-1 ring-purple-400/40'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-purple-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Additional Notes / Special Requests (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Taking an important phone call at 2:30 PM..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-900">
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send to {driverName}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
