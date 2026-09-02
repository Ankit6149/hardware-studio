'use client';

import React from 'react';
import { ClipboardCheck, Factory, History, Plus, TestTube2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  useValidationWorkspaceUiStore,
  type ValidationDrawerSection,
  type ValidationWorkspaceView,
} from '../../store/validationWorkspaceUiStore';

const sections: Array<{
  id: ValidationDrawerSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'tests', label: 'Tests', icon: TestTube2 },
  { id: 'coverage', label: 'Coverage', icon: ClipboardCheck },
  { id: 'factory-qa', label: 'Factory', icon: Factory },
  { id: 'runs', label: 'Runs', icon: History },
];

function statusClass(status: string): string {
  if (status === 'Pass' || status === 'Passed') return 'text-emerald-600';
  if (status === 'Fail' || status === 'Failed') return 'text-rose-600';
  return 'text-amber-600';
}

export const ValidationProjectDrawer: React.FC = () => {
  const tests = useProjectStore((state) => state.validationTests ?? []);
  const runs = useProjectStore((state) => state.validationRuns ?? []);
  const requirements = useProjectStore((state) => state.requirements ?? []);
  const activeView = useProjectStore((state) => state.activeView);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const executeProjectCommand = useProjectStore((state) => state.executeProjectCommand);
  const addValidationTest = useProjectStore((state) => state.addValidationTest);

  const drawerSection = useValidationWorkspaceUiStore((state) => state.drawerSection);
  const selectedTestId = useValidationWorkspaceUiStore((state) => state.selectedTestId);
  const selectedRunId = useValidationWorkspaceUiStore((state) => state.selectedRunId);
  const setDrawerSection = useValidationWorkspaceUiStore((state) => state.setDrawerSection);
  const setSelectedTestId = useValidationWorkspaceUiStore((state) => state.setSelectedTestId);
  const setSelectedRunId = useValidationWorkspaceUiStore((state) => state.setSelectedRunId);
  const setView = useValidationWorkspaceUiStore((state) => state.setView);
  const setInspectorOpen = useValidationWorkspaceUiStore((state) => state.setInspectorOpen);
  const setBottomDockOpen = useValidationWorkspaceUiStore((state) => state.setBottomDockOpen);

  const factoryTests = tests.filter((test) => test.stage === 'Factory QA');
  const orderedRuns = runs.slice().sort((a, b) => Date.parse(b.timestamp || '') - Date.parse(a.timestamp || ''));

  const moveTo = (view: ValidationWorkspaceView, route = 'validation-studio') => {
    setView(view);
    setActiveView(route);
  };

  const openSection = (section: ValidationDrawerSection) => {
    setDrawerSection(section);
    if (section === 'coverage') {
      moveTo('coverage', 'requirement-coverage');
      return;
    }
    if (section === 'factory-qa') {
      moveTo('factory-qa', 'factory-qa');
      return;
    }
    if (section === 'runs') {
      moveTo('review');
      return;
    }
    moveTo('define');
  };

  const selectTest = (testId: string, view: ValidationWorkspaceView = 'define', route = 'validation-studio') => {
    setSelectedTestId(testId);
    setView(view);
    setActiveView(route);
    setInspectorOpen(true);
  };

  const selectRun = (runId: string, testId: string) => {
    setSelectedTestId(testId);
    setSelectedRunId(runId);
    setView('review');
    setDrawerSection('runs');
    setActiveView('validation-studio');
    setInspectorOpen(true);
    setBottomDockOpen(true);
  };

  const addTest = (factory: boolean) => {
    const beforeIds = new Set((useProjectStore.getState().validationTests ?? []).map((test) => test.id));
    executeProjectCommand(factory ? 'ADD_QA' : 'ADD_TEST', factory ? 'Add Factory QA test' : 'Add validation test', () => {
      addValidationTest({
        name: factory ? `Factory QA ${factoryTests.length + 1}` : `Test ${tests.length + 1}`,
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
    if (created) selectTest(created.id, 'define', factory ? 'factory-qa' : 'validation-studio');
  };

  const routeSection: ValidationDrawerSection = activeView === 'requirement-coverage'
    ? 'coverage'
    : activeView === 'factory-qa'
      ? 'factory-qa'
      : drawerSection;

  return (
    <aside
      className="z-20 flex h-full w-[224px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label="Validation project drawer"
      data-studio-shell="project-drawer"
      data-workbench="validation"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TestTube2 className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Validation</div>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">Verification structure</h2>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-4 border-b border-[#d8d1c5] bg-[#f1ece3]">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => openSection(id)}
            aria-pressed={routeSection === id}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 border-r border-[#d8d1c5] text-[8px] font-semibold last:border-r-0 ${routeSection === id ? 'bg-[#fbfaf6] text-slate-950' : 'text-slate-500 hover:bg-[#ece6dc]'}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {routeSection === 'tests' && (
          <div className="space-y-0.5">
            <button type="button" onClick={() => addTest(false)} className="mb-1.5 flex h-8 w-full items-center justify-center gap-1.5 border border-dashed border-slate-300 bg-[#fbfaf6] text-[9px] font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-950">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add test
            </button>
            {tests.map((test) => {
              const active = selectedTestId === test.id;
              const runCount = runs.filter((run) => run.testId === test.id).length;
              return (
                <button key={test.id} type="button" onClick={() => selectTest(test.id)} aria-pressed={active} className={`flex min-h-10 w-full items-center gap-2 px-2 text-left ${active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-[#ece6dc]'}`}>
                  <TestTube2 className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white/60' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9px] font-semibold">{test.name}</span>
                    <span className={`mt-0.5 block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{test.stage} · {test.category} · {runCount} run{runCount === 1 ? '' : 's'}</span>
                  </span>
                </button>
              );
            })}
            {tests.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No validation tests yet. Creating a definition does not create execution evidence.</p>}
          </div>
        )}

        {routeSection === 'coverage' && (
          <div className="space-y-2 p-2">
            <p className="text-[9px] leading-4 text-slate-500">Coverage is traceability across {requirements.length} requirement{requirements.length === 1 ? '' : 's'} and {tests.length} test definition{tests.length === 1 ? '' : 's'}.</p>
            <p className="border-l-2 border-amber-400 pl-2 text-[9px] leading-4 text-slate-600">A linked test is not a passing run. Coverage remains evidence-driven.</p>
          </div>
        )}

        {routeSection === 'factory-qa' && (
          <div className="space-y-0.5">
            <button type="button" onClick={() => addTest(true)} className="mb-1.5 flex h-8 w-full items-center justify-center gap-1.5 border border-dashed border-slate-300 bg-[#fbfaf6] text-[9px] font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-950">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Factory QA test
            </button>
            {factoryTests.map((test) => {
              const active = selectedTestId === test.id;
              return (
                <button key={test.id} type="button" onClick={() => selectTest(test.id, 'factory-qa', 'factory-qa')} aria-pressed={active} className={`flex min-h-10 w-full items-center gap-2 px-2 text-left ${active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-[#ece6dc]'}`}>
                  <Factory className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white/60' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[9px] font-semibold">{test.name}</span><span className={`mt-0.5 block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{test.category} · {test.status}</span></span>
                </button>
              );
            })}
            {factoryTests.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No Factory QA definitions yet.</p>}
          </div>
        )}

        {routeSection === 'runs' && (
          <div className="space-y-0.5">
            {orderedRuns.map((run) => {
              const active = selectedRunId === run.id;
              return (
                <button key={run.id} type="button" onClick={() => selectRun(run.id, run.testId)} aria-pressed={active} className={`flex min-h-11 w-full items-center gap-2 px-2 text-left ${active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-[#ece6dc]'}`}>
                  <History className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white/60' : statusClass(run.status)}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9px] font-semibold">{run.testName || run.testId}</span>
                    <span className={`mt-0.5 block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>run #{run.runNumber || 1} · {run.status} · {run.timestamp ? new Date(run.timestamp).toLocaleString() : 'time unresolved'}</span>
                  </span>
                </button>
              );
            })}
            {orderedRuns.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No recorded validation runs. Define a test, then execute it explicitly.</p>}
          </div>
        )}
      </div>
    </aside>
  );
};
