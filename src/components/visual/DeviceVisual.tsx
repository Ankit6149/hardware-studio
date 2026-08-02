'use client';

import React, { Suspense, lazy } from 'react';
import {
  Box,
  CameraOff,
  CircleHelp,
  FileWarning,
  ImageOff,
  Layers3,
} from 'lucide-react';
import {
  getVisualFamily,
  RepresentationKind,
  VisualFamilyId,
} from '../../lib/visual/representationRegistry';
import type { VisualQualityProfile } from './Lightweight3DPreview';

const LazyLightweight3DPreview = lazy(() =>
  import('./Lightweight3DPreview').then((module) => ({ default: module.Lightweight3DPreview })),
);

interface DeviceVisualProps {
  familyId: VisualFamilyId;
  kind: RepresentationKind;
  className?: string;
  quality?: VisualQualityProfile;
  compact?: boolean;
}

interface ArchitectureGlyphProps {
  familyId: VisualFamilyId;
  className?: string;
  title?: string;
}

const commonStroke = {
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

export const ArchitectureGlyph: React.FC<ArchitectureGlyphProps> = ({ familyId, className = '', title }) => {
  const family = getVisualFamily(familyId);
  const glyph = (() => {
    switch (familyId) {
      case 'resistor':
        return <><path d="M5 32h10l5-9 8 18 8-18 8 18 5-9h10" {...commonStroke} /><circle cx="5" cy="32" r="2" fill="currentColor" /><circle cx="59" cy="32" r="2" fill="currentColor" /></>;
      case 'capacitor':
        return <><path d="M7 32h18M39 32h18M25 18v28M39 18v28" {...commonStroke} /></>;
      case 'led':
        return <><path d="M10 32h14M40 32h14M24 18v28l16-14-16-14Z" {...commonStroke} /><path d="m40 17 8-8m-3 12 8-8" {...commonStroke} /><path d="m46 9 2 7-7-2m6-1 2 7-7-2" {...commonStroke} /></>;
      case 'push-button':
        return <><path d="M8 40h16m16 0h16M24 40l16-12M20 18h24M32 18v8" {...commonStroke} /><circle cx="24" cy="40" r="2.5" fill="currentColor" /><circle cx="40" cy="40" r="2.5" fill="currentColor" /></>;
      case 'microcontroller':
        return <><rect x="15" y="15" width="34" height="34" rx="4" {...commonStroke} /><rect x="24" y="24" width="16" height="16" rx="2" {...commonStroke} />{[20,28,36,44].map((v) => <React.Fragment key={v}><path d={`M${v} 8v7M${v} 49v7M8 ${v}h7M49 ${v}h7`} {...commonStroke} /></React.Fragment>)}</>;
      case 'sensor':
        return <><rect x="11" y="16" width="42" height="32" rx="7" {...commonStroke} /><circle cx="32" cy="32" r="8" {...commonStroke} /><path d="M32 24v16m-8-8h16M6 25h5m-5 14h5m42-14h5m-5 14h5" {...commonStroke} /></>;
      case 'voltage-regulator':
        return <><path d="M7 32h12m26 0h12" {...commonStroke} /><rect x="19" y="18" width="26" height="28" rx="4" {...commonStroke} /><path d="M25 35c4-10 10 10 14 0M32 12v6m0 28v6" {...commonStroke} /></>;
      case 'battery':
        return <><rect x="10" y="18" width="44" height="30" rx="5" {...commonStroke} /><path d="M54 27h5v12h-5M22 25v16m-8-8h16M38 33h10" {...commonStroke} /></>;
      case 'usb-c':
        return <><rect x="7" y="18" width="50" height="28" rx="12" {...commonStroke} /><rect x="15" y="24" width="34" height="16" rx="7" {...commonStroke} /><path d="M23 29v6m6-6v6m6-6v6m6-6v6" {...commonStroke} /></>;
      case 'motor-actuator':
        return <><circle cx="29" cy="32" r="18" {...commonStroke} /><path d="M47 32h11M11 32H6M21 40l16-16m-14 0 14 16" {...commonStroke} /><circle cx="29" cy="32" r="4" fill="currentColor" /></>;
      case 'display':
        return <><rect x="8" y="12" width="48" height="36" rx="5" {...commonStroke} /><path d="M17 22h30M17 30h21M17 38h26M25 54h14" {...commonStroke} /></>;
      case 'debug-connector':
        return <><rect x="10" y="16" width="44" height="32" rx="4" {...commonStroke} />{[20,28,36,44].map((x) => <React.Fragment key={x}><circle cx={x} cy="26" r="2.4" fill="currentColor" /><circle cx={x} cy="38" r="2.4" fill="currentColor" /></React.Fragment>)}<path d="M32 8v8m0 32v8" {...commonStroke} /></>;
      case 'protection-device':
        return <><path d="M32 7 52 15v15c0 13-8 22-20 27C20 52 12 43 12 30V15L32 7Z" {...commonStroke} /><path d="m23 32 6 6 13-15" {...commonStroke} /></>;
      case 'enclosure':
        return <><path d="m10 20 22-12 22 12v26L32 57 10 46V20Z" {...commonStroke} /><path d="m10 20 22 12 22-12M32 32v25" {...commonStroke} /></>;
      case 'pcb-assembly':
        return <><rect x="7" y="12" width="50" height="40" rx="5" {...commonStroke} /><rect x="22" y="22" width="19" height="16" rx="2" {...commonStroke} /><circle cx="14" cy="19" r="2" fill="currentColor" /><circle cx="50" cy="19" r="2" fill="currentColor" /><circle cx="14" cy="45" r="2" fill="currentColor" /><circle cx="50" cy="45" r="2" fill="currentColor" /><path d="M7 31h15m19 0h16M31 12v10m0 16v14" {...commonStroke} /></>;
      case 'firmware-state':
        return <><circle cx="24" cy="32" r="13" {...commonStroke} /><circle cx="50" cy="18" r="7" {...commonStroke} /><circle cx="50" cy="46" r="7" {...commonStroke} /><path d="M37 28 45 21m-8 15 8 7M24 19v-8m0 42v-8" {...commonStroke} /></>;
      case 'software-service':
        return <><path d="M16 43a12 12 0 0 1 2-24 16 16 0 0 1 29 5 10 10 0 0 1 0 20H16Z" {...commonStroke} /><path d="M23 32h18m-12-7-6 7 6 7m6-14 6 7-6 7" {...commonStroke} /></>;
      case 'validation':
        return <><path d="M18 8h28v48H18z" {...commonStroke} /><path d="M25 22h14M25 31h14M25 40h8m5 2 4 4 8-10" {...commonStroke} /><path d="M25 8v8h14V8" {...commonStroke} /></>;
      case 'product-system':
        return <><circle cx="32" cy="32" r="23" {...commonStroke} /><circle cx="32" cy="32" r="8" {...commonStroke} /><path d="M32 9v15m0 16v15M9 32h15m16 0h15M16 16l10 10m12 12 10 10m0-32L38 26M26 38 16 48" {...commonStroke} /></>;
      default:
        return <><rect x="10" y="14" width="44" height="36" rx="7" {...commonStroke} /><path d="M18 32h28M32 20v24" {...commonStroke} /></>;
    }
  })();

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title ?? family.label}>
      {glyph}
    </svg>
  );
};

function SchematicVisual({ familyId }: { familyId: VisualFamilyId }) {
  const family = getVisualFamily(familyId);
  const terminals = family.ports.slice(0, 6);

  if (family.representations.schematic.status === 'unavailable') {
    return <UnavailableVisual icon={FileWarning} title="No schematic symbol" detail={family.representations.schematic.description} />;
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-[#fffdf7] p-4">
      <svg viewBox="0 0 520 280" className="h-auto w-full" role="img" aria-label={`${family.label} schematic-symbol preview`}>
        <defs><pattern id={`grid-${familyId}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e2e8f0" strokeWidth="1" /></pattern></defs>
        <rect width="520" height="280" fill={`url(#grid-${familyId})`} />
        <g transform="translate(190 60)" stroke="#0f172a" fill="white" strokeWidth="3">
          {familyId === 'resistor' ? (
            <><path d="M-120 80h50l12-24 20 48 20-48 20 48 20-48 12 24h50" fill="none" /><circle cx="-120" cy="80" r="4" fill="#0f172a" /><circle cx="84" cy="80" r="4" fill="#0f172a" /></>
          ) : familyId === 'capacitor' ? (
            <><path d="M-100 80h75m50 0h75M-25 35v90M25 35v90" fill="none" /></>
          ) : familyId === 'led' ? (
            <><path d="M-100 80h65m70 0h65M-35 30v100L35 80-35 30Z" /><path d="m42 44 35-35m-14 48 35-35" fill="none" /><path d="m77 9 1 22-22-1m42-8 1 22-22-1" fill="none" /></>
          ) : (
            <>
              <rect x="-10" y="0" width="180" height="160" rx="4" />
              <text x="80" y="76" textAnchor="middle" fill="#0f172a" stroke="none" fontSize="18" fontWeight="700">{family.shortLabel}</text>
              <text x="80" y="100" textAnchor="middle" fill="#64748b" stroke="none" fontSize="11">family preview</text>
              {terminals.map((terminal, index) => {
                const left = terminal.direction === 'input' || (terminal.direction === 'bidirectional' && index % 2 === 0);
                const y = 24 + index * 23;
                return <g key={terminal.id}><path d={left ? `M-60 ${y}H-10` : `M170 ${y}h50`} fill="none" /><circle cx={left ? -60 : 220} cy={y} r="3" fill="#0f172a" /><text x={left ? -66 : 226} y={y + 4} textAnchor={left ? 'end' : 'start'} fill="#334155" stroke="none" fontSize="10">{terminal.label}</text></g>;
              })}
            </>
          )}
        </g>
        <text x="20" y="255" fill="#64748b" fontSize="12">Vector convention preview · exact pins require a selected component revision</text>
      </svg>
    </div>
  );
}

function PictorialVisual({ familyId }: { familyId: VisualFamilyId }) {
  const family = getVisualFamily(familyId);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-5">
      <svg viewBox="0 0 520 280" className="h-auto w-full" role="img" aria-label={`${family.label} educational illustration`}>
        <defs>
          <linearGradient id={`surface-${familyId}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor={family.accent} /><stop offset="1" stopColor="#ffffff" /></linearGradient>
          <filter id={`shadow-${familyId}`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.16" /></filter>
        </defs>
        <rect x="15" y="15" width="490" height="250" rx="26" fill={`url(#surface-${familyId})`} />
        <g transform="translate(44 35)">
          <rect x="0" y="0" width="210" height="210" rx="30" fill="white" opacity="0.92" filter={`url(#shadow-${familyId})`} />
          <g transform="translate(45 45)" style={{ color: family.color }}><ArchitectureGlyph familyId={familyId} className="h-[120px] w-[120px]" /></g>
        </g>
        <g transform="translate(290 68)">
          <text x="0" y="0" fill={family.color} fontSize="14" fontWeight="800" letterSpacing="2">{family.shortLabel}</text>
          <text x="0" y="34" fill="#0f172a" fontSize="28" fontWeight="800">{family.label}</text>
          <foreignObject x="0" y="52" width="185" height="84"><div className="text-[14px] leading-6 text-slate-600">{family.description}</div></foreignObject>
          <g transform="translate(0 150)">{family.ports.slice(0, 3).map((entry, index) => <g key={entry.id} transform={`translate(0 ${index * 25})`}><circle cx="6" cy="-4" r="5" fill={family.color} /><text x="20" y="0" fill="#475569" fontSize="12" fontWeight="600">{entry.label}</text></g>)}</g>
        </g>
      </svg>
      <p className="mt-3 text-xs leading-5 text-slate-500">Internally authored recognition graphic. It teaches the family but does not define exact dimensions, package, pinout, or manufacturer appearance.</p>
    </div>
  );
}

function FootprintVisual({ familyId }: { familyId: VisualFamilyId }) {
  const family = getVisualFamily(familyId);
  if (family.representations.footprint.status === 'unresolved') {
    return <UnavailableVisual icon={Layers3} title="Select a package first" detail={family.representations.footprint.description} />;
  }

  const padCount = Math.max(2, Math.min(12, family.ports.length * 2));
  const perSide = Math.ceil(padCount / 2);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <svg viewBox="0 0 520 280" className="h-auto w-full" role="img" aria-label={`${family.label} footprint-family preview`}>
        <rect width="520" height="280" rx="18" fill="#020617" />
        <path d="M55 45H465V235H55Z" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="8 7" />
        <rect x="155" y="70" width="210" height="140" rx="8" fill="none" stroke="#facc15" strokeWidth="3" />
        <circle cx="143" cy="84" r="6" fill="#facc15" />
        {Array.from({ length: perSide }).map((_, index) => {
          const y = 90 + (100 * index) / Math.max(1, perSide - 1);
          return <React.Fragment key={index}><rect x="105" y={y - 8} width="70" height="16" rx="4" fill="#cbd5e1" /><rect x="345" y={y - 8} width="70" height="16" rx="4" fill="#cbd5e1" /><text x="140" y={y + 4} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">{index + 1}</text><text x="380" y={y + 4} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">{index + perSide + 1}</text></React.Fragment>;
        })}
        <text x="260" y="135" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="800">{family.shortLabel}</text>
        <text x="260" y="158" textAnchor="middle" fill="#94a3b8" fontSize="11">package-family preview</text>
        <text x="24" y="260" fill="#94a3b8" fontSize="12">Exact pads, drills, mask, paste, courtyard, origin, and orientation require the selected footprint revision.</text>
      </svg>
    </div>
  );
}

function PackageVisual({ familyId }: { familyId: VisualFamilyId }) {
  const family = getVisualFamily(familyId);
  if (family.representations.package.status === 'unavailable') {
    return <UnavailableVisual icon={Box} title="No physical package" detail={family.representations.package.description} />;
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
        <svg viewBox="0 0 220 180" className="w-full" role="img" aria-label={`${family.label} unresolved package envelope`}>
          <path d="m35 55 75-38 75 38v78l-75 34-75-34V55Z" fill="white" stroke="#b45309" strokeWidth="2.5" strokeDasharray="7 6" />
          <path d="m35 55 75 39 75-39M110 94v73" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M24 31h172M24 150h172M28 26v129M192 26v129" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="110" y="111" textAnchor="middle" fill="#92400e" fontSize="18" fontWeight="800">?</text>
        </svg>
        <div>
          <p className="text-sm font-bold text-amber-950">Exact package geometry is unresolved</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">{family.representations.package.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-amber-900">
            {['Width', 'Length', 'Height', 'Origin', 'Tolerance', 'Mounting'].map((entry) => <span key={entry} className="rounded-lg border border-amber-200 bg-white/70 px-2.5 py-2"><strong>{entry}:</strong> missing</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UnavailableVisualProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}

function UnavailableVisual({ icon: Icon, title, detail }: UnavailableVisualProps) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"><Icon className="h-5 w-5" /></span>
        <p className="mt-3 text-sm font-bold text-slate-800">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

export const DeviceVisual: React.FC<DeviceVisualProps> = ({ familyId, kind, className = '', quality = 'balanced', compact = false }) => {
  const family = getVisualFamily(familyId);
  const availability = family.representations[kind];

  if (kind === 'architecture') {
    return (
      <div className={`grid place-items-center rounded-xl border border-slate-200 ${compact ? 'h-12 w-12' : 'min-h-[240px]'} ${className}`} style={{ backgroundColor: family.accent, color: family.color }}>
        <ArchitectureGlyph familyId={familyId} className={compact ? 'h-8 w-8' : 'h-32 w-32'} />
      </div>
    );
  }
  if (kind === 'schematic') return <div className={className}><SchematicVisual familyId={familyId} /></div>;
  if (kind === 'pictorial') return <div className={className}><PictorialVisual familyId={familyId} /></div>;
  if (kind === 'footprint') return <div className={className}><FootprintVisual familyId={familyId} /></div>;
  if (kind === 'package') return <div className={className}><PackageVisual familyId={familyId} /></div>;
  if (kind === 'render3d') {
    if (availability.status === 'unavailable') return <UnavailableVisual icon={CameraOff} title="3D not applicable" detail={availability.description} />;
    return (
      <Suspense fallback={<div className="grid min-h-[260px] place-items-center rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300">Loading lightweight 3D only when requested…</div>}>
        <LazyLightweight3DPreview familyId={familyId} quality={quality} className={className} />
      </Suspense>
    );
  }
  if (kind === 'exact3d') return <UnavailableVisual icon={Layers3} title={availability.label} detail={availability.description} />;
  if (kind === 'photo') return <UnavailableVisual icon={ImageOff} title={availability.label} detail={availability.description} />;
  return <UnavailableVisual icon={CircleHelp} title="Representation unavailable" detail={availability.description} />;
};
