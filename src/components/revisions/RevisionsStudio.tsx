'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Fingerprint, GitBranch, Plus, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useReleaseWorkspaceUiStore } from '../../store/releaseWorkspaceUiStore';
import {
  approveRelease,
  createBranch,
  createNamedRevision,
  createReleaseCandidate,
  validateReleaseEligibility,
  verifyReleaseCandidateIntegrity,
  type ProductRevision,
  type ReleaseRevision,
} from '../../lib/releaseEngine';
import type { Project } from '../../types';
import { useFeedback } from '../feedback/FeedbackProvider';

export const RevisionsStudio: React.FC = () => {
  const store = useProjectStore();
  const { confirm: requestConfirmation, notify } = useFeedback();
  const [snapshotName, setSnapshotName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [candidateTag, setCandidateTag] = useState('');
  const [reviewerNote, setReviewerNote] = useState('');

  const selectedKind = useReleaseWorkspaceUiStore((state) => state.selectedKind);
  const selectedRecordId = useReleaseWorkspaceUiStore((state) => state.selectedRecordId);
  const selectRecord = useReleaseWorkspaceUiStore((state) => state.selectRecord);

  const revisions: ProductRevision[] = store.revisions || [];
  const branches: ProductRevision[] = store.branches || [];
  const releaseCandidates = (store.releaseCandidates || []) as ReleaseRevision[];
  const releases = (store.releases || []) as ReleaseRevision[];
  const activeBranch = store.activeBranch || 'main';
  const selectedSnapshot = selectedKind === 'snapshot'
    ? revisions.find((revision) => revision.id === selectedRecordId) || null
    : null;

  const selectedSnapshotBlockers = selectedSnapshot?.projectSnapshot
    ? validateReleaseEligibility(selectedSnapshot.projectSnapshot as Project)
    : [];
  const selectedSnapshotHardBlockers = selectedSnapshotBlockers.filter((blocker) => blocker.severity !== 'Warning');

  const handleCreateSnapshot = () => {
    const name = snapshotName.trim();
    if (!name) return;
    const snapshot = createNamedRevision(store, name, `Local named snapshot from ${activeBranch}`, activeBranch);
    store.updateProjectState({ revisions: [...revisions, snapshot] });
    selectRecord('snapshot', snapshot.id);
    setSnapshotName('');
    notify({
      tone: 'success',
      title: 'Local snapshot captured',
      detail: `${snapshot.name} captured the current project JSON state. It is not a #20-grade content-addressed immutable version.`,
    });
  };

  const handleCreateBranch = () => {
    const name = branchName.trim();
    if (!name || !selectedSnapshot) return;
    const branch = createBranch(selectedSnapshot, name);
    store.updateProjectState({ branches: [...branches, branch], activeBranch: branch.branchName });
    setBranchName('');
    notify({
      tone: 'success',
      title: 'Local working branch record created',
      detail: `${branch.branchName} references explicitly selected snapshot ${selectedSnapshot.name}. Full ancestry/merge semantics remain #20.`,
    });
  };

  const handleCreateCandidate = () => {
    const tag = candidateTag.trim();
    if (!tag || !selectedSnapshot) return;
    if (selectedSnapshotHardBlockers.length > 0) {
      notify({
        tone: 'warning',
        title: 'Selected snapshot fails local preflight',
        detail: selectedSnapshotHardBlockers.map((blocker) => blocker.message).join(' '),
        durationMs: 0,
      });
      return;
    }

    try {
      const candidate = createReleaseCandidate(selectedSnapshot, tag);
      store.updateProjectState({ releaseCandidates: [...releaseCandidates, candidate] });
      selectRecord('candidate', candidate.id);
      setCandidateTag('');
      notify({
        tone: 'success',
        title: 'Provisional candidate captured',
        detail: `${candidate.name} has a local snapshot fingerprint. This is integrity evidence, not a trusted #20 release approval.`,
      });
    } catch (error: unknown) {
      notify({ tone: 'error', title: 'Could not create provisional candidate', detail: error instanceof Error ? error.message : String(error), durationMs: 0 });
    }
  };

  const handleCreateLocalReleaseRecord = async (candidate: ReleaseRevision) => {
    const integrity = verifyReleaseCandidateIntegrity(candidate);
    if (!integrity.valid) {
      notify({ tone: 'error', title: 'Candidate snapshot integrity failed', detail: integrity.reason || 'Local snapshot fingerprint does not match.', durationMs: 0 });
      return;
    }
    const reviewer = reviewerNote.trim();
    if (!reviewer) {
      notify({ tone: 'warning', title: 'Reviewer note required', detail: 'Record who performed this local review. Trusted actor/role approval remains #20.' });
      return;
    }

    const candidateBlockers = validateReleaseEligibility(candidate.projectSnapshot as Project).filter((blocker) => blocker.severity !== 'Warning');
    if (candidateBlockers.length > 0) {
      notify({ tone: 'error', title: 'Provisional candidate fails local preflight', detail: candidateBlockers.map((blocker) => blocker.message).join(' '), durationMs: 0 });
      return;
    }

    const confirmed = await requestConfirmation({
      title: `Record local release review for “${candidate.name}”?`,
      description: `This records the current local candidate snapshot and reviewer note (${reviewer}). It is not a trusted signed/content-addressed #20 release and does not qualify manufacturing artifacts under #21.`,
      confirmLabel: 'Create local release record',
      variant: 'default',
    });
    if (!confirmed) return;

    try {
      const release = approveRelease(candidate, reviewer);
      store.updateProjectState({ releases: [...releases, release] });
      selectRecord('release', release.id);
      setReviewerNote('');
      notify({
        tone: 'success',
        title: 'Local release record created',
        detail: `${release.name} references candidate ${candidate.id}. Trusted approval/immutable publication remain #20.`,
      });
    } catch (error: unknown) {
      notify({ tone: 'error', title: 'Could not create local release record', detail: error instanceof Error ? error.message : String(error), durationMs: 0 });
    }
  };

  return (
    <section className="h-full min-h-0 overflow-y-auto bg-slate-50 p-4 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-950">
          <strong>Current authority:</strong> these are local JSON snapshot / candidate / release-review records. They are useful for workflow review, but they are not the content-addressed immutable versions, full branch ancestry, trusted approvals, or published releases required by #20.
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-slate-500" /><h2 className="text-sm font-semibold text-slate-950">Capture local snapshot</h2></div>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">Captures the current project JSON state on branch label <span className="font-mono">{activeBranch}</span>. This does not create a #20 immutable version.</p>
            <div className="mt-3 flex gap-2">
              <input value={snapshotName} onChange={(event) => setSnapshotName(event.target.value)} placeholder="Rev-1.1-EVT" className="h-9 min-w-0 flex-1 border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500" />
              <button type="button" onClick={handleCreateSnapshot} disabled={!snapshotName.trim()} className="h-9 bg-slate-950 px-3 text-xs font-semibold text-white disabled:opacity-40">Capture</button>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Explicit source snapshot</p>
            {selectedSnapshot ? (
              <>
                <p className="mt-1 truncate text-sm font-semibold text-slate-950">{selectedSnapshot.name}</p>
                <p className="mt-1 break-all font-mono text-[8px] text-slate-400">{selectedSnapshot.id}</p>
                <p className={`mt-2 text-[10px] font-semibold ${selectedSnapshotHardBlockers.length === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedSnapshotHardBlockers.length === 0 ? 'Local preflight has no hard blocker' : `${selectedSnapshotHardBlockers.length} local blocker${selectedSnapshotHardBlockers.length === 1 ? '' : 's'}`}</p>
              </>
            ) : (
              <p className="mt-2 text-[10px] leading-5 text-slate-500">Select a local snapshot explicitly in the Release Project Drawer. Branch/candidate creation is disabled until you do.</p>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-slate-500" /><h2 className="text-sm font-semibold text-slate-950">Local branch record</h2></div>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">Uses only the explicitly selected snapshot. True ancestry, switching safety and three-way merge remain #20.</p>
            <div className="mt-3 flex gap-2">
              <input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="feature/enclosure-b" className="h-9 min-w-0 flex-1 border border-slate-300 px-2.5 text-xs outline-none" />
              <button type="button" onClick={handleCreateBranch} disabled={!selectedSnapshot || !branchName.trim()} className="h-9 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 disabled:opacity-40">Create</button>
            </div>
            <p className="mt-2 text-[9px] text-slate-400">{branches.length} local working branch record{branches.length === 1 ? '' : 's'}.</p>
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /><h2 className="text-sm font-semibold text-slate-950">Provisional candidate</h2></div>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">Captures a locally fingerprinted snapshot after the current helper preflight. It is not a trusted release candidate under #20.</p>
            <div className="mt-3 flex gap-2">
              <input value={candidateTag} onChange={(event) => setCandidateTag(event.target.value)} placeholder="RC-1.0.0-EVT" className="h-9 min-w-0 flex-1 border border-slate-300 px-2.5 text-xs outline-none" />
              <button type="button" onClick={handleCreateCandidate} disabled={!selectedSnapshot || selectedSnapshotHardBlockers.length > 0 || !candidateTag.trim()} className="h-9 bg-amber-400 px-3 text-xs font-semibold text-slate-950 disabled:opacity-40">Capture</button>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Provisional candidates</h2><p className="mt-1 text-[10px] text-slate-500">Local SHA-256 checks detect snapshot changes; they do not provide signed approval, role policy, artifact qualification, or repository-enforced immutability.</p></div>
          <div className="divide-y divide-slate-100">
            {releaseCandidates.map((candidate) => {
              const integrity = verifyReleaseCandidateIntegrity(candidate);
              const blockers = candidate.projectSnapshot ? validateReleaseEligibility(candidate.projectSnapshot as Project).filter((blocker) => blocker.severity !== 'Warning') : [];
              return (
                <article key={candidate.id} className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-950">{candidate.name}</strong><span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-800">Provisional candidate</span></div>
                      <div className="mt-2 flex min-w-0 items-center gap-2 bg-slate-50 px-2.5 py-2 font-mono text-[9px] text-slate-600"><Fingerprint className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Local snapshot SHA-256 {candidate.integrity?.snapshotSha256 || 'missing'}</span></div>
                      <p className={`mt-2 text-[10px] ${integrity.valid && blockers.length === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{integrity.valid ? 'Local snapshot fingerprint matches.' : integrity.reason || 'Fingerprint check failed.'} {blockers.length > 0 ? `${blockers.length} local blocker(s).` : ''}</p>
                    </div>
                    <div className="w-full space-y-2 lg:w-[260px]">
                      <input value={reviewerNote} onChange={(event) => setReviewerNote(event.target.value)} placeholder="Local reviewer / operator note" className="h-9 w-full border border-slate-300 px-2.5 text-xs outline-none" />
                      <button type="button" onClick={() => void handleCreateLocalReleaseRecord(candidate)} disabled={!integrity.valid || blockers.length > 0 || !reviewerNote.trim()} className="inline-flex h-9 w-full items-center justify-center gap-2 bg-slate-950 px-3 text-xs font-semibold text-white disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Create local release record</button>
                    </div>
                  </div>
                </article>
              );
            })}
            {releaseCandidates.length === 0 && <p className="p-5 text-center text-[10px] text-slate-400">No provisional candidates recorded.</p>}
          </div>
        </section>

        {selectedSnapshotBlockers.length > 0 && (
          <section className="border border-rose-200 bg-rose-50">
            <div className="border-b border-rose-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-rose-700">Selected snapshot local preflight</div>
            <div className="divide-y divide-rose-100">
              {selectedSnapshotBlockers.map((blocker, index) => <div key={`${blocker.domain}-${index}`} className="flex gap-2 px-4 py-2.5 text-[10px] leading-5 text-rose-900"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{blocker.message}</div>)}
            </div>
          </section>
        )}

        <section className="border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-950">Local release records</h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">These preserve current local workflow output only. They are not immutable published releases until #20 is implemented.</p>
          <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
            {releases.map((release) => (
              <button key={release.id} type="button" onClick={() => selectRecord('release', release.id)} className="flex w-full flex-col gap-1 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
                <div><strong className="text-xs text-slate-900">{release.name}</strong><p className="mt-0.5 text-[9px] text-slate-500">Local reviewer note: {release.releaseArtifacts?.approvalSignoff || 'unattributed'} · {release.createdAt}</p></div>
                <span className="max-w-sm truncate font-mono text-[9px] text-slate-500">{release.integrity?.snapshotSha256 || 'no local fingerprint'}</span>
              </button>
            ))}
            {releases.length === 0 && <p className="py-4 text-center text-[10px] text-slate-400">No local release records.</p>}
          </div>
        </section>
      </div>
    </section>
  );
};
