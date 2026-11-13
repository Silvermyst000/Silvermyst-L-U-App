export interface TimeZonePreset {
  id: string;
  label: string;
  cities: string;
  timeZone: string;
  region: 'us' | 'global';
}

export const US_TIMEZONES: TimeZonePreset[] = [
  {
    id: 'us-et',
    label: 'Eastern Time',
    cities: 'South Bend, IN · New York · Miami · Atlanta',
    timeZone: 'America/New_York',
    region: 'us',
  },
  {
    id: 'us-ct',
    label: 'Central Time',
    cities: 'Chicago · Dallas · Nashville · New Orleans',
    timeZone: 'America/Chicago',
    region: 'us',
  },
  {
    id: 'us-mt',
    label: 'Mountain Time',
    cities: 'Denver · Salt Lake City · Albuquerque',
    timeZone: 'America/Denver',
    region: 'us',
  },
  {
    id: 'us-az',
    label: 'Arizona (No DST)',
    cities: 'Phoenix · Tucson · Flagstaff',
    timeZone: 'America/Phoenix',
    region: 'us',
  },
  {
    id: 'us-pt',
    label: 'Pacific Time',
    cities: 'Los Angeles · San Francisco · Seattle · Las Vegas',
    timeZone: 'America/Los_Angeles',
    region: 'us',
  },
  {
    id: 'us-ak',
    label: 'Alaska Time',
    cities: 'Anchorage · Fairbanks · Juneau',
    timeZone: 'America/Anchorage',
    region: 'us',
  },
  {
    id: 'us-hi',
    label: 'Hawaii-Aleutian Time',
    cities: 'Honolulu · Maui · Kailua-Kona',
    timeZone: 'Pacific/Honolulu',
    region: 'us',
  },
  {
    id: 'us-at',
    label: 'Atlantic Time (US Territories)',
    cities: 'San Juan, PR · St. Thomas, USVI',
    timeZone: 'America/Puerto_Rico',
    region: 'us',
  },
];

export const GLOBAL_TIMEZONES: TimeZonePreset[] = [
  {
    id: 'gl-utc',
    label: 'UTC / Coordinated Universal',
    cities: 'Aviation & Dispatch Reference',
    timeZone: 'UTC',
    region: 'global',
  },
  {
    id: 'gl-lon',
    label: 'United Kingdom (GMT / BST)',
    cities: 'London · Manchester · Edinburgh',
    timeZone: 'Europe/London',
    region: 'global',
  },
  {
    id: 'gl-par',
    label: 'Central Europe (CET / CEST)',
    cities: 'Paris · Berlin · Madrid · Rome',
    timeZone: 'Europe/Paris',
    region: 'global',
  },
  {
    id: 'gl-mex',
    label: 'Mexico Central',
    cities: 'Mexico City · Guadalajara · Monterrey',
    timeZone: 'America/Mexico_City',
    region: 'global',
  },
  {
    id: 'gl-tor',
    label: 'Canada Eastern',
    cities: 'Toronto · Montreal · Ottawa',
    timeZone: 'America/Toronto',
    region: 'global',
  },
  {
    id: 'gl-sao',
    label: 'Brazil (BRT)',
    cities: 'São Paulo · Rio de Janeiro',
    timeZone: 'America/Sao_Paulo',
    region: 'global',
  },
  {
    id: 'gl-dxb',
    label: 'Gulf Standard (GST)',
    cities: 'Dubai · Abu Dhabi',
    timeZone: 'Asia/Dubai',
    region: 'global',
  },
  {
    id: 'gl-ind',
    label: 'India Standard (IST)',
    cities: 'Mumbai · New Delhi · Bengaluru',
    timeZone: 'Asia/Kolkata',
    region: 'global',
  },
  {
    id: 'gl-sin',
    label: 'Singapore / China (SGT / CST)',
    cities: 'Singapore · Shanghai · Hong Kong',
    timeZone: 'Asia/Singapore',
    region: 'global',
  },
  {
    id: 'gl-tyo',
    label: 'Japan Standard (JST)',
    cities: 'Tokyo · Osaka · Kyoto',
    timeZone: 'Asia/Tokyo',
    region: 'global',
  },
  {
    id: 'gl-seo',
    label: 'Korea Standard (KST)',
    cities: 'Seoul · Incheon · Busan',
    timeZone: 'Asia/Seoul',
    region: 'global',
  },
  {
    id: 'gl-syd',
    label: 'Australia Eastern (AEST)',
    cities: 'Sydney · Melbourne · Brisbane',
    timeZone: 'Australia/Sydney',
    region: 'global',
  },
];

export interface FormattedTimeInfo {
  timeStr: string;
  timeWithSeconds: string;
  zoneAbbr: string;
  dateStr: string;
  ianaTimeZone: string;
}

export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
  }
}

export function formatTimeInZone(date: Date, timeZone?: string): FormattedTimeInfo {
  const effectiveZone = timeZone || getDeviceTimeZone();
  try {
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: effectiveZone,
    });
    const timeWithSeconds = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: effectiveZone,
    });
    const dateStr = date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: effectiveZone,
    });

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: effectiveZone,
      timeZoneName: 'short',
    }).formatToParts(date);
    const zoneAbbr = parts.find((p) => p.type === 'timeZoneName')?.value || effectiveZone;

    return {
      timeStr,
      timeWithSeconds,
      zoneAbbr,
      dateStr,
      ianaTimeZone: effectiveZone,
    };
  } catch {
    return {
      timeStr: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeWithSeconds: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      zoneAbbr: 'LOCAL',
      dateStr: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      ianaTimeZone: effectiveZone,
    };
  }
}

function getTimezoneByZipPrefix(zip: string): { timeZone: string; zoneName: string; regionName: string } {
  const prefix = Number(zip.slice(0, 3));

  // Puerto Rico & US Virgin Islands
  if (prefix >= 6 && prefix <= 9) {
    return { timeZone: 'America/Puerto_Rico', zoneName: 'Atlantic Standard Time', regionName: 'Puerto Rico / USVI' };
  }

  // East Coast (MA, RI, NH, ME, VT, CT, NJ, NY, PA, DE, DC, VA, MD, WV, NC, SC, GA)
  if ((prefix >= 10 && prefix <= 299) || (prefix >= 300 && prefix <= 319)) {
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Eastern US' };
  }

  // Florida (Panhandle 324-325 Central; rest Eastern)
  if (prefix >= 320 && prefix <= 349) {
    if (prefix === 324 || prefix === 325) {
      return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'NW Florida' };
    }
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Florida' };
  }

  // Alabama (350-369)
  if (prefix >= 350 && prefix <= 369) {
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Alabama' };
  }

  // Tennessee (376-379 Eastern; rest Central)
  if (prefix >= 370 && prefix <= 385) {
    if (prefix >= 376 && prefix <= 379) {
      return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'East Tennessee' };
    }
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Tennessee' };
  }

  // Mississippi (386-397)
  if (prefix >= 386 && prefix <= 397) {
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Mississippi' };
  }

  // Kentucky (420-424, 427 Central; rest Eastern)
  if (prefix >= 400 && prefix <= 427) {
    if ((prefix >= 420 && prefix <= 424) || prefix === 427) {
      return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Western Kentucky' };
    }
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Kentucky' };
  }

  // Ohio (430-459)
  if (prefix >= 430 && prefix <= 459) {
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Ohio' };
  }

  // Indiana (463-464 NW/Gary, 476-477 SW/Evansville Central; 465-466 South Bend & rest Eastern)
  if (prefix >= 460 && prefix <= 479) {
    if (prefix === 463 || prefix === 464 || prefix === 476 || prefix === 477) {
      return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'NW / SW Indiana' };
    }
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Indiana' };
  }

  // Michigan (498-499 Upper Peninsula border Central; rest Eastern)
  if (prefix >= 480 && prefix <= 499) {
    if (prefix === 498 || prefix === 499) {
      return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Western Upper Peninsula, MI' };
    }
    return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'Michigan' };
  }

  // IA, WI, MN, IL, MO, LA, AR, OK, Central US (500-569, 600-749)
  if ((prefix >= 500 && prefix <= 569) || (prefix >= 600 && prefix <= 749)) {
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Central US' };
  }

  // North & South Dakota (570-588: 577 & 586-588 Mountain, rest Central)
  if (prefix >= 570 && prefix <= 588) {
    if (prefix === 577 || (prefix >= 586 && prefix <= 588)) {
      return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Western Dakotas' };
    }
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'North / South Dakota' };
  }

  // Montana (590-599)
  if (prefix >= 590 && prefix <= 599) {
    return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Montana' };
  }

  // Texas (750-799; 798-799 El Paso is Mountain)
  if (prefix >= 750 && prefix <= 799) {
    if (prefix === 798 || prefix === 799) {
      return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'West Texas (El Paso)' };
    }
    return { timeZone: 'America/Chicago', zoneName: 'Central Time', regionName: 'Texas' };
  }

  // Colorado (800-816) & Wyoming (820-831)
  if (prefix >= 800 && prefix <= 831) {
    return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Colorado / Wyoming' };
  }

  // Idaho (832-838: 835 & 838 Northern Panhandle Pacific; rest Mountain)
  if (prefix >= 832 && prefix <= 838) {
    if (prefix === 835 || prefix === 838) {
      return { timeZone: 'America/Los_Angeles', zoneName: 'Pacific Time', regionName: 'North Idaho' };
    }
    return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Idaho' };
  }

  // Utah (840-847)
  if (prefix >= 840 && prefix <= 847) {
    return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Utah' };
  }

  // Arizona (850-865: MST no DST except Navajo Nation, default Phoenix)
  if (prefix >= 850 && prefix <= 865) {
    return { timeZone: 'America/Phoenix', zoneName: 'Mountain Standard Time (No DST)', regionName: 'Arizona' };
  }

  // New Mexico (870-884)
  if (prefix >= 870 && prefix <= 884) {
    return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'New Mexico' };
  }

  // Nevada (889-898)
  if (prefix >= 889 && prefix <= 898) {
    return { timeZone: 'America/Los_Angeles', zoneName: 'Pacific Time', regionName: 'Nevada' };
  }

  // California (900-966)
  if (prefix >= 900 && prefix <= 966) {
    return { timeZone: 'America/Los_Angeles', zoneName: 'Pacific Time', regionName: 'California' };
  }

  // Hawaii (967-968)
  if (prefix === 967 || prefix === 968) {
    return { timeZone: 'Pacific/Honolulu', zoneName: 'Hawaii-Aleutian Time', regionName: 'Hawaii' };
  }

  // Guam / Northern Mariana (969)
  if (prefix === 969) {
    return { timeZone: 'Pacific/Guam', zoneName: 'Chamorro Standard Time', regionName: 'Guam / Pacific Territories' };
  }

  // Oregon (970-979: 979 Malheur Mountain; rest Pacific)
  if (prefix >= 970 && prefix <= 979) {
    if (prefix === 979) {
      return { timeZone: 'America/Denver', zoneName: 'Mountain Time', regionName: 'Eastern Oregon' };
    }
    return { timeZone: 'America/Los_Angeles', zoneName: 'Pacific Time', regionName: 'Oregon' };
  }

  // Washington (980-994)
  if (prefix >= 980 && prefix <= 994) {
    return { timeZone: 'America/Los_Angeles', zoneName: 'Pacific Time', regionName: 'Washington' };
  }

  // Alaska (995-999)
  if (prefix >= 995 && prefix <= 999) {
    return { timeZone: 'America/Anchorage', zoneName: 'Alaska Time', regionName: 'Alaska' };
  }

  return { timeZone: 'America/New_York', zoneName: 'Eastern Time', regionName: 'United States' };
}

export interface ZipLookupResult {
  zip: string;
  city?: string;
  state?: string;
  regionLabel: string;
  timeZone: string;
  zoneName: string;
}

export async function lookupZipCodeTimezone(rawZip: string): Promise<ZipLookupResult | { error: string }> {
  const cleanZip = rawZip.replace(/\D/g, '').slice(0, 5);
  if (cleanZip.length !== 5) {
    return { error: 'Enter a valid 5-digit US ZIP code (e.g., 46601, 60601, 90210).' };
  }

  const base = getTimezoneByZipPrefix(cleanZip);
  let city: string | undefined;
  let state: string | undefined;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(`https://api.zippopotam.us/us/${cleanZip}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      const place = data?.places?.[0];
      if (place) {
        city = place['place name'];
        state = place['state abbreviation'] || place['state'];
      }
    }
  } catch {
    // Offline or network timeout -> prefix mapping still resolves cleanly
  }

  return {
    zip: cleanZip,
    city,
    state,
    regionLabel: city && state ? `${city}, ${state}` : base.regionName,
    timeZone: base.timeZone,
    zoneName: base.zoneName,
  };
}
