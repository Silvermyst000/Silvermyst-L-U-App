import React from 'react';
import { GalleryItem } from '../types/kiosk';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { playCabinChime } from '../utils/cabinAudio';

interface PhotoLightboxModalProps {
  photos: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}) => {
  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCabinChime('tap');
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCabinChime('tap');
    onSelectIndex((currentIndex + 1) % photos.length);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 font-display">
              {currentPhoto.tag}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-medium tabular-nums">
              Photo {currentIndex + 1} of {photos.length}
            </span>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Frame with Nav Arrows */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[58vh]">
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Caption & Story Description */}
        <div className="p-6 bg-slate-900/90 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">
              {currentPhoto.title}
            </h3>
            <span className="text-xs text-sky-400 font-medium">
              {currentPhoto.subtitle}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {currentPhoto.description}
          </p>

          {/* Thumbnail dots row */}
          <div className="flex items-center gap-2 pt-3">
            {photos.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  playCabinChime('tap');
                  onSelectIndex(idx);
                }}
                className={`relative w-12 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-sky-400 scale-105 shadow-md shadow-sky-500/20'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
