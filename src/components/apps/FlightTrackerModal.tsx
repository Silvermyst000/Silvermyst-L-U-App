import React, { useState } from 'react';
import {
  X,
  Plane,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';

interface FlightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MockFlight {
  flightNo: string;
  airline: string;
  origin: string;
  destination: string;
  time: string;
  terminal: string;
  gate: string;
  status: 'On Time' | 'Boarding' | 'Departed' | 'Arrived' | 'Delayed';
  driveTimeFromCar: string;
}

const REGIONAL_AIRPORTS = [
  { code: 'SBN', name: 'South Bend International', distance: '12 mins (Local Hub)' },
  { code: 'ORD', name: 'Chicago O\'Hare International', distance: '1 hr 45 mins' },
  { code: 'MDW', name: 'Chicago Midway International', distance: '1 hr 35 mins' },
  { code: 'IND', name: 'Indianapolis International', distance: '2 hrs 10 mins' },
];

const POPULAR_FLIGHTS: MockFlight[] = [
  {
    flightNo: 'DL 5320',
    airline: 'Delta Air Lines',
    origin: 'Atlanta (ATL)',
    destination: 'South Bend (SBN)',
    time: '2:15 PM',
    terminal: 'Main Terminal',
    gate: 'Gate 5',
    status: 'On Time',
    driveTimeFromCar: '12 mins to Curbside Pickup',
  },
  {
    flightNo: 'AA 3614',
    airline: 'American Eagle',
    origin: 'Dallas/Fort Worth (DFW)',
    destination: 'South Bend (SBN)',
    time: '3:40 PM',
    terminal: 'Main Terminal',
    gate: 'Gate 7B',
    status: 'On Time',
    driveTimeFromCar: '12 mins to Curbside Pickup',
  },
  {
    flightNo: 'UA 1892',
    airline: 'United Airlines',
    origin: 'New York (EWR)',
    destination: 'Chicago O’Hare (ORD)',
    time: '4:20 PM',
    terminal: 'Terminal 1',
    gate: 'Gate B18',
    status: 'Boarding',
    driveTimeFromCar: '1 hr 45 mins via I-90 Tollway',
  },
  {
    flightNo: 'WN 428',
    airline: 'Southwest Airlines',
    origin: 'Orlando (MCO)',
    destination: 'Chicago Midway (MDW)',
    time: '5:10 PM',
    terminal: 'Concourse A',
    gate: 'Gate A4',
    status: 'On Time',
    driveTimeFromCar: '1 hr 35 mins via I-80/I-90',
  },
  {
    flightNo: 'G4 1184',
    airline: 'Allegiant Air',
    origin: 'Punta Gorda (PGD)',
    destination: 'South Bend (SBN)',
    time: '6:30 PM',
    terminal: 'Main Terminal',
    gate: 'Gate 3',
    status: 'On Time',
    driveTimeFromCar: '12 mins to Curbside Pickup',
  },
];

export const FlightTrackerModal: React.FC<FlightTrackerModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('SBN');

  if (!isOpen) return null;

  const handleOpenGoogleFlights = (flightQuery?: string) => {
    playCabinChime('tap');
    const query = flightQuery ? `flight+${encodeURIComponent(flightQuery)}` : `flights+from+${selectedAirport}`;
    openExternalUrl(`https://www.google.com/search?q=${query}`);
  };

  const filtered = search.trim()
    ? POPULAR_FLIGHTS.filter(
        (f) =>
          f.flightNo.toLowerCase().includes(search.toLowerCase()) ||
          f.airline.toLowerCase().includes(search.toLowerCase()) ||
          f.destination.toLowerCase().includes(search.toLowerCase()) ||
          f.origin.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_FLIGHTS;

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 border border-sky-500/30 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Live Flight Tracker & Airport Navigator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  Google Flights Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track arrivals, flight gates, baggage status, and highway travel times.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Airport Hub Selector & Direct Google Flight Link */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Regional Airport Hub:
            </span>
            <button
              onClick={() => handleOpenGoogleFlights(search || selectedAirport)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Track on Google Live</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGIONAL_AIRPORTS.map((ap) => (
              <button
                key={ap.code}
                onClick={() => {
                  playCabinChime('tap');
                  setSelectedAirport(ap.code);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedAirport === ap.code
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
                }`}
              >
                <div className="text-xs font-black">{ap.code}</div>
                <div className="text-[10px] opacity-80 truncate">{ap.name}</div>
                <div className="text-[9px] opacity-70 mt-0.5 flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5" />
                  <span>{ap.distance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flight number (e.g. DL 5320, AA 3614) or destination..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>
          {search.trim() && (
            <button
              onClick={() => handleOpenGoogleFlights(search)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Search Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Flight Cards Stream */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
          {filtered.map((fl) => (
            <div
              key={fl.flightNo}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 space-y-2.5 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {fl.flightNo}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      • {fl.airline}
                    </span>
                  </div>
                  <div className="text-xs text-sky-600 dark:text-sky-400 font-bold mt-0.5 flex items-center gap-1.5">
                    <span>{fl.origin}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{fl.destination}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      fl.status === 'Boarding'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : fl.status === 'Delayed'
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    }`}
                  >
                    {fl.status}
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 font-bold">
                    Arrival: {fl.time}
                  </div>
                </div>
              </div>

              {/* Gate, Terminal, and Live Link Bar */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{fl.terminal}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{fl.gate}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-indigo-500 dark:text-indigo-400 font-medium">
                    {fl.driveTimeFromCar}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenGoogleFlights(fl.flightNo)}
                  className="flex items-center gap-1 text-sky-500 hover:text-sky-400 font-bold text-xs cursor-pointer hover:underline"
                >
                  <span>Google Live Status</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
