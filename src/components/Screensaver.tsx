import React, { useState, useEffect, useRef } from 'react';
import { ScreensaverSettings, ScreensaverSlideItem } from '../types/kiosk';
import { SCREENSAVER_ALBUM } from '../data/mockData';
import { playCabinChime } from '../utils/cabinAudio';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface ScreensaverProps {
  isActive: boolean;
  settings: ScreensaverSettings;
  onDismiss: () => void;
  onOpenAdminSettings: () => void;
  websiteUrl: string;
  phoneNumber: string;
}

export const Screensaver: React.FC<ScreensaverProps> = ({
  isActive,
  settings,
  onDismiss,
  onOpenAdminSettings,
}) => {
  // Filter active slides from the dedicated promotional SCREENSAVER_ALBUM based on Carlos's chosen IDs
  const activeSlides: ScreensaverSlideItem[] = SCREENSAVER_ALBUM.filter((item) =>
    settings.selectedPhotoIds.includes(item.id)
  );

  // Fallback to all 10 promo posters if none selected
  const slides = activeSlides.length > 0 ? activeSlides : SCREENSAVER_ALBUM;

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto-advance slideshow timer
  useEffect(() => {
    if (!isActive || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, (settings.slideDurationSeconds || 8) * 1000);

    return () => clearInterval(interval);
  }, [isActive, slides.length, settings.slideDurationSeconds]);

  // Reset to first slide when screensaver opens
  useEffect(() => {
    if (isActive) {
      setCurrentIndex(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    playCabinChime('tap');
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    playCabinChime('tap');
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Touch swipe handling for horizontal scrolling left and right
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 45; // min distance for swipe
      if (distance > minSwipeDistance) {
        // Swiped left -> Next picture
        handleNext();
      } else if (distance < -minSwipeDistance) {
        // Swiped right -> Previous picture
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleWakeUp = () => {
    playCabinChime('acknowledged');
    onDismiss();
  };

  return (
    <div
      onClick={handleWakeUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden animate-fadeIn"
      title="Touch anywhere to start the screen"
    >
      {/* Pure Edge-to-Edge Picture Display (No QR overlays, no text cards) */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <img
          key={currentSlide.id}
          src={currentSlide.imageUrl}
          alt={currentSlide.title}
          className="w-full h-full object-contain pointer-events-none transition-opacity duration-700 animate-fadeIn"
        />
      </div>

      {/* Left Navigation Chevron Button (Scroll Left) */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3.5 sm:p-5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/30 backdrop-blur-md shadow-2xl transition-all cursor-pointer z-20 active:scale-95 group"
        title="Previous picture (or swipe right)"
      >
        <ChevronLeft className="w-7 h-7 sm:w-10 sm:h-10 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Right Navigation Chevron Button (Scroll Right) */}
      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3.5 sm:p-5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/30 backdrop-blur-md shadow-2xl transition-all cursor-pointer z-20 active:scale-95 group"
        title="Next picture (or swipe left)"
      >
        <ChevronRight className="w-7 h-7 sm:w-10 sm:h-10 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Discreet Admin Settings Gear Icon in top corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          playCabinChime('tap');
          onDismiss();
          onOpenAdminSettings();
        }}
        className="absolute top-4 right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white/50 hover:text-white transition-colors cursor-pointer z-20"
        title="Driver Screensaver Admin Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Bottom Area: "Touch anywhere to start the screen" Button followed by Carousel Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex flex-col items-center gap-3.5 z-20 pointer-events-none">
        {/* The Button requested by Carlos: "Touch anywhere to start the screen" */}
        <div
          onClick={handleWakeUp}
          className="pointer-events-auto inline-flex items-center justify-center px-8 sm:px-12 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-500 hover:brightness-110 active:scale-97 text-white font-extrabold text-sm sm:text-base tracking-tight shadow-2xl border border-white/50 cursor-pointer animate-pulse transition-all min-h-[52px]"
        >
          <span>Touch anywhere to start the screen</span>
        </div>

        {/* Slide Indicator Dots underneath the button */}
        {slides.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/25 pointer-events-auto shadow-lg"
          >
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={(e) => {
                  e.stopPropagation();
                  playCabinChime('tap');
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 sm:w-10 bg-white shadow-md'
                    : 'w-2.5 bg-white/40 hover:bg-white/80'
                }`}
                title={`Switch to: ${slide.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
