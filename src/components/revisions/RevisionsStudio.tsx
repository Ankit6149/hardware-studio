'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import {
  createNamedRevision,
  createBranch,
  createReleaseCandidate,
  approveRelease,
  validateReleaseEligibility,
  ProductRevision,
  ReleaseBlocker
} from '../../lib/releaseEngine';
import { GitBranch, Tag, ShieldCheck, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export const RevisionsStudio: React.FC = () => {
  const store = useProjectStore();
  const [versionName, setVersionName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [rcTag, setRcTag] = useState('');

  const revisions: ProductRevision[] = store.revisions || [];
  const branches: ProductRevision[] = store.branches || [];
  const releaseCandidates: ProductRevision[] = store.releaseCandidates || [];
  const activeBranch = store.activeBranch || 'main';

  const blockers: ReleaseBlocker[] = validateReleaseEligibility(store);
  const isEligible = blockers.length === 0;

  const handleCreateVersion = () => {
    if (!versionName.trim()) return;
    const rev = createNamedRevision(store, versionName.trim(), 'Version snapshot');
    store.updateProjectState({
      revisions: [...revisions, rev]
    });
    setVersionName('');
  };

  const handleCreateBranch = () => {
    if (!branchName.trim() || revisions.length === 0) return;
    const sourceRev = revisions[revisions.length - 1];
    const branch = createBranch(sourceRev, branchName.trim());
    store.updateProjectState({
      branches: [...branches, branch],
      activeBranch: branch.branchName
    });
    setBranchName('');
  };

  const handleCreateRC = () => {
    if (!rcTag.trim() || revisions.length === 0) return;
    const sourceRev = revisions[revisions.length - 1];
    const rc = createReleaseCandidate(sourceRev);
    store.updateProjectState({
      releaseCandidates: [...releaseCandidates, rc]
    });
    setRcTag('');
  };

  const handleApproveRelease = (rcId: string) => {
    const rc = releaseCandidates.find(r => r.id === rcId);
    if (!rc) return;
    try {
      const rel = approveRelease(rc, 'Lead Hardware Engineer');
      store.updateProjectState({
        releases: [...(store.releases || []), rel]
      });
      alert(`Release ${rel.name} approved and published cleanly!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Approval error: ${msg}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" /> Revisions, Branches & Releases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable release snapshots, git-style hardware branching, and release candidate eligibility verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Active Branch:</span>
          <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-xs rounded-full">
            {activeBranch}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Named Revisions & Branches */}
        <div className="space-y-6">
          {/* Create Revision */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" /> Create Named Version Snapshot
            </h2>
            <div className="flex gap-2">
              <input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Rev-1.1-EVT-Freeze"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateVersion}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Snapshot
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {revisions.map((r: ProductRevision) => (
                <div key={r.id} className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-300 block">{r.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{r.createdAt}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Branch */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-indigo-400" /> Hardware Branching
            </h2>
            <div className="flex gap-2">
              <input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. feature/flex-pcb-redesign"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateBranch}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition-all"
              >
                Branch
              </button>
            </div>
          </div>
        </div>

        {/* Center: Release Eligibility & Candidate Promoter */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Release Eligibility Verification
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded text-xs">
                <span className="text-slate-400">Eligibility Status</span>
                <span className={`font-bold font-mono ${isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isEligible ? 'ELIGIBLE FOR RELEASE' : 'BLOCKED BY ISSUES'}
                </span>
              </div>
              
              {blockers.map((b: ReleaseBlocker, idx: number) => (
                <div key={idx} className="p-2 bg-amber-950/40 border border-amber-500/30 rounded text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{b.message}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={rcTag}
                onChange={(e) => setRcTag(e.target.value)}
                placeholder="e.g. RC-1.0.0-EVT"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCreateRC}
                disabled={!isEligible}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-all disabled:opacity-40"
              >
                Promote RC
              </button>
            </div>
          </div>
        </div>

        {/* Right: Published Releases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Immutable Published Releases
          </h2>

          <div className="space-y-3">
            {releaseCandidates.map((rc: ProductRevision) => (
              <div key={rc.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 font-mono">{rc.name}</span>
                  <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-1.5 py-0.5 rounded">
                    {rc.status}
                  </span>
                </div>

                {rc.status === 'Release Candidate' && (
                  <button
                    onClick={() => handleApproveRelease(rc.id)}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-all"
                  >
                    Approve Release Sign-Off
                  </button>
                )}
              </div>
            ))}

            {releaseCandidates.length === 0 && (
              <div className="text-xs text-slate-600 text-center py-8">
                No active release candidates created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
