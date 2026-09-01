import { beforeEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { useValidationWorkspaceUiStore } from '../store/validationWorkspaceUiStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('U7 Validation convergence', () => {
  beforeEach(() => {
    useValidationWorkspaceUiStore.setState({
      view: 'define',
      drawerSection: 'tests',
      selectedTestId: null,
      selectedRunId: null,
      inspectorOpen: true,
      bottomDockOpen: false,
    });
  });

  it('keeps Validation selection and panel state UI-only', () => {
    const ui = useValidationWorkspaceUiStore.getState();
    ui.setSelectedTestId('test-1');
    ui.setSelectedRunId('run-2');
    ui.setView('review');
    ui.setDrawerSection('runs');
    ui.setBottomDockOpen(true);

    expect(useValidationWorkspaceUiStore.getState()).toMatchObject({
      selectedTestId: 'test-1',
      selectedRunId: 'run-2',
      view: 'review',
      drawerSection: 'runs',
      bottomDockOpen: true,
    });

    const uiSource = source('../store/validationWorkspaceUiStore.ts');
    expect(uiSource).not.toContain('useProjectStore');
    expect(uiSource).not.toContain('validationTests:');
    expect(uiSource).not.toContain('validationRuns:');
  });

  it('uses one shell-owned Validation Project Drawer', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const drawer = source('../components/validation/ValidationProjectDrawer.tsx');

    expect(navigation).toContain("activeWorkbench.id === 'validation'");
    expect(navigation).toContain('<ValidationProjectDrawer />');
    expect(drawer).toContain("{ id: 'tests', label: 'Tests'");
    expect(drawer).toContain("{ id: 'coverage', label: 'Coverage'");
    expect(drawer).toContain("{ id: 'factory-qa', label: 'Factory'");
    expect(drawer).toContain("{ id: 'runs', label: 'Runs'");
    expect(drawer).toContain('setSelectedTestId(testId)');
    expect(drawer).toContain('setSelectedRunId(runId)');
  });

  it('never chooses the first test or run implicitly', () => {
    const definition = source('../components/validation/ValidationStudio.tsx');
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(definition).not.toContain('visibleTests[0]');
    expect(definition).not.toContain('useState<string | null>(null)');
    expect(definition).not.toContain('testListOpen');
    expect(workbench).not.toContain('linkedTests[0]');
    expect(workbench).not.toContain('validationTests[0]');
    expect(workbench).not.toContain('runHistory[0]');
    expect(workbench).toContain('selectedTestId ? tests.find');
    expect(workbench).toContain('selectedRunId ? runs.find');
  });

  it('separates Define specification from Execute observations and Review history', () => {
    const definition = source('../components/validation/ValidationStudio.tsx');
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(definition).toContain('Expected values/tolerances belong to Define. Actual readings belong to Execute.');
    expect(definition).not.toContain('value={measurement.actualValue');
    expect(definition).not.toContain('Mark step');
    expect(definition).toContain('Definition references');
    expect(definition).toContain('not validation run evidence');

    expect(workbench).toContain("label=\"Define\"");
    expect(workbench).toContain("label=\"Execute\"");
    expect(workbench).toContain("label=\"Review\"");
    expect(workbench).toContain('ValidationExecuteSurface');
    expect(workbench).toContain('ValidationReviewSurface');
    expect(workbench).not.toContain('runPanelOpen');
  });

  it('uses the shared Inspector and bottom dock for selection and run output', () => {
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(workbench).toContain('<EngineeringEditorBar');
    expect(workbench).toContain('<EngineeringInspector');
    expect(workbench).toContain('<EngineeringBottomDock');
    expect(workbench).toContain('title="Validation run output"');
    expect(workbench).toContain('<EngineeringStatusBar');
  });

  it('preserves the existing bounded execution authority instead of broadening automation', () => {
    const runner = source('../lib/validationRunner.ts');
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(runner).toContain("export type ValidationExecutionMode = 'drc-auto' | 'firmware-state-auto' | 'mechanical-screen' | 'manual'");
    expect(runner).toContain('approximate AABB collision screen');
    expect(runner).toContain('Hardware Studio does not currently run a thermal solver');
    expect(runner).toContain('Prior history remains immutable');
    expect(workbench).toContain('Durable hashed evidence, exact version/DUT/equipment binding and reviewed immutability remain #19.');
  });

  it('keeps the old Validation component files only as the one controlled definition surface', () => {
    expect(existsSync(new URL('../components/validation/ValidationStudio.tsx', import.meta.url))).toBe(true);
    const definition = source('../components/validation/ValidationStudio.tsx');
    expect(definition).toContain('useValidationWorkspaceUiStore');
    expect(definition).not.toContain('EditorDockButton');
  });
});
