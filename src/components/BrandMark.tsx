import React from 'react';

interface BrandMarkProps {
  className?: string;
  title?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  className = 'h-9 w-9',
  title = 'Hardware Studio',
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[28%] shadow-[0_8px_24px_rgba(15,23,42,0.16)] ${className}`}
    aria-label={title}
    role="img"
  >
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#11110f" />
      <g
        fill="none"
        stroke="#f3f0e8"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="14" y="14" width="36" height="36" rx="4" />
        <path d="M30 26h8a4 4 0 0 0 4-4v-8" />
        <circle cx="26" cy="26" r="4" />
        <path d="M22 50v-8a4 4 0 0 1 4-4h8" />
        <circle cx="38" cy="38" r="4" />
      </g>
    </svg>
  </span>
);
