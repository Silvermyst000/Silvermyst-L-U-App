export interface MapsConfigResponse {
  apiKey: string;
  configured: boolean;
}

export interface GeocodedArea {
  lat: number;
  lng: number;
  label: string;
  zip?: string;
  source: 'google_geocoding' | 'postal_fallback';
}

export interface GooglePlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  summary?: string;
  googleMapsUri?: string;
  openNow?: boolean;
  weekdayText?: string[];
}

let cachedConfigPromise: Promise<MapsConfigResponse> | null = null;

export function notifyGmpQuotaExceeded() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

export async function getMapsConfig(): Promise<MapsConfigResponse> {
  const envKey = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (envKey && envKey !== 'YOUR_API_KEY') {
    return { apiKey: envKey, configured: true };
  }
  if (!cachedConfigPromise) {
    cachedConfigPromise = fetch('/api/maps/config')
      .then(async (res) => {
        if (!res.ok) return { apiKey: '', configured: false };
        const data = (await res.json()) as MapsConfigResponse;
        return {
          apiKey: typeof data?.apiKey === 'string' ? data.apiKey : '',
          configured: Boolean(data?.configured && data?.apiKey),
        };
      })
      .catch(() => ({ apiKey: '', configured: false }));
  }
  return cachedConfigPromise;
}

export async function geocodeLocationQuery(query: string): Promise<GeocodedArea | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const res = await fetch(`/api/maps/geocode?q=${encodeURIComponent(trimmed)}`);
  if (res.status === 429) {
    notifyGmpQuotaExceeded();
  }
  const data = await res.json().catch(() => ({}));
  if (data?.quotaExceeded) {
    notifyGmpQuotaExceeded();
  }
  if (!res.ok || typeof data?.lat !== 'number' || typeof data?.lng !== 'number') {
    return null;
  }
  return data as GeocodedArea;
}

export async function searchGooglePlaces(params: {
  query: string;
  lat?: number;
  lng?: number;
  category?: string;
}): Promise<{ places: GooglePlaceResult[]; quotaExceeded?: boolean; configured?: boolean }> {
  const res = await fetch('/api/maps/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 429 || data?.quotaExceeded) {
    notifyGmpQuotaExceeded();
    return { places: [], quotaExceeded: true, configured: Boolean(data?.configured) };
  }
  return {
    places: Array.isArray(data?.places) ? (data.places as GooglePlaceResult[]) : [],
    quotaExceeded: false,
    configured: Boolean(data?.configured),
  };
}
