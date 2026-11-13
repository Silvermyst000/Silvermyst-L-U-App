import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeInZone, getDeviceTimeZone } from '../utils/timezones';
import { TimeZoneModal } from './TimeZoneModal';
import { playCabinChime } from '../utils/cabinAudio';

const TIMEZONE_STORAGE_KEY = 'silvermyst_selected_timezone_v1';

interface DashboardClockButtonProps {
  className?: string;
}

export const DashboardClockButton: React.FC<DashboardClockButtonProps> = ({
  className = '',
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string | undefined>(() => {
    try {
      const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
      return stored || undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectZone = (tz: string | undefined) => {
    setSelectedTimeZone(tz);
    try {
      if (tz) {
        localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
      } else {
        localStorage.removeItem(TIMEZONE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  };

  const activeZone = selectedTimeZone || getDeviceTimeZone();
  const formatted = formatTimeInZone(now, activeZone);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playCabinChime('tap');
          setIsModalOpen(true);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl cabin-panel border shadow-2xs shrink-0 hover:brightness-110 transition-all cursor-pointer ${className}`}
        title={`${formatted.dateStr} · ${formatted.ianaTimeZone} (Click for US & Global Time Zones or ZIP lookup)`}
      >
        <Clock className="w-3.5 h-3.5 opacity-80 shrink-0" style={{ color: 'var(--cabin-accent)' }} />
        <span className="tabular-nums font-extrabold text-xs sm:text-[13px] whitespace-nowrap">
          {formatted.timeStr}
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-[10px] font-black text-sky-500 dark:text-sky-300 uppercase whitespace-nowrap">
          {formatted.zoneAbbr}
        </span>
      </button>

      <TimeZoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTimeZone={selectedTimeZone}
        onSelectTimeZone={handleSelectZone}
      />
    </>
  );
};
