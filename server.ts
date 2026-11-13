import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const LANG_NAMES: Record<string, string> = {
  auto: 'Auto-Detect',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
};

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai =
  geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'
    ? new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

async function translateViaFallback(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translatedText: string; detectedSourceLang?: string } | null> {
  // Primary public fallback: Google gtx endpoint (supports sl=auto)
  try {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      if (Array.isArray(data?.[0])) {
        const joined = data[0].map((part: any) => (Array.isArray(part) ? part[0] : '')).join('');
        const detected = typeof data?.[2] === 'string' ? data[2] : undefined;
        if (joined && joined.trim()) {
          return {
            translatedText: joined.trim(),
            detectedSourceLang: detected,
          };
        }
      }
    }
  } catch (e) {
    // Proceed to secondary fallback
  }

  // Secondary fallback: MyMemory (requires explicit source code)
  try {
    const srcCode = sourceLang === 'auto' ? 'en' : sourceLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${encodeURIComponent(`${srcCode}|${targetLang}`)}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      const candidate = data?.responseData?.translatedText;
      if (typeof candidate === 'string' && candidate.trim() && data?.responseStatus === 200) {
        return {
          translatedText: candidate.trim(),
          detectedSourceLang: srcCode,
        };
      }
    }
  } catch (e) {
    // Fallback failed
  }

  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const getMapsApiKey = () =>
    process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';

  app.get('/api/maps/config', (_req, res) => {
    const apiKey = getMapsApiKey();
    res.json({
      apiKey,
      configured: Boolean(apiKey && apiKey !== 'MY_GOOGLE_MAPS_API_KEY'),
    });
  });

  app.get('/api/maps/geocode', async (req, res) => {
    try {
      const q = typeof req.query?.q === 'string' ? req.query.q.trim() : '';
      if (!q) {
        res.status(400).json({ error: 'Location query is required.' });
        return;
      }

      const apiKey = getMapsApiKey();
      const isUsZip = /^\d{5}$/.test(q);

      if (apiKey) {
        try {
          const geocodeUrl = `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(
            q
          )}?regionCode=us`;
          const gResp = await fetch(geocodeUrl, {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask':
                'results.placeId,results.location,results.formattedAddress,results.postalAddress',
              'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
            },
          });

          const gData = (await gResp.json().catch(() => ({}))) as any;
          const isQuota =
            gResp.status === 429 || gData?.error?.status === 'RESOURCE_EXHAUSTED';
          if (isQuota) {
            res.status(429).json({
              error: gData?.error?.message || 'Google Maps Geocoding quota exceeded.',
              quotaExceeded: true,
            });
            return;
          }

          const first = gData?.results?.[0];
          const lat = first?.location?.latitude;
          const lng = first?.location?.longitude;
          if (gResp.ok && typeof lat === 'number' && typeof lng === 'number') {
            const postal = first?.postalAddress;
            const cityState =
              postal?.locality && postal?.administrativeArea
                ? `${postal.locality}, ${postal.administrativeArea}${
                    postal?.postalCode ? ` ${postal.postalCode}` : ''
                  }`
                : first?.formattedAddress || q;
            res.json({
              lat,
              lng,
              label: cityState,
              zip: postal?.postalCode || (isUsZip ? q : undefined),
              source: 'google_geocoding',
            });
            return;
          }
        } catch {
          // Proceed to postal / city fallback below
        }
      }

      // Reliable fallback for 5-digit US ZIP codes via Zippopotam
      if (isUsZip) {
        try {
          const zipResp = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(q)}`);
          if (zipResp.ok) {
            const zipData = (await zipResp.json()) as any;
            const place = zipData?.places?.[0];
            const lat = Number(place?.latitude);
            const lng = Number(place?.longitude);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              const city = place['place name'] || '';
              const stateAbbr = place['state abbreviation'] || '';
              res.json({
                lat,
                lng,
                label: city ? `${city}, ${stateAbbr} ${q}`.trim() : `ZIP ${q}`,
                zip: q,
                source: 'postal_fallback',
              });
              return;
            }
          }
        } catch {
          // Proceed to Nominatim
        }
      }

      // General city/neighborhood fallback via Nominatim
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
          q
        )}`;
        const nomResp = await fetch(nomUrl, {
          headers: { 'User-Agent': 'SilvermystCabinOS/3.5' },
        });
        if (nomResp.ok) {
          const nomList = (await nomResp.json()) as any[];
          const item = nomList?.[0];
          const lat = Number(item?.lat);
          const lng = Number(item?.lon);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const shortParts = String(item?.display_name || q)
              .split(',')
              .slice(0, 2)
              .map((s: string) => s.trim())
              .filter(Boolean);
            res.json({
              lat,
              lng,
              label: shortParts.join(', ') || q,
              zip: isUsZip ? q : undefined,
              source: 'postal_fallback',
            });
            return;
          }
        }
      } catch {
        // Unable to resolve location
      }

      res.status(404).json({ error: 'Could not resolve that location or ZIP code.' });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Geocoding failed.' });
    }
  });

  app.post('/api/maps/places', async (req, res) => {
    try {
      const apiKey = getMapsApiKey();
      if (!apiKey) {
        res.json({ places: [], configured: false });
        return;
      }

      const rawQuery =
        typeof req.body?.query === 'string' && req.body.query.trim()
          ? req.body.query.trim()
          : 'popular attractions and adventures';
      const lat = typeof req.body?.lat === 'number' ? req.body.lat : undefined;
      const lng = typeof req.body?.lng === 'number' ? req.body.lng : undefined;

      const bodyPayload: Record<string, any> = {
        textQuery: rawQuery,
        regionCode: 'us',
        languageCode: 'en',
        pageSize: 12,
      };

      if (typeof lat === 'number' && typeof lng === 'number') {
        bodyPayload.locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 18000.0,
          },
        };
      }

      const pResp = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.editorialSummary,places.googleMapsUri,places.currentOpeningHours',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify(bodyPayload),
      });

      const pData = (await pResp.json().catch(() => ({}))) as any;
      const isQuota =
        pResp.status === 429 || pData?.error?.status === 'RESOURCE_EXHAUSTED';
      if (isQuota) {
        res.status(429).json({
          places: [],
          configured: true,
          quotaExceeded: true,
          error: pData?.error?.message || 'Google Places API quota exceeded.',
        });
        return;
      }

      if (!pResp.ok) {
        res.json({
          places: [],
          configured: true,
          error: pData?.error?.message || 'Places search did not succeed.',
        });
        return;
      }

      const places = Array.isArray(pData?.places)
        ? pData.places
            .filter(
              (p: any) =>
                p?.displayName?.text &&
                typeof p?.location?.latitude === 'number' &&
                typeof p?.location?.longitude === 'number'
            )
            .map((p: any) => ({
              id: p.id || `gp-${Math.random().toString(36).slice(2, 8)}`,
              name: p.displayName.text,
              address: p.shortFormattedAddress || p.formattedAddress || '',
              lat: p.location.latitude,
              lng: p.location.longitude,
              rating: typeof p.rating === 'number' ? p.rating : undefined,
              userRatingCount:
                typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
              primaryType: p.primaryTypeDisplayName?.text || undefined,
              summary: p.editorialSummary?.text || undefined,
              googleMapsUri: p.googleMapsUri || undefined,
              openNow:
                typeof p.currentOpeningHours?.openNow === 'boolean'
                  ? p.currentOpeningHours.openNow
                  : undefined,
              weekdayText: Array.isArray(p.currentOpeningHours?.weekdayDescriptions)
                ? p.currentOpeningHours.weekdayDescriptions
                : undefined,
            }))
        : [];

      res.json({ places, configured: true });
    } catch (err: any) {
      res.status(500).json({ places: [], configured: true, error: err?.message || 'Places proxy error.' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/translate', async (req, res) => {
    try {
      const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const sourceLang = typeof req.body?.sourceLang === 'string' ? req.body.sourceLang.trim() : 'auto';
      const targetLang = typeof req.body?.targetLang === 'string' ? req.body.targetLang.trim() : 'es';

      if (!rawText) {
        res.status(400).json({ error: 'Please enter text to translate.' });
        return;
      }

      if (sourceLang !== 'auto' && sourceLang === targetLang) {
        res.json({
          translatedText: rawText,
          detectedSourceLang: sourceLang,
          provider: 'identity',
        });
        return;
      }

      const targetName = LANG_NAMES[targetLang] || targetLang;
      const sourceName = sourceLang === 'auto' ? 'the detected input language' : LANG_NAMES[sourceLang] || sourceLang;

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: `Translate the following text from ${sourceName} into natural, accurate ${targetName}. Preserve tone, punctuation, and polite forms appropriate for passenger hospitality.\n\nText:\n${rawText}`,
            config: {
              systemInstruction:
                'You are a precise bilingual/multilingual translator for an executive rideshare cabin kiosk. Return strictly JSON with translatedText and detectedSourceLang (2-letter ISO 639-1 code).',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  translatedText: {
                    type: Type.STRING,
                    description: 'The accurate translated text in the requested target language.',
                  },
                  detectedSourceLang: {
                    type: Type.STRING,
                    description: 'Two-letter ISO 639-1 language code of the input text (e.g. en, es, fr, de).',
                  },
                },
                required: ['translatedText'],
              },
            },
          });

          const rawJson = (response.text ?? '{}').trim();
          const parsed = JSON.parse(rawJson) as {
            translatedText?: string;
            detectedSourceLang?: string;
          };

          if (parsed.translatedText && parsed.translatedText.trim()) {
            res.json({
              translatedText: parsed.translatedText.trim(),
              detectedSourceLang: parsed.detectedSourceLang || (sourceLang === 'auto' ? undefined : sourceLang),
              provider: 'gemini',
            });
            return;
          }
        } catch (geminiErr) {
          console.warn('Gemini translation fallback engaged:', geminiErr);
        }
      }

      const fallbackResult = await translateViaFallback(rawText, sourceLang, targetLang);
      if (fallbackResult) {
        res.json({
          ...fallbackResult,
          provider: 'fallback',
        });
        return;
      }

      res.status(502).json({
        error: 'Translation service is temporarily unavailable. Please verify your internet connection.',
      });
    } catch (err: any) {
      res.status(500).json({
        error: err?.message || 'Unexpected error during translation.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const srcImagesDir = path.resolve(__dirname, 'src', 'assets', 'images');
    app.use('/src/assets/images', express.static(srcImagesDir, { maxAge: '7d' }));
    app.use(express.static(distDir, { maxAge: '1d' }));
    app.all('/api/*', (_req, res) => {
      res.status(404).json({ error: 'API endpoint not found.' });
    });
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Silvermyst CabinOS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
