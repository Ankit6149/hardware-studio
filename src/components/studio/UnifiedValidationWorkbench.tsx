'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  FileCheck2,
  History,
  PanelRight,
  Play,
  Plus,
  TestTube2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import {
  useValidationWorkspaceUiStore,
  type ValidationWorkspaceView,
} from '../../store/validationWorkspaceUiStore';
import type { ValidationRun, ValidationTest } from '../../types';
import {
  getValidationExecutionMode,
  getValidationRunHistory,
  runValidationTest,
} from '../../lib/validationRunner';
import { ValidationStudio } from '../validation/ValidationStudio';
import { useFeedback } from '../feedback/FeedbackProvider';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringBottomDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';

interface UnifiedValidationWorkbenchProps {
  initialMode: 'tests' | 'coverage' | 'factory-qa';
}

interface ValidationRunStepSnapshot {
  stepNumber?: number;
  instruction: string;
  expectedResult: string;
  completed?: boolean;
}

const EMPTY_RUNS: ValidationRun[] = [];

function isValidationRunStepSnapshot(value: unknown): value is ValidationRunStepSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.instruction === 'string' && typeof candidate.expectedResult === 'string';
}

function getValidationRunStepSnapshots(run: ValidationRun): ValidationRunStepSnapshot[] {
  return (run.stepResults || []).filter(isValidationRunStepSnapshot);
}

function runStatusToTestStatus(status: string): string {
  if (status === 'Pass' || status === 'Passed') return 'Passed';
  if (status === 'Fail' || status === 'Failed') return 'Failed';
  return 'In Progress';
}

function statusTone(status: string): string {
  if (status === 'Pass' || status === 'Passed') return 'text-emerald-700';
  if (status === 'Fail' || status === 'Failed') return 'text-rose-700';
  return 'text-amber-700';
}

function executionAuthority(test: ValidationTest | null): string {
  if (!test) return 'Select a test explicitly before execution.';
  const mode = getValidationExecutionMode(test.category, test.name || test.testName);
  if (mode === 'drc-auto') return 'Local DRC rules may produce an automated verdict for this run.';
  if (mode === 'firmware-state-auto') return 'Local state-machine structural validation may produce an automated verdict; compilation/runtime are not verified.';
  if (mode === 'mechanical-screen') return 'Local Mechanical execution is an approximate AABB collision screen; a clean screen cannot auto-pass exact clearance.';
  if ((test.category || '').trim().toLowerCase() === 'thermal') return 'No internal thermal solver exists; a verdict requires external evidence and reviewer identity.';
  return 'This is a manual/physical validation path; an explicit engineer verdict is required.';
}

const EmptySelection: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="grid h-full min-h-0 place-items-center bg-white p-8 text-center">
    <div className="max-w-sm">
      <TestTube2 className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
      <h2 className="mt-3 text-sm font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  </div>
);

const ValidationExecuteSurface: React.FC<{
  test: ValidationTest | null;
  onRunRecorded: (run: ValidationRun) => void;
}> = ({ test, onRunRecorded }) => {
  const feedback = useFeedback();
  const validationRuns = useProjectStore((state) => state.validationRuns ?? EMPTY_RUNS);
  const updateProjectState = useProjectStore((state) => state.updateProjectState);
  const updateValidationTest = useProjectStore((state) => state.updateValidationTest);
  const [measurement, setMeasurement] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [operator, setOperator] = useState('');
  const [manualVerdict, setManualVerdict] = useState<'' | 'Pass' | 'Fail' | 'Inconclusive'>('');

  if (!test) {
    return <EmptySelection title="Select a test to execute" detail="Execution never falls back to the first or linked test. Choose the exact definition in the Validation Project Drawer." />;
  }

  const project = useProjectStore.getState();
  const runHistory = getValidationRunHistory({ ...project, validationRuns }, test.id);
  const executionMode = getValidationExecutionMode(test.category, test.name || test.testName);
  const automatedRun = executionMode === 'drc-auto' || executionMode === 'firmware-state-auto';
  const mechanicalScreenRun = executionMode === 'mechanical-screen';
  const thermalReview = (test.category || '').trim().toLowerCase() === 'thermal';
  const evidenceBackedReview = mechanicalScreenRun || thermalReview;

  const recordRun = () => {
    if (!automatedRun && !mechanicalScreenRun && !manualVerdict) {
      feedback.notify({ tone: 'warning', title: 'Engineer verdict required', detail: 'Choose Pass, Fail, or Inconclusive after reviewing the procedure and evidence.' });
      return;
    }
    if (evidenceBackedReview && manualVerdict && (!evidenceLink.trim() || !operator.trim())) {
      feedback.notify({
        tone: 'warning',
        title: 'Evidence and reviewer required',
        detail: mechanicalScreenRun
          ? 'A Mechanical verdict requires an exact CAD/physical evidence reference plus reviewer identity; the approximate local screen alone cannot verify clearance.'
          : 'A Thermal verdict requires external simulation/lab evidence plus reviewer identity because Hardware Studio does not run a thermal solver.',
      });
      return;
    }

    const current = useProjectStore.getState();
    const { run, updatedRuns } = runValidationTest(current, test.id, {
      measuredValue: measurement.trim() || undefined,
      evidenceLink: evidenceLink.trim() || undefined,
      runBy: operator.trim() || undefined,
      manualVerdict: automatedRun ? undefined : manualVerdict || undefined,
    });
    updateProjectState({ validationRuns: updatedRuns });
    updateValidationTest(test.id, { status: runStatusToTestStatus(run.status) });
    onRunRecorded(run);
    setMeasurement('');
    setEvidenceLink('');
    setManualVerdict('');
    feedback.notify({
      tone: run.status === 'Fail' || run.status === 'Failed' ? 'error' : run.status === 'Pass' || run.status === 'Passed' ? 'success' : 'warning',
      title: `${run.testName || test.name} · run #${run.runNumber || 1}`,
      detail: runHistory.length > 0 ? `${run.status}. Retest appended; prior run history remains present.` : `${run.status}. First run record captured.`,
    });
  };

  const actionLabel = executionMode === 'drc-auto'
    ? 'Run local DRC validation'
    : executionMode === 'firmware-state-auto'
      ? 'Run structural state check'
      : mechanicalScreenRun && !manualVerdict
        ? 'Run approximate screen'
        : runHistory.length > 0
          ? 'Record retest'
          : 'Record run';

  return (
    <main className="h-full min-h-0 overflow-y-auto bg-white" aria-label={`Execute ${test.name}`}>
      <div className="mx-auto max-w-5xl p-5">
        <div className="border-b border-slate-300 pb-4">
          <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Execute · explicit test</div>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{test.name}</h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">{executionAuthority(test)}</p>
        </div>

        <section className="border-b border-slate-200 py-5">
          <h3 className="text-xs font-semibold text-slate-900">Procedure snapshot</h3>
          <p className="mt-1 text-[10px] text-slate-500">The current runner snapshots this procedure into the run. Per-step execution state/recovery remains #19.</p>
          <ol className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
            {test.steps.map((step, index) => <li key={`${step.stepNumber}-${index}`} className="grid gap-2 px-2 py-2.5 text-[10px] sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)]"><span className="font-mono text-slate-400">{index + 1}</span><span className="text-slate-800">{step.instruction || 'Instruction unresolved'}</span><span className="text-slate-500">{step.expectedResult || 'Expected result unresolved'}</span></li>)}
            {test.steps.length === 0 && <li className="py-5 text-center text-[10px] text-amber-700">No procedure steps are defined.</li>}
          </ol>
        </section>

        <section className="border-b border-slate-200 py-5">
          <h3 className="text-xs font-semibold text-slate-900">Measurement definitions</h3>
          <p className="mt-1 text-[10px] text-slate-500">Expected/tolerance schema is read-only during this run. The current local runner records one observation summary; typed per-measurement execution belongs to #19.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {test.measurements.map((item) => <div key={item.id} className="border border-slate-200 bg-[#fbfaf6] p-2.5 text-[9px]"><div className="font-semibold text-slate-800">{item.name || 'Unnamed measurement'} <span className="font-normal text-slate-400">· {item.type}</span></div><div className="mt-1 font-mono text-slate-500">expected {item.expectedValue == null ? 'unresolved' : String(item.expectedValue)}{item.unit ? ` ${item.unit}` : ''}{item.tolerancePlus != null || item.toleranceMinus != null ? ` · +${item.tolerancePlus ?? '?'} / -${item.toleranceMinus ?? '?'}` : ''}</div></div>)}
            {test.measurements.length === 0 && <p className="text-[10px] text-slate-400">No measurement schema defined.</p>}
          </div>
        </section>

        <section className="py-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600">Observed measurement / behavior<textarea value={measurement} onChange={(event) => setMeasurement(event.target.value)} placeholder="Record what was actually measured or observed" className="mt-1 min-h-28 w-full resize-y border border-slate-300 p-2.5 text-xs font-normal leading-5 outline-none focus:border-slate-500" /></label>
              {!automatedRun && <label className="mt-3 block text-[10px] font-semibold text-slate-600">Engineer verdict{mechanicalScreenRun ? ' · optional for screen-only run' : ''}<select value={manualVerdict} onChange={(event) => setManualVerdict(event.target.value as typeof manualVerdict)} className="mt-1 h-9 w-full border border-slate-300 bg-white px-2.5 text-xs font-normal"><option value="">Choose verdict…</option><option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Inconclusive">Inconclusive</option></select></label>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600">Evidence reference{evidenceBackedReview && manualVerdict ? ' · required' : ''}<input value={evidenceLink} onChange={(event) => setEvidenceLink(event.target.value)} placeholder="File, URL, log, image, CAD review or lab reference" className="mt-1 h-9 w-full border border-slate-300 bg-white px-2.5 text-xs font-normal" /></label>
              <label className="mt-3 block text-[10px] font-semibold text-slate-600">Operator / reviewer{evidenceBackedReview && manualVerdict ? ' · required' : ''}<input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="Name or role" className="mt-1 h-9 w-full border border-slate-300 bg-white px-2.5 text-xs font-normal" /></label>
              <div className="mt-3 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-[9px] leading-4 text-amber-900">Run evidence is stored in the current project record. Durable hashed evidence, exact version/DUT/equipment binding and reviewed immutability remain #19.</div>
            </div>
          </div>
          <button type="button" onClick={recordRun} className="mt-4 inline-flex h-9 items-center gap-2 bg-slate-950 px-3 text-xs font-semibold text-white"><Play className="h-4 w-4" /> {actionLabel}</button>
        </section>
      </div>
    </main>
  );
};

const ValidationReviewSurface: React.FC<{
  test: ValidationTest | null;
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
}> = ({ test, selectedRunId, onSelectRun }) => {
  const project = useProjectStore();
  if (!test) return <EmptySelection title="Select a test to review" detail="Review never chooses the newest or first test implicitly. Select the exact test or a run from the Project Drawer." />;

  const history = getValidationRunHistory(project, test.id);
  const selectedRun = selectedRunId ? history.find((run) => run.id === selectedRunId) ?? null : null;
  const stepSnapshots = selectedRun ? getValidationRunStepSnapshots(selectedRun) : [];
  const unresolvedStepSnapshots = selectedRun ? (selectedRun.stepResults || []).length - stepSnapshots.length : 0;

  return (
    <main className="flex h-full min-h-0 overflow-hidden bg-white" aria-label={`Review ${test.name}`}>
      <section className="w-[min(340px,42%)] shrink-0 overflow-y-auto border-r border-slate-200 bg-[#fbfaf6]">
        <div className="border-b border-slate-200 p-3"><div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Review · append-only history</div><h2 className="mt-1 text-[12px] font-semibold text-slate-900">{test.name}</h2><p className="mt-1 text-[9px] leading-4 text-slate-500">Select a run explicitly. Historical snapshots are displayed read-only.</p></div>
        <div className="p-1.5">
          {history.map((run) => {
            const active = selectedRunId === run.id;
            return <button key={run.id} type="button" onClick={() => onSelectRun(run.id)} aria-pressed={active} className={`mb-1 w-full border px-2.5 py-2 text-left ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:border-slate-400'}`}><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${run.status === 'Pass' || run.status === 'Passed' ? 'bg-emerald-500' : run.status === 'Fail' || run.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-500'}`} /><span className="text-[10px] font-semibold">Run #{run.runNumber || 1}</span><span className={`ml-auto text-[9px] font-semibold ${active ? 'text-white/70' : statusTone(run.status)}`}>{run.status}</span></div><div className={`mt-1 truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{run.timestamp || 'time unresolved'} · {run.runBy || 'actor unresolved'}</div></button>;
          })}
          {history.length === 0 && <p className="p-3 text-[10px] leading-4 text-slate-400">No runs exist for this test. Define the test, then execute it explicitly.</p>}
        </div>
      </section>

      <section className="min-w-0 flex-1 overflow-y-auto p-5">
        {selectedRun ? (
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-300 pb-4"><div><div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Frozen run snapshot</div><h3 className="mt-1 text-lg font-semibold text-slate-950">Run #{selectedRun.runNumber || 1}</h3><p className="mt-1 text-[10px] text-slate-500">{selectedRun.timestamp || 'Timestamp unresolved'} · {selectedRun.runBy || 'Actor unresolved'}</p></div><span className={`text-sm font-semibold ${statusTone(selectedRun.status)}`}>{selectedRun.status}</span></div>
            <dl className="grid gap-3 border-b border-slate-200 py-4 sm:grid-cols-2"><div><dt className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Observed value</dt><dd className="mt-1 text-xs text-slate-800">{selectedRun.measuredValue == null ? 'Not recorded' : String(selectedRun.measuredValue)}</dd></div><div><dt className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Environment</dt><dd className="mt-1 text-xs text-slate-800">{selectedRun.environment || 'Not recorded'}</dd></div><div><dt className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Pass criteria snapshot</dt><dd className="mt-1 text-xs leading-5 text-slate-800">{selectedRun.passCriteria || 'Not recorded'}</dd></div><div><dt className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Evidence reference</dt><dd className="mt-1 break-all text-xs text-slate-800">{selectedRun.evidenceLink || 'Not recorded'}</dd></div></dl>
            <section className="py-4"><h4 className="text-xs font-semibold text-slate-900">Captured procedure snapshot</h4><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{stepSnapshots.map((step, index) => <div key={`${step.stepNumber ?? index + 1}-${index}`} className="grid gap-2 px-2 py-2 text-[10px] sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)]"><span className="font-mono text-slate-400">{index + 1}</span><span>{step.instruction}</span><span className="text-slate-500">{step.expectedResult}</span></div>)}{stepSnapshots.length === 0 && <p className="py-4 text-center text-[10px] text-slate-400">No readable procedure snapshot recorded.</p>}{unresolvedStepSnapshots > 0 && <p className="border-t border-amber-200 bg-amber-50 px-2 py-2 text-[9px] leading-4 text-amber-900">{unresolvedStepSnapshots} legacy step snapshot{unresolvedStepSnapshots === 1 ? '' : 's'} could not be interpreted as the current procedure shape and remain unresolved.</p>}</div></section>
            <section className="border-t border-slate-200 py-4"><h4 className="text-xs font-semibold text-slate-900">Evidence snapshot</h4><div className="mt-2 space-y-1">{(selectedRun.evidence || []).map((item, index) => <div key={`${typeof item === 'object' && item && 'id' in item ? String((item as { id?: unknown }).id) : 'evidence'}-${index}`} className="border border-slate-200 px-2.5 py-2 text-[10px] text-slate-600">{typeof item === 'object' && item ? String('value' in item ? (item as { value?: unknown }).value ?? JSON.stringify(item) : JSON.stringify(item)) : String(item)}</div>)}{(selectedRun.evidence || []).length === 0 && <p className="text-[10px] text-slate-400">No frozen evidence items recorded.</p>}</div></section>
          </div>
        ) : <EmptySelection title="Select a run" detail="Run history is visible at left, but Review does not silently select the latest run. Choose the exact snapshot you want to inspect." />}
      </section>
    </main>
  );
};

export const UnifiedValidationWorkbench: React.FC<UnifiedValidationWorkbenchProps> = ({ initialMode }) => {
  const tests = useProjectStore((state) => state.validationTests ?? []);
  const runs = useProjectStore((state) => state.validationRuns ?? EMPTY_RUNS);
  const boardComponents = useProjectStore((state) => state.boardComponents ?? []);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const addValidationTest = useProjectStore((state) => state.addValidationTest);
  const executeProjectCommand = useProjectStore((state) => state.executeProjectCommand);
  const activeComponentId = useStudioContextStore((state) => state.activeComponentId);

  const view = useValidationWorkspaceUiStore((state) => state.view);
  const selectedTestId = useValidationWorkspaceUiStore((state) => state.selectedTestId);
  const selectedRunId = useValidationWorkspaceUiStore((state) => state.selectedRunId);
  const inspectorOpen = useValidationWorkspaceUiStore((state) => state.inspectorOpen);
  const bottomDockOpen = useValidationWorkspaceUiStore((state) => state.bottomDockOpen);
  const setView = useValidationWorkspaceUiStore((state) => state.setView);
  const setDrawerSection = useValidationWorkspaceUiStore((state) => state.setDrawerSection);
  const setSelectedTestId = useValidationWorkspaceUiStore((state) => state.setSelectedTestId);
  const setSelectedRunId = useValidationWorkspaceUiStore((state) => state.setSelectedRunId);
  const setInspectorOpen = useValidationWorkspaceUiStore((state) => state.setInspectorOpen);
  const setBottomDockOpen = useValidationWorkspaceUiStore((state) => state.setBottomDockOpen);

  const selectedTest = selectedTestId ? tests.find((test) => test.id === selectedTestId) ?? null : null;
  const selectedRun = selectedRunId ? runs.find((run) => run.id === selectedRunId) ?? null : null;
  const selectedComponent = activeComponentId ? boardComponents.find((component) => component.id === activeComponentId) ?? null : null;

  const effectiveView: ValidationWorkspaceView = initialMode === 'coverage'
    ? 'coverage'
    : initialMode === 'factory-qa'
      ? 'factory-qa'
      : view === 'coverage' || view === 'factory-qa'
        ? 'define'
        : view;

  const switchJob = (nextView: 'define' | 'execute' | 'review') => {
    setView(nextView);
    setActiveView('validation-studio');
    setDrawerSection(nextView === 'review' ? 'runs' : 'tests');
  };

  const createLinkedTest = () => {
    if (!selectedComponent) return;
    const beforeIds = new Set((useProjectStore.getState().validationTests ?? []).map((test) => test.id));
    const selectedNetIds = Array.from(new Set((selectedComponent.pins || []).map((pin) => pin.netId).filter((netId): netId is string => Boolean(netId))));
    executeProjectCommand('ADD_COMPONENT_TEST', `Create validation test for ${selectedComponent.referenceDesignator}`, () => {
      addValidationTest({
        name: `${selectedComponent.referenceDesignator} ${selectedComponent.componentName} validation`,
        stage: 'EVT',
        category: 'Electrical',
        linkedRequirementIds: [],
        linkedArchitectureNodeIds: selectedComponent.architectureNodeId ? [selectedComponent.architectureNodeId] : [],
        linkedComponentIds: [selectedComponent.id],
        linkedNetIds: selectedNetIds,
        linkedFirmwareModuleIds: [],
        steps: [{ stepNumber: 1, instruction: `Inspect ${selectedComponent.referenceDesignator}, its footprint, orientation and connected nets before applying power.`, expectedResult: 'Physical/electrical implementation matches reviewed intent.', completed: false }],
        measurements: [],
        passCriteria: [`${selectedComponent.referenceDesignator} is correctly placed and electrically connected for the intended validation.`],
        status: 'Not Started',
        evidence: [],
      });
    });
    const created = (useProjectStore.getState().validationTests ?? []).find((test) => !beforeIds.has(test.id));
    if (created) {
      setSelectedTestId(created.id);
      switchJob('define');
      setInspectorOpen(true);
    }
  };

  const onRunRecorded = (run: ValidationRun) => {
    setSelectedRunId(run.id);
    setBottomDockOpen(true);
  };

  const onSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    setBottomDockOpen(true);
  };

  const title = effectiveView === 'coverage' ? 'Coverage' : effectiveView === 'factory-qa' ? 'Factory QA' : effectiveView === 'define' ? 'Define' : effectiveView === 'execute' ? 'Execute' : 'Review';
  const history = selectedTest ? getValidationRunHistory({ ...useProjectStore.getState(), validationRuns: runs }, selectedTest.id) : EMPTY_RUNS;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#ebe8df]" aria-label="Validation workbench">
      <EngineeringEditorBar
        domain="Validation"
        title={title}
        meta={selectedTest ? `${selectedTest.name} · ${history.length} run${history.length === 1 ? '' : 's'}` : `${tests.length} test definitions · explicit selection required`}
        tools={<><EditorToolButton label="Define" active={effectiveView === 'define'} onClick={() => switchJob('define')}><ClipboardList className="h-4 w-4" /></EditorToolButton><EditorToolButton label="Execute" active={effectiveView === 'execute'} onClick={() => switchJob('execute')}><Play className="h-4 w-4" /></EditorToolButton><EditorToolButton label="Review" active={effectiveView === 'review'} onClick={() => switchJob('review')}><History className="h-4 w-4" /></EditorToolButton></>}
        docks={<><EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} count={selectedTest || selectedRun ? 1 : 0} onClick={() => setInspectorOpen(!inspectorOpen)} />{selectedRun && <EditorDockButton label="Run output" icon={FileCheck2} active={bottomDockOpen} count={selectedRun.logs.length} onClick={() => setBottomDockOpen(!bottomDockOpen)} />}</>}
        actions={selectedComponent ? <button type="button" onClick={createLinkedTest} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[9px] font-semibold text-slate-700 hover:border-slate-500"><Plus className="h-3.5 w-3.5" /> Test {selectedComponent.referenceDesignator}</button> : undefined}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {effectiveView === 'coverage' ? <ValidationStudio initialMode="coverage" /> : effectiveView === 'factory-qa' ? <ValidationStudio initialMode="factory-qa" /> : effectiveView === 'define' ? <ValidationStudio initialMode="tests" /> : effectiveView === 'execute' ? <ValidationExecuteSurface key={selectedTest?.id ?? 'no-test'} test={selectedTest} onRunRecorded={onRunRecorded} /> : <ValidationReviewSurface test={selectedTest} selectedRunId={selectedRunId} onSelectRun={onSelectRun} />}

        <EngineeringInspector open={inspectorOpen} onClose={() => setInspectorOpen(false)} subtitle={selectedRun ? 'Selected immutable run snapshot' : selectedTest ? 'Selected test definition' : 'No validation selection'}>
          {selectedRun ? (
            <div className="space-y-3 p-3 text-[10px]"><div><div className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Run</div><div className="mt-1 font-semibold text-slate-900">#{selectedRun.runNumber || 1} · {selectedRun.status}</div></div><dl className="space-y-2 text-slate-600"><div><dt className="text-[8px] uppercase text-slate-400">Test</dt><dd>{selectedRun.testName || selectedRun.testId}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Timestamp</dt><dd>{selectedRun.timestamp || 'Unresolved'}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Actor</dt><dd>{selectedRun.runBy || 'Unresolved'}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Evidence</dt><dd className="break-all">{selectedRun.evidenceLink || 'No external reference'}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Environment</dt><dd>{selectedRun.environment || 'Unresolved'}</dd></div></dl><div className="border-l-2 border-amber-400 pl-2 text-[9px] leading-4 text-slate-500">Displayed read-only. #19 remains responsible for reviewed immutable evidence/provenance policy.</div></div>
          ) : selectedTest ? (
            <div className="space-y-3 p-3 text-[10px]"><div><div className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Definition</div><div className="mt-1 font-semibold text-slate-900">{selectedTest.name}</div><div className="mt-0.5 text-slate-500">{selectedTest.stage || 'stage unresolved'} · {selectedTest.category || 'category unresolved'}</div></div><dl className="grid grid-cols-2 gap-2 text-slate-600"><div><dt className="text-[8px] uppercase text-slate-400">Requirements</dt><dd className="font-mono">{selectedTest.linkedRequirementIds.length}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Components</dt><dd className="font-mono">{selectedTest.linkedComponentIds?.length || 0}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Procedure</dt><dd className="font-mono">{selectedTest.steps.length}</dd></div><div><dt className="text-[8px] uppercase text-slate-400">Runs</dt><dd className="font-mono">{history.length}</dd></div></dl><div className="border-t border-slate-200 pt-2 text-[9px] leading-4 text-slate-500">{executionAuthority(selectedTest)}</div></div>
          ) : <div className="p-3 text-[10px] leading-5 text-slate-500">Select a test or run explicitly in the Validation Project Drawer. Opening the workbench does not choose one for you.</div>}
        </EngineeringInspector>

        <EngineeringBottomDock open={bottomDockOpen && Boolean(selectedRun)} title="Validation run output" subtitle={selectedRun ? `${selectedRun.testName || selectedRun.testId} · run #${selectedRun.runNumber || 1} · ${selectedRun.status}` : undefined} onClose={() => setBottomDockOpen(false)} heightClassName="h-[220px]">
          {selectedRun && <div className="h-full overflow-auto bg-[#1b1a18] p-3 font-mono text-[9px] leading-5 text-[#d7d2c8]">{selectedRun.logs.map((line, index) => <div key={`${index}-${line}`}><span className="mr-2 text-[#777168]">{String(index + 1).padStart(2, '0')}</span>{line}</div>)}</div>}
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={<span>{title} · {selectedTest ? selectedTest.name : 'no test selected'}</span>}
        center={<span>{effectiveView === 'execute' ? executionAuthority(selectedTest) : effectiveView === 'review' ? 'Run history is read-only; selection is explicit.' : effectiveView === 'define' ? 'Definition schema only; execution evidence is separate.' : 'Traceability context; passing evidence still required.'}</span>}
        right={<span>{tests.length} tests · {runs.length} runs</span>}
      />
    </section>
  );
};
