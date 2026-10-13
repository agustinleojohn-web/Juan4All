import React, { useId } from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  clickable?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true,
  className = '',
}) => {
  const gradientId = useId();

  const sizeConfig = {
    sm: { text: 'text-xl', iconW: 18, iconH: 22 },
    md: { text: 'text-2xl sm:text-3xl', iconW: 24, iconH: 28 },
    lg: { text: 'text-3xl sm:text-4xl', iconW: 30, iconH: 36 },
    xl: { text: 'text-4xl sm:text-5xl', iconW: 40, iconH: 48 },
  };

  const current = sizeConfig[size];

  const logoContent = (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`inline-flex items-center tracking-wide font-bebas ${current.text} leading-none select-none`}>
        {/* "JUAN" in bold white Bebas Neue font */}
        <span className="text-white tracking-wider font-normal">JUAN</span>

        {/* The Number 4 is a clean Red Playbutton with NO vertical line */}
        <span
          className="relative inline-flex items-center justify-center mx-1 sm:mx-1.5 transition-transform duration-200 hover:scale-105"
          title="Juan4All"
          aria-label="4 (Red Play Button)"
        >
          <svg
            width={current.iconW}
            height={current.iconH}
            viewBox="0 0 32 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block drop-shadow-[0_2px_8px_rgba(229,9,20,0.65)]"
          >
            <defs>
              <linearGradient id={`redPlayGrad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2A38" />
                <stop offset="50%" stopColor="#E50914" />
                <stop offset="100%" stopColor="#9E000B" />
              </linearGradient>
            </defs>
            {/* Smooth rounded right-pointing play button triangle */}
            <path
              d="M6 5.5C6 3.96 7.67 3 9 3.77L27.5 16.27C28.83 17.04 28.83 18.96 27.5 19.73L9 32.23C7.67 33 6 32.04 6 30.5V5.5Z"
              fill={`url(#redPlayGrad-${gradientId})`}
              stroke="#FF4D5A"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* "ALL" in bold white Bebas Neue font */}
        <span className="text-white tracking-wider font-normal">ALL</span>
      </div>

      {showTagline && (
        <span className="text-[10px] sm:text-xs text-[#B3B3B3] tracking-widest uppercase font-medium mt-1 font-sans">
          Your next movie night starts here.
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        to="/"
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] rounded-lg"
        aria-label="Juan4All Home"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
