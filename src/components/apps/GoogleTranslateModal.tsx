import React, { useEffect, useState } from 'react';
import {
  Globe,
  X,
  Volume2,
  ArrowRightLeft,
  ExternalLink,
  Languages,
  Check,
  Send,
  Square,
  Gauge,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { SupportedLanguage } from '../../types/kiosk';
import {
  isSpeechSupported,
  speakText,
  stopSpeech,
  TtsLanguage,
} from '../../utils/speechTts';
import {
  translateText,
  TRANSLATE_LANGUAGE_OPTIONS,
  TranslateSourceLang,
  TranslateTargetLang,
} from '../../utils/translator';

interface GoogleTranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onSendCabinMessage?: (text: string) => void;
}

const COMMON_CABIN_PHRASES: Array<Record<SupportedLanguage, string>> = [
  {
    en: 'Welcome aboard! Let me know if you need temperature adjustment or charging cables.',
    es: '¡Bienvenido a bordo! Avíseme si necesita ajustar la temperatura o cables de carga.',
    fr: 'Bienvenue à bord ! Faites-moi savoir si vous avez besoin d\'ajuster la température ou de câbles de charge.',
    de: 'Willkommen an Bord! Lassen Sie mich wissen, wenn Sie eine Temperaturanpassung oder Ladekabel benötigen.',
  },
  {
    en: 'Could we please turn down the air conditioning a little bit?',
    es: '¿Podríamos bajar un poco el aire acondicionado por favor?',
    fr: 'Pourrions-nous baisser un peu la climatisation s\'il vous plaît ?',
    de: 'Könnten wir bitte die Klimaanlage etwas herunterdrehen?',
  },
  {
    en: 'Where are we headed today? Any preferred highway or local route?',
    es: '¿Hacia dónde nos dirigimos hoy? ¿Alguna ruta preferida por autopista o local?',
    fr: 'Où allons-nous aujourd\'hui ? Un itinéraire préféré par autoroute ou local ?',
    de: 'Wohin fahren wir heute? Bevorzugen Sie die Autobahn oder eine lokale Route?',
  },
  {
    en: 'Thank you for riding with Silvermyst Multiservices!',
    es: '¡Gracias por viajar con Silvermyst Multiservices!',
    fr: 'Merci d\'avoir voyagé avec Silvermyst Multiservices !',
    de: 'Vielen Dank, dass Sie mit Silvermyst Multiservices gefahren sind!',
  },
];

export const GoogleTranslateModal: React.FC<GoogleTranslateModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  onSendCabinMessage,
}) => {
  const [sourceLang, setSourceLang] = useState<TranslateSourceLang>('auto');
  const [targetLang, setTargetLang] = useState<TranslateTargetLang>('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Text-to-Speech (TTS) state
  const [speakingSlot, setSpeakingSlot] = useState<'source' | 'target' | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.96);
  const [autoSpeakTranslation, setAutoSpeakTranslation] = useState<boolean>(true);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const ttsSupported = isSpeechSupported();

  // Ensure browser speech synthesis voices initialize cleanly and stop speech on unmount/close
  useEffect(() => {
    if (ttsSupported) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
        stopSpeech();
      };
    }
    return undefined;
  }, [ttsSupported]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setSpeakingSlot(null);
      setTtsNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLanguageName = (code: TranslateSourceLang): string => {
    if (code === 'auto') {
      if (detectedLang) {
        const found = TRANSLATE_LANGUAGE_OPTIONS.find((l) => l.code === detectedLang);
        return found ? `Detected: ${found.label}` : `Detected (${detectedLang.toUpperCase()})`;
      }
      return 'Auto-Detect Language';
    }
    return TRANSLATE_LANGUAGE_OPTIONS.find((l) => l.code === code)?.nativeLabel || code.toUpperCase();
  };

  const handleSpeak = (text: string, lang: TtsLanguage, slot: 'source' | 'target') => {
    playCabinChime('tap');
    setTtsNotice(null);

    if (speakingSlot === slot) {
      stopSpeech();
      setSpeakingSlot(null);
      return;
    }

    const effectiveLang =
      lang === 'auto' ? ((detectedLang as TtsLanguage) || 'en') : lang;

    speakText({
      text,
      lang: effectiveLang,
      rate: speechRate,
      onStart: () => setSpeakingSlot(slot),
      onEnd: () => setSpeakingSlot((prev) => (prev === slot ? null : prev)),
      onError: (reason) => {
        setSpeakingSlot(null);
        setTtsNotice(reason);
      },
    });
  };

  const handleSwap = () => {
    playCabinChime('tap');
    stopSpeech();
    setSpeakingSlot(null);
    const resolvedSource: TranslateTargetLang =
      sourceLang === 'auto'
        ? ((detectedLang as TranslateTargetLang) || 'en')
        : sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(resolvedSource === prevTarget ? 'en' : resolvedSource);
    setDetectedLang(null);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleTranslate = async () => {
    const cleaned = sourceText.trim();
    if (!cleaned) return;
    playCabinChime('tap');
    setIsTranslating(true);
    setTtsNotice(null);

    const res = await translateText(cleaned, sourceLang, targetLang);
    setIsTranslating(false);

    if (res.error && !res.translatedText) {
      setTtsNotice(res.error);
      return;
    }

    setTranslatedText(res.translatedText);
    if (res.detectedSourceLang) {
      setDetectedLang(res.detectedSourceLang);
    }

    if (autoSpeakTranslation && res.translatedText && ttsSupported) {
      speakText({
        text: res.translatedText,
        lang: targetLang as TtsLanguage,
        rate: speechRate,
        onStart: () => setSpeakingSlot('target'),
        onEnd: () => setSpeakingSlot((prev) => (prev === 'target' ? null : prev)),
        onError: (reason) => {
          setSpeakingSlot(null);
          setTtsNotice(reason);
        },
      });
    }
  };

  const phraseSourceCode: SupportedLanguage =
    sourceLang === 'es' || sourceLang === 'fr' || sourceLang === 'de' ? sourceLang : 'en';
  const phraseTargetCode: SupportedLanguage =
    targetLang === 'es' || targetLang === 'fr' || targetLang === 'de' ? targetLang : 'es';

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        stopSpeech();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl border border-sky-500/40 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Google Translate &amp; Voice TTS Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30">
                  Live Translate + Voice
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type any message to translate instantly, or switch kiosk system language below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playCabinChime('tap');
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Full System Language Switcher */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-sky-500" />
              <span>Change System Kiosk Language:</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active: <strong className="text-sky-500 uppercase">{currentLanguage}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { code: 'en' as SupportedLanguage, label: '🇺🇸 English', desc: 'Default Kiosk' },
              { code: 'es' as SupportedLanguage, label: '🇲🇽 Español', desc: 'Traducir Sistema' },
              { code: 'fr' as SupportedLanguage, label: '🇫🇷 Français', desc: 'Traduire Système' },
              { code: 'de' as SupportedLanguage, label: '🇩🇪 Deutsch', desc: 'System Deutsch' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  playCabinChime('acknowledged');
                  onSelectLanguage(item.code);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentLanguage === item.code
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>{item.label}</span>
                  {currentLanguage === item.code && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text-to-Speech Controls Strip */}
        <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-300">
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>Text-to-Speech Controls</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1">
              <Gauge className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Speed:</span>
              {[
                { label: '0.8x', value: 0.8 },
                { label: '1.0x', value: 0.96 },
                { label: '1.2x', value: 1.2 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setSpeechRate(opt.value);
                  }}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                    speechRate === opt.value
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playCabinChime('tap');
                setAutoSpeakTranslation((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${
                autoSpeakTranslation
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              Auto-Speak: {autoSpeakTranslation ? 'ON' : 'OFF'}
            </button>

            {speakingSlot && (
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setSpeakingSlot(null);
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Audio</span>
              </button>
            )}
          </div>
        </div>

        {ttsNotice && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{ttsNotice}</span>
          </div>
        )}

        {/* Live Translation Pair Interface */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <select
              value={sourceLang}
              onChange={(e) => {
                setSourceLang(e.target.value as TranslateSourceLang);
                setDetectedLang(null);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="auto">Auto-Detect Language</option>
              {TRANSLATE_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as TranslateTargetLang)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {TRANSLATE_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Input Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Type Phrase ({getLanguageName(sourceLang)})
              </label>
              <textarea
                rows={3}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder="Type any sentence or question in any language..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 resize-none"
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSpeak(sourceText, sourceLang as TtsLanguage, 'source')}
                  disabled={!sourceText.trim() || !ttsSupported}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors disabled:opacity-40 cursor-pointer ${
                    speakingSlot === 'source'
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      : 'text-sky-500 hover:bg-sky-500/10'
                  }`}
                >
                  {speakingSlot === 'source' ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Speaking</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak Source</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isTranslating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                </button>
              </div>
            </div>

            {/* Output Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Translation ({getLanguageName(targetLang)})
              </label>
              <div className="min-h-[85px] p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                {isTranslating ? (
                  <span className="text-slate-400 italic flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Translating...
                  </span>
                ) : translatedText ? (
                  translatedText
                ) : (
                  <span className="text-slate-400 italic">Translation will appear here</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSpeak(translatedText, targetLang as TtsLanguage, 'target')}
                  disabled={!translatedText || !ttsSupported}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors disabled:opacity-40 cursor-pointer ${
                    speakingSlot === 'target'
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      : 'text-sky-500 hover:bg-sky-500/10'
                  }`}
                >
                  {speakingSlot === 'target' ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak Translation</span>
                    </>
                  )}
                </button>
                {onSendCabinMessage && translatedText && (
                  <button
                    type="button"
                    onClick={() => {
                      playCabinChime('acknowledged');
                      onSendCabinMessage(`Translated Message: "${translatedText}"`);
                      stopSpeech();
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Driver</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Common In-Cabin Phrases with Direct TTS Play */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Instant In-Cabin Travel Phrases (Tap to Load &amp; Speak):</span>
            <a
              href={`https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(sourceText || 'Hello')}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:underline flex items-center gap-1"
            >
              <span>Full Google Translate Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {COMMON_CABIN_PHRASES.map((phrase, idx) => (
              <div
                key={idx}
                onClick={async () => {
                  const chosenSource = phrase[phraseSourceCode];
                  setSourceText(chosenSource);
                  if (phraseTargetCode === targetLang) {
                    setTranslatedText(phrase[phraseTargetCode]);
                    if (autoSpeakTranslation && ttsSupported) {
                      speakText({
                        text: phrase[phraseTargetCode],
                        lang: targetLang as TtsLanguage,
                        rate: speechRate,
                        onStart: () => setSpeakingSlot('target'),
                        onEnd: () => setSpeakingSlot((prev) => (prev === 'target' ? null : prev)),
                      });
                    }
                  } else {
                    setIsTranslating(true);
                    const res = await translateText(chosenSource, phraseSourceCode, targetLang);
                    setIsTranslating(false);
                    if (res.translatedText) {
                      setTranslatedText(res.translatedText);
                      if (autoSpeakTranslation && ttsSupported) {
                        speakText({
                          text: res.translatedText,
                          lang: targetLang as TtsLanguage,
                          rate: speechRate,
                          onStart: () => setSpeakingSlot('target'),
                          onEnd: () => setSpeakingSlot((prev) => (prev === 'target' ? null : prev)),
                        });
                      }
                    }
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                  {phrase[phraseSourceCode]}
                </div>
                <div className="text-[11px] text-sky-600 dark:text-sky-400 flex items-center justify-between gap-2">
                  <span className="line-clamp-1">{phrase[phraseTargetCode]}</span>
                  <Volume2 className="w-3.5 h-3.5 shrink-0 opacity-75" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
