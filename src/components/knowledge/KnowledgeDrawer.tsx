'use client';

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  DEVICE_KNOWLEDGE_CATEGORIES,
  DeviceKnowledgeCategory,
  searchKnowledgeEntries,
} from '../../lib/knowledge/deviceKnowledge';
import {
  getStarterKnowledgeEntry,
  starterDeviceKnowledge,
} from '../../lib/knowledge/starterDeviceKnowledge';

interface KnowledgeDrawerProps {
  isOpen: boolean;
  requestedEntryId?: string;
  onOpenChange: (open: boolean) => void;
}

const DetailSection: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">{title}</h3>
    <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
  </section>
);

const GuidanceList: React.FC<{ items: readonly string[]; emptyLabel?: string }> = ({ items, emptyLabel = 'Not generally applicable.' }) => (
  items.length > 0 ? (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ) : <p className="text-slate-500">{emptyLabel}</p>
);

export const KnowledgeDrawer: React.FC<KnowledgeDrawerProps> = ({
  isOpen,
  requestedEntryId,
  onOpenChange,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DeviceKnowledgeCategory | 'All'>('All');
  const [selectedId, setSelectedId] = useState(
    getStarterKnowledgeEntry(requestedEntryId)?.id ?? starterDeviceKnowledge[0].id,
  );
  const setActiveView = useProjectStore((state) => state.setActiveView);

  const filteredEntries = useMemo(
    () => searchKnowledgeEntries(starterDeviceKnowledge, { query, category }),
    [category, query],
  );
  const selectedEntry = getStarterKnowledgeEntry(selectedId)
    ?? filteredEntries[0]
    ?? starterDeviceKnowledge[0];

  const navigateToWorkbench = (viewId: string) => {
    setActiveView(viewId);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          aria-describedby="device-knowledge-description"
          className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[1080px] flex-col overflow-hidden border-l border-slate-200 bg-slate-50 shadow-2xl outline-none sm:w-[92vw]"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-bold text-slate-950">Learn hardware building blocks</Dialog.Title>
                <Dialog.Description id="device-knowledge-description" className="mt-0.5 text-xs text-slate-500">
                  Search by device, use case, protocol, pin, or workbench.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Close device knowledge"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
              <div className="space-y-3 border-b border-slate-200 p-4">
                <label className="relative block">
                  <span className="sr-only">Search device knowledge</span>
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try I2C, battery, PWM…"
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap" aria-label="Knowledge categories">
                  {(['All', ...DEVICE_KNOWLEDGE_CATEGORIES] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      aria-pressed={category === item}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                        category === item
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2.5" role="listbox" aria-label="Device knowledge results">
                {filteredEntries.length > 0 ? (
                  <div className="space-y-1.5">
                    {filteredEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        role="option"
                        aria-selected={selectedEntry.id === entry.id}
                        onClick={() => setSelectedId(entry.id)}
                        className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                          selectedEntry.id === entry.id
                            ? 'border-indigo-200 bg-indigo-50'
                            : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{entry.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{entry.summary}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {entry.category}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-[11px] text-slate-400">
                          {entry.connection.protocols.length > 0 ? entry.connection.protocols.join(' · ') : entry.commonNames.slice(0, 2).join(' · ')}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <Search className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">No matching guide</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Search a broader term or choose All categories.</p>
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setCategory('All'); }}
                      className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </aside>

            <main className="min-h-0 overflow-y-auto bg-slate-50">
              <article className="mx-auto max-w-3xl space-y-4 p-4 pb-12 sm:p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">{selectedEntry.category}</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{selectedEntry.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{selectedEntry.summary}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Generic guidance reviewed
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <p><strong>Use the selected part datasheet for exact values.</strong> This guide teaches the device family and workflow; it is not a qualified part definition or replacement for engineering review.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailSection title="Typical uses"><GuidanceList items={selectedEntry.useCases} /></DetailSection>
                  <DetailSection title="When to use"><GuidanceList items={selectedEntry.whenToUse} /></DetailSection>
                  <DetailSection title="When not to use"><GuidanceList items={selectedEntry.whenNotToUse} /></DetailSection>
                  <DetailSection title="Ports, pins, and protocols">
                    <GuidanceList items={selectedEntry.connection.portsAndPins} />
                    {selectedEntry.connection.protocols.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedEntry.connection.protocols.map((protocol) => (
                          <span key={protocol} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{protocol}</span>
                        ))}
                      </div>
                    )}
                  </DetailSection>
                </div>

                <DetailSection title="Connection workflow">
                  <ol className="space-y-3">
                    {selectedEntry.connection.steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Operating envelope</h4>
                      <div className="mt-2"><GuidanceList items={selectedEntry.connection.operatingEnvelope} /></div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Orientation and polarity</h4>
                      <div className="mt-2"><GuidanceList items={selectedEntry.connection.orientationAndPolarity} /></div>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection title="Prerequisites before placement">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div><h4 className="font-bold text-slate-900">Electrical</h4><div className="mt-2"><GuidanceList items={selectedEntry.prerequisites.electrical} /></div></div>
                    <div><h4 className="font-bold text-slate-900">Mechanical</h4><div className="mt-2"><GuidanceList items={selectedEntry.prerequisites.mechanical} /></div></div>
                    <div><h4 className="font-bold text-slate-900">Firmware</h4><div className="mt-2"><GuidanceList items={selectedEntry.prerequisites.firmware} /></div></div>
                  </div>
                </DetailSection>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailSection title="Common mistakes">
                    <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-900"><GuidanceList items={selectedEntry.commonMistakes} /></div>
                  </DetailSection>
                  <DetailSection title="Safety notes">
                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <GuidanceList items={selectedEntry.safetyNotes} />
                    </div>
                  </DetailSection>
                </div>

                <DetailSection title="How to validate it"><GuidanceList items={selectedEntry.validationSuggestions} /></DetailSection>

                <DetailSection title="Continue in Hardware Studio">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedEntry.workbenches.map((workbench) => (
                      <button
                        key={`${selectedEntry.id}-${workbench.viewId}`}
                        type="button"
                        onClick={() => navigateToWorkbench(workbench.viewId)}
                        className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-900">
                          {workbench.label}
                          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-700" aria-hidden="true" />
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{workbench.action}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Next actions</h4>
                    <div className="mt-2"><GuidanceList items={selectedEntry.nextActions} /></div>
                  </div>
                </DetailSection>

                <DetailSection title="Related and alternative devices">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-bold text-slate-900">Related guides</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEntry.relatedIds.map((relatedId) => {
                          const related = getStarterKnowledgeEntry(relatedId);
                          if (!related) return null;
                          return (
                            <button
                              key={relatedId}
                              type="button"
                              onClick={() => setSelectedId(relatedId)}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {related.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Alternatives to compare</h4>
                      <div className="mt-2"><GuidanceList items={selectedEntry.alternatives} /></div>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection title="Sources and qualification">
                  <p>{selectedEntry.provenance.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">Reviewed {selectedEntry.provenance.reviewedOn}. Qualification: {selectedEntry.provenance.qualification}.</p>
                  <div className="mt-3 space-y-2">
                    {selectedEntry.provenance.references.map((reference) => (
                      <a
                        key={reference.url}
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{reference.label}</span>
                      </a>
                    ))}
                  </div>
                </DetailSection>
              </article>
            </main>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
