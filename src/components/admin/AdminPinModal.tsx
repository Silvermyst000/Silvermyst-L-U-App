import React, { useState } from 'react';
import { ShieldCheck, Lock, Delete, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savedPin?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  savedPin = '1229',
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigitPress = (digit: string) => {
    playCabinChime('tap');
    setIsError(false);
    setErrorMessage(null);

    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      // If 4th digit entered, auto-verify
      if (nextPin.length === 4) {
        if (nextPin === savedPin) {
          playCabinChime('acknowledged');
          setTimeout(() => {
            setPin('');
            onSuccess();
          }, 200);
        } else {
          setIsError(true);
          setErrorMessage('Incorrect PIN. Please try again.');
          playCabinChime('comfort');
          setTimeout(() => {
            setPin('');
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    playCabinChime('tap');
    setIsError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    playCabinChime('tap');
    setIsError(false);
    setPin('');
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm bg-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-purple-800/60 shadow-[0_0_50px_rgba(147,51,234,0.3)] space-y-5 text-center relative transition-transform ${
          isError ? 'animate-bounce' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playCabinChime('tap');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Administration Access
          </h3>
          <p className="text-xs text-slate-400">
            Enter 4-digit security PIN to access fleet controls and button manager.
          </p>
        </div>

        {/* 4 PIN Dots */}
        <div className="flex justify-center items-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isError
                    ? 'bg-rose-500 ring-4 ring-rose-500/30'
                    : isFilled
                    ? 'bg-purple-500 ring-4 ring-purple-500/30 scale-110'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Numeric Keypad (3x4 grid) */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-14 rounded-2xl bg-slate-900/90 hover:bg-purple-900/50 active:scale-95 border border-slate-800 hover:border-purple-600/60 text-white font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm select-none"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-14 rounded-2xl bg-slate-900/90 hover:bg-purple-900/50 active:scale-95 border border-slate-800 hover:border-purple-600/60 text-white font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm select-none"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Note */}
        <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-900">
          <span>Protected In-Cabin Host Terminal • Default PIN: <strong>1229</strong></span>
        </div>
      </div>
    </div>
  );
};
