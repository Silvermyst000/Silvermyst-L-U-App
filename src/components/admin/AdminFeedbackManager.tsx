import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Filter,
  Calendar,
} from 'lucide-react';
import { PassengerFeedback, DriverProfile, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminFeedbackManagerProps {
  drivers: DriverProfile[];
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

export const AdminFeedbackManager: React.FC<AdminFeedbackManagerProps> = ({
  drivers,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [feedbackList, setFeedbackList] = useState<PassengerFeedback[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const unsub = cloudSync.subscribeToFeedback((list) => {
      setFeedbackList(list);
    });
    return () => unsub();
  }, []);

  const filtered = feedbackList.filter((fb) => {
    const matchesRating = filterRating === 'all' || fb.rating === filterRating;
    const matchesCategory = filterCategory === 'all' || fb.category === filterCategory;
    return matchesRating && matchesCategory;
  });

  const totalReviews = feedbackList.length;
  const averageRating =
    totalReviews > 0
      ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const fiveStarCount = feedbackList.filter((f) => f.rating === 5).length;
  const complimentsCount = feedbackList.reduce((acc, curr) => acc + (curr.compliments?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border border-amber-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-500/40">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.feedbackTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.feedbackSub}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sl.overallRating}</span>
          <div className="text-3xl font-black text-amber-400 flex items-center gap-1.5">
            <span>{averageRating}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Fleet</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sl.totalSubmissions}</span>
          <div className="text-3xl font-black text-white">{totalReviews}</div>
          <div className="text-[11px] text-emerald-400 font-bold">100%</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sl.fiveStarRides}</span>
          <div className="text-3xl font-black text-emerald-400">{fiveStarCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">
            {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100}%
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sl.complimentsTagged}</span>
          <div className="text-3xl font-black text-purple-400">{complimentsCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">VIP</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">{sl.filterStars}</span>
          <div className="flex items-center gap-1">
            {['all', 5, 4, 3, 2, 1].map((st) => (
              <button
                key={st}
                onClick={() => {
                  playCabinChime('tap');
                  setFilterRating(st as any);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  filterRating === st
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? sl.all : `${st} ★`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">{sl.category}</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none"
          >
            <option value="all">{sl.allFeedback}</option>
            <option value="compliment">{sl.complimentsOnly}</option>
            <option value="suggestion">{sl.suggestions}</option>
            <option value="concern">{sl.concerns}</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.submissionLog}</h3>
          <span className="text-xs text-slate-400">{filtered.length} {sl.reviewsShown}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No passenger feedback submissions match your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-white">
                      Host Driver: {item.driverName || 'Carlos'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {item.compliments && item.compliments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {item.compliments.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}

                {item.message && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                    "{item.message}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
