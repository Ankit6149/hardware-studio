'use client';

import React from 'react';

interface LandingSectionLinkProps {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}

export const LandingSectionLink: React.FC<LandingSectionLinkProps> = ({ targetId, className, children }) => (
  <button
    type="button"
    className={className}
    onClick={() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
  >
    {children}
  </button>
);
