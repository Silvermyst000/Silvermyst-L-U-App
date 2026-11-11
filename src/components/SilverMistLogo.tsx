import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SilverMistLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-sm font-bold tracking-wider',
    md: 'text-lg font-bold tracking-widest',
    lg: 'text-2xl font-bold tracking-[0.2em]',
  }[size];

  const subtitleSize = {
    sm: 'text-[9px] tracking-[0.25em]',
    md: 'text-[11px] tracking-[0.3em]',
    lg: 'text-xs tracking-[0.35em]',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Luxury Silver Mist Hexagon / Diamond Crest */}
      <div className={`relative ${iconDimensions} shrink-0 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-[1.5px] shadow-sm`}>
        <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
          {/* Subtle mist light reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/20" />
          
          <svg
            viewBox="0 0 40 40"
            className="w-3/4 h-3/4 text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            fill="none"
            stroke="currentColor"
          >
            {/* Geometric interlocking S & M logo */}
            <path
              d="M12 14C12 11.79 14.2 10 17 10H22C24.8 10 27 11.79 27 14C27 17 21 17 21 20C21 23 27 23 27 26C27 28.21 24.8 30 22 30H17C14.2 30 12 28.21 12 26"
              stroke="url(#silverGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M20 7L24 11M20 33L24 29"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="1.5" fill="#38bdf8" />
            <defs>
              <linearGradient id="silverGradient" x1="12" y1="10" x2="27" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.5" stopColor="#cbd5e1" />
                <stop offset="1" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={`${titleSize} text-slate-900 dark:text-white uppercase leading-none font-display`}>
          Silvermyst
        </span>
        {showSubtitle && (
          <span className={`${subtitleSize} text-slate-500 dark:text-slate-400 uppercase font-medium mt-1 leading-none`}>
            Multiservices
          </span>
        )}
      </div>
    </div>
  );
};
