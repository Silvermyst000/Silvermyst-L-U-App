export type TranslateSourceLang =
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

export type TranslateTargetLang = Exclude<TranslateSourceLang, 'auto'>;

export interface TranslationLanguageOption {
  code: TranslateTargetLang;
  label: string;
  nativeLabel: string;
}

export const TRANSLATE_LANGUAGE_OPTIONS: TranslationLanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English (US)' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLang?: string;
  provider?: string;
  error?: string;
}

export async function translateText(
  text: string,
  sourceLang: TranslateSourceLang,
  targetLang: TranslateTargetLang
): Promise<TranslateResponse> {
  const cleaned = text.trim();
  if (!cleaned) {
    return { translatedText: '' };
  }

  if (sourceLang !== 'auto' && sourceLang === targetLang) {
    return { translatedText: cleaned, detectedSourceLang: sourceLang, provider: 'identity' };
  }

  // 1. Primary: call our Express /api/translate backend (Gemini + server fallback)
  try {
    const resp = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleaned,
        sourceLang,
        targetLang,
      }),
    });
    const data = (await resp.json().catch(() => ({}))) as TranslateResponse;
    if (resp.ok && data.translatedText) {
      return data;
    }
  } catch {
    // Fall through to client fallback if backend unreachable
  }

  // 2. Direct client fallback via public Google / MyMemory APIs if needed
  try {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(cleaned)}`;
    const resp = await fetch(gtxUrl);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      if (Array.isArray(data?.[0])) {
        const joined = data[0].map((part: any) => (Array.isArray(part) ? part[0] : '')).join('');
        if (joined.trim()) {
          return {
            translatedText: joined.trim(),
            detectedSourceLang: typeof data?.[2] === 'string' ? data[2] : undefined,
            provider: 'client-fallback',
          };
        }
      }
    }
  } catch {
    // Try MyMemory below
  }

  try {
    const srcCode = sourceLang === 'auto' ? 'en' : sourceLang;
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleaned
    )}&langpair=${encodeURIComponent(`${srcCode}|${targetLang}`)}`;
    const resp = await fetch(mmUrl);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      const candidate = data?.responseData?.translatedText;
      if (typeof candidate === 'string' && candidate.trim() && data?.responseStatus === 200) {
        return {
          translatedText: candidate.trim(),
          detectedSourceLang: srcCode,
          provider: 'mymemory',
        };
      }
    }
  } catch {
    // Exhausted online fallbacks
  }

  return {
    translatedText: '',
    error: 'Unable to reach translation service right now. Please check connection and try again.',
  };
}
