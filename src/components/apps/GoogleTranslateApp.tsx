import React, { useEffect, useState } from 'react';
import {
  Globe,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  ExternalLink,
  Square,
  Gauge,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';
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

interface QuickPhrase {
  en: string;
  es: string;
  fr: string;
  de: string;
  pt: string;
}

const PASSENGER_PHRASES: QuickPhrase[] = [
  {
    en: 'Could you please turn on the air conditioning?',
    es: '¿Podría encender el aire acondicionado, por favor?',
    fr: 'Pourriez-vous allumer la climatisation, s’il vous plaît ?',
    de: 'Könnten Sie bitte die Klimaanlage einschalten?',
    pt: 'Poderia ligar o ar-condicionado, por favor?',
  },
  {
    en: 'How long until we arrive at the airport?',
    es: '¿Cuánto tiempo falta para llegar al aeropuerto?',
    fr: 'Dans combien de temps arrivons-nous à l’aéroport ?',
    de: 'Wie lange dauert es noch bis zum Flughafen?',
    pt: 'Quanto tempo falta para chegarmos ao aeroporto?',
  },
  {
    en: 'Could we make a quick stop at an ATM or store?',
    es: '¿Podríamos hacer una parada rápida en un cajero o tienda?',
    fr: 'Pourrions-nous faire un arrêt rapide à un distributeur ?',
    de: 'Könnten wir kurz an einem Geldautomaten anhalten?',
    pt: 'Poderíamos fazer uma parada rápida em um caixa eletrônico?',
  },
  {
    en: 'Thank you for the wonderful and smooth ride!',
    es: '¡Muchas gracias por el maravilloso y suave viaje!',
    fr: 'Merci beaucoup pour cet excellent trajet tout en douceur !',
    de: 'Vielen Dank für die wunderbare und ruhige Fahrt!',
    pt: 'Muito obrigado pela viagem excelente e tranquila!',
  },
  {
    en: 'Do you have a charging cable for iPhone or USB-C?',
    es: '¿Tiene un cable de carga para iPhone o USB-C?',
    fr: 'Avez-vous un câble de recharge pour iPhone ou USB-C ?',
    de: 'Haben Sie ein Ladekabel für iPhone oder USB-C?',
    pt: 'Você tem um cabo de carregamento para iPhone ou USB-C?',
  },
];

export const GoogleTranslateApp: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<TranslateSourceLang>('auto');
  const [targetLang, setTargetLang] = useState<TranslateTargetLang>('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('¡Muchas gracias por el maravilloso y suave viaje!');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speakingSlot, setSpeakingSlot] = useState<'source' | 'target' | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.96);
  const ttsSupported = isSpeechSupported();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const getLangName = (code: TranslateSourceLang): string => {
    if (code === 'auto') {
      if (detectedLang) {
        const found = TRANSLATE_LANGUAGE_OPTIONS.find((l) => l.code === detectedLang);
        return found ? `Auto (${found.label})` : `Auto (${detectedLang.toUpperCase()})`;
      }
      return 'Auto-Detect';
    }
    return TRANSLATE_LANGUAGE_OPTIONS.find((l) => l.code === code)?.nativeLabel || code.toUpperCase();
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
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleRunTranslation = async (textOverride?: string) => {
    const cleaned = (textOverride ?? inputText).trim();
    if (!cleaned) {
      setTranslatedText('');
      return;
    }
    playCabinChime('tap');
    setIsTranslating(true);
    setTranslateError(null);

    const res = await translateText(cleaned, sourceLang, targetLang);
    setIsTranslating(false);

    if (res.error && !res.translatedText) {
      setTranslateError(res.error);
      return;
    }

    setTranslatedText(res.translatedText);
    if (res.detectedSourceLang) {
      setDetectedLang(res.detectedSourceLang);
    }
  };

  const handleSelectPhrase = async (phrase: QuickPhrase) => {
    playCabinChime('tap');
    const srcKey: keyof QuickPhrase =
      sourceLang === 'es' || sourceLang === 'fr' || sourceLang === 'de' || sourceLang === 'pt'
        ? sourceLang
        : 'en';
    const tgtKey: keyof QuickPhrase | null =
      targetLang === 'en' || targetLang === 'es' || targetLang === 'fr' || targetLang === 'de' || targetLang === 'pt'
        ? targetLang
        : null;

    const chosenInput = phrase[srcKey];
    setInputText(chosenInput);
    setTranslateError(null);

    let nextTranslated = '';
    if (tgtKey) {
      nextTranslated = phrase[tgtKey];
      setTranslatedText(nextTranslated);
    } else {
      setIsTranslating(true);
      const res = await translateText(chosenInput, srcKey, targetLang);
      setIsTranslating(false);
      nextTranslated = res.translatedText || '';
      setTranslatedText(nextTranslated);
    }

    if (ttsSupported && nextTranslated) {
      speakText({
        text: nextTranslated,
        lang: targetLang as TtsLanguage,
        rate: speechRate,
        onStart: () => setSpeakingSlot('target'),
        onEnd: () => setSpeakingSlot((prev) => (prev === 'target' ? null : prev)),
      });
    }
  };

  const handleSpeak = (text: string, lang: TtsLanguage, slot: 'source' | 'target') => {
    playCabinChime('tap');
    if (speakingSlot === slot) {
      stopSpeech();
      setSpeakingSlot(null);
      return;
    }
    const effectiveLang = lang === 'auto' ? ((detectedLang as TtsLanguage) || 'en') : lang;
    speakText({
      text,
      lang: effectiveLang,
      rate: speechRate,
      onStart: () => setSpeakingSlot(slot),
      onEnd: () => setSpeakingSlot((prev) => (prev === slot ? null : prev)),
      onError: () => setSpeakingSlot(null),
    });
  };

  const handleCopy = () => {
    playCabinChime('tap');
    navigator.clipboard?.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchGoogleTranslate = () => {
    playCabinChime('tap');
    const textParam = encodeURIComponent(inputText || 'Hello');
    const url = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${textParam}&op=translate`;
    openExternalUrl(url);
  };

  const phraseSrcKey: keyof QuickPhrase =
    sourceLang === 'es' || sourceLang === 'fr' || sourceLang === 'de' || sourceLang === 'pt'
      ? sourceLang
      : 'en';
  const phraseTgtKey: keyof QuickPhrase =
    targetLang === 'en' || targetLang === 'es' || targetLang === 'fr' || targetLang === 'de' || targetLang === 'pt'
      ? targetLang
      : 'es';

  return (
    <div className="flex flex-col h-full space-y-3 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md p-1.5">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-display">
              Google Translate &amp; Voice TTS
            </h3>
            <p className="text-[10px] text-slate-400">
              Live Multilingual Translator &amp; Spoken Audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
            <Gauge className="w-3 h-3 text-sky-400" />
            {[
              { label: '0.8x', value: 0.8 },
              { label: '1.0x', value: 0.96 },
              { label: '1.2x', value: 1.2 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setSpeechRate(sp.value)}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  speechRate === sp.value ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLaunchGoogleTranslate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Open Google Translate on web"
          >
            <span>Open Translate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <select
          value={sourceLang}
          onChange={(e) => {
            setSourceLang(e.target.value as TranslateSourceLang);
            setDetectedLang(null);
          }}
          className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer px-2 py-1 max-w-[44%]"
        >
          <option value="auto" className="bg-slate-900 text-white">
            Auto-Detect Language
          </option>
          {TRANSLATE_LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
              {opt.nativeLabel}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSwap}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as TranslateTargetLang)}
          className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none cursor-pointer px-2 py-1 text-right max-w-[44%]"
        >
          {TRANSLATE_LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
              {opt.nativeLabel}
            </option>
          ))}
        </select>
      </div>

      {translateError && (
        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{translateError}</span>
        </div>
      )}

      {/* Translation Cards (Input & Output) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
        {/* Source Text Box */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2 min-h-[112px]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunTranslation();
              }
            }}
            placeholder={`Type text to translate (${getLangName(sourceLang)})...`}
            rows={3}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate">{getLangName(sourceLang)}</span>
              {inputText && ttsSupported && (
                <button
                  type="button"
                  onClick={() => handleSpeak(inputText, sourceLang as TtsLanguage, 'source')}
                  className={`p-1 cursor-pointer flex items-center gap-1 font-bold shrink-0 ${
                    speakingSlot === 'source' ? 'text-rose-400' : 'text-slate-400 hover:text-sky-400'
                  }`}
                  title="Speak source text"
                >
                  {speakingSlot === 'source' ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleRunTranslation()}
              disabled={isTranslating || !inputText.trim()}
              className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
            >
              {isTranslating && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{isTranslating ? 'Translating' : 'Translate'}</span>
            </button>
          </div>
        </div>

        {/* Target Translation Box */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 flex flex-col justify-between space-y-2 min-h-[112px]">
          <div className="text-xs text-sky-200 font-medium leading-relaxed">
            {isTranslating ? (
              <span className="text-sky-400 italic flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Translating...
              </span>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-500 italic">Translation will appear here...</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-sky-400 pt-1.5 border-t border-blue-900/40">
            <span className="font-semibold truncate">{getLangName(targetLang)}</span>
            <div className="flex items-center gap-1.5">
              {ttsSupported && (
                <button
                  type="button"
                  onClick={() => handleSpeak(translatedText, targetLang as TtsLanguage, 'target')}
                  className={`p-1 cursor-pointer flex items-center gap-1 font-bold ${
                    speakingSlot === 'target' ? 'text-rose-400' : 'text-sky-300 hover:text-white'
                  }`}
                  title="Listen to native pronunciation"
                >
                  {speakingSlot === 'target' ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="text-sky-300 hover:text-white p-1 cursor-pointer"
                title="Copy translation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Tap Passenger Travel Phrasebook */}
      <div className="space-y-1.5 flex-1 overflow-y-auto min-h-0 pr-1">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-display">
          1-Tap Common In-Cabin Phrases (Tap to Translate &amp; Speak)
        </span>
        <div className="space-y-1.5">
          {PASSENGER_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPhrase(phrase)}
              className="w-full p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-left transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-slate-300 truncate">
                {phrase[phraseSrcKey]}
              </span>
              <span className="text-sky-400 font-semibold text-[11px] shrink-0 truncate max-w-[45%]">
                {phrase[phraseTgtKey]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
