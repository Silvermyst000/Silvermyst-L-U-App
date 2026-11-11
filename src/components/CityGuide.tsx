import React, { useState } from 'react';
import { MapPin, Compass, Utensils, Sparkles, Navigation } from 'lucide-react';
import { LOCAL_RECOMMENDATIONS } from '../data/mockData';
import { playCabinChime } from '../utils/cabinAudio';

export const CityGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Culture', 'Dining', 'Nightlife', 'Sightseeing'];

  const filtered = selectedCategory === 'All'
    ? LOCAL_RECOMMENDATIONS
    : LOCAL_RECOMMENDATIONS.filter((r) => r.category === selectedCategory);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Category Filter Pills (Functional interactive buttons) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory(cat);
            }}
            className={`flex-1 py-1 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center truncate ${
              selectedCategory === cat
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guide List with Carlos's Personal Tips */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  {item.name}
                </h4>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-400" />
                {item.distance}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10.5px] text-amber-700 dark:text-amber-400/90 font-medium">
              <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
              <span>Carlos's Tip: {item.carlosTip}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 flex items-center justify-between text-xs text-sky-900 dark:text-sky-300">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-500 shrink-0" />
          <span>Need a customized local stop on today's trip?</span>
        </div>
        <span className="font-semibold text-[11px] text-sky-700 dark:text-sky-400">
          Just ask Carlos!
        </span>
      </div>
    </div>
  );
};
