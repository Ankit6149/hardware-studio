'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Link2,
  Plus,
  ShieldCheck,
  TestTube2,
  Trash2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { ProductRequirement } from '../../types';
import { calculateTestStatus } from '../../lib/validation/measurementEvaluation';
import { useFeedback } from '../feedback/FeedbackProvider';

interface ProductRequirementsPanelProps {
  mode?: 'full' | 'compact';
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
const smallInputClass = 'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const priorityStyle: Record<ProductRequirement['priority'], string> = {
  Critical: 'border-rose-200 bg-rose-50 text-rose-700',
  High: 'border-amber-200 bg-amber-50 text-amber-700',
  Medium: 'border-sky-200 bg-sky-50 text-sky-700',
  Low: 'border-slate-200 bg-slate-50 text-slate-600',
};

const statusStyle: Record<string, string> = {
  Draft: 'border-slate-200 bg-slate-50 text-slate-600',
  Approved: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Implemented: 'border-sky-200 bg-sky-50 text-sky-700',
  Verified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const ProductRequirementsPanel: React.FC<ProductRequirementsPanelProps> = ({ mode = 'full' }) => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const requirements = store.requirements || [];
  const validationTests = store.validationTests || [];
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(requirements[0]?.id || null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criterion, setCriterion] = useState('');
  const [criterionDraft, setCriterionDraft] = useState('');
  const [type, setType] = useState<ProductRequirement['type']>('Functional');
  const [priority, setPriority] = useState<ProductRequirement['priority']>('Medium');

  const selectedRequirement = requirements.find((requirement) => requirement.id === selectedRequirementId) || requirements[0] || null;
  const linkedTests = useMemo(
    () => selectedRequirement
      ? validationTests.filter((test) => selectedRequirement.linkedTestIds.includes(test.id) || test.linkedRequirementIds.includes(selectedRequirement.id))
      : [],
    [selectedRequirement, validationTests],
  );
  const passedLinkedTests = linkedTests.filter((test) => calculateTestStatus(test) === 'Passed');

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !criterion.trim()) {
      feedback.notify({
        tone: 'warning',
        title: 'Requirement needs a measurable decision',
        detail: 'Add a title, a clear need, and at least one acceptance criterion so the record can later be verified.',
      });
      return;
    }

    store.executeProjectCommand('ADD_REQUIREMENT', `Add requirement: ${title.trim()}`, () =>
      store.addRequirement({
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        status: 'Draft',
        acceptanceCriteria: [criterion.trim()],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        risks: [],
      })
    );

    const created = (useProjectStore.getState().requirements || []).at(-1);
    if (created) setSelectedRequirementId(created.id);
    setTitle('');
    setDescription('');
    setCriterion('');
    setShowForm(false);
    feedback.notify({ tone: 'success', title: 'Requirement created', detail: 'The requirement starts as Draft until its acceptance decision is approved.' });
  };

  const updateRequirement = (patch: Partial<ProductRequirement>, descriptionText: string) => {
    if (!selectedRequirement) return;
    store.executeProjectCommand('UPDATE_REQUIREMENT_DECISION', descriptionText, () =>
      store.updateRequirement(selectedRequirement.id, patch)
    );
  };

  const handleDelete = async (requirement: ProductRequirement) => {
    const confirmed = await feedback.confirm({
      title: `Delete “${requirement.title}”?`,
      description: `This removes the requirement and its links from the current product intent. ${requirement.linkedTestIds.length > 0 ? 'Linked validation tests are not automatically deleted.' : ''}`,
      confirmLabel: 'Delete requirement',
      cancelLabel: 'Keep requirement',
      variant: 'destructive',
    });
    if (!confirmed) return;

    store.executeProjectCommand('DELETE_REQUIREMENT', `Delete requirement ${requirement.title}`, () => store.deleteRequirement(requirement.id));
    const remaining = (useProjectStore.getState().requirements || []).filter((candidate) => candidate.id !== requirement.id);
    setSelectedRequirementId(remaining[0]?.id || null);
    feedback.notify({ tone: 'success', title: 'Requirement deleted', detail: `${requirement.title} was removed from product intent.` });
  };

  const handleStatusDecision = (nextStatus: ProductRequirement['status']) => {
    if (!selectedRequirement) return;

    if (nextStatus === 'Approved' && selectedRequirement.acceptanceCriteria.length === 0) {
      feedback.notify({ tone: 'warning', title: 'Approval blocked', detail: 'Define at least one measurable acceptance criterion before approving this requirement.' });
      return;
    }

    const implementationLinks = selectedRequirement.linkedArchitectureNodeIds.length
      + selectedRequirement.linkedComponentIds.length
      + selectedRequirement.linkedFirmwareModuleIds.length;
    if (nextStatus === 'Implemented' && implementationLinks === 0) {
      feedback.notify({ tone: 'warning', title: 'Implementation evidence missing', detail: 'Link the requirement to architecture, a component, or firmware before marking it Implemented.' });
      return;
    }

    if (nextStatus === 'Verified' && passedLinkedTests.length === 0) {
      feedback.notify({ tone: 'warning', title: 'Verification blocked', detail: 'A requirement becomes Verified only when at least one linked validation test has actually passed.' });
      return;
    }

    updateRequirement({ status: nextStatus }, `Set ${selectedRequirement.title} to ${nextStatus}`);
    feedback.notify({
      tone: 'success',
      title: `Requirement ${nextStatus.toLowerCase()}`,
      detail: nextStatus === 'Verified'
        ? 'The requirement is now backed by passing linked validation evidence.'
        : `The requirement decision state is now ${nextStatus}.`,
    });
  };

  const addAcceptanceCriterion = () => {
    if (!selectedRequirement || !criterionDraft.trim()) return;
    updateRequirement(
      { acceptanceCriteria: [...selectedRequirement.acceptanceCriteria, criterionDraft.trim()] },
      `Add acceptance criterion to ${selectedRequirement.title}`,
    );
    setCriterionDraft('');
  };

  const removeAcceptanceCriterion = (index: number) => {
    if (!selectedRequirement) return;
    updateRequirement(
      { acceptanceCriteria: selectedRequirement.acceptanceCriteria.filter((_, criterionIndex) => criterionIndex !== index) },
      `Remove acceptance criterion from ${selectedRequirement.title}`,
    );
  };

  const createLinkedValidationTest = () => {
    if (!selectedRequirement) return;
    if (selectedRequirement.acceptanceCriteria.length === 0) {
      feedback.notify({ tone: 'warning', title: 'Validation needs criteria', detail: 'Define acceptance criteria before creating a linked validation procedure.' });
      return;
    }

    store.executeProjectCommand('CREATE_REQUIREMENT_TEST', `Create validation for ${selectedRequirement.title}`, () => {
      store.addValidationTest({
        name: `${selectedRequirement.title} acceptance test`,
        stage: 'EVT',
        category: 'Requirement',
        linkedRequirementIds: [selectedRequirement.id],
        linkedArchitectureNodeIds: selectedRequirement.linkedArchitectureNodeIds,
        linkedComponentIds: selectedRequirement.linkedComponentIds,
        linkedNetIds: [],
        linkedFirmwareModuleIds: selectedRequirement.linkedFirmwareModuleIds,
        steps: [{ stepNumber: 1, instruction: 'Execute the defined acceptance procedure.', expectedResult: selectedRequirement.acceptanceCriteria.join('; '), completed: false }],
        measurements: [],
        passCriteria: selectedRequirement.acceptanceCriteria,
        status: 'Not Started',
        evidence: [],
      });
      const tests = useProjectStore.getState().validationTests || [];
      const createdTest = tests.at(-1);
      if (createdTest) {
        store.updateRequirement(selectedRequirement.id, {
          linkedTestIds: Array.from(new Set([...selectedRequirement.linkedTestIds, createdTest.id])),
        });
      }
    });
    feedback.notify({ tone: 'success', title: 'Linked validation created', detail: 'The test carries this requirement ID and its acceptance criteria instead of copied text alone.' });
    store.setActiveView('validation-studio');
  };

  if (mode === 'compact') {
    return (
      <section className="h-full overflow-y-auto bg-slate-50 p-3" aria-label="Requirements supporting architecture">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Product intent</p>
            <h2 className="mt-0.5 text-xs font-bold text-slate-900">Requirements</h2>
          </div>
          <button type="button" onClick={() => store.setActiveView('requirements')} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Manage <ArrowRight className="h-3 w-3" /></button>
        </div>
        <div className="mt-3 space-y-2">
          {requirements.map((requirement) => (
            <button key={requirement.id} type="button" onClick={() => setSelectedRequirementId(requirement.id)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-indigo-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <p className="text-[11px] font-semibold leading-4 text-slate-900">{requirement.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${priorityStyle[requirement.priority]}`}>{requirement.priority}</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${statusStyle[requirement.status] || statusStyle.Draft}`}>{requirement.status}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">{requirement.acceptanceCriteria.length} criteria</span>
              </div>
            </button>
          ))}
          {requirements.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-[10px] leading-5 text-slate-500">No product requirement exists yet. Define intent before treating architecture as decided.</p>}
        </div>
      </section>
    );
  }

  const implementationLinkCount = selectedRequirement
    ? selectedRequirement.linkedArchitectureNodeIds.length + selectedRequirement.linkedComponentIds.length + selectedRequirement.linkedFirmwareModuleIds.length
    : 0;

  const consequence = !selectedRequirement
    ? 'Create a requirement to begin.'
    : selectedRequirement.status === 'Draft'
      ? 'Draft intent is still negotiable and should not be treated as a verified downstream constraint.'
      : selectedRequirement.status === 'Approved'
        ? 'Downstream design decisions should now satisfy this accepted need; changing it may invalidate linked engineering work.'
        : selectedRequirement.status === 'Implemented'
          ? 'The requirement has engineering implementation links, but it is not proven until linked validation evidence passes.'
          : 'The requirement is backed by passing linked validation evidence. Future changes should trigger re-verification.';

  return (
    <section className="flex h-full min-h-0 overflow-hidden bg-slate-50" aria-label="Requirement decision workspace">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white xl:w-80">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Decision subjects</p>
              <h2 className="mt-1 text-sm font-bold text-slate-950">Requirements</h2>
            </div>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Create requirement"><Plus className="h-4 w-4" aria-hidden="true" /></button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="block"><span className="mb-1 block text-[10px] font-semibold text-slate-600">Need</span><input value={title} onChange={(event) => setTitle(event.target.value)} className={smallInputClass} placeholder="What must be true?" /></label>
              <label className="block"><span className="mb-1 block text-[10px] font-semibold text-slate-600">Why / context</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${smallInputClass} min-h-16 resize-y`} placeholder="Why does the product need this?" /></label>
              <label className="block"><span className="mb-1 block text-[10px] font-semibold text-slate-600">First acceptance criterion</span><textarea value={criterion} onChange={(event) => setCriterion(event.target.value)} className={`${smallInputClass} min-h-16 resize-y`} placeholder="How will we know it is satisfied?" /></label>
              <div className="grid grid-cols-2 gap-2">
                <select value={type} onChange={(event) => setType(event.target.value as ProductRequirement['type'])} className={smallInputClass} aria-label="Requirement type">{['Functional', 'Electrical', 'Mechanical', 'Firmware', 'Safety', 'Manufacturing', 'Validation'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
                <select value={priority} onChange={(event) => setPriority(event.target.value as ProductRequirement['priority'])} className={smallInputClass} aria-label="Requirement priority">{['Critical', 'High', 'Medium', 'Low'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              </div>
              <button type="submit" className="min-h-10 w-full rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">Create measurable requirement</button>
            </form>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {requirements.map((requirement) => {
            const selected = requirement.id === selectedRequirement?.id;
            return (
              <button key={requirement.id} type="button" onClick={() => setSelectedRequirementId(requirement.id)} aria-current={selected ? 'true' : undefined} className={`mb-1.5 w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'}`}>
                <p className="text-xs font-semibold leading-4 text-slate-950">{requirement.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${priorityStyle[requirement.priority]}`}>{requirement.priority}</span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${statusStyle[requirement.status] || statusStyle.Draft}`}>{requirement.status}</span>
                </div>
              </button>
            );
          })}
          {requirements.length === 0 && <div className="m-2 rounded-xl border border-dashed border-slate-300 p-5 text-center"><p className="text-xs font-semibold text-slate-700">No decision subject yet</p><p className="mt-1 text-[10px] leading-5 text-slate-500">Create a measurable product need instead of starting with a solution.</p></div>}
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {selectedRequirement ? (
          <div className="mx-auto max-w-5xl">
            <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Decision subject</p>
                <input value={selectedRequirement.title} onChange={(event) => updateRequirement({ title: event.target.value }, `Rename requirement ${selectedRequirement.title}`)} className="mt-1 w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-tight text-slate-950 outline-none focus:ring-0" aria-label="Requirement title" />
                <textarea value={selectedRequirement.description} onChange={(event) => updateRequirement({ description: event.target.value }, `Update requirement ${selectedRequirement.title}`)} className="mt-2 min-h-16 w-full resize-y border-0 bg-transparent p-0 text-sm leading-6 text-slate-600 outline-none focus:ring-0" aria-label="Requirement description" />
              </div>
              <button type="button" onClick={() => void handleDelete(selectedRequirement)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500"><Trash2 className="h-4 w-4" /> Delete</button>
            </header>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <main className="min-w-0 space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="requirement-evidence-title">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Evidence needed to decide</p>
                    <h2 id="requirement-evidence-title" className="mt-1 text-base font-bold text-slate-950">Acceptance criteria</h2>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={criterionDraft}
                      onChange={(event) => setCriterionDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addAcceptanceCriterion();
                        }
                      }}
                      className={`${smallInputClass} flex-1`}
                      placeholder="Add a measurable acceptance criterion"
                      aria-label="New acceptance criterion"
                    />
                    <button type="button" onClick={addAcceptanceCriterion} disabled={!criterionDraft.trim()} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Add criterion</button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedRequirement.acceptanceCriteria.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500 shadow-sm">{index + 1}</span>
                        <textarea value={item} onChange={(event) => updateRequirement({ acceptanceCriteria: selectedRequirement.acceptanceCriteria.map((value, criterionIndex) => criterionIndex === index ? event.target.value : value) }, `Edit acceptance criterion for ${selectedRequirement.title}`)} className="min-h-12 flex-1 resize-y border-0 bg-transparent p-0 text-xs leading-5 text-slate-700 outline-none" aria-label={`Acceptance criterion ${index + 1}`} />
                        <button type="button" onClick={() => removeAcceptanceCriterion(index)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500" aria-label={`Remove acceptance criterion ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                    {selectedRequirement.acceptanceCriteria.length === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Approval is blocked.</strong> A requirement without a measurable acceptance criterion cannot produce a defensible verification decision.</div>}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="requirement-links-title">
                  <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-indigo-700" aria-hidden="true" /><h2 id="requirement-links-title" className="text-sm font-bold text-slate-950">Implementation and validation evidence</h2></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Architecture', selectedRequirement.linkedArchitectureNodeIds.length],
                      ['Components', selectedRequirement.linkedComponentIds.length],
                      ['Firmware', selectedRequirement.linkedFirmwareModuleIds.length],
                      ['Validation tests', linkedTests.length],
                    ].map(([label, count]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-bold tabular-nums text-slate-950">{count}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p></div>
                    ))}
                  </div>

                  {linkedTests.length > 0 && (
                    <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {linkedTests.map((test) => {
                        const testStatus = calculateTestStatus(test);
                        return <button key={test.id} type="button" onClick={() => store.setActiveView('validation-studio')} className="flex min-h-11 w-full items-center gap-3 px-3 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"><span className={`h-2 w-2 rounded-full ${testStatus === 'Passed' ? 'bg-emerald-500' : testStatus === 'Failed' ? 'bg-rose-500' : 'bg-amber-400'}`} /><span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{test.name}</span><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{testStatus}</span><ChevronRight className="h-3.5 w-3.5 text-slate-400" /></button>;
                      })}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => store.setActiveView('product-architecture')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">Link implementation <ArrowRight className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={createLinkedValidationTest} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"><TestTube2 className="h-3.5 w-3.5" /> Create linked validation</button>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Risk evidence</p>
                  <label className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-slate-700">What could make this requirement wrong, unsafe, or impossible?</span><textarea value={selectedRequirement.risks.join('\n')} onChange={(event) => updateRequirement({ risks: event.target.value.split('\n').map((risk) => risk.trim()).filter(Boolean) }, `Update risks for ${selectedRequirement.title}`)} className={`${inputClass} min-h-24 resize-y`} placeholder="One risk or assumption per line" /></label>
                </section>
              </main>

              <aside className="h-fit space-y-4 xl:sticky xl:top-4" aria-label="Requirement decision controls">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-700" /><h2 className="text-sm font-bold text-slate-950">Decision state</h2></div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Status changes are decisions with evidence requirements, not labels.</p>

                  <div className="mt-4 space-y-2">
                    {(['Draft', 'Approved', 'Implemented', 'Verified'] as ProductRequirement['status'][]).map((status) => {
                      const active = selectedRequirement.status === status;
                      const unavailable = status === 'Approved'
                        ? selectedRequirement.acceptanceCriteria.length === 0
                        : status === 'Implemented'
                          ? implementationLinkCount === 0
                          : status === 'Verified'
                            ? passedLinkedTests.length === 0
                            : false;
                      return (
                        <button key={status} type="button" onClick={() => handleStatusDecision(status)} aria-pressed={active} className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${active ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${active ? 'bg-indigo-600 text-white' : unavailable ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700'}`}>{active ? <CheckCircle2 className="h-3.5 w-3.5" /> : unavailable ? '·' : '✓'}</span>
                          <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-900">{status}</span><span className="mt-0.5 block text-[9px] text-slate-500">{status === 'Draft' ? 'Intent still negotiable' : status === 'Approved' ? 'Criteria defined' : status === 'Implemented' ? 'Engineering link required' : 'Passing linked test required'}</span></span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Consequence</p>
                  <p className="mt-2 text-xs leading-5 text-slate-700">{consequence}</p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Classification</p>
                  <div className="mt-3 grid gap-2">
                    <label><span className="mb-1 block text-[10px] font-semibold text-slate-600">Type</span><select value={selectedRequirement.type} onChange={(event) => updateRequirement({ type: event.target.value as ProductRequirement['type'] }, `Change type for ${selectedRequirement.title}`)} className={smallInputClass}>{['Functional', 'Electrical', 'Mechanical', 'Firmware', 'Safety', 'Manufacturing', 'Validation'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                    <label><span className="mb-1 block text-[10px] font-semibold text-slate-600">Priority</span><select value={selectedRequirement.priority} onChange={(event) => updateRequirement({ priority: event.target.value as ProductRequirement['priority'] }, `Change priority for ${selectedRequirement.title}`)} className={smallInputClass}>{['Critical', 'High', 'Medium', 'Low'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  </div>
                </section>

                {(selectedRequirement.acceptanceCriteria.length === 0 || (selectedRequirement.status === 'Implemented' && linkedTests.length === 0)) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p className="text-[10px] leading-5">The current decision state is missing evidence needed for the next transition. Hardware Studio will block the transition rather than silently upgrading the status.</p></div></div>
                )}
              </aside>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center"><div className="max-w-md text-center"><ShieldCheck className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-lg font-bold text-slate-900">Define the first product decision</h2><p className="mt-2 text-sm leading-6 text-slate-500">A useful requirement states the need, the evidence required to decide it, the allowed decision states, and what changes after the decision.</p><button type="button" onClick={() => setShowForm(true)} className="mt-4 min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">Create requirement</button></div></div>
        )}
      </div>
    </section>
  );
};
