import React from 'react';
import { X, CloudSun, Wind, Droplets, Sun, Compass } from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface WeatherAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherAppModal: React.FC<WeatherAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hourly = [
    { time: 'Now', temp: '72°', icon: '☀️' },
    { time: '11 AM', temp: '74°', icon: '☀️' },
    { time: '12 PM', temp: '76°', icon: '⛅' },
    { time: '1 PM', temp: '77°', icon: '🌤️' },
    { time: '2 PM', temp: '75°', icon: '⛅' },
    { time: '3 PM', temp: '73°', icon: '☀️' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Metro In-Cabin Weather & Forecast
            </h3>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Weather Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-100 font-semibold">Local Metro Area</span>
              <h2 className="text-3xl font-extrabold font-display tabular-nums mt-0.5">72°F</h2>
              <p className="text-xs text-sky-100">Clear Skies • Perfect Driving Weather</p>
            </div>
            <Sun className="w-12 h-12 text-amber-300 animate-spin" style={{ animationDuration: '24s' }} />
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-white/20 text-xs">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" /> 38% Humidity
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" /> 6 mph Breeze
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Airport 70°F
            </span>
          </div>
        </div>

        {/* Hourly Strip */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
            Hourly In-Ride Forecast
          </span>
          <div className="grid grid-cols-6 gap-2 text-center">
            {hourly.map((h, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
              >
                <span className="text-[10px] text-slate-400 block">{h.time}</span>
                <span className="text-sm my-1 block">{h.icon}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                  {h.temp}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
