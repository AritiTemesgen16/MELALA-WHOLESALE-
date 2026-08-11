import React from 'react';
import logoMarkImg from '../assets/images/melala_logo_mark_1786456883757.jpg';

interface MelalaLogoProps {
  variant?: 'full' | 'compact' | 'mark';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSlogan?: boolean;
}

export const MelalaLogo: React.FC<MelalaLogoProps> = ({
  variant = 'compact',
  theme = 'light',
  size = 'md',
  className = '',
  showSlogan = true,
}) => {
  const isDark = theme === 'dark';

  // Sizing mappings
  const markSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  const subSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Mark Container */}
      <div
        className={`${markSizeClasses} shrink-0 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/80 flex items-center justify-center p-0.5 relative group`}
      >
        <img
          src={logoMarkImg}
          alt="Melala Logo Mark"
          className="w-full h-full object-contain rounded-lg"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback SVG if image load is blocked
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* SVG Backup Icon rendered if image fallback occurs */}
        <svg
          className="w-full h-full p-1 hidden text-teal-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>

      {/* Text Branding */}
      {variant !== 'mark' && (
        <div className="flex flex-col">
          <div
            className={`font-black tracking-tight leading-none ${titleSizeClasses} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            MELALA{' '}
            <span className="text-teal-600 font-extrabold tracking-normal">
              {variant === 'full' ? 'PHARMACEUTICAL WHOLESALE' : 'WHOLESALE'}
            </span>
          </div>

          {showSlogan && (
            <div
              className={`font-semibold uppercase tracking-wider mt-0.5 ${subSizeClasses} ${
                isDark ? 'text-teal-300' : 'text-slate-500'
              }`}
            >
              {variant === 'full'
                ? 'Your Trusted Healthcare Partner • EFDA Licensed B2B'
                : 'Pharmaceutical & Healthcare B2B'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
