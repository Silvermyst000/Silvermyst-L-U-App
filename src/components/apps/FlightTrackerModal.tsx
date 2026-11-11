import React, { useState } from 'react';
import { X, Plane, Search, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface FlightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MockFlight {
  flightNo: string;
  airline: string;
  destination: string;
  time: string;
  terminal: string;
  gate: string;
  status: 'On Time' | 'Boarding' | 'Departed' | 'Arrived';
}

const MOCK_FLIGHTS: MockFlight[] = [
  { flightNo: 'AA 1420', airline: 'American Airlines', destination: 'Dallas / Fort Worth (DFW)', time: '11:45 AM', terminal: 'Terminal 4', gate: 'Gate 42B', status: 'On Time' },
  { flightNo: 'UA 892', airline: 'United Airlines', destination: 'Chicago O’Hare (ORD)', time: '12:15 PM', terminal: 'Terminal 7', gate: 'Gate 74', status: 'Boarding' },
  { flightNo: 'DL 520', airline: 'Delta Air Lines', destination: 'Atlanta Hartsfield (ATL)', time: '12:40 PM', terminal: 'Terminal 2', gate: 'Gate 26', status: 'On Time' },
  { flightNo: 'WN 310', airline: 'Southwest Airlines', destination: 'Las Vegas (LAS)', time: '1:05 PM', terminal: 'Terminal 1', gate: 'Gate 14', status: 'On Time' },
];

export const FlightTrackerModal: React.FC<FlightTrackerModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = search.trim()
    ? MOCK_FLIGHTS.filter(
        (f) =>
          f.flightNo.toLowerCase().includes(search.toLowerCase()) ||
          f.airline.toLowerCase().includes(search.toLowerCase()) ||
          f.destination.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_FLIGHTS;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Airport Terminal Flight Tracker
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

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by flight number (e.g. AA 1420), airline or city..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Flight list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
          {filtered.map((fl) => (
            <div
              key={fl.flightNo}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                    {fl.flightNo}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    {fl.airline}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    fl.status === 'Boarding'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {fl.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="truncate pr-2">To: {fl.destination}</span>
                <span className="shrink-0 font-bold tabular-nums text-slate-900 dark:text-white">
                  {fl.time}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span>📍 {fl.terminal}</span>
                <span>·</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {fl.gate}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight transition-colors cursor-pointer shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
};
