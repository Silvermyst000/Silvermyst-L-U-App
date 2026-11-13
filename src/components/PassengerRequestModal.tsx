import React, { useState, useRef } from 'react';
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
  MessageCircle,
  Sparkles,
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

interface PassengerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
  messages?: CabinMessage[];
  driverName?: string;
  driverAvatarUrl?: string;
  language?: SupportedLanguage;
}

const REQUEST_EMOJIS = ['😊', '👍', '🙏', '❤️', '❄️', '🔥', '🎵', '🥤', '🔌', '⭐', '🪟', '🚗', '👋', '🎉'];

export const PassengerRequestModal: React.FC<PassengerRequestModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  messages = [],
  driverName = 'Carlos',
  driverAvatarUrl,
  language = 'en',
}) => {
  const [customText, setCustomText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordTimerRef = useRef<any>(null);
  const buttonsCarouselRef = useRef<HTMLDivElement>(null);

  const t = KIOSK_TRANSLATIONS[language] || KIOSK_TRANSLATIONS.en;

  React.useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (!isRecording) {
      playCabinChime('tap');
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
      const dur = recordingSeconds || 2;
      playCabinChime('acknowledged');
      onSendMessage({
        type: 'custom',
        text: `🎤 Voice Message (${dur}s)`,
        audioDuration: dur,
      });
      setSentNotice(`🎤 (${dur}s) → ${driverName}`);
      setRecordingSeconds(0);
      setTimeout(() => setSentNotice(null), 3500);
    }
  };

  const handleSend = (text: string) => {
    playCabinChime('comfort');
    onSendMessage({
      type: 'comfort',
      text,
    });
    setSentNotice(`→ ${driverName}: "${text}"`);
    setTimeout(() => {
      setSentNotice(null);
    }, 3500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    handleSend(customText.trim());
    setCustomText('');
    setShowEmojis(false);
  };

  const scrollButtons = (dir: 'left' | 'right') => {
    playCabinChime('tap');
    if (!buttonsCarouselRef.current) return;
    buttonsCarouselRef.current.scrollBy({
      left: dir === 'left' ? -260 : 260,
      behavior: 'smooth',
    });
  };

  const requestButtons = [
    {
      id: 'raise-vol',
      title: `${t.raiseVol} 🔊`,
      subtitle: t.raiseVolSub,
      icon: <Volume2 className="w-5 h-5 text-sky-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'lower-vol',
      title: `${t.lowerVol} 🔉`,
      subtitle: t.lowerVolSub,
      icon: <Volume1 className="w-5 h-5 text-blue-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'quiet-ride',
      title: `${t.quietRide} 🤫`,
      subtitle: t.quietRideSub,
      icon: <VolumeX className="w-5 h-5 text-indigo-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'too-cold',
      title: `${t.tooCold} 🌡️`,
      subtitle: t.tooColdSub,
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      cardCls: 'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900/50',
    },
    {
      id: 'too-hot',
      title: `${t.tooHot} ❄️`,
      subtitle: t.tooHotSub,
      icon: <Snowflake className="w-5 h-5 text-sky-500" />,
      cardCls: 'bg-sky-500/5 hover:bg-sky-500/10 dark:bg-sky-950/30 dark:hover:bg-sky-950/50 border-sky-200 dark:border-sky-900/50',
    },
    {
      id: 'crack-window',
      title: `${t.crackWindow} 🪟`,
      subtitle: t.crackWindowSub,
      icon: <Wind className="w-5 h-5 text-teal-500" />,
      cardCls: 'bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-950/30 dark:hover:bg-teal-950/50 border-teal-200 dark:border-teal-900/50',
    },
    {
      id: 'phone-cable',
      title: `${t.phoneCable} 🔌`,
      subtitle: t.phoneCableSub,
      icon: <BatteryCharging className="w-5 h-5 text-emerald-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'bottled-water',
      title: `${t.bottledWater} 💧`,
      subtitle: t.bottledWaterSub,
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'scenic-route',
      title: language === 'es' ? 'Ruta Panorámica 🗺️' : 'Scenic Route 🗺️',
      subtitle: language === 'es' ? 'Puntos de interés' : 'See local sights',
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'fast-highway',
      title: language === 'es' ? 'Autopista Rápida ⚡' : 'Express Route ⚡',
      subtitle: language === 'es' ? 'Ruta más directa' : 'Priority highway',
      icon: <Navigation className="w-5 h-5 text-emerald-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'luggage-help',
      title: language === 'es' ? 'Ayuda Equipaje 🧳' : 'Luggage Help 🧳',
      subtitle: language === 'es' ? 'En la parada final' : 'Drop-off help',
      icon: <Briefcase className="w-5 h-5 text-purple-500" />,
      cardCls: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    },
  ];

  const quickChips =
    language === 'es'
      ? ['Parada rápida en cajero / tienda', 'Necesito ir al baño', 'Cable Aux / Conectar Bluetooth', 'Ayuda con equipaje al llegar', 'Ruta rápida por autopista']
      : language === 'fr'
      ? ['Arrêt rapide DAB / magasin', 'Pause toilettes', 'Câble Aux / Bluetooth', 'Aide bagages à l’arrivée', 'Itinéraire autoroute']
      : language === 'de'
      ? ['Kurzer Stopp Geldautomat / Laden', 'Toilettenpause bitte', 'Aux / Bluetooth verbinden', 'Gepäckhilfe am Ziel', 'Autobahn bevorzugen']
      : ['Quick stop at ATM / store', 'Restroom break needed', 'Aux cable / Bluetooth connect', 'Luggage help at destination', 'Smooth highway route'];

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 transition-all animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            {driverAvatarUrl ? (
              <img
                src={driverAvatarUrl}
                alt={driverName}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/70"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span>{t.requestsAndChatTitle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  {t.hostOnline}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.requestsAndChatSub} ({driverName})
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
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <span>{sentNotice}</span>
            </div>
          </div>
        )}

        {/* 1. Compact Horizontal Request Buttons Strip with Left & Right Scroll Arrows */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
              {t.oneTapRequests}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollButtons('left')}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
                title="Scroll left for previous buttons"
                aria-label="Scroll request buttons left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollButtons('right')}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
                title="Scroll right for more buttons"
                aria-label="Scroll request buttons right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={buttonsCarouselRef}
            className="flex items-stretch gap-2.5 overflow-x-auto scrollbar-none scroll-smooth pb-1"
          >
            {requestButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleSend(btn.title)}
                className={`p-3 rounded-2xl border transition-all active:scale-96 cursor-pointer text-left flex items-center gap-2.5 w-[195px] shrink-0 ${btn.cardCls}`}
              >
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 shrink-0 shadow-2xs">
                  {btn.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {btn.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {btn.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Spacious Unified Live Driver Chat & Custom Requests */}
        <div className="flex-1 min-h-0 flex flex-col p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{t.directChatSection}</span>
            </div>
            <span className="text-[11px] text-slate-400">{driverName}</span>
          </div>

          {/* Generous Conversation History Stream */}
          <div className="flex-1 min-h-[175px] overflow-y-auto space-y-2 p-3 rounded-xl bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div className="flex items-start gap-2 max-w-[90%]">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed">
                {t.greetingBubble}
              </div>
            </div>

            {messages.slice(0, 12).map((m) => (
              <div key={m.id} className="flex flex-col items-end space-y-0.5">
                <div className="max-w-[85%] p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 capitalize">
                  {m.status === 'acknowledged' ? `✓ ${driverName}` : m.status}
                </span>
              </div>
            ))}
          </div>

          {/* Quick suggestion chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 pb-0.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Emoji Picker Row */}
          {showEmojis && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
              {REQUEST_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setCustomText((prev) => prev + em);
                  }}
                  className="text-lg px-1.5 py-0.5 hover:scale-125 transition-transform cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* Custom text, emoji & voice audio form */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-0.5 items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                playCabinChime('tap');
                setShowEmojis(!showEmojis);
              }}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[44px] ${
                showEmojis
                  ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-400 text-sky-600 dark:text-sky-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 min-h-[44px] ${
                isRecording
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
              }`}
              title={isRecording ? 'Tap to stop & send audio note' : 'Record Voice Note for Driver'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording && <span>{recordingSeconds}s</span>}
            </button>

            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t.typeMessagePlaceholder}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 font-extrabold text-sm tracking-tight transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              <span>{t.send}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
