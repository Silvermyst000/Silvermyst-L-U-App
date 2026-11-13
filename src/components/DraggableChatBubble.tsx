import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DriverProfile, CabinMessage, SupportedLanguage } from '../types/kiosk';
import { playCabinChime } from '../utils/cabinAudio';
import { KIOSK_TRANSLATIONS } from '../data/cabinThemes';

interface DraggableChatBubbleProps {
  driver: DriverProfile;
  messages: CabinMessage[];
  onSendMessage: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
  language?: SupportedLanguage;
  isDismissed?: boolean;
  onDismiss?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const COMMON_EMOJIS = ['😊', '👍', '🙏', '❤️', '❄️', '🔥', '🎵', '🥤', '🔌', '⭐', '✨', '🚗', '👋', '✈️'];

export const DraggableChatBubble: React.FC<DraggableChatBubbleProps> = ({
  driver,
  messages,
  onSendMessage,
  language = 'en',
  isDismissed: controlledDismissed,
  onDismiss,
  isOpen: controlledOpen,
  onOpenChange,
}) => {
  const t = KIOSK_TRANSLATIONS[language] || KIOSK_TRANSLATIONS.en;
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [unreadCount, setUnreadCount] = useState(1);
  const [internalClosed, setInternalClosed] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof val === 'function' ? val(isOpen) : val;
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  const isClosed = controlledDismissed !== undefined ? controlledDismissed : internalClosed;
  const dismissBubble = () => {
    setInternalClosed(true);
    setInternalOpen(false);
    onOpenChange?.(false);
    onDismiss?.();
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isOverDismissZone, setIsOverDismissZone] = useState(false);

  // Position state (defaults to bottom-left of kiosk)
  const getDefaultBottomLeft = () => ({
    x: 20,
    y: typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 104) : 650,
  });

  const [position, setPosition] = useState(getDefaultBottomLeft);
  const isDraggingRef = useRef(false);
  const isOverDismissRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialBubblePos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const timerRef = useRef<any>(null);

  // Clamping within viewport
  const clampPosition = (x: number, y: number) => {
    const maxX = window.innerWidth - 76;
    const maxY = window.innerHeight - 76;
    return {
      x: Math.max(16, Math.min(x, maxX)),
      y: Math.max(76, Math.min(y, maxY)),
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dismiss target center coordinates (bottom-middle of screen)
  const getDismissTargetCenter = () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight - 58,
  });

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    isOverDismissRef.current = false;
    setIsOverDismissZone(false);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialBubblePos.current = { ...position };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }
    const newPos = clampPosition(initialBubblePos.current.x + dx, initialBubblePos.current.y + dy);

    // Check proximity to bottom-middle X dismiss target
    const bubbleCenterX = newPos.x + 30;
    const bubbleCenterY = newPos.y + 30;
    const target = getDismissTargetCenter();
    const dist = Math.hypot(bubbleCenterX - target.x, bubbleCenterY - target.y);
    const overTarget = hasMovedRef.current && dist < 84;

    isOverDismissRef.current = overTarget;
    setIsOverDismissZone(overTarget);

    if (overTarget) {
      // Gently snap bubble center to the X target for tactile Messenger feel
      setPosition({
        x: target.x - 30,
        y: target.y - 30,
      });
    } else {
      setPosition(newPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (hasMovedRef.current && isOverDismissRef.current) {
      // Dropped onto middle X zone -> completely hide bubble & reset default position for next restore
      playCabinChime('tap');
      isOverDismissRef.current = false;
      setIsOverDismissZone(false);
      dismissBubble();
      setPosition(getDefaultBottomLeft());
      return;
    }

    isOverDismissRef.current = false;
    setIsOverDismissZone(false);

    // If tapped without dragging, toggle open chat window
    if (!hasMovedRef.current) {
      playCabinChime('tap');
      setIsOpen((prev) => !prev);
      setUnreadCount(0);
    }
  };

  // Push-to-talk voice notes simulation
  const handleToggleVoiceRecord = () => {
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
      playCabinChime('acknowledged');
      // Dispatch simulated voice audio note
      onSendMessage({
        type: 'custom',
        text: `🎤 Voice Message (${recordingSeconds || 1}s)`,
        audioDuration: recordingSeconds || 2,
        category: 'other',
      });
      setRecordingSeconds(0);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playCabinChime('tap');
    onSendMessage({
      type: 'custom',
      text: inputText.trim(),
      category: 'other',
    });
    setInputText('');
    setIsEmojiPickerOpen(false);
  };

  const handleAddEmoji = (emoji: string) => {
    playCabinChime('tap');
    setInputText((prev) => prev + emoji);
  };

  // Once dragged to the middle X, completely disappear so passengers see everything underneath.
  // Reactivated via the header Driver Chat icon/button.
  if (isClosed) {
    return null;
  }

  return (
    <>
      {/* Facebook Messenger Style Bottom-Center Dismiss X Target (Appears while dragging) */}
      {isDragging && (
        <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none flex flex-col items-center justify-end pb-6 animate-fade-in">
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="relative flex flex-col items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all duration-150 ${
                isOverDismissZone
                  ? 'bg-rose-600 text-white shadow-lg scale-105'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-700'
              }`}
            >
              {isOverDismissZone
                ? language === 'es'
                  ? 'Suelta para cerrar el chat'
                  : language === 'fr'
                  ? 'Relâchez pour fermer'
                  : language === 'de'
                  ? 'Loslassen zum Schließen'
                  : 'Release to Close Chat'
                : language === 'es'
                ? 'Arrastra aquí para cerrar'
                : language === 'fr'
                ? 'Glisser ici pour fermer'
                : language === 'de'
                ? 'Hierher ziehen zum Schließen'
                : 'Drag here to close'}
            </span>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
                isOverDismissZone
                  ? 'bg-rose-600 border-white text-white scale-125 shadow-[0_0_35px_rgba(244,63,94,0.85)]'
                  : 'bg-slate-950/85 border-white/60 text-white scale-100 shadow-2xl'
              }`}
            >
              <X className="w-8 h-8 stroke-[2.75]" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Facebook-Style Chat Head Bubble */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className={`fixed z-40 touch-none select-none transition-transform duration-100 ${
          isOverDismissZone ? 'scale-90 opacity-90' : 'scale-100 opacity-100'
        }`}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative group cursor-grab active:cursor-grabbing"
          title={t.requestsAndChatTitle}
        >
          {/* Driver Avatar Ring */}
          <div className="w-15 h-15 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-indigo-500 to-sky-400 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 relative">
            <img
              src={driver.avatarUrl || '/assets/aistudio/1672373005387_54b82b85.jpg'}
              alt={driver.name}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900 pointer-events-none"
            />
            {/* Online Green Indicator */}
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
            {/* Unread Message Badge */}
            {unreadCount > 0 && !isOpen && !isDragging && (
              <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white border border-white shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Quick Close Button on Hover */}
          {!isDragging && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                playCabinChime('tap');
                dismissBubble();
              }}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md cursor-pointer"
              title="Close chat bubble"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          style={{
            left: Math.max(16, Math.min(position.x, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 396)),
            bottom: Math.max(16, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - position.y + 10, (typeof window !== 'undefined' ? window.innerHeight : 800) - 500)),
          }}
          className="fixed z-40 w-84 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[480px] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-purple-500/30 dark:border-purple-800/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={driver.avatarUrl || '/assets/aistudio/1672373005387_54b82b85.jpg'}
                alt={driver.name}
                className="w-9 h-9 rounded-full object-cover border border-white/60"
              />
              <div>
                <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                  <span>{driver.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200">
                    {t.hostOnline}
                  </span>
                </div>
                <div className="text-[10px] text-purple-200 truncate max-w-[190px]">
                  {driver.vehicleModel} • {t.driverChat}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  playCabinChime('tap');
                  dismissBubble();
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                title="Close chat bubble"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Pre-set Buttons */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <button
              onClick={() => {
                onSendMessage({ type: 'comfort', text: `${t.tooHot} ❄️`, category: 'too-hot' });
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              ❄️ {t.tooHot}
            </button>
            <button
              onClick={() => {
                onSendMessage({ type: 'comfort', text: `${t.tooCold} 🔥`, category: 'too-cold' });
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              🔥 {t.tooCold}
            </button>
            <button
              onClick={() => {
                onSendMessage({ type: 'comfort', text: `${t.raiseVol} 🔊`, category: 'volume-up' });
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              🔊 {t.raiseVol}
            </button>
            <button
              onClick={() => {
                onSendMessage({ type: 'comfort', text: `${t.bottledWater} 🥤`, category: 'water' });
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              🥤 {t.bottledWater}
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50 dark:bg-slate-900/40 text-xs">
            {/* Greeting */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <img
                src={driver.avatarUrl || '/assets/aistudio/1672373005387_54b82b85.jpg'}
                alt={driver.name}
                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs leading-relaxed">
                {t.greetingBubble}
              </div>
            </div>

            {messages.map((m) => (
              <div key={m.id} className="flex flex-col items-end space-y-0.5">
                <div className="max-w-[85%] p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs shadow-xs leading-relaxed">
                  {m.text}
                  {m.audioDuration && (
                    <div className="mt-1 pt-1 border-t border-white/20 flex items-center gap-1.5 text-[10px] text-purple-200">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Audio Note ({m.audioDuration}s)</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 capitalize">
                  {m.status === 'acknowledged' ? '✓ Acknowledged' : m.status}
                </span>
              </div>
            ))}
          </div>

          {/* Emoji Bar */}
          {isEmojiPickerOpen && (
            <div className="p-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddEmoji(emoji)}
                  className="p-1 text-base hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input & Voice Controls */}
          <form onSubmit={handleSendText} className="p-2.5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isEmojiPickerOpen
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 border-purple-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
              title="Add Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Push to talk voice note */}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-400'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200'
              }`}
              title={isRecording ? 'Tap to finish & send audio' : 'Tap to send voice note'}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-indigo-500" />}
              {isRecording && <span>{recordingSeconds}s</span>}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.typeMessagePlaceholder}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40 hover:brightness-110 cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
