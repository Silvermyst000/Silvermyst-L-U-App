import React, { useState, useRef } from 'react';
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
  Smile,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Compass,
  Navigation,
  Briefcase,
} from 'lucide-react';
import { CabinMessage, SupportedLanguage } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';
import { KIOSK_TRANSLATIONS } from '../data/cabinThemes';

interface ComfortAndMessagesProps {
  messages: CabinMessage[];
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
  driverName?: string;
  language?: SupportedLanguage;
  easyView?: boolean;
}

const CABIN_EMOJIS = ['😊', '👍', '🙏', '❤️', '❄️', '🔥', '🎵', '🥤', '🔌', '⭐', '🪟', '🚗'];

export const ComfortAndMessages: React.FC<ComfortAndMessagesProps> = ({
  messages,
  onSendMessage,
  driverName = 'Carlos',
  language = 'en',
  easyView = false,
}) => {
  const [customText, setCustomText] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const presetStripRef = useRef<HTMLDivElement>(null);

  const t = KIOSK_TRANSLATIONS[language] || KIOSK_TRANSLATIONS.en;

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleToggleVoice = () => {
    if (!isRecording) {
      playCabinChime('tap');
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setIsRecording(false);
      const dur = recordingSeconds || 2;
      playCabinChime('acknowledged');
      onSendMessage({
        type: 'custom',
        text: `🎤 Voice Message (${dur}s)`,
        audioDuration: dur,
      });
      setFeedbackNotice(`🎤 (${dur}s) → ${driverName}`);
      setRecordingSeconds(0);
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  const comfortPresets = [
    {
      id: 'raise-vol',
      title: `${t.raiseVol} 🔊`,
      subtitle: t.raiseVolSub,
      icon: <Volume2 className="w-4.5 h-4.5 text-sky-400" />,
    },
    {
      id: 'lower-vol',
      title: `${t.lowerVol} 🔉`,
      subtitle: t.lowerVolSub,
      icon: <Volume1 className="w-4.5 h-4.5 text-blue-400" />,
    },
    {
      id: 'too-cold',
      title: `${t.tooCold} 🌡️`,
      subtitle: t.tooColdSub,
      icon: <Flame className="w-4.5 h-4.5 text-amber-500" />,
    },
    {
      id: 'too-hot',
      title: `${t.tooHot} ❄️`,
      subtitle: t.tooHotSub,
      icon: <Snowflake className="w-4.5 h-4.5 text-sky-400" />,
    },
    {
      id: 'window',
      title: `${t.crackWindow} 🪟`,
      subtitle: t.crackWindowSub,
      icon: <Wind className="w-4.5 h-4.5 text-teal-400" />,
    },
    {
      id: 'quiet',
      title: `${t.quietRide} 🤫`,
      subtitle: t.quietRideSub,
      icon: <VolumeX className="w-4.5 h-4.5 text-indigo-400" />,
    },
    {
      id: 'charger',
      title: `${t.phoneCable} 🔌`,
      subtitle: t.phoneCableSub,
      icon: <BatteryCharging className="w-4.5 h-4.5 text-emerald-400" />,
    },
    {
      id: 'water',
      title: `${t.bottledWater} 💧`,
      subtitle: t.bottledWaterSub,
      icon: <Droplets className="w-4.5 h-4.5 text-blue-400" />,
    },
    {
      id: 'scenic',
      title: language === 'es' ? 'Ruta Panorámica 🗺️' : 'Scenic Route 🗺️',
      subtitle: language === 'es' ? 'Ver lugares locales' : 'See local highlights',
      icon: <Compass className="w-4.5 h-4.5 text-amber-400" />,
    },
    {
      id: 'express',
      title: language === 'es' ? 'Ruta Rápida ⚡' : 'Fastest Route ⚡',
      subtitle: language === 'es' ? 'Llegar antes' : 'Priority highway',
      icon: <Navigation className="w-4.5 h-4.5 text-emerald-400" />,
    },
    {
      id: 'luggage',
      title: language === 'es' ? 'Ayuda Equipaje 🧳' : 'Luggage Help 🧳',
      subtitle: language === 'es' ? 'Al bajar del auto' : 'Assistance at drop-off',
      icon: <Briefcase className="w-4.5 h-4.5 text-purple-400" />,
    },
  ];

  const scrollPresets = (direction: 'left' | 'right') => {
    playCabinChime('tap');
    if (!presetStripRef.current) return;
    presetStripRef.current.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };

  const quickChips =
    language === 'es'
      ? ['Parada rápida en cajero / tienda', 'Necesito ir al baño', 'Cable Aux / Bluetooth', 'Ayuda con equipaje']
      : language === 'fr'
      ? ['Arrêt rapide DAB / magasin', 'Pause toilettes', 'Câble Aux / Bluetooth', 'Aide bagages']
      : language === 'de'
      ? ['Kurzer Stopp', 'Toilettenpause', 'Aux / Bluetooth', 'Gepäckhilfe']
      : ['Quick stop at ATM / store', 'Restroom break needed', 'Aux cable / Bluetooth connect', 'Luggage help at destination'];

  const handleSendPreset = (preset: typeof comfortPresets[0]) => {
    playCabinChime('comfort');
    onSendMessage({
      type: 'comfort',
      text: preset.title,
    });
    setFeedbackNotice(`→ ${driverName}: "${preset.title}"`);
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
    setFeedbackNotice(`→ ${driverName}: "${customText.trim()}"`);
    setCustomText('');
    setShowEmojis(false);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden">
      {/* Compact Horizontal Scrollable 1-Tap Request Buttons with Left / Right Arrows */}
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-display flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-sky-500" />
            <span>{t.oneTapRequests}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-[11px] text-slate-400 mr-1">
              {t.driverNotified}
            </span>
            <button
              type="button"
              onClick={() => scrollPresets('left')}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs active:scale-95"
              title="Scroll requests left"
              aria-label="Scroll request buttons left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollPresets('right')}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs active:scale-95"
              title="Scroll requests right"
              aria-label="Scroll request buttons right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={presetStripRef}
          className="flex items-stretch gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-1"
        >
          {comfortPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSendPreset(preset)}
              className={`flex items-center gap-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all active:scale-98 cursor-pointer shrink-0 shadow-xs group ${
                easyView ? 'p-3.5 min-h-[72px] w-[225px] sm:w-[245px]' : 'p-2.5 min-h-[56px] w-[178px] sm:w-[192px]'
              }`}
            >
              <div className={`${easyView ? 'w-11 h-11' : 'w-9 h-9'} rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                {preset.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`${easyView ? 'text-sm sm:text-base' : 'text-xs sm:text-[13px]'} font-bold text-slate-800 dark:text-slate-100 truncate`}>
                  {preset.title}
                </p>
                {!easyView && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {preset.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation feedback alert */}
      {feedbackNotice && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fadeIn shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">{feedbackNotice}</span>
        </div>
      )}

      {/* Spacious Direct Driver Chat & Custom Requests Form */}
      <div className="flex-1 min-h-0 flex flex-col p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{t.directChatSection}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
            {driverName} • {t.hostOnline}
          </span>
        </div>

        {/* Generous Scrollable Live Chat Stream */}
        <div className={`flex-1 min-h-[110px] overflow-y-auto space-y-2 p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800 pr-2 ${easyView ? 'text-sm sm:text-base' : 'text-xs'}`}>
          <div className="flex items-start gap-2 max-w-[92%]">
            <div className={`${easyView ? 'p-3.5' : 'p-2.5'} rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed`}>
              {t.greetingBubble}
            </div>
          </div>

          {messages.slice(0, 12).map((msg) => (
            <div key={msg.id} className="flex flex-col items-end space-y-0.5">
              <div className={`max-w-[85%] rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs ${easyView ? 'p-3.5' : 'p-2.5'}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                {msg.status === 'acknowledged' ? (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {driverName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sky-400">
                    <Clock className="w-3 h-3" /> Sent to {driverName}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Quick chip suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 pb-0.5">
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
                setFeedbackNotice(`→ ${driverName}: "${chip}"`);
                setTimeout(() => setFeedbackNotice(null), 3500);
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            >
              + {chip}
            </button>
          ))}
        </div>

        {showEmojis && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
            {CABIN_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  setCustomText((prev) => prev + em);
                }}
                className="text-base px-1 hover:scale-125 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendCustom} className="flex gap-2 pt-0.5 items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              playCabinChime('tap');
              setShowEmojis(!showEmojis);
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[44px] ${
              showEmojis
                ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-400 text-sky-600 dark:text-sky-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Add Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`px-2.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 min-h-[44px] ${
              isRecording
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-indigo-500'
            }`}
            title={isRecording ? 'Tap to stop & send audio' : 'Record Voice Note'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording && <span>{recordingSeconds}s</span>}
          </button>

          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t.typeMessagePlaceholder}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 font-extrabold text-sm tracking-tight transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>{t.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
