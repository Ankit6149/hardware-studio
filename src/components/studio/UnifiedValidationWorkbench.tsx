'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  History,
  Link2,
  Play,
  Plus,
  RotateCcw,
  TestTube2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { getValidationRunHistory, runValidationTest } from '../../lib/validationRunner';
import { useFeedback } from '../feedback/FeedbackProvider';
import { ValidationStudio } from '../validation/ValidationStudio';

interface UnifiedValidationWorkbenchProps {
  initialMode: 'tests' | 'coverage' | 'factory-qa';
}

function runStatusToTestStatus(status: string): string {
  if (status === 'Pass' || status === 'Passed') return 'Passed';
  if (status === 'Fail' || status === 'Failed') return 'Failed';
  return 'In Progress';
}

function isAutomatedValidation(category?: string, name?: string): boolean {
  const normalized = (category || '').toLowerCase();
  const testName = (name || '').toLowerCase();
  return ['drc', 'mechanical', 'thermal', 'firmware'].includes(normalized)
    || testName.includes('drc')
    || testName.includes('clearance')
    || testName.includes('state');
}

export const UnifiedValidationWorkbench: React.FC<UnifiedValidationWorkbenchProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const {
    boardComponents = [],
    validationTests = [],
    validationRuns = [],
    addValidationTest,
    executeProjectCommand,
    setActiveView,
    updateProjectState,
    updateValidationTest,
  } = store;
  const {
    activeBoardId,
    activeComponentId,
    activeNetName,
    setActiveComponent,
    beginHandoff,
  } = useStudioContextStore();
  const [selectedRunTestId, setSelectedRunTestId] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [operator, setOperator] = useState('');
  const [manualVerdict, setManualVerdict] = useState<'' | 'Pass' | 'Fail' | 'Inconclusive'>('');

  const contextualComponents = useMemo(
    () => boardComponents.filter((component) => !activeBoardId || component.boardId === activeBoardId),
    [activeBoardId, boardComponents],
  );
  const selectedComponent = boardComponents.find((component) => component.id === activeComponentId)
    || contextualComponents[0];
  const selectedNetIds = Array.from(new Set(
    (selectedComponent?.pins || [])
      .map((pin) => pin.netId)
      .filter((netId): netId is string => Boolean(netId)),
  ));
  const linkedTests = selectedComponent
    ? validationTests.filter((test) => (test.linkedComponentIds || []).includes(selectedComponent.id))
    : [];
  const runTest = validationTests.find((test) => test.id === selectedRunTestId)
    || linkedTests[0]
    || validationTests[0];
  const runHistory = runTest ? getValidationRunHistory({ ...store, validationRuns }, runTest.id) : [];
  const latestRun = runHistory[0];
  const automatedRun = isAutomatedValidation(runTest?.category, runTest?.name || runTest?.testName);

  const createLinkedTest = () => {
    if (!selectedComponent) return;
    executeProjectCommand('ADD_COMPONENT_TEST', `Create validation test for ${selectedComponent.referenceDesignator}`, () =>
      addValidationTest({
        name: `${selectedComponent.referenceDesignator} ${selectedComponent.componentName} validation`,
        stage: 'EVT',
        category: 'Electrical',
        linkedRequirementIds: [],
        linkedArchitectureNodeIds: selectedComponent.architectureNodeId ? [selectedComponent.architectureNodeId] : [],
        linkedComponentIds: [selectedComponent.id],
        linkedNetIds: selectedNetIds,
        linkedFirmwareModuleIds: [],
        steps: [
          {
            stepNumber: 1,
            instruction: `Inspect ${selectedComponent.referenceDesignator}, its footprint, orientation, and connected nets before applying power.`,
            expectedResult: 'The physical and electrical implementation matches the reviewed component definition and schematic intent.',
            completed: false,
          },
        ],
        measurements: [],
        passCriteria: [
          `${selectedComponent.referenceDesignator} is correctly placed and electrically connected for the intended test.`,
        ],
        status: 'Not Started',
        evidence: [],
      })
    );
  };

  const recordRun = () => {
    if (!runTest) {
      feedback.notify({ tone: 'warning', title: 'No validation test selected', detail: 'Create or select a validation test before recording evidence.' });
      return;
    }
    if (!automatedRun && !manualVerdict) {
      feedback.notify({
        tone: 'warning',
        title: 'Manual verdict required',
        detail: 'Physical/manual validation cannot auto-pass from a measurement alone. Choose Pass, Fail, or Inconclusive after reviewing the procedure and evidence.',
      });
      return;
    }

    const { run, updatedRuns } = runValidationTest(store, runTest.id, {
      measuredValue: measurement.trim() || undefined,
      evidenceLink: evidenceLink.trim() || undefined,
      runBy: operator.trim() || undefined,
      manualVerdict: automatedRun ? undefined : manualVerdict || undefined,
    });
    updateProjectState({ validationRuns: updatedRuns });
    updateValidationTest(runTest.id, { status: runStatusToTestStatus(run.status) });
    feedback.notify({
      tone: run.status === 'Fail' || run.status === 'Failed' ? 'error' : run.status === 'Pass' || run.status === 'Passed' ? 'success' : 'warning',
      title: `${run.testName || runTest.name} · run #${run.runNumber || 1}`,
      detail: runHistory.length > 0
        ? `${run.status}. Retest recorded without replacing the previous run.`
        : `${run.status}. First immutable run record captured.`,
    });
    setMeasurement('');
    setEvidenceLink('');
    setManualVerdict('');
  };

  const navigate = (viewId: string) => {
    beginHandoff('validation-studio', 'validation-studio');
    setActiveView(viewId);
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50" aria-label="Context-aware validation workbench">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Validation · evidence, runs, retests</p>
            </div>
            {selectedComponent ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <strong className="text-slate-950">{selectedComponent.referenceDesignator} · {selectedComponent.componentName}</strong>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{linkedTests.length} linked test{linkedTests.length === 1 ? '' : 's'}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{selectedNetIds.length} linked net{selectedNetIds.length === 1 ? '' : 's'}</span>
                {activeNetName && <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-800">Active net: {activeNetName}</span>}
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">No component is selected. Requirement, system, and factory tests remain available in the main workspace.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate('component-library')} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Boxes className="h-3.5 w-3.5" /> Components</button>
            <button type="button" onClick={() => navigate('board-designer')} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><CircuitBoard className="h-3.5 w-3.5" /> PCB</button>
            <button type="button" onClick={createLinkedTest} disabled={!selectedComponent} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 text-[10px] font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Create linked test</button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 xl:grid-cols-[minmax(220px,1.25fr)_minmax(140px,.8fr)_minmax(140px,.8fr)_minmax(160px,.8fr)_auto]">
          <label className="min-w-0">
            <span className="sr-only">Validation test to run</span>
            <select value={runTest?.id || ''} onChange={(event) => setSelectedRunTestId(event.target.value)} className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500">
              {validationTests.length === 0 && <option value="">No validation tests</option>}
              {validationTests.map((test) => <option key={test.id} value={test.id}>{test.name} · {test.category || 'Manual'}</option>)}
            </select>
          </label>
          <input value={measurement} onChange={(event) => setMeasurement(event.target.value)} placeholder={automatedRun ? 'Optional override/reading' : 'Measurement / observation'} className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-indigo-500" />
          {automatedRun ? (
            <div className="flex h-9 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold text-emerald-800">Engine derives verdict</div>
          ) : (
            <select value={manualVerdict} onChange={(event) => setManualVerdict(event.target.value as typeof manualVerdict)} className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-indigo-500">
              <option value="">Choose verdict…</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Inconclusive">Inconclusive</option>
            </select>
          )}
          <input value={evidenceLink} onChange={(event) => setEvidenceLink(event.target.value)} placeholder="Evidence link / file reference" className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-indigo-500" />
          <button type="button" onClick={recordRun} disabled={!runTest} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
            {runHistory.length > 0 ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {runHistory.length > 0 ? 'Record retest' : 'Record run'}
          </button>
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-[minmax(180px,.8fr)_minmax(0,1.8fr)]">
          <input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="Operator / reviewer (recommended)" className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[10px] outline-none focus:border-indigo-500" />
          <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[10px] text-slate-600">
            <History className="h-3.5 w-3.5 shrink-0" />
            {latestRun ? (
              <span className="truncate"><strong className="text-slate-900">Latest:</strong> run #{latestRun.runNumber || 1} · {latestRun.status} · {latestRun.timestamp || 'time not recorded'} · {runHistory.length - 1} prior run{runHistory.length - 1 === 1 ? '' : 's'} preserved</span>
            ) : (
              <span>No run evidence yet. Test definitions and checkbox completion alone do not prove validation.</span>
            )}
          </div>
        </div>

        {selectedComponent && linkedTests.length > 0 && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] leading-5 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0"><strong>Linked validation:</strong> {linkedTests.map((test) => `${test.name} (${test.status})`).join(' · ')}</div>
          </div>
        )}

        {selectedComponent && linkedTests.length === 0 && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[10px] leading-5 text-amber-900">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>This component has no validation definition yet. Create one here; it stores the same component ID and current net IDs rather than a copied label.</p>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1">
        <ValidationStudio initialMode={initialMode} />
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 py-1.5 text-[9px] text-slate-500">
        <span>Run history is append-only; retests add evidence instead of overwriting prior outcomes.</span>
        {selectedComponent && (
          <button type="button" onClick={() => setActiveComponent(selectedComponent.id)} className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900">
            Keep {selectedComponent.referenceDesignator} selected <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </footer>
    </section>
  );
};
