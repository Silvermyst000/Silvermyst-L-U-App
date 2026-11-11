import React, { useState } from 'react';
import { X, Calculator, Users, DollarSign, Sparkles } from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface FareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FareCalculatorModal: React.FC<FareCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [fareAmount, setFareAmount] = useState<number>(36.0);
  const [tipPercent, setTipPercent] = useState<number>(20);
  const [passengerCount, setPassengerCount] = useState<number>(2);

  if (!isOpen) return null;

  const tipAmount = (fareAmount * tipPercent) / 100;
  const totalAmount = fareAmount + tipAmount;
  const perPerson = totalAmount / Math.max(1, passengerCount);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Fare & Tip Split Calculator
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

        {/* Big Per-Person Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white text-center space-y-1 shadow-md">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-100">
            Each Person Pays ({passengerCount} riders)
          </span>
          <div className="text-3xl font-extrabold font-display tabular-nums">
            ${perPerson.toFixed(2)}
          </div>
          <p className="text-[11px] text-teal-100 tabular-nums">
            Total with {tipPercent}% tip: ${totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Ride Fare ($)
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                step="0.5"
                value={fareAmount}
                onChange={(e) => setFareAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Tip for Carlos
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    playCabinChime('tap');
                    setTipPercent(pct);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tipPercent === pct
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Number of Riders Splitting
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    playCabinChime('tap');
                    setPassengerCount(count);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    passengerCount === count
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {count} {count === 1 ? 'Person' : 'People'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
