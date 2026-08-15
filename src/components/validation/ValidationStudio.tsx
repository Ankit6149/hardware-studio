'use client';

import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import type { ValidationEvidence, ValidationMeasurement, ValidationTest, ValidationTestStep } from '../../types';
import { evaluateValidationMeasurement, calculateTestStatus } from '../../lib/validation/measurementEvaluation';
import { calculateRequirementCoverage } from '../../lib/validation/validationCoverage';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  ListChecks,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';
import { EditorDockButton } from '../editor/EditorDockButton';

interface ValidationStudioProps {
  initialMode?: string;
}

type ValidationMode = 'tests' | 'coverage' | 'factory-qa';

const inputClass = 'h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[10px] text-slate-800 outline-none focus:border-slate-500';
const textAreaClass = 'w-full resize-y rounded-md border border-slate-300 bg-white p-2.5 text-[10px] leading-5 text-slate-800 outline-none focus:border-slate-500';

function normalizeMode(initialMode?: string): ValidationMode {
  if (initialMode === 'coverage' || initialMode === 'factory-qa') return initialMode;
  return 'tests';
}

function statusTone(status: string): string {
  switch (status) {
    case 'Passed':
    case 'Pass':
    case 'Covered':
      return 'text-emerald-700';
    case 'Failed':
    case 'Fail':
      return 'text-rose-700';
    case 'In Progress':
    case 'Partially Covered':
      return 'text-amber-700';
    case 'Needs Review':
      return 'text-violet-700';
    default:
      return 'text-slate-500';
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'Passed' || status === 'Pass' || status === 'Covered') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />;
  if (status === 'Failed' || status === 'Fail') return <XCircle className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />;
  if (status === 'In Progress' || status === 'Partially Covered') return <AlertCircle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />;
  return <HelpCircle className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />;
}

export const ValidationStudio: React.FC<ValidationStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const mode = normalizeMode(initialMode);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testListOpen, setTestListOpen] = useState(false);

  const validationTests = store.validationTests || [];
  const requirements = store.requirements || [];
  const visibleTests = useMemo(
    () => mode === 'factory-qa' ? validationTests.filter((test) => test.stage === 'Factory QA') : validationTests,
    [mode, validationTests],
  );
  const selectedTest = visibleTests.find((test) => test.id === selectedTestId) || visibleTests[0] || null;

  const handleAddTest = () => {
    const factory = mode === 'factory-qa';
    store.executeProjectCommand(factory ? 'ADD_QA' : 'ADD_TEST', factory ? 'Add Factory QA test' : 'Add validation test', () =>
      store.addValidationTest({
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
      })
    );
    setTestListOpen(true);
  };

  const handleAddStep = () => {
    if (!selectedTest) return;
    const newStep: ValidationTestStep = {
      stepNumber: selectedTest.steps.length + 1,
      instruction: '',
      expectedResult: '',
      completed: false,
    };
    store.executeProjectCommand('ADD_STEP', 'Add test step', () =>
      store.updateValidationTest(selectedTest.id, { steps: [...selectedTest.steps, newStep] })
    );
  };

  const handleAddMeasurement = () => {
    if (!selectedTest) return;
    const newMeasurement: ValidationMeasurement = {
      id: `meas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      type: 'Numeric',
      required: true,
      status: 'Untested',
    };
    store.executeProjectCommand('ADD_MEAS', 'Add measurement', () =>
      store.updateValidationTest(selectedTest.id, { measurements: [...selectedTest.measurements, newMeasurement] })
    );
  };

  const handleAddEvidence = () => {
    if (!selectedTest) return;
    const newEvidence: ValidationEvidence = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'Text',
      value: '',
      createdAt: new Date().toISOString(),
    };
    store.executeProjectCommand('ADD_EVIDENCE', 'Add evidence', () =>
      store.updateValidationTest(selectedTest.id, { evidence: [...selectedTest.evidence, newEvidence] })
    );
  };

  const handleDeleteTest = async () => {
    if (!selectedTest) return;
    const confirmed = await feedback.confirm({
      title: `Delete ${selectedTest.name}?`,
      description: 'This removes the validation test, including its steps, measurements, pass criteria, and attached evidence from the current project state. The deletion is not applied until you confirm.',
      confirmLabel: 'Delete test',
      cancelLabel: 'Keep test',
      variant: 'destructive',
    });
    if (!confirmed) return;

    const deletedName = selectedTest.name;
    store.executeProjectCommand('DEL_TEST', `Delete validation test ${deletedName}`, () =>
      store.deleteValidationTest(selectedTest.id)
    );
    setSelectedTestId(null);
    feedback.notify({ tone: 'success', title: 'Validation test deleted', detail: `${deletedName} was removed from the current project state.` });
  };

  const updateStep = (index: number, patch: Partial<ValidationTestStep>) => {
    if (!selectedTest) return;
    const steps = selectedTest.steps.map((step, itemIndex) => itemIndex === index ? { ...step, ...patch } : step);
    store.updateValidationTest(selectedTest.id, { steps });
  };

  const updateMeasurement = (index: number, patch: Partial<ValidationMeasurement>) => {
    if (!selectedTest) return;
    const measurements = selectedTest.measurements.map((measurement, itemIndex) => itemIndex === index ? { ...measurement, ...patch } : measurement);
    store.updateValidationTest(selectedTest.id, { measurements });
  };

  const updateEvidence = (index: number, patch: Partial<ValidationEvidence>) => {
    if (!selectedTest) return;
    const evidence = selectedTest.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    store.updateValidationTest(selectedTest.id, { evidence });
  };

  if (mode === 'coverage') {
    const coverage = calculateRequirementCoverage(requirements, validationTests);
    const covered = coverage.filter((entry) => entry.status === 'Covered').length;
    const total = coverage.length;

    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white" aria-label="Requirement coverage workspace">
        <header className="flex min-h-11 shrink-0 items-center gap-3 border-b border-slate-300 bg-white px-3">
          <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-900">Requirement coverage</p><p className="mt-0.5 text-[9px] text-slate-500">Traceability evidence only—coverage does not replace a passing validation run.</p></div>
          <span className="text-[10px] tabular-nums text-slate-500"><strong className="text-slate-900">{covered}/{total}</strong> covered · {total > 0 ? Math.round((covered / total) * 100) : 0}%</span>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[10px]">
            <thead className="sticky top-0 z-10 bg-[#f5f1e8] text-slate-600">
              <tr><th className="border-b border-slate-300 px-3 py-2 font-semibold">Requirement</th><th className="border-b border-slate-300 px-3 py-2 font-semibold">Priority</th><th className="border-b border-slate-300 px-3 py-2 font-semibold">Linked tests</th><th className="border-b border-slate-300 px-3 py-2 font-semibold">Passed</th><th className="border-b border-slate-300 px-3 py-2 font-semibold">Failed</th><th className="border-b border-slate-300 px-3 py-2 font-semibold">Coverage state</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coverage.map((entry) => <tr key={entry.requirementId} className="bg-white"><td className="px-3 py-2.5 font-medium text-slate-900">{entry.requirementTitle}</td><td className="px-3 py-2.5 text-slate-600">{entry.priority}</td><td className="px-3 py-2.5 tabular-nums text-slate-600">{entry.linkedTestIds.length}</td><td className="px-3 py-2.5 tabular-nums text-slate-600">{entry.passedTestIds.length}</td><td className="px-3 py-2.5 tabular-nums text-slate-600">{entry.failedTestIds.length}</td><td className={`px-3 py-2.5 font-semibold ${statusTone(entry.status)}`}>{entry.status}</td></tr>)}
            </tbody>
          </table>
          {coverage.length === 0 && <div className="grid min-h-64 place-items-center p-8 text-center"><div><ClipboardCheck className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-800">No requirements to evaluate</p><p className="mt-1 text-xs text-slate-500">Create measurable requirements and link validation tests to see coverage.</p></div></div>}
        </div>
      </section>
    );
  }

  const selectedStatus = selectedTest ? calculateTestStatus(selectedTest) : 'Not Started';

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbfaf6]" aria-label={mode === 'factory-qa' ? 'Factory QA test editor' : 'Validation test editor'}>
      <header className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-3 py-1.5">
        <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-900">{mode === 'factory-qa' ? 'Factory QA tests' : 'Test definitions'}</p><p className="mt-0.5 truncate text-[9px] text-slate-500">{visibleTests.length} test{visibleTests.length === 1 ? '' : 's'} · select, author procedure, measurements, evidence, and pass criteria here; record runs separately.</p></div>
        <EditorDockButton label="Tests" icon={ListChecks} active={testListOpen} count={visibleTests.length} onClick={() => setTestListOpen((value) => !value)} />
        <button type="button" onClick={handleAddTest} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-2.5 text-[10px] font-semibold text-white hover:bg-slate-800"><Plus className="h-3.5 w-3.5" /> {mode === 'factory-qa' ? 'Add QA test' : 'Add test'}</button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {selectedTest ? (
          <main className="h-full overflow-y-auto bg-white" aria-label={`Edit ${selectedTest.name}`}>
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 border-b border-slate-300 pb-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`validation-name-${selectedTest.id}`}>Test name</label>
                  <input id={`validation-name-${selectedTest.id}`} value={selectedTest.name} onChange={(event) => store.updateValidationTest(selectedTest.id, { name: event.target.value })} className="w-full border-0 bg-transparent p-0 text-xl font-semibold tracking-tight text-slate-950 outline-none" />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select value={selectedTest.stage} onChange={(event) => store.executeProjectCommand('UPDATE_STAGE', 'Change stage', () => store.updateValidationTest(selectedTest.id, { stage: event.target.value as ValidationTest['stage'] }))} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-slate-500">{['EVT', 'DVT', 'PVT', 'Factory QA'].map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select>
                    <select value={selectedTest.category} onChange={(event) => store.updateValidationTest(selectedTest.id, { category: event.target.value as ValidationTest['category'] })} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-slate-500">{['Requirement', 'Mechanical', 'Electrical', 'Power', 'RF', 'Firmware', 'Thermal', 'Environmental', 'Manufacturing'].map((category) => <option key={category} value={category}>{category}</option>)}</select>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${statusTone(selectedStatus)}`}><StatusIcon status={selectedStatus} />{selectedStatus}</span>
                  </div>
                </div>
                <button type="button" onClick={handleDeleteTest} className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>

              <section className="border-b border-slate-200 py-5" aria-labelledby="validation-steps-title">
                <div className="flex items-center justify-between gap-3"><div><h2 id="validation-steps-title" className="text-sm font-semibold text-slate-900">Procedure</h2><p className="mt-0.5 text-[10px] text-slate-500">Author explicit actions and expected outcomes. Checking steps alone is not run evidence.</p></div><button type="button" onClick={handleAddStep} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-3 w-3" /> Step</button></div>
                <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
                  {selectedTest.steps.map((step, index) => (
                    <div key={`${step.stepNumber}-${index}`} className="grid gap-2 px-2 py-2.5 md:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_2rem] md:items-start">
                      <label className="grid h-8 place-items-center"><input type="checkbox" checked={step.completed} onChange={(event) => store.executeProjectCommand('TOGGLE_STEP', 'Toggle step', () => updateStep(index, { completed: event.target.checked }))} aria-label={`Mark step ${index + 1} complete`} /></label>
                      <div><label className="text-[9px] font-medium text-slate-500" htmlFor={`step-instruction-${index}`}>Instruction {index + 1}</label><input id={`step-instruction-${index}`} value={step.instruction} onChange={(event) => updateStep(index, { instruction: event.target.value })} placeholder="What should the operator do?" className={`${inputClass} mt-1`} /></div>
                      <div><label className="text-[9px] font-medium text-slate-500" htmlFor={`step-expected-${index}`}>Expected result</label><input id={`step-expected-${index}`} value={step.expectedResult} onChange={(event) => updateStep(index, { expectedResult: event.target.value })} placeholder="What evidence indicates success?" className={`${inputClass} mt-1`} /></div>
                      <button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { steps: selectedTest.steps.filter((_, itemIndex) => itemIndex !== index) })} className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50" aria-label={`Delete step ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  {selectedTest.steps.length === 0 && <p className="py-5 text-center text-[10px] text-slate-400">No procedure steps recorded.</p>}
                </div>
              </section>

              <section className="border-b border-slate-200 py-5" aria-labelledby="validation-measurements-title">
                <div className="flex items-center justify-between gap-3"><div><h2 id="validation-measurements-title" className="text-sm font-semibold text-slate-900">Measurements</h2><p className="mt-0.5 text-[10px] text-slate-500">Define expected values and tolerances; actual readings remain evidence inputs.</p></div><button type="button" onClick={handleAddMeasurement} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-3 w-3" /> Measurement</button></div>
                <div className="mt-3 space-y-2">
                  {selectedTest.measurements.map((measurement, index) => {
                    const evaluation = evaluateValidationMeasurement(measurement);
                    return (
                      <div key={measurement.id} className="rounded-md border border-slate-300 bg-[#fbfaf6] p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input value={measurement.name} onChange={(event) => updateMeasurement(index, { name: event.target.value })} placeholder="Measurement name" className="h-8 min-w-[180px] flex-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-slate-500" />
                          <select value={measurement.type} onChange={(event) => updateMeasurement(index, { type: event.target.value as ValidationMeasurement['type'] })} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-slate-500">{['Numeric', 'Boolean', 'Text', 'Visual Inspection'].map((type) => <option key={type} value={type}>{type}</option>)}</select>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold ${statusTone(evaluation)}`}><StatusIcon status={evaluation} />{evaluation}</span>
                          <label className="inline-flex items-center gap-1 text-[9px] text-slate-600"><input type="checkbox" checked={measurement.required} onChange={(event) => updateMeasurement(index, { required: event.target.checked })} /> Required</label>
                          <button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { measurements: selectedTest.measurements.filter((item) => item.id !== measurement.id) })} className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50" aria-label={`Delete ${measurement.name || 'measurement'}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {measurement.type === 'Numeric' && <><label className="text-[9px] font-medium text-slate-500">Expected<input type="number" value={typeof measurement.expectedValue === 'number' ? measurement.expectedValue : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label><label className="text-[9px] font-medium text-slate-500">Tolerance +<input type="number" value={measurement.tolerancePlus ?? ''} onChange={(event) => updateMeasurement(index, { tolerancePlus: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label><label className="text-[9px] font-medium text-slate-500">Tolerance -<input type="number" value={measurement.toleranceMinus ?? ''} onChange={(event) => updateMeasurement(index, { toleranceMinus: event.target.value ? Number.parseFloat(event.target.value) : undefined })} className={`${inputClass} mt-1`} /></label></>}
                          {measurement.type === 'Boolean' && <label className="text-[9px] font-medium text-slate-500">Expected<select value={typeof measurement.expectedValue === 'boolean' ? String(measurement.expectedValue) : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value === '' ? undefined : event.target.value === 'true' })} className={`${inputClass} mt-1`}><option value="">—</option><option value="true">True</option><option value="false">False</option></select></label>}
                          {measurement.type === 'Text' && <label className="text-[9px] font-medium text-slate-500 sm:col-span-2">Expected<input value={typeof measurement.expectedValue === 'string' ? measurement.expectedValue : ''} onChange={(event) => updateMeasurement(index, { expectedValue: event.target.value })} className={`${inputClass} mt-1`} /></label>}
                          <label className="text-[9px] font-medium text-slate-500">Actual{measurement.type === 'Boolean' ? <select value={typeof measurement.actualValue === 'boolean' ? String(measurement.actualValue) : ''} onChange={(event) => updateMeasurement(index, { actualValue: event.target.value === '' ? undefined : event.target.value === 'true' })} className={`${inputClass} mt-1`}><option value="">—</option><option value="true">True</option><option value="false">False</option></select> : <input value={measurement.actualValue != null ? String(measurement.actualValue) : ''} onChange={(event) => updateMeasurement(index, { actualValue: measurement.type === 'Numeric' ? (event.target.value ? Number.parseFloat(event.target.value) : undefined) : event.target.value })} className={`${inputClass} mt-1`} />}</label>
                        </div>
                      </div>
                    );
                  })}
                  {selectedTest.measurements.length === 0 && <p className="rounded-md border border-dashed border-slate-300 py-5 text-center text-[10px] text-slate-400">No measurements defined.</p>}
                </div>
              </section>

              <section className="border-b border-slate-200 py-5" aria-labelledby="validation-evidence-title">
                <div className="flex items-center justify-between gap-3"><div><h2 id="validation-evidence-title" className="text-sm font-semibold text-slate-900">Evidence references</h2><p className="mt-0.5 text-[10px] text-slate-500">Attach descriptions or references; run history remains a separate immutable record.</p></div><button type="button" onClick={handleAddEvidence} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-3 w-3" /> Evidence</button></div>
                <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
                  {selectedTest.evidence.map((evidence, index) => <div key={evidence.id} className="flex flex-wrap items-center gap-2 px-2 py-2"><select value={evidence.type} onChange={(event) => updateEvidence(index, { type: event.target.value as ValidationEvidence['type'] })} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-slate-500">{['Text', 'URL', 'Measurement', 'Photo Reference', 'File Reference'].map((type) => <option key={type} value={type}>{type}</option>)}</select><input value={evidence.value} onChange={(event) => updateEvidence(index, { value: event.target.value })} placeholder="Value / description / reference" className="h-8 min-w-[220px] flex-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-slate-500" /><button type="button" onClick={() => store.updateValidationTest(selectedTest.id, { evidence: selectedTest.evidence.filter((item) => item.id !== evidence.id) })} className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50" aria-label="Delete evidence"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
                  {selectedTest.evidence.length === 0 && <p className="py-5 text-center text-[10px] text-slate-400">No evidence references attached.</p>}
                </div>
              </section>

              <section className="py-5" aria-labelledby="validation-pass-title"><h2 id="validation-pass-title" className="text-sm font-semibold text-slate-900">Pass criteria</h2><p className="mt-0.5 text-[10px] text-slate-500">One explicit criterion per line.</p><textarea value={selectedTest.passCriteria.join('\n')} onChange={(event) => store.updateValidationTest(selectedTest.id, { passCriteria: event.target.value.split('\n').map((criterion) => criterion.trim()).filter(Boolean) })} placeholder="Acceptance criterion" className={`${textAreaClass} mt-3 min-h-28`} /></section>
            </div>
          </main>
        ) : (
          <div className="grid h-full place-items-center bg-white p-8 text-center"><div className="max-w-sm"><ListChecks className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-800">No {mode === 'factory-qa' ? 'Factory QA ' : ''}test selected</p><p className="mt-1 text-xs leading-5 text-slate-500">Create a test or open the Tests dock. Defining a test does not count as execution evidence.</p><button type="button" onClick={handleAddTest} className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Create test</button></div></div>
        )}

        {testListOpen && (
          <aside className="absolute bottom-3 left-3 top-3 z-30 flex w-[260px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="Validation test list">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5"><p className="text-[10px] font-semibold text-slate-700">{mode === 'factory-qa' ? 'Factory QA tests' : 'Validation tests'}</p><p className="mt-0.5 text-[9px] text-slate-400">Selecting a test edits it here; it does not navigate away.</p></div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5">
              {visibleTests.map((test) => {
                const testStatus = calculateTestStatus(test);
                const selected = selectedTest?.id === test.id;
                return <button key={test.id} type="button" onClick={() => setSelectedTestId(test.id)} aria-pressed={selected} className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-2 text-left ${selected ? 'border-slate-950 bg-slate-100' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}><StatusIcon status={testStatus} /><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-slate-800">{test.name}</span><span className="mt-0.5 block truncate text-[9px] text-slate-400">{test.stage} · {test.category}</span></span><span className={`text-[8px] font-semibold ${statusTone(testStatus)}`}>{testStatus}</span></button>;
              })}
              {visibleTests.length === 0 && <p className="px-3 py-8 text-center text-[10px] leading-4 text-slate-400">No tests in this workspace yet.</p>}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};