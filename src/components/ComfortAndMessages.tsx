import React, { useState } from 'react';
import {
  Volume2,
  Volume1,
  VolumeX,
  Snowflake,
  Flame,
  BatteryCharging,
  Droplets,
  Wind,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { CabinMessage } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';

interface ComfortAndMessagesProps {
  messages: CabinMessage[];
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
}

export const ComfortAndMessages: React.FC<ComfortAndMessagesProps> = ({
  messages,
  onSendMessage,
}) => {
  const [customText, setCustomText] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const comfortPresets = [
    {
      id: 'raise-vol',
      title: 'Raise Volume 🔊',
      subtitle: 'Turn up the music',
      icon: <Volume2 className="w-5 h-5 text-sky-400" />,
      text: 'Request: Please raise the volume 🔊',
    },
    {
      id: 'lower-vol',
      title: 'Lower Volume 🔉',
      subtitle: 'Turn down the music',
      icon: <Volume1 className="w-5 h-5 text-blue-400" />,
      text: 'Request: Please lower the volume 🔉',
    },
    {
      id: 'too-cold',
      title: "It's Too Cold 🌡️",
      subtitle: 'Turn up heat / warmer',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      text: "Request: It's too cold, please turn up heat 🌡️",
    },
    {
      id: 'too-hot',
      title: "It's Too Hot ❄️",
      subtitle: 'Turn up A/C / cooler',
      icon: <Snowflake className="w-5 h-5 text-sky-400" />,
      text: "Request: It's too hot, please turn up A/C ❄️",
    },
    {
      id: 'window',
      title: 'Crack Window 🪟',
      subtitle: 'Fresh air breeze',
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      text: 'Request: Please crack rear window for fresh air 🪟',
    },
    {
      id: 'quiet',
      title: 'Quiet Ride 🤫',
      subtitle: 'Rest or take calls',
      icon: <VolumeX className="w-5 h-5 text-indigo-400" />,
      text: 'Request: Passenger requested quiet cabin mode 🤫',
    },
    {
      id: 'charger',
      title: 'Phone Cable 🔌',
      subtitle: 'USB-C or iPhone cord',
      icon: <BatteryCharging className="w-5 h-5 text-emerald-400" />,
      text: 'Request: Passenger requested charging cable 🔌',
    },
    {
      id: 'water',
      title: 'Bottled Water 💧',
      subtitle: 'Chilled spring water',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      text: 'Request: Passenger requested bottled water 💧',
    },
  ];

  const quickChips = [
    'Quick stop at ATM / store',
    'Restroom break needed',
    'Aux cable / Bluetooth connect',
    'Luggage help at destination',
  ];

  const handleSendPreset = (preset: typeof comfortPresets[0]) => {
    playCabinChime('comfort');
    onSendMessage({
      type: 'comfort',
      text: preset.title,
    });
    setFeedbackNotice(`Sent to Carlos: "${preset.title}"`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    playCabinChime('comfort');
    onSendMessage({
      type: 'custom',
      text: customText.trim(),
    });
    setFeedbackNotice(`Sent to Carlos: "${customText.trim()}"`);
    setCustomText('');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  return (
    <div className="flex flex-col h-full space-y-3.5 overflow-y-auto pr-1">
      {/* 1-Tap Comfort & Volume Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-display flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-500" />
            1-Tap Cabin Requests
          </span>
          <span className="text-xs text-slate-400">Driver notified instantly</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {comfortPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSendPreset(preset)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all active:scale-98 cursor-pointer min-h-[58px] shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {preset.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {preset.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {preset.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation feedback alert */}
      {feedbackNotice && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Or Any Other Request Form */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Or Any Other Request</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">Direct Note to Carlos</span>
        </div>

        {/* Quick chip suggestions */}
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                playCabinChime('comfort');
                onSendMessage({
                  type: 'custom',
                  text: chip,
                });
                setFeedbackNotice(`Sent to Carlos: "${chip}"`);
                setTimeout(() => setFeedbackNotice(null), 3500);
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              + {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendCustom} className="flex gap-2 pt-0.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Can we stop by an ATM? / Smooth ride, thank you!"
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 font-extrabold text-sm tracking-tight transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Real-time Message Log with Carlos acknowledgment */}
      {messages.length > 0 && (
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Recent Requests Log</span>
            <span className="tabular-nums">{messages.length} total</span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {messages.slice(0, 4).map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 truncate pr-2">
                  {msg.text}
                </span>
                <span className="shrink-0 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  {msg.status === 'acknowledged' ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Acknowledged by Carlos
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sky-400">
                      <Clock className="w-3 h-3" /> Sent to Driver
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
