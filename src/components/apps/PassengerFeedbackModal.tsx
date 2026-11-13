import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  Send,
  X,
  CheckCircle,
  ShieldCheck,
  Heart,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { PassengerFeedback } from '../../types/kiosk';
import { playCabinChime } from '../../utils/cabinAudio';

interface PassengerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: Omit<PassengerFeedback, 'id' | 'submittedAt'>) => void;
  driverId?: string;
  driverName?: string;
}

export const PassengerFeedbackModal: React.FC<PassengerFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitFeedback,
  driverId = 'carlos-01',
  driverName = 'Carlos',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [compliments, setCompliments] = useState<string[]>(['Smooth Ride 🚗', 'Clean Vehicle ✨']);
  const [category, setCategory] = useState<PassengerFeedback['category']>('compliment');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const complimentOptions = [
    'Smooth Ride 🚗',
    'Spotless Clean Cabin ✨',
    'Great Conversation 💬',
    'Perfect Music & Sound 🎵',
    'Professional & Courteous 👔',
    'Safe & Attentive Driver 🛡️',
    'Comfortable Climate ❄️',
    'Helpful with Luggage 🧳',
  ];

  const toggleCompliment = (item: string) => {
    playCabinChime('tap');
    setCompliments((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCabinChime('acknowledged');

    onSubmitFeedback({
      rating,
      compliments,
      category,
      message: message.trim() || undefined,
      driverId,
      driverName,
      isRead: false,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[92vh] bg-slate-950 text-white rounded-3xl border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black">
              <Heart className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Passenger Feedback & Review</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Private & Secure
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Share your experience with {driverName}. Sent privately to management.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>
            <h4 className="text-2xl font-black text-white">Thank You for Your Feedback!</h4>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your compliments and comments help Silvermyst Multiservices uphold executive-level transportation excellence.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* 5-Star Driver Rating */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                How Was Your Ride with {driverName}?
              </span>
              <div className="flex justify-center items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setRating(star);
                    }}
                    className="p-1.5 transition-transform hover:scale-120 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-amber-400">
                {rating === 5 && 'Outstanding 5-Star Executive Ride!'}
                {rating === 4 && 'Great Ride Experience!'}
                {rating === 3 && 'Average Trip'}
                {rating <= 2 && 'Needs Improvement'}
              </div>
            </div>

            {/* Compliments Badges */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-amber-400" />
                <span>What Did You Like Most? (Tap to Select)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {complimentOptions.map((opt) => {
                  const isChecked = compliments.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleCompliment(opt)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Feedback Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compliment', label: 'Compliment 🌟' },
                  { id: 'suggestion', label: 'Suggestion 💡' },
                  { id: 'concern', label: 'Concern / Note ⚠️' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playCabinChime('tap');
                      setCategory(cat.id as any);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      category === cat.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Written Comments or Message for Management (Optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share any special details or praise for Carlos..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-900">
              <button
                type="button"
                onClick={() => {
                  playCabinChime('tap');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 fill-slate-950" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
