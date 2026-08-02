'use client';

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleHelp,
  Link2,
  Settings2,
  Unlink,
  X,
} from 'lucide-react';
import {
  getWorkflowConnectionNotices,
  getWorkflowProfile,
  inferProfileId,
  toggleWorkflowDomain,
  workflowProfiles,
  WORKFLOW_DOMAIN_IDS,
  type WorkflowDomainId,
  type WorkflowProfileId,
} from '../../lib/workflowProfiles';
import { navigationDomains } from '../../lib/navigationRegistry';
import { useWorkflowPreferencesStore } from '../../store/workflowPreferencesStore';

const domainDetail = new Map(
  navigationDomains
    .filter((domain) => domain.id !== 'overview')
    .map((domain) => [domain.id as WorkflowDomainId, domain]),
);

interface WorkflowSetupSessionProps {
  initialDomains: readonly WorkflowDomainId[];
  initialProfileId: WorkflowProfileId;
  onCancel: () => void;
  onApply: (domains: readonly WorkflowDomainId[]) => void;
}

const WorkflowSetupSession: React.FC<WorkflowSetupSessionProps> = ({
  initialDomains,
  initialProfileId,
  onCancel,
  onApply,
}) => {
  const [draftDomains, setDraftDomains] = useState<WorkflowDomainId[]>([...initialDomains]);
  const [selectedProfileId, setSelectedProfileId] = useState<WorkflowProfileId>(initialProfileId);

  const notices = useMemo(() => getWorkflowConnectionNotices(draftDomains), [draftDomains]);
  const selectedProfile = getWorkflowProfile(selectedProfileId);

  const selectProfile = (profileId: WorkflowProfileId) => {
    const profile = getWorkflowProfile(profileId);
    setSelectedProfileId(profileId);
    if (profileId !== 'custom') setDraftDomains([...profile.enabledDomains]);
  };

  const toggleDomain = (domainId: WorkflowDomainId) => {
    const nextDomains = toggleWorkflowDomain(draftDomains, domainId);
    setDraftDomains(nextDomains);
    setSelectedProfileId(inferProfileId(nextDomains));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Start from a workflow</p>
          <div className="mt-3 space-y-2">
            {workflowProfiles.map((profile) => {
              const active = selectedProfileId === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => selectProfile(profile.id)}
                  aria-pressed={active}
                  className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${active ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-950">{profile.name}</span>
                    {active ? <Check className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
                  </span>
                  <span className="mt-1.5 block text-xs leading-5 text-slate-500">{profile.summary}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto bg-white p-4 sm:p-5 lg:p-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">{selectedProfile.name}</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Choose what appears in your studio</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedProfile.bestFor}</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {draftDomains.length} of {WORKFLOW_DOMAIN_IDS.length} domains visible
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
              <div className="flex gap-2">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p><strong>Connected when useful, independent when needed.</strong> Showing multiple domains lets them share the same project state. Hiding a domain only changes navigation—it does not delete engineering data.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {WORKFLOW_DOMAIN_IDS.map((domainId) => {
                const domain = domainDetail.get(domainId);
                const enabled = draftDomains.includes(domainId);
                if (!domain) return null;
                return (
                  <button
                    key={domainId}
                    type="button"
                    onClick={() => toggleDomain(domainId)}
                    aria-pressed={enabled}
                    className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${enabled ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{domain.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{domain.purpose}</span>
                      </span>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${enabled ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </span>
                    <span className="mt-3 block text-[11px] font-semibold text-slate-500">{domain.items.length} {domain.items.length === 1 ? 'workbench' : 'workbenches'}</span>
                  </button>
                );
              })}
            </div>

            <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Unlink className="h-4 w-4 text-slate-600" aria-hidden="true" />
                <h4 className="text-sm font-bold text-slate-900">Standalone and connection notes</h4>
              </div>
              {notices.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {notices.map((notice) => (
                    <div key={notice.id} className={`rounded-lg border p-3 ${notice.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-sky-200 bg-sky-50 text-sky-950'}`}>
                      <div className="flex gap-2">
                        {notice.tone === 'warning' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                        <div>
                          <p className="text-xs font-bold">{notice.title}</p>
                          <p className="mt-1 text-xs leading-5 opacity-80">{notice.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-600">This selection has no special standalone limitations. Individual workbenches still show their own readiness and engineering boundaries.</p>
              )}
            </section>
          </div>
        </main>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs leading-5 text-slate-500">Overview is always available. You can change this workflow later without losing project data.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500">Cancel</button>
          <button type="button" onClick={() => onApply(draftDomains)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
            <Check className="h-4 w-4" aria-hidden="true" /> Use this workflow
          </button>
        </div>
      </footer>
    </div>
  );
};

export const WorkflowSetupDialog: React.FC = () => {
  const { isSetupOpen, enabledDomains, profileId, closeSetup, replaceDomains, completeSetup } = useWorkflowPreferencesStore();

  const apply = (domains: readonly WorkflowDomainId[]) => {
    replaceDomains(domains);
    completeSetup();
  };

  return (
    <Dialog.Root open={isSetupOpen} onOpenChange={(open) => { if (!open) closeSetup(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-slate-950/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby="workflow-setup-description"
          className="fixed left-1/2 top-1/2 z-[130] flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Settings2 className="h-5 w-5" aria-hidden="true" /></span>
              <div className="min-w-0">
                <Dialog.Title className="text-base font-bold text-slate-950">Configure your Hardware Studio workflow</Dialog.Title>
                <Dialog.Description id="workflow-setup-description" className="mt-1 text-xs leading-5 text-slate-500">Show only the domains you need now. Re-enable anything later without deleting its project data.</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close workflow setup">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          {isSetupOpen && (
            <WorkflowSetupSession
              key={`${profileId}:${enabledDomains.join(',')}`}
              initialDomains={enabledDomains}
              initialProfileId={profileId}
              onCancel={closeSetup}
              onApply={apply}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
