'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  History,
  Link2,
  Play,
  Plus,
  RotateCcw,
  TestTube2,
  X,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { getValidationRunHistory, runValidationTest } from '../../lib/validationRunner';
import { useFeedback } from '../feedback/FeedbackProvider';
import { ValidationStudio } from '../validation/ValidationStudio';
import { EditorDockButton } from '../editor/EditorDockButton';

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
    updateProjectState,
    updateValidationTest,
  } = store;
  const { activeBoardId, activeComponentId, activeNetName } = useStudioContextStore();

  const [runPanelOpen, setRunPanelOpen] = useState(false);
  const [selectedRunTestId, setSelectedRunTestId] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [operator, setOperator] = useState('');
  const [manualVerdict, setManualVerdict] = useState<'' | 'Pass' | 'Fail' | 'Inconclusive'>('');

  const selectedComponent = activeComponentId
    ? boardComponents.find((component) => component.id === activeComponentId)
    : undefined;
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

  const contextualComponentCount = useMemo(
    () => boardComponents.filter((component) => !activeBoardId || component.boardId === activeBoardId).length,
    [activeBoardId, boardComponents],
  );

  const createLinkedTest = () => {
    if (!selectedComponent) {
      feedback.notify({
        tone: 'warning',
        title: 'Select a component first',
        detail: 'Choose a canonical component in Electronics or PCB before creating component-linked validation evidence.',
      });
      return;
    }
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
    feedback.notify({ tone: 'success', title: 'Linked test created', detail: `Validation now references ${selectedComponent.referenceDesignator} by canonical component ID.` });
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

    const previousRunCount = runHistory.length;
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
      detail: previousRunCount > 0
        ? `${run.status}. Retest recorded without replacing the previous run.`
        : `${run.status}. First immutable run record captured.`,
    });
    setMeasurement('');
    setEvidenceLink('');
    setManualVerdict('');
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50" aria-label="Context-aware validation workbench">
      <header className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TestTube2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-900">
              {initialMode === 'tests' ? 'Validation tests' : initialMode === 'coverage' ? 'Requirement coverage' : 'Factory QA'}
            </p>
            <p className="truncate text-[9px] text-slate-500">
              {selectedComponent
                ? `${selectedComponent.referenceDesignator} · ${selectedComponent.componentName} · ${linkedTests.length} linked tests · ${selectedNetIds.length} nets`
                : `${validationTests.length} tests · ${validationRuns.length} immutable runs · ${contextualComponentCount} components in current board context`}
              {activeNetName ? ` · active net ${activeNetName}` : ''}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {initialMode === 'tests' && (
            <button type="button" onClick={createLinkedTest} className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <Plus className="h-3.5 w-3.5" /> Linked test
            </button>
          )}
          <EditorDockButton label="Run evidence" icon={FileCheck2} active={runPanelOpen} count={runHistory.length} onClick={() => setRunPanelOpen((value) => !value)} />
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ValidationStudio initialMode={initialMode} />

        {runPanelOpen && (
          <aside className="absolute bottom-3 right-3 top-3 z-40 flex w-[min(360px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="Validation run evidence">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
              <div><p className="text-[11px] font-semibold text-slate-900">Record run evidence</p><p className="mt-0.5 text-[9px] leading-4 text-slate-500">Runs are append-only. Manual measurements never imply Pass without an explicit verdict.</p></div>
              <button type="button" onClick={() => setRunPanelOpen(false)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-200" aria-label="Close run evidence"><X className="h-3.5 w-3.5" /></button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              <label className="block"><span className="text-[9px] font-semibold text-slate-500">Test</span><select value={runTest?.id || ''} onChange={(event) => setSelectedRunTestId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-800 outline-none focus:border-slate-500">{validationTests.length === 0 && <option value="">No validation tests</option>}{validationTests.map((test) => <option key={test.id} value={test.id}>{test.name} · {test.category || 'Manual'}</option>)}</select></label>

              <label className="block"><span className="text-[9px] font-semibold text-slate-500">Measurement / observation</span><textarea value={measurement} onChange={(event) => setMeasurement(event.target.value)} placeholder={automatedRun ? 'Optional reading or observation' : 'Record the observed result'} className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-300 bg-white p-2.5 text-[10px] leading-5 outline-none focus:border-slate-500" /></label>

              {automatedRun ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] font-semibold text-emerald-800">The validation engine derives this verdict from recorded project state.</div>
              ) : (
                <label className="block"><span className="text-[9px] font-semibold text-slate-500">Manual verdict</span><select value={manualVerdict} onChange={(event) => setManualVerdict(event.target.value as typeof manualVerdict)} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold outline-none focus:border-slate-500"><option value="">Choose verdict…</option><option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Inconclusive">Inconclusive</option></select></label>
              )}

              <label className="block"><span className="text-[9px] font-semibold text-slate-500">Evidence reference</span><input value={evidenceLink} onChange={(event) => setEvidenceLink(event.target.value)} placeholder="File, URL, log, image, or lab reference" className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[10px] outline-none focus:border-slate-500" /></label>
              <label className="block"><span className="text-[9px] font-semibold text-slate-500">Operator / reviewer</span><input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="Name or role" className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[10px] outline-none focus:border-slate-500" /></label>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700"><History className="h-3.5 w-3.5" /> Run history</div>
                {latestRun ? <p className="mt-1 text-[9px] leading-4 text-slate-500"><strong className="text-slate-700">Latest:</strong> run #{latestRun.runNumber || 1} · {latestRun.status} · {latestRun.timestamp || 'time not recorded'} · {Math.max(0, runHistory.length - 1)} prior preserved</p> : <p className="mt-1 text-[9px] leading-4 text-slate-500">No immutable run evidence yet.</p>}
              </div>

              {selectedComponent && linkedTests.length > 0 && <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-[9px] leading-4 text-emerald-900"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span><strong>Linked:</strong> {linkedTests.map((test) => `${test.name} (${test.status})`).join(' · ')}</span></div>}
              {selectedComponent && linkedTests.length === 0 && <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[9px] leading-4 text-amber-900"><Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>This selected component has no linked validation definition yet.</span></div>}
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-3">
              <button type="button" onClick={recordRun} disabled={!runTest} className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                {runHistory.length > 0 ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {runHistory.length > 0 ? 'Record retest' : 'Record run'}
              </button>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};