export type TtsLanguage =
  | 'auto'
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'ar'
  | 'hi';

const LANG_LOCALE_MAP: Record<TtsLanguage, string[]> = {
  auto: ['en-US', 'en'],
  en: ['en-US', 'en-GB', 'en'],
  es: ['es-MX', 'es-US', 'es-ES', 'es'],
  fr: ['fr-FR', 'fr-CA', 'fr'],
  de: ['de-DE', 'de-AT', 'de'],
  pt: ['pt-BR', 'pt-PT', 'pt'],
  it: ['it-IT', 'it'],
  zh: ['zh-CN', 'zh-TW', 'zh'],
  ja: ['ja-JP', 'ja'],
  ko: ['ko-KR', 'ko'],
  ar: ['ar-SA', 'ar'],
  hi: ['hi-IN', 'hi'],
};

/**
 * Strips diagnostic language prefixes (e.g. "[Español]: ...") before speaking aloud.
 */
export function sanitizeSpeechText(rawText: string): string {
  return rawText
    .replace(/^\[[^\]]+\]:\s*/i, '')
    .replace(/\s*\((?:Traducido|Traduit|Übersetzt|Translated)[^)]*\)$/i, '')
    .replace(/^"(.+)"$/, '$1')
    .trim();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  }
}

export function pickVoiceForLanguage(lang: TtsLanguage): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferredLocales = LANG_LOCALE_MAP[lang] || LANG_LOCALE_MAP.en;
  for (const locale of preferredLocales) {
    const exact = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
    if (exact) return exact;
  }
  const base = preferredLocales[preferredLocales.length - 1].toLowerCase();
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(base));
  return prefixMatch || null;
}

export function getAvailableVoicesCount(lang: TtsLanguage): number {
  if (!isSpeechSupported()) return 0;
  const base = (LANG_LOCALE_MAP[lang]?.[0] || 'en').slice(0, 2).toLowerCase();
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith(base)).length;
}

export interface SpeakOptions {
  text: string;
  lang: TtsLanguage;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
}

export function speakText({
  text,
  lang,
  rate = 0.96,
  pitch = 1.0,
  onStart,
  onEnd,
  onError,
}: SpeakOptions): boolean {
  const cleanText = sanitizeSpeechText(text);
  if (!cleanText) {
    onError?.('Enter or select text first to hear spoken audio.');
    return false;
  }

  if (!isSpeechSupported()) {
    onError?.('Text-to-Speech is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const primaryLocale = LANG_LOCALE_MAP[lang]?.[0] || 'en-US';
    utterance.lang = primaryLocale;
    utterance.rate = Math.min(1.6, Math.max(0.6, rate));
    utterance.pitch = pitch;

    const voice = pickVoiceForLanguage(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (ev) => {
      // 'interrupted' and 'canceled' happen normally when user switches or stops audio
      if (ev.error === 'interrupted' || ev.error === 'canceled') {
        onEnd?.();
        return;
      }
      onError?.(ev.error || 'Unable to play spoken audio.');
      onEnd?.();
    };

    onStart?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err: any) {
    onError?.(err?.message || 'Audio playback failed.');
    onEnd?.();
    return false;
  }
}
