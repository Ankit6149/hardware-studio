'use client';

import React from 'react';
import { ClipboardCheck, Link2, Plus, Ruler, TestTube2, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useValidationWorkspaceUiStore } from '../../store/validationWorkspaceUiStore';
import type { ValidationEvidence, ValidationMeasurement, ValidationTest, ValidationTestStep } from '../../types';
import { calculateRequirementCoverage } from '../../lib/validation/validationCoverage';
import { useFeedback } from '../feedback/FeedbackProvider';

interface ValidationStudioProps {
  initialMode?: string;
}

type ValidationMode = 'tests' | 'coverage' | 'factory-qa';

const inputClass = 'h-8 w-full border border-slate-300 bg-white px-2 text-[10px] text-slate-800 outline-none focus:border-slate-500';
const textAreaClass = 'w-full resize-y border border-slate-300 bg-white p-2.5 text-[10px] leading-5 text-slate-800 outline-none focus:border-slate-500';

function normalizeMode(initialMode?: string): ValidationMode {
  if (initialMode === 'coverage' || initialMode === 'factory-qa') return initialMode;
  return 'tests';
}

function statusTone(status: string): string {
  if (status === 'Covered') return 'text-emerald-700';
  if (status === 'Partially Covered') return 'text-amber-700';
  return 'text-slate-500';
}

function nextScopedId(prefix: string, ownerId: string, existingIds: string[]): string {
  let sequence = 1;
  let candidate = `${prefix}_${ownerId}_${sequence}`;
  while (existingIds.includes(candidate)) {
    sequence += 1;
    candidate = `${prefix}_${ownerId}_${sequence}`;
  }
  return candidate;
}

export const ValidationStudio: React.FC<ValidationStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const mode = normalizeMode(initialMode);
  const selectedTestId = useValidationWorkspaceUiStore((state) => state.selectedTestId);
  const setSelectedTestId = useValidationWorkspaceUiStore((state) => state.setSelectedTestId);
  const setInspectorOpen = useValidationWorkspaceUiStore((state) => state.setInspectorOpen);

  const validationTests = store.validationTests ?? [];
  const requirements = store.requirements ?? [];
  const visibleTests = mode === 'factory-qa'
    ? validationTests.filter((test) => test.stage === 'Factory QA')
    : validationTests;
  const selectedTest = selectedTestId
    ? visibleTests.find((test) => test.id === selectedTestId) ?? null
    : null;

  const addTest = () => {
    const factory = mode === 'factory-qa';
    const beforeIds = new Set((useProjectStore.getState().validationTests ?? []).map((test) => test.id));
    store.executeProjectCommand(factory ? 'ADD_QA' : 'ADD_TEST', factory ? 'Add Factory QA test' : 'Add validation test', () => {
      useProjectStore.getState().addValidationTest({
        name: factory ? `Factory QA ${visibleTests.length + 1}` : `Test ${validationTests.length + 1}`,
        stage: factory ? 'Factory QA' : 'EVT',
        category: factory ? 'Manufacturing' : 'Requirement',
        linkedRequirementIds: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedNetIds: [],
        linkedFirmwareModuleIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        status: 'Not Started',
        evidence: [],
      });
    });
    const created = (useProjectStore.getState().validationTests ?? []).find((test) => !beforeIds.has(test.id));
    if (created) {
      setSelectedTestId(created.id);
      setInspectorOpen(true);
    }
  };

  const addStep = () => {
    if (!selectedTest) return;
    const newStep: ValidationTestStep = {
      stepNumber: selectedTest.steps.length + 1,
      instruction: '',
      expectedResult: '',
      completed: false,
    };
    store.executeProjectCommand('ADD_STEP', 'Add validation procedure step', () => {
      store.updateValidationTest(selectedTest.id, { steps: [...selectedTest.steps, newStep] });
    });
  };

  const addMeasurement = () => {
    if (!selectedTest) return;
    const id = nextScopedId('meas', selectedTest.id, selectedTest.measurements.map((item) => item.id));
    const measurement: ValidationMeasurement = {
      id,
      name: '',
      type: 'Numeric',
      required: true,
      status: 'Untested',
    };
    store.executeProjectCommand('ADD_MEAS', 'Add validation measurement definition', () => {
      store.updateValidationTest(selectedTest.id, { measurements: [...selectedTest.measurements, measurement] });
    });
  };

  const addDefinitionReference = () => {
    if (!selectedTest) return;
    const id = nextScopedId('ref', selectedTest.id, selectedTest.evidence.map((item) => item.id));
    const reference: ValidationEvidence = {
      id,
      type: 'Text',
      value: '',
      createdAt: new Date().toISOString(),
      notes: 'Definition/reference metadata only — not validation run evidence.',
    };
    store.executeProjectCommand('ADD_TEST_REFERENCE', 'Add validation definition reference', () => {
      store.updateValidationTest(selectedTest.id, { evidence: [...selectedTest.evidence, reference] });
    });
  };

  const deleteTest = async () => {
    if (!selectedTest) return;
    const confirmed = await feedback.confirm({
      title: `Delete ${selectedTest.name}?`,
      description: 'This removes the editable test definition from current project state. Historical validation runs remain separate records.',
      confirmLabel: 'Delete test',
      cancelLabel: 'Keep test',
      variant: 'destructive',
    });
    if (!confirmed) return;
    store.executeProjectCommand('DEL_TEST', `Delete validation test ${selectedTest.name}`, () => store.deleteValidationTest(selectedTest.id));
    setSelectedTestId(null);
  };

  const updateStep = (index: number, patch: Partial<ValidationTestStep>) => {
    if (!selectedTest) return;
    const steps = selectedTest.steps.map((step, itemIndex) => itemIndex === index ? { ...step, ...patch } : step);
    store.updateValidationTest(selectedTest.id, { steps });
  };

  const updateMeasurement = (index: number, patch: Partial<ValidationMeasurement>) => {
    if (!selectedTest) return;
    const measurements = selectedTest.measurements.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    store.updateValidationTest(selectedTest.id, { measurements });
  };

  const updateReference = (index: number, patch: Partial<ValidationEvidence>) => {
    if (!selectedTest) return;
    const evidence = selectedTest.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    store.updateValidationTest(selectedTest.id, { evidence });
  };

  if (mode === 'coverage') {
    const coverage = calculateRequirementCoverage(requirements, validationTests);
    const covered = coverage.filter((entry) => entry.status === 'Covered').length;
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white" aria-label="Requirement coverage workspace">
        <div className="flex min-h-10 shrink-0 items-center gap-3 border-b border-slate-300 bg-[#f8f6f0] px-3">
          <ClipboardCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-slate-900">Requirement coverage</p><p className="text-[8px] text-slate-500">Traceability only. A linked definition is not a passing run.</p></div>
          <span className="font-mono text-[9px] text-slate-500">{covered}/{coverage.length} covered</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[10px]">
            <thead className="sticky top-0 z-10 bg-[#f5f1e8] text-slate-600"><tr><th className="border-b border-slate-300 px-3 py-2">Requirement</th><th className="border-b border-slate-300 px-3 py-2">Priority</th><th className="border-b border-slate-300 px-3 py-2">Linked tests</th><th className="border-b border-slate-300 px-3 py-2">Passed</th><th className="border-b border-slate-300 px-3 py-2">Failed</th><th className="border-b border-slate-300 px-3 py-2">State</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {coverage.map((entry) => (
                <tr key={entry.requirementId}><td className="px-3 py-2.5 font-medium text-slate-900">{entry.requirementTitle}</td><td className="px-3 py-2.5 text-slate-600">{entry.priority}</td><td className="px-3 py-2.5 font-mono text-slate-600">{entry.linkedTestIds.length}</td><td className="px-3 py-2.5 font-mono text-slate-600">{entry.passedTestIds.length}</td><td className="px-3 py-2.5 font-mono text-slate-600">{entry.failedTestIds.length}</td><td className={`px-3 py-2.5 font-semibold ${statusTone(entry.status)}`}>{entry.status}</td></tr>
              ))}
            </tbody>
          </table>
          {coverage.length === 0 && <div className="grid min-h-64 place-items-center p-8 text-center"><div><ClipboardCheck className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-800">No requirements to evaluate</p><p className="mt-1 text-xs text-slate-500">Create measurable requirements and link explicit test definitions.</p></div></div>}
        </div>
      </section>
    );
  }

  if (!selectedTest) {
    return (
      <section className="grid h-full min-h-0 place-items-center bg-white p-8 text-center" aria-label={mode === 'factory-qa' ? 'Factory QA definition workspace' : 'Validation definition workspace'}>
        <div className="max-w-sm">
          <TestTube2 className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-slate-800">Select a test definition</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Opening Validation never chooses a test for you. Select one in the Project Drawer or create a new definition explicitly.</p>
          <button type="button" onClick={addTest} className="mt-3 inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[10px] font-semibold text-white"><Plus className="h-3.5 w-3.5" /> {mode === 'factory-qa' ? 'Create Factory QA test' : 'Create test'}</button>
        </div>
      </section>
    );
  }

  const runCount = (store.validationRuns ?? []).filter((run) => run.testId === selectedTest.id).length;

  return (
    <main className="h-full min-h-0 overflow-y-auto bg-white" aria-label={`Define ${selectedTest.name}`}>
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 border-b border-slate-300 pb-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Definition · {runCount} recorded run{runCount === 1 ? '' : 's'}</div>
            <label className="sr-only" htmlFor={`validation-name-${selectedTest.id}`}>Test name</label>
            <input id={`validation-name-${selectedTest.id}`} value={selectedTest.name} onChange={(event) => store.updateValidationTest(selectedTest.id, { name: event.target.value })} className="mt-1 w-full border-0 bg-transparent p-0 text-xl font-semibold tracking-tight text-slate-950 outline-none" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select value={selectedTest.stage ?? 'EVT'} onChange={(event) => store.updateValidationTest(selectedTest.id, { stage: event.target.value as ValidationTest['stage'] })} className="h-8 border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none"><option>EVT</option><option>DVT</option><option>PVT</option><option>Factory QA</option></select>
              <select value={selectedTest.category ?? 'Requirement'} onChange={(event) => store.updateValidationTest(selectedTest.id, { category: event.target.value })} className="h-8 border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none">{['Requirement', 'Mechanical', 'Electrical', 'Power', 'RF', 'Firmware', 'Thermal', 'Environmental', 'Manufacturing', 'DRC'].map((category) => <option key={category}>{category}</option>)}</select>
              <span className="text-[9px] font-medium text-slate-400">Latest aggregate status: {selectedTest.status ?? 'Not Started'}</span>
            </div>
          </div>
          <button type="button" onClick={() => void deleteTest()} className="inline-flex h-8 items-center gap-1.5 px-2.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>

        <section className="border-b border-slate-200 py-5" aria-labelledby="validation-links-title">
          <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-slate-400" /><div><h2 id="validation-links-title" className="text-sm font-semibold text-slate-900">Requirement links</h2><p className="text-[10px] text-slate-500">Traceability links only. They do not make the requirement verified.</p></div></div>
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {requirements.map((requirement) => {
              const linked = selectedTest.linkedRequirementIds.includes(requirement.id);
              return <label key={requirement.id} className="flex min-h-9 cursor-pointer items-center gap-2 border border-slate-200 px-2.5 text-[10px] hover:bg-slate-50"><input type="checkbox" checked={linked} onChange={() => store.updateValidationTest(selectedTest.id, { linkedRequirementIds: linked ? selectedTest.linkedRequirementIds.filter((id) => id !== requirement.id) : [...selectedTest.linkedRequirementIds, requirement.id] })} /><span className="min-w-0 flex-1 truncate">{requirement.title}</span><span className="text-[8px] text-slate-400">{requirement.priority}</span></label>;
            })}
            {requirements.length === 0 && <p className="text-[10px] text-slate-400">No product requirements exist yet.</p>}
          </div>
        </section>

        <section className="border-b border-slate-200 py-5" aria-labelledby="validation-steps-title">
          <div className="flex items-center justify-between gap-3"><div><h2 id="validation-steps-title" className="text-sm font-semibold text-slate-900">Procedure</h2><p className="text-[10px] text-slate-500">Define actions and expected outcomes. Completion is recorded during execution, not here.</p></div><button type="button" onClick={addStep} className="inline-flex h-8 items-center gap-1 border border-slate-300 px-2 text-[10px] font-semibold"><Plus className="h-3 w-3" /> Step</button></div>
          <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
            {selectedTest.steps.map((step, index) => <div key={`${step.stepNumber}-${index}`} className="grid gap-2 px-2 py-2.5 md:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_2rem]"><span className="grid h-8 place-items-center font-mono text-[10px] text-slate-400">{index + 1}</span><input value={step.instruction} onChange={(event) => updateStep(index, { instruction: event.target.value, completed: false })} placeholder="Operator action" className={inputClass} /><input value={step.expectedResult} onChange={(event) => updateStep(index, { expectedResult: event.target.value, completed: false })} placeholder="Expected result" className={inputClass} /><button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { steps: selectedTest.steps.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, stepNumber: itemIndex + 1 })) })} className="grid h-8 w-8 place-items-center text-rose-600 hover:bg-rose-50" aria-label={`Delete step ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
            {selectedTest.steps.length === 0 && <p className="py-5 text-center text-[10px] text-slate-400">No procedure steps defined.</p>}
          </div>
        </section>

        <section className="border-b border-slate-200 py-5" aria-labelledby="validation-measurements-title">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Ruler className="h-4 w-4 text-slate-400" /><div><h2 id="validation-measurements-title" className="text-sm font-semibold text-slate-900">Measurement schema</h2><p className="text-[10px] text-slate-500">Expected values/tolerances belong to Define. Actual readings belong to Execute.</p></div></div><button type="button" onClick={addMeasurement} className="inline-flex h-8 items-center gap-1 border border-slate-300 px-2 text-[10px] font-semibold"><Plus className="h-3 w-3" /> Measurement</button></div>
          <div className="mt-3 space-y-2">
            {selectedTest.measurements.map((measurement, index) => (
              <div key={measurement.id} className="border border-slate-300 bg-[#fbfaf6] p-3">
                <div className="flex flex-wrap items-center gap-2"><input value={measurement.name} onChange={(event) => updateMeasurement(index, { name: event.target.value, actualValue: undefined, status: 'Untested' })} placeholder="Measurement name" className="h-8 min-w-[180px] flex-1 border border-slate-300 bg-white px-2 text-[10px]" /><select value={measurement.type} onChange={(event) => updateMeasurement(index, { type: event.target.value as ValidationMeasurement['type'], actualValue: undefined, status: 'Untested' })} className="h-8 border border-slate-300 bg-white px-2 text-[10px]">{['Numeric', 'Boolean', 'Text', 'Visual Inspection'].map((type) => <option key={type}>{type}</option>)}</select><label className="inline-flex items-center gap-1 text-[9px] text-slate-600"><input type="checkbox" checked={measurement.required} onChange={(event) => updateMeasurement(index, { required: event.target.checked })} /> Required</label><button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { measurements: selectedTest.measurements.filter((item) => item.id !== measurement.id) })} className="grid h-8 w-8 place-items-center text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {measurement.type === 'Numeric' && <><label className="text-[9px] text-slate-500">Expected<input type="number" value={typeof measurement.expectedValue === 'number' ? measurement.expectedValue : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label><label className="text-[9px] text-slate-500">Unit<input value={measurement.unit ?? ''} onChange={(event) => updateMeasurement(index, { unit: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[9px] text-slate-500">Tolerance +<input type="number" value={measurement.tolerancePlus ?? ''} onChange={(event) => updateMeasurement(index, { tolerancePlus: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label><label className="text-[9px] text-slate-500">Tolerance -<input type="number" value={measurement.toleranceMinus ?? ''} onChange={(event) => updateMeasurement(index, { toleranceMinus: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label></>}
                  {measurement.type === 'Boolean' && <label className="text-[9px] text-slate-500">Expected<select value={typeof measurement.expectedValue === 'boolean' ? String(measurement.expectedValue) : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value === '' ? undefined : event.target.value === 'true' })} className={`${inputClass} mt-1`}><option value="">—</option><option value="true">True</option><option value="false">False</option></select></label>}
                  {measurement.type === 'Text' && <label className="text-[9px] text-slate-500 sm:col-span-2">Expected<input value={typeof measurement.expectedValue === 'string' ? measurement.expectedValue : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value })} className={`${inputClass} mt-1`} /></label>}
                </div>
              </div>
            ))}
            {selectedTest.measurements.length === 0 && <p className="border border-dashed border-slate-300 py-5 text-center text-[10px] text-slate-400">No measurement schema defined.</p>}
          </div>
        </section>

        <section className="border-b border-slate-200 py-5" aria-labelledby="validation-reference-title">
          <div className="flex items-center justify-between gap-3"><div><h2 id="validation-reference-title" className="text-sm font-semibold text-slate-900">Definition references</h2><p className="text-[10px] text-slate-500">Procedure/specification references only. These are editable and are not immutable run evidence.</p></div><button type="button" onClick={addDefinitionReference} className="inline-flex h-8 items-center gap-1 border border-slate-300 px-2 text-[10px] font-semibold"><Plus className="h-3 w-3" /> Reference</button></div>
          <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
            {selectedTest.evidence.map((reference, index) => <div key={reference.id} className="flex flex-wrap items-center gap-2 px-2 py-2"><select value={reference.type} onChange={(event) => updateReference(index, { type: event.target.value as ValidationEvidence['type'] })} className="h-8 border border-slate-300 bg-white px-2 text-[10px]">{['Text', 'URL', 'Photo Reference', 'File Reference'].map((type) => <option key={type}>{type}</option>)}</select><input value={reference.value} onChange={(event) => updateReference(index, { value: event.target.value, notes: 'Definition/reference metadata only — not validation run evidence.' })} placeholder="Procedure, standard, fixture or reference" className="h-8 min-w-[220px] flex-1 border border-slate-300 bg-white px-2 text-[10px]" /><button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { evidence: selectedTest.evidence.filter((item) => item.id !== reference.id) })} className="grid h-8 w-8 place-items-center text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
            {selectedTest.evidence.length === 0 && <p className="py-5 text-center text-[10px] text-slate-400">No definition references attached.</p>}
          </div>
        </section>

        <section className="py-5" aria-labelledby="validation-pass-title"><h2 id="validation-pass-title" className="text-sm font-semibold text-slate-900">Pass criteria</h2><p className="mt-0.5 text-[10px] text-slate-500">Explicit criteria define what a reviewer/run evaluates; they do not mark the test Passed.</p><textarea value={selectedTest.passCriteria.join('\n')} onChange={(event) => store.updateValidationTest(selectedTest.id, { passCriteria: event.target.value.split('\n').map((criterion) => criterion.trim()).filter(Boolean) })} placeholder="One acceptance criterion per line" className={`${textAreaClass} mt-3 min-h-28`} /></section>
      </div>
    </main>
  );
};
