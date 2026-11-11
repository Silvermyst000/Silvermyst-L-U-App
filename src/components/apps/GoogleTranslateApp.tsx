import React, { useState } from 'react';
import {
  Globe,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

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

const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  hello: { es: 'Hola', fr: 'Bonjour', de: 'Hallo', pt: 'Olá' },
  airport: { es: 'Aeropuerto', fr: 'Aéroport', de: 'Flughafen', pt: 'Aeroporto' },
  hotel: { es: 'Hotel', fr: 'Hôtel', de: 'Hotel', pt: 'Hotel' },
  restaurant: { es: 'Restaurante', fr: 'Restaurant', de: 'Restaurant', pt: 'Restaurante' },
  coffee: { es: 'Café', fr: 'Café', de: 'Kaffee', pt: 'Café' },
  water: { es: 'Agua', fr: 'Eau', de: 'Wasser', pt: 'Água' },
  music: { es: 'Música', fr: 'Musique', de: 'Musik', pt: 'Música' },
  warm: { es: 'Cálido', fr: 'Chaud', de: 'Warm', pt: 'Quente' },
  cold: { es: 'Frío', fr: 'Froid', de: 'Kalt', pt: 'Frio' },
  receipt: { es: 'Recibo', fr: 'Reçu', de: 'Quittung', pt: 'Recibo' },
};

export const GoogleTranslateApp: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<'en' | 'es' | 'fr' | 'de' | 'pt'>('en');
  const [targetLang, setTargetLang] = useState<'en' | 'es' | 'fr' | 'de' | 'pt'>('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('¡Muchas gracias por el maravilloso y suave viaje!');
  const [copied, setCopied] = useState(false);

  const langNames = {
    en: 'English',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    de: 'Deutsch (German)',
    pt: 'Português (Portuguese)',
  };

  const handleSwap = () => {
    playCabinChime('tap');
    const prevSrc = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSrc);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleSelectPhrase = (phrase: QuickPhrase) => {
    playCabinChime('tap');
    setInputText(phrase[sourceLang] || phrase.en);
    setTranslatedText(phrase[targetLang] || phrase.es);
  };

  const handleTranslateInput = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    const lower = text.toLowerCase().trim();
    if (TRANSLATION_DICTIONARY[lower] && TRANSLATION_DICTIONARY[lower][targetLang]) {
      setTranslatedText(TRANSLATION_DICTIONARY[lower][targetLang]);
      return;
    }

    // Check if matches preset phrase
    const found = PASSENGER_PHRASES.find(
      (p) => p.en.toLowerCase().includes(lower) || p.es.toLowerCase().includes(lower)
    );
    if (found) {
      setTranslatedText(found[targetLang] || found.es);
      return;
    }

    // Default conversational response fallback
    if (targetLang === 'es') {
      setTranslatedText(`[Traducción al español]: "${text}"`);
    } else if (targetLang === 'en') {
      setTranslatedText(`[English translation]: "${text}"`);
    } else {
      setTranslatedText(`[${langNames[targetLang]}]: "${text}"`);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    playCabinChime('tap');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'pt' ? 'pt-BR' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
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
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full space-y-3.5 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md p-1.5">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-display">
              Google Translate
            </h3>
            <p className="text-[10px] text-slate-400">
              Bilingual In-Cabin Communication & Speech
            </p>
          </div>
        </div>

        <button
          onClick={handleLaunchGoogleTranslate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Open Google Translate App on tablet"
        >
          <span>Open Translate</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value as typeof sourceLang)}
          className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer px-2 py-1"
        >
          {Object.entries(langNames).map(([code, name]) => (
            <option key={code} value={code} className="bg-slate-900 text-white">
              {name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwap}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as typeof targetLang)}
          className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none cursor-pointer px-2 py-1 text-right"
        >
          {Object.entries(langNames).map(([code, name]) => (
            <option key={code} value={code} className="bg-slate-900 text-white">
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Translation Cards (Input & Output) */}
      <div className="grid grid-cols-2 gap-2.5 shrink-0">
        {/* Source Text Box */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2 min-h-[100px]">
          <textarea
            value={inputText}
            onChange={(e) => handleTranslateInput(e.target.value)}
            placeholder={`Type anything in ${langNames[sourceLang]}...`}
            rows={3}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>{langNames[sourceLang].split(' ')[0]}</span>
            {inputText && (
              <button
                onClick={() => handleSpeak(inputText, sourceLang)}
                className="text-slate-400 hover:text-sky-400 p-1"
                title="Speak source text"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Target Translation Box */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 flex flex-col justify-between space-y-2 min-h-[100px]">
          <div className="text-xs text-sky-200 font-medium leading-relaxed">
            {translatedText || <span className="text-slate-500 italic">Translation will appear here...</span>}
          </div>
          <div className="flex items-center justify-between text-[11px] text-sky-400 pt-1 border-t border-blue-900/40">
            <span className="font-semibold">{langNames[targetLang].split(' ')[0]}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSpeak(translatedText, targetLang)}
                className="text-sky-300 hover:text-white p-1 cursor-pointer"
                title="Listen to native pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
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
          1-Tap Common In-Cabin Phrases
        </span>
        <div className="space-y-1.5">
          {PASSENGER_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPhrase(phrase)}
              className="w-full p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-left transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-slate-300 truncate">
                {phrase[sourceLang] || phrase.en}
              </span>
              <span className="text-sky-400 font-semibold text-[11px] shrink-0 truncate max-w-[45%]">
                {phrase[targetLang] || phrase.es}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
