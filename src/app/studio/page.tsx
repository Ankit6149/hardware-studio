"use client";

import dynamic from 'next/dynamic';

const StudioRoot = dynamic(
  () => import('../../components/reliability/StudioRoot').then((mod) => mod.StudioRoot),
  { ssr: false }
);

export default function StudioPage() {
  return <StudioRoot />;
}
