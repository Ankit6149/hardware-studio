'use client';

import React from 'react';
import { FileArchive, FileCheck2, FileText, Layers3, PackageCheck, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  useReleaseWorkspaceUiStore,
  type ReleaseDrawerSection,
  type ReleaseSelectionKind,
} from '../../store/releaseWorkspaceUiStore';

const sectionItems: ReadonlyArray<{
  id: ReleaseDrawerSection;
  viewId: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}> = [
  { id: 'readiness', viewId: 'readiness', label: 'Readiness', description: 'Local evidence preflight', icon: ShieldCheck },
  { id: 'snapshots', viewId: 'revisions', label: 'Snapshots', description: 'Local snapshots & candidates', icon: Layers3 },
  { id: 'outputs', viewId: 'exports', label: 'Outputs', description: 'Draft / unqualified files', icon: FileArchive },
  { id: 'drawings', viewId: 'blueprint-sheets', label: 'Drawings', description: 'Review drawing sheets', icon: FileText },
  { id: 'factory', viewId: 'factory-builder', label: 'Factory', description: 'Draft package preflight', icon: PackageCheck },
];

const recordTone: Record<ReleaseSelectionKind, string> = {
  snapshot: 'Snapshot',
  candidate: 'Provisional candidate',
  release: 'Local release record',
};

export const ReleaseProjectDrawer: React.FC = () => {
  const activeView = useProjectStore((state) => state.activeView);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const revisions = useProjectStore((state) => state.revisions || []);
  const candidates = useProjectStore((state) => state.releaseCandidates || []);
  const releases = useProjectStore((state) => state.releases || []);
  const selectedKind = useReleaseWorkspaceUiStore((state) => state.selectedKind);
  const selectedRecordId = useReleaseWorkspaceUiStore((state) => state.selectedRecordId);
  const setDrawerSection = useReleaseWorkspaceUiStore((state) => state.setDrawerSection);
  const selectRecord = useReleaseWorkspaceUiStore((state) => state.selectRecord);

  const navigate = (section: ReleaseDrawerSection, viewId: string) => {
    setDrawerSection(section);
    setActiveView(viewId);
  };

  const records = [
    ...revisions.map((record) => ({ kind: 'snapshot' as const, record })),
    ...candidates.map((record) => ({ kind: 'candidate' as const, record })),
    ...releases.map((record) => ({ kind: 'release' as const, record })),
  ];

  return (
    <aside
      className="z-20 flex h-full w-[224px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label="Release project drawer"
      data-studio-shell="project-drawer"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-3 py-2.5">
        <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Release control</div>
        <h2 className="mt-1 text-[12px] font-semibold tracking-[-0.01em] text-slate-950">Review before handoff</h2>
        <p className="mt-1 text-[9px] leading-4 text-slate-500">Local preflight and draft artifacts. Trusted release/qualification remain #20/#21.</p>
      </div>

      <nav className="shrink-0 border-b border-[#d8d1c5] p-1.5" aria-label="Release jobs">
        {sectionItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.viewId || (item.id === 'snapshots' && ['branches', 'releases'].includes(activeView));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id, item.viewId)}
              className={`relative flex min-h-10 w-full items-center gap-2 px-2 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${active ? 'bg-[#e4ddd0] text-slate-950' : 'text-slate-600 hover:bg-[#ece6dc] hover:text-slate-950'}`}
              aria-current={active ? 'page' : undefined}
            >
              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-slate-950" aria-hidden="true" />}
              <span className={`grid h-6 w-6 shrink-0 place-items-center border ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-[#fbfaf6] text-slate-500'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold">{item.label}</span>
                <span className="mt-0.5 block truncate text-[8px] text-slate-400">{item.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-9 shrink-0 items-center gap-2 border-b border-[#ded8cc] px-3">
          <FileCheck2 className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-500">Explicit release context</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {records.map(({ kind, record }) => {
            const selected = selectedKind === kind && selectedRecordId === record.id;
            return (
              <button
                key={`${kind}-${record.id}`}
                type="button"
                onClick={() => selectRecord(kind, record.id)}
                className={`mb-1 w-full border px-2 py-2 text-left ${selected ? 'border-slate-950 bg-white text-slate-950' : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-white/70'}`}
              >
                <span className="block text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">{recordTone[kind]}</span>
                <span className="mt-0.5 block truncate text-[10px] font-semibold">{record.name}</span>
                <span className="mt-0.5 block truncate font-mono text-[8px] text-slate-400">{record.id}</span>
              </button>
            );
          })}
          {records.length === 0 && (
            <div className="px-2 py-4 text-center text-[9px] leading-4 text-slate-400">No release records yet. Opening Release never creates or selects one.</div>
          )}
        </div>
      </div>
    </aside>
  );
};
