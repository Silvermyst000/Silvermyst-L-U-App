import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { WorkShift } from '../types/kiosk';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

// Strictly in-memory OAuth token cache (never stored in localStorage or sessionStorage)
let cachedCalendarAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

function extractIanaTimeZone(tzLabel: string): string {
  const clean = tzLabel.replace(/\s*\([^)]*\)\s*/g, '').trim();
  if (clean.includes('/')) return clean;
  return 'America/Indiana/Indianapolis';
}

function buildIsoRange(shift: WorkShift): { startIso: string; endIso: string } {
  const [sh, sm] = (shift.startTime || '08:00').split(':').map(Number);
  const [eh, em] = (shift.endTime || '17:00').split(':').map(Number);

  const startDate = new Date(`${shift.dateStr}T${String(sh || 0).padStart(2, '0')}:${String(sm || 0).padStart(2, '0')}:00`);
  const endDate = new Date(`${shift.dateStr}T${String(eh || 0).padStart(2, '0')}:${String(em || 0).padStart(2, '0')}:00`);

  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatLocalIso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  return {
    startIso: formatLocalIso(startDate),
    endIso: formatLocalIso(endDate),
  };
}

export function getGoogleCalendarConnectionState(): { connected: boolean; email: string | null } {
  return {
    connected: Boolean(cachedCalendarAccessToken),
    email: cachedUserEmail,
  };
}

export function disconnectGoogleCalendar(): void {
  cachedCalendarAccessToken = null;
  cachedUserEmail = null;
}

export async function connectGoogleCalendar(): Promise<{ email: string | null; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  provider.addScope(CALENDAR_SCOPE);
  provider.setCustomParameters({
    prompt: 'consent',
    access_type: 'online',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) {
    throw new Error('Google Calendar permission did not return an access token. Please try again and allow calendar access.');
  }

  cachedCalendarAccessToken = token;
  cachedUserEmail = result.user?.email || null;

  return {
    email: cachedUserEmail,
    accessToken: token,
  };
}

export async function syncWorkShiftToGoogleCalendar(shift: WorkShift): Promise<{ eventLink?: string; eventId?: string }> {
  let token = cachedCalendarAccessToken;
  if (!token) {
    const authRes = await connectGoogleCalendar();
    token = authRes.accessToken;
  }

  const timeZone = extractIanaTimeZone(shift.timeZone || 'America/Indiana/Indianapolis (ET)');
  const { startIso, endIso } = buildIsoRange(shift);

  const eventBody = {
    summary: `Silvermyst Shift: ${shift.driverName} (${shift.locationZone})`,
    location: shift.locationZone,
    description: [
      `Driver: ${shift.driverName}`,
      shift.vehicleModel ? `Vehicle: ${shift.vehicleModel}` : '',
      `Status: ${shift.status.replace('_', ' ').toUpperCase()}`,
      `Hours: ${shift.startTime} - ${shift.endTime} (${shift.timeZone})`,
      shift.notes ? `Notes: ${shift.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    start: {
      dateTime: startIso,
      timeZone,
    },
    end: {
      dateTime: endIso,
      timeZone,
    },
    reminders: {
      useDefault: true,
    },
  };

  let res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBody),
  });

  // If token expired, prompt re-auth once
  if (res.status === 401) {
    cachedCalendarAccessToken = null;
    const reAuth = await connectGoogleCalendar();
    res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${reAuth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errText.slice(0, 140)}`);
  }

  const data = await res.json();
  return {
    eventId: data.id,
    eventLink: data.htmlLink,
  };
}

export async function syncShiftsBatchToGoogleCalendar(shifts: WorkShift[]): Promise<{ syncedCount: number; failedCount: number }> {
  let syncedCount = 0;
  let failedCount = 0;

  for (const sh of shifts) {
    try {
      await syncWorkShiftToGoogleCalendar(sh);
      syncedCount += 1;
    } catch (e) {
      failedCount += 1;
    }
  }
  return { syncedCount, failedCount };
}

export function buildGoogleCalendarQuickAddUrl(shift: WorkShift): string {
  const { startIso, endIso } = buildIsoRange(shift);
  const compactStart = startIso.replace(/[-:]/g, '');
  const compactEnd = endIso.replace(/[-:]/g, '');
  const title = encodeURIComponent(`Silvermyst Shift: ${shift.driverName}`);
  const details = encodeURIComponent(
    `Zone: ${shift.locationZone}\nVehicle: ${shift.vehicleModel || 'Executive SUV'}\nTime Zone: ${shift.timeZone}\n${shift.notes || ''}`
  );
  const location = encodeURIComponent(shift.locationZone || 'South Bend / Notre Dame');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${compactStart}/${compactEnd}&details=${details}&location=${location}`;
}

export function downloadShiftsAsIcs(shifts: WorkShift[], filename = 'silvermyst-shifts.ics'): void {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIcsDate = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const [hh, mm] = (timeStr || '08:00').split(':');
    return `${y}${m}${d}T${pad(Number(hh || 0))}${pad(Number(mm || 0))}00`;
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Silvermyst Multiservices//Shift Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];

  shifts.forEach((sh) => {
    const startCompact = formatIcsDate(sh.dateStr, sh.startTime);
    const endCompact = formatIcsDate(sh.dateStr, sh.endTime);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${sh.id}@silvermyst.com`);
    lines.push(`DTSTART:${startCompact}`);
    lines.push(`DTEND:${endCompact}`);
    lines.push(`SUMMARY:Silvermyst Shift - ${sh.driverName} (${sh.locationZone})`);
    lines.push(`LOCATION:${sh.locationZone}`);
    lines.push(
      `DESCRIPTION:Driver: ${sh.driverName}\\nVehicle: ${sh.vehicleModel || 'Executive SUV'}\\nZone: ${sh.locationZone}\\n${sh.notes || ''}`
    );
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
