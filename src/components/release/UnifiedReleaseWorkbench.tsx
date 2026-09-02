'use client';

import React from 'react';
import { AlertTriangle, PanelRight, ShieldAlert } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useReleaseWorkspaceUiStore } from '../../store/releaseWorkspaceUiStore';
import { validateReleaseEligibility } from '../../lib/releaseEngine';
import { ReadinessDashboard } from '../ReadinessDashboard';
import { ExportCenter } from '../ExportCenter';
import { BlueprintSheets } from '../BlueprintSheets';
import { FactoryPackageBuilder } from '../FactoryPackageBuilder';
import { RevisionsStudio } from '../revisions/RevisionsStudio';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EngineeringBottomDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';

export type ReleaseWorkbenchMode = 'readiness' | 'snapshots' | 'outputs' | 'drawings' | 'factory';

const modeTitle: Record<ReleaseWorkbenchMode, string> = {
  readiness: 'Readiness preflight',
  snapshots: 'Snapshots & candidates',
  outputs: 'Draft outputs',
  drawings: 'Drawing review',
  factory: 'Factory package preflight',
};

export const UnifiedReleaseWorkbench: React.FC<{ mode: ReleaseWorkbenchMode }> = ({ mode }) => {
  const revisions = useProjectStore((state) => state.revisions || []);
  const candidates = useProjectStore((state) => state.releaseCandidates || []);
  const releases = useProjectStore((state) => state.releases || []);
  const project = useProjectStore();
  const selectedKind = useReleaseWorkspaceUiStore((state) => state.selectedKind);
  const selectedRecordId = useReleaseWorkspaceUiStore((state) => state.selectedRecordId);
  const inspectorOpen = useReleaseWorkspaceUiStore((state) => state.inspectorOpen);
  const bottomDockOpen = useReleaseWorkspaceUiStore((state) => state.bottomDockOpen);
  const setInspectorOpen = useReleaseWorkspaceUiStore((state) => state.setInspectorOpen);
  const setBottomDockOpen = useReleaseWorkspaceUiStore((state) => state.setBottomDockOpen);

  const selectedRecord = selectedKind === 'snapshot'
    ? revisions.find((record) => record.id === selectedRecordId) || null
    : selectedKind === 'candidate'
      ? candidates.find((record) => record.id === selectedRecordId) || null
      : selectedKind === 'release'
        ? releases.find((record) => record.id === selectedRecordId) || null
        : null;

  const localBlockers = validateReleaseEligibility(project);
  const hardBlockers = localBlockers.filter((blocker) => blocker.severity !== 'Warning');

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#fbfaf6]" aria-label="Release workbench">
      <EngineeringEditorBar
        domain="Release"
        title={modeTitle[mode]}
        meta="Local preflight and draft handoff only · trusted versions/releases remain #20 · qualified artifacts remain #21"
        docks={(
          <>
            <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen(!inspectorOpen)} />
            <EditorDockButton label="Preflight" icon={ShieldAlert} active={bottomDockOpen} count={hardBlockers.length} onClick={() => setBottomDockOpen(!bottomDockOpen)} />
          </>
        )}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 overflow-hidden">
          {mode === 'readiness' && <ReadinessDashboard />}
          {mode === 'snapshots' && <RevisionsStudio />}
          {mode === 'outputs' && <ExportCenter />}
          {mode === 'drawings' && <BlueprintSheets />}
          {mode === 'factory' && <FactoryPackageBuilder />}
        </div>

        <EngineeringInspector
          open={inspectorOpen}
          subtitle={selectedRecord ? `${selectedKind} · explicit selection` : 'No release record selected'}
          onClose={() => setInspectorOpen(false)}
        >
          {selectedRecord ? (
            <div className="space-y-3 p-3 text-[10px]">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {selectedKind === 'snapshot' ? 'Local snapshot' : selectedKind === 'candidate' ? 'Provisional candidate' : 'Local release record'}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-slate-950">{selectedRecord.name}</p>
                <p className="mt-1 break-all font-mono text-[8px] text-slate-400">{selectedRecord.id}</p>
              </div>
              <dl className="divide-y divide-slate-100 border-y border-slate-200">
                <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">Status</dt><dd className="text-right font-semibold text-slate-800">{selectedRecord.status}</dd></div>
                <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">Branch label</dt><dd className="max-w-[160px] truncate text-right font-mono text-slate-700">{selectedRecord.branchName || '—'}</dd></div>
                <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">Created</dt><dd className="text-right text-slate-700">{selectedRecord.createdAt || '—'}</dd></div>
              </dl>
              <div className="border border-amber-200 bg-amber-50 p-2 text-[9px] leading-4 text-amber-900">
                This record uses the current local snapshot/release model. It is not a #20-grade content-addressed version, trusted approval, or immutable published release.
              </div>
            </div>
          ) : (
            <div className="p-4 text-[10px] leading-5 text-slate-500">Select a snapshot, provisional candidate, or local release record explicitly from the Release Project Drawer. Opening Release never chooses one for you.</div>
          )}
        </EngineeringInspector>

        <EngineeringBottomDock
          open={bottomDockOpen}
          title="Local release preflight"
          subtitle="Helper blockers only — this does not establish #20/#21 release or fabrication qualification"
          onClose={() => setBottomDockOpen(false)}
        >
          <div className="divide-y divide-slate-100">
            {localBlockers.map((blocker, index) => (
              <div key={`${blocker.domain}-${index}`} className="flex gap-2 px-3 py-2.5 text-[10px] leading-4 text-slate-700">
                <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${blocker.severity === 'Warning' ? 'text-amber-500' : 'text-rose-600'}`} aria-hidden="true" />
                <div><strong className="text-slate-900">{blocker.domain}</strong><span className="ml-1 text-slate-500">{blocker.message}</span></div>
              </div>
            ))}
            {localBlockers.length === 0 && (
              <div className="px-3 py-4 text-[10px] leading-5 text-slate-600">No blocker is reported by the current local preflight helper. This is not fabrication authorization: immutable version/release guarantees (#20) and qualified artifacts/reproducible independent checks (#21) remain separate engineering gates.</div>
            )}
          </div>
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={`${modeTitle[mode]} · local/provisional authority`}
        center={selectedRecord ? `Explicit context: ${selectedRecord.name}` : 'No release record selected'}
        right={`${hardBlockers.length} local blocker${hardBlockers.length === 1 ? '' : 's'}`}
      />
    </section>
  );
};
