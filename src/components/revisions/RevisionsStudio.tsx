'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  approveRelease,
  createBranch,
  createNamedRevision,
  createReleaseCandidate,
  validateReleaseEligibility,
  verifyReleaseCandidateIntegrity,
  type ProductRevision,
  type ReleaseBlocker,
  type ReleaseRevision,
} from '../../lib/releaseEngine';
import type { Project } from '../../types';
import { useFeedback } from '../feedback/FeedbackProvider';

export const RevisionsStudio: React.FC = () => {
  const store = useProjectStore();
  const { confirm: requestConfirmation, notify } = useFeedback();
  const [versionName, setVersionName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [rcTag, setRcTag] = useState('');
  const [signoff, setSignoff] = useState('');

  const revisions: ProductRevision[] = store.revisions || [];
  const branches: ProductRevision[] = store.branches || [];
  const releaseCandidates = (store.releaseCandidates || []) as ReleaseRevision[];
  const releases = (store.releases || []) as ReleaseRevision[];
  const activeBranch = store.activeBranch || 'main';
  const blockers: ReleaseBlocker[] = validateReleaseEligibility(store);
  const isEligible = blockers.filter((blocker) => blocker.severity !== 'Warning').length === 0;
  const latestRevision = revisions[revisions.length - 1];

  const latestRevisionBlockers = useMemo(() => {
    if (!latestRevision?.projectSnapshot) return [];
    return validateReleaseEligibility(latestRevision.projectSnapshot as Project);
  }, [latestRevision]);
  const latestRevisionEligible = latestRevisionBlockers.filter((blocker) => blocker.severity !== 'Warning').length === 0;

  const handleCreateVersion = () => {
    const name = versionName.trim();
    if (!name) return;
    const revision = createNamedRevision(store, name, `Named snapshot from ${activeBranch}`, activeBranch);
    store.updateProjectState({ revisions: [...revisions, revision] });
    setVersionName('');
    notify({ tone: 'success', title: 'Named version frozen', detail: `${revision.name} captured the current project state.` });
  };

  const handleCreateBranch = () => {
    const name = branchName.trim();
    if (!name || !latestRevision) return;
    const branch = createBranch(latestRevision, name);
    store.updateProjectState({ branches: [...branches, branch], activeBranch: branch.branchName });
    setBranchName('');
    notify({ tone: 'success', title: 'Working branch created', detail: `${branch.branchName} starts from ${latestRevision.name}.` });
  };

  const handleCreateRC = () => {
    const tag = rcTag.trim();
    if (!tag || !latestRevision) return;
    if (!latestRevisionEligible) {
      notify({
        tone: 'warning',
        title: 'Named version is not release-eligible',
        detail: latestRevisionBlockers.map((blocker) => blocker.message).join(' '),
        durationMs: 0,
      });
      return;
    }

    try {
      const candidate = createReleaseCandidate(latestRevision, tag);
      store.updateProjectState({ releaseCandidates: [...releaseCandidates, candidate] });
      setRcTag('');
      notify({
        tone: 'success',
        title: 'Release Candidate frozen',
        detail: `${candidate.name} is a separate immutable snapshot with SHA-256 integrity evidence.`,
      });
    } catch (error: unknown) {
      notify({ tone: 'error', title: 'Could not create Release Candidate', detail: error instanceof Error ? error.message : String(error), durationMs: 0 });
    }
  };

  const handleApproveRelease = async (candidate: ReleaseRevision) => {
    const integrity = verifyReleaseCandidateIntegrity(candidate);
    if (!integrity.valid) {
      notify({ tone: 'error', title: 'Release Candidate integrity failed', detail: integrity.reason || 'Snapshot fingerprint does not match.', durationMs: 0 });
      return;
    }
    const reviewer = signoff.trim();
    if (!reviewer) {
      notify({ tone: 'warning', title: 'Reviewer sign-off required', detail: 'Enter the actual reviewer/operator identity before approving a release.' });
      return;
    }

    const candidateBlockers = validateReleaseEligibility(candidate.projectSnapshot as Project).filter((blocker) => blocker.severity !== 'Warning');
    if (candidateBlockers.length > 0) {
      notify({ tone: 'error', title: 'Frozen candidate is blocked', detail: candidateBlockers.map((blocker) => blocker.message).join(' '), durationMs: 0 });
      return;
    }

    const approved = await requestConfirmation({
      title: `Release “${candidate.name}”?`,
      description: `This publishes the frozen candidate snapshot reviewed by ${reviewer}. Working-state changes are not included. The candidate SHA-256 fingerprint will remain attached to the release record.`,
      confirmLabel: 'Publish release',
      variant: 'default',
    });
    if (!approved) return;

    try {
      const release = approveRelease(candidate, reviewer);
      store.updateProjectState({ releases: [...releases, release] });
      setSignoff('');
      notify({ tone: 'success', title: 'Release published', detail: `${release.name} was published from candidate ${candidate.id}. No artifact IDs were fabricated.` });
    } catch (error: unknown) {
      notify({ tone: 'error', title: 'Release approval failed', detail: error instanceof Error ? error.message : String(error), durationMs: 0 });
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-indigo-700"><LockKeyhole className="h-4 w-4" /> Release workspace</div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Freeze what was reviewed. Release only that snapshot.</h1>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">Working state, named versions, Release Candidates, and published releases are kept distinct so later edits cannot silently change approved hardware evidence.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700">branch: {activeBranch}</span>
            <span className={`rounded-full border px-2.5 py-1 font-semibold ${isEligible ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{isEligible ? 'Working state eligible' : `${blockers.length} working blocker${blockers.length === 1 ? '' : 's'}`}</span>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800"><Tag className="h-4 w-4 text-emerald-600" /> Named versions</div>
          <div className="mt-3 flex gap-2">
            <input value={versionName} onChange={(event) => setVersionName(event.target.value)} placeholder="Rev-1.1-EVT" className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-indigo-500" />
            <button type="button" onClick={handleCreateVersion} disabled={!versionName.trim()} className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-950 px-3 text-xs font-bold text-white disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Freeze</button>
          </div>

          <div className="mt-4 space-y-2">
            {revisions.slice().reverse().map((revision) => (
              <div key={revision.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2"><strong className="min-w-0 truncate text-xs text-slate-900">{revision.name}</strong><span className="shrink-0 text-[9px] font-semibold text-slate-500">{revision.status}</span></div>
                <p className="mt-1 truncate font-mono text-[9px] text-slate-500">{revision.id}</p>
              </div>
            ))}
            {revisions.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">Freeze a named version before creating a Release Candidate.</p>}
          </div>

          <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-xs font-bold text-slate-700">Working branches</summary>
            <div className="mt-3 flex gap-2">
              <input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="feature/enclosure-b" className="h-8 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 text-[10px] outline-none" />
              <button type="button" onClick={handleCreateBranch} disabled={!branchName.trim() || !latestRevision} className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-bold disabled:opacity-40">Branch</button>
            </div>
            <p className="mt-2 text-[9px] text-slate-500">{branches.length} recorded working branch{branches.length === 1 ? '' : 'es'}.</p>
          </details>
        </aside>

        <main className="min-h-0 overflow-y-auto p-5">
          <div className="mx-auto max-w-5xl space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-amber-600" /> Candidate gate</div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">The candidate is created from the latest named version, not from whatever happens to be open afterward.</p>
                </div>
                {latestRevision && <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${latestRevisionEligible ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{latestRevision.name}: {latestRevisionEligible ? 'eligible' : 'blocked'}</span>}
              </div>

              {latestRevisionBlockers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {latestRevisionBlockers.map((blocker, index) => <div key={`${blocker.domain}-${index}`} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] leading-5 text-amber-900"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {blocker.message}</div>)}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input value={rcTag} onChange={(event) => setRcTag(event.target.value)} placeholder="RC-1.0.0-EVT" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold outline-none focus:border-indigo-500" />
                <button type="button" onClick={handleCreateRC} disabled={!latestRevision || !latestRevisionEligible || !rcTag.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"><LockKeyhole className="h-4 w-4" /> Freeze Release Candidate</button>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">Frozen candidates</h2><span className="text-[10px] text-slate-500">Integrity is checked again at approval time.</span></div>
              <div className="space-y-3">
                {releaseCandidates.slice().reverse().map((candidate) => {
                  const integrity = verifyReleaseCandidateIntegrity(candidate);
                  const candidateBlockers = candidate.projectSnapshot ? validateReleaseEligibility(candidate.projectSnapshot as Project).filter((blocker) => blocker.severity !== 'Warning') : [];
                  return (
                    <article key={candidate.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-950">{candidate.name}</strong><span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800">Release Candidate</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${integrity.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{integrity.valid ? 'snapshot intact' : 'integrity failed'}</span></div>
                          <div className="mt-2 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[9px] text-slate-600"><Fingerprint className="h-3.5 w-3.5 shrink-0" /><span className="truncate">SHA-256 {candidate.integrity?.snapshotSha256 || 'missing'}</span></div>
                          <p className="mt-2 text-[10px] text-slate-500">Source {candidate.integrity?.sourceRevisionId || candidate.parentRevisionId || 'unknown'} · {(candidate.integrity?.validationRunIds || []).length} validation run ID{(candidate.integrity?.validationRunIds || []).length === 1 ? '' : 's'} captured</p>
                        </div>
                        <div className="min-w-[240px] space-y-2">
                          <input value={signoff} onChange={(event) => setSignoff(event.target.value)} placeholder="Actual reviewer / approver" className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-indigo-500" />
                          <button type="button" onClick={() => void handleApproveRelease(candidate)} disabled={!integrity.valid || candidateBlockers.length > 0 || !signoff.trim()} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Publish this frozen snapshot</button>
                        </div>
                      </div>
                      {candidateBlockers.length > 0 && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-[10px] leading-5 text-red-800">Candidate blocked: {candidateBlockers.map((blocker) => blocker.message).join(' ')}</p>}
                    </article>
                  );
                })}
                {releaseCandidates.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">No Release Candidate exists yet.</div>}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-bold text-slate-900">Published release history</h2></div>
              <div className="mt-3 divide-y divide-slate-100">
                {releases.slice().reverse().map((release) => (
                  <div key={release.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><strong className="text-xs text-slate-900">{release.name}</strong><p className="mt-0.5 text-[9px] text-slate-500">Approved by {release.releaseArtifacts?.approvalSignoff || 'unattributed'} · {release.createdAt}</p></div>
                    <span className="max-w-sm truncate font-mono text-[9px] text-slate-500">{release.integrity?.snapshotSha256 || 'legacy release without fingerprint'}</span>
                  </div>
                ))}
                {releases.length === 0 && <p className="py-6 text-center text-xs text-slate-500">No published releases yet.</p>}
              </div>
            </section>
          </div>
        </main>
      </div>
    </section>
  );
};
