import React from 'react';

interface RailQuickLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const RailQuickLogo: React.FC<RailQuickLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    sm: {
      text: 'text-2xl',
      badge: 'text-[9px] px-2.5 py-0.5',
      arrowHeight: 18,
      arrowWidth: 32,
      gap: 'gap-1',
    },
    md: {
      text: 'text-3xl',
      badge: 'text-[10px] px-3 py-1',
      arrowHeight: 22,
      arrowWidth: 40,
      gap: 'gap-1.5',
    },
    lg: {
      text: 'text-4xl sm:text-5xl',
      badge: 'text-xs px-3.5 py-1',
      arrowHeight: 28,
      arrowWidth: 50,
      gap: 'gap-2',
    },
    xl: {
      text: 'text-5xl sm:text-6xl',
      badge: 'text-xs sm:text-sm px-4 py-1.5',
      arrowHeight: 34,
      arrowWidth: 60,
      gap: 'gap-2.5',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none ${className} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
    >
      {/* Brand Name */}
      <div className="flex items-center tracking-tight font-black leading-none">
        {/* "Rail" */}
        <span className={`${sizeConfig.text} text-slate-900 font-extrabold tracking-tight`}>
          Rail
        </span>

        {/* "Quick" with fast-forward arrow integrated into Q */}
        <div className="relative inline-flex items-center">
          <span className={`${sizeConfig.text} text-[#008b3e] font-black tracking-tight ml-0.5`}>
            Quick
          </span>

          {/* Dynamic orange train-speed track streak over the Q */}
          <svg
            className="absolute -left-1 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-sm"
            width={sizeConfig.arrowWidth}
            height={sizeConfig.arrowHeight}
            viewBox="0 0 50 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed dash 1 */}
            <path
              d="M3 14H16M6 10H14M6 18H14"
              stroke="#ff7a00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Speed chevron arrow pointing right */}
            <path
              d="M17 9L23 14L17 19"
              stroke="#ff7a00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Pill Badge: "India's Train Delivery App" */}
      {showSubtitle && (
        <div className={`mt-2 ${sizeConfig.gap}`}>
          <div className={`bg-[#121619] text-white font-bold rounded-full ${sizeConfig.badge} tracking-wide shadow-sm flex items-center justify-center whitespace-nowrap`}>
            India's Train Delivery App
          </div>
        </div>
      )}
    </div>
  );
};
