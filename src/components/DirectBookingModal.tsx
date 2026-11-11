import React, { useState } from 'react';
import { MultiserviceItem } from '../types/kiosk';
import { X, CheckCircle2, ShieldCheck, Calendar, Phone, Mail, Send } from 'lucide-react';
import { playCabinChime } from '../utils/cabinAudio';

interface DirectBookingModalProps {
  service: MultiserviceItem | null;
  onClose: () => void;
}

export const DirectBookingModal: React.FC<DirectBookingModalProps> = ({ service, onClose }) => {
  const [passengerName, setPassengerName] = useState('');
  const [passengerContact, setPassengerContact] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim() || !passengerContact.trim()) return;

    playCabinChime('acknowledged');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest font-display">
              Silvermyst Multiservices • silvermyst.com
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {service.title}
            </h3>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Inquiry Sent to Carlos!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Carlos has received your request and will text or call you with confirmation and flat-rate details shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {service.badge}
                </span>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {service.pricingHint}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {service.fullDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 min-h-[46px]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone / Email *
                </label>
                <input
                  type="text"
                  required
                  value={passengerContact}
                  onChange={(e) => setPassengerContact(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 min-h-[46px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Date / Time
                </label>
                <input
                  type="text"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  placeholder="e.g. Tomorrow 6:00 AM / Friday"
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 min-h-[46px]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pick-up / Location Info
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Terminal 2 Airport or Downtown"
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 min-h-[46px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-extrabold text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer min-h-[50px]"
            >
              <Send className="w-4.5 h-4.5" />
              <span>Submit Direct Booking Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
