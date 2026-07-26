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
      <path
        d="M19 17v10m0 10v10M45 17v10m0 10v10M19 27h9m8 0h9M19 37h9m8 0h9M28 27v10h8V27"
        fill="none"
        stroke="#f3f0e8"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="14" r="3" fill="#f3f0e8" />
      <circle cx="45" cy="14" r="3" fill="#f3f0e8" />
      <circle cx="19" cy="50" r="3" fill="#f3f0e8" />
      <circle cx="45" cy="50" r="3" fill="#f3f0e8" />
      <circle cx="32" cy="32" r="3.5" fill="#9de4c2" />
    </svg>
  </span>
);
