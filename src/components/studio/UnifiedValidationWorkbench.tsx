'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  Link2,
  Plus,
  TestTube2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { ValidationStudio } from '../validation/ValidationStudio';

interface UnifiedValidationWorkbenchProps {
  initialMode: 'tests' | 'coverage' | 'factory-qa';
}

export const UnifiedValidationWorkbench: React.FC<UnifiedValidationWorkbenchProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const {
    boardComponents = [],
    validationTests = [],
    addValidationTest,
    executeProjectCommand,
    setActiveView,
  } = store;
  const {
    activeBoardId,
    activeComponentId,
    activeNetName,
    setActiveComponent,
    beginHandoff,
  } = useStudioContextStore();

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
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Validation in the same product context</p>
            </div>
            {selectedComponent ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <strong className="text-slate-950">{selectedComponent.referenceDesignator} · {selectedComponent.componentName}</strong>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{linkedTests.length} linked test{linkedTests.length === 1 ? '' : 's'}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{selectedNetIds.length} linked net{selectedNetIds.length === 1 ? '' : 's'}</span>
                {activeNetName && <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-800">Active net: {activeNetName}</span>}
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">No component is selected. Generic requirement and factory tests remain available below.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate('component-library')} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Boxes className="h-3.5 w-3.5" /> Components</button>
            <button type="button" onClick={() => navigate('board-designer')} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><CircuitBoard className="h-3.5 w-3.5" /> PCB</button>
            <button type="button" onClick={createLinkedTest} disabled={!selectedComponent} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 text-[10px] font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Create linked test</button>
          </div>
        </div>

        {selectedComponent && linkedTests.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] leading-5 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <strong>Linked validation:</strong>{' '}
              {linkedTests.map((test) => `${test.name} (${test.status})`).join(' · ')}
            </div>
          </div>
        )}

        {selectedComponent && linkedTests.length === 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[10px] leading-5 text-amber-900">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>This component has no validation record yet. Create one here; it will store the same component ID and current net IDs instead of relying on a copied name.</p>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1">
        <ValidationStudio initialMode={initialMode} />
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 py-1.5 text-[9px] text-slate-500">
        <span>Validation records remain part of canonical project state.</span>
        {selectedComponent && (
          <button type="button" onClick={() => setActiveComponent(selectedComponent.id)} className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900">
            Keep {selectedComponent.referenceDesignator} selected <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </footer>
    </section>
  );
};
