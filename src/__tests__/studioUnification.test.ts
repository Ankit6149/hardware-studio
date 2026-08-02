import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BUILD_STAGES, ELECTRONICS_FLOW } from '../components/studio/StudioBuildMap';
import { useStudioContextStore } from '../store/studioContextStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

afterEach(() => {
  useStudioContextStore.getState().clearContext();
});

describe('unified Hardware Studio build map', () => {
  it('keeps every major product domain discoverable in one stable order', () => {
    expect(BUILD_STAGES.map((stage) => stage.id)).toEqual([
      'product',
      'mechanical',
      'electronics',
      'pcb',
      'firmware',
      'validation',
      'outputs',
    ]);
    expect(new Set(BUILD_STAGES.map((stage) => stage.viewId)).size).toBe(BUILD_STAGES.length);
  });

  it('defines a single connected electronics golden path including real 3D entry', () => {
    expect(ELECTRONICS_FLOW.map((step) => step.id)).toEqual([
      'component-library',
      'schematic-editor',
      'board-settings',
      'board-designer',
      'mechanical-studio',
      'pcb-drc',
    ]);
    expect(ELECTRONICS_FLOW.find((step) => step.id === 'mechanical-studio')?.label).toBe('Assembly / 3D');
  });
});

describe('shared cross-workbench engineering context', () => {
  it('preserves board, component, net, origin, and requested 3D mode across handoffs', () => {
    const context = useStudioContextStore.getState();
    context.setActiveBoard('board-main');
    context.setActiveComponentDefinition('lib-mcu');
    context.setActiveComponent('comp-u1');
    context.setActiveNet('I2C_SDA');
    context.beginHandoff('schematic-editor', 'schematic-editor');
    context.requestMechanicalMode('webgl-3d');

    const next = useStudioContextStore.getState();
    expect(next.activeBoardId).toBe('board-main');
    expect(next.activeComponentDefinitionId).toBe('lib-mcu');
    expect(next.activeComponentId).toBe('comp-u1');
    expect(next.activeNetName).toBe('I2C_SDA');
    expect(next.originView).toBe('schematic-editor');
    expect(next.returnView).toBe('schematic-editor');
    expect(next.requestedMechanicalMode).toBe('webgl-3d');
    expect(next.selected).toEqual({ entity: 'net', id: 'I2C_SDA', label: 'I2C_SDA' });
  });

  it('clears only UI context without mutating project engineering data', () => {
    const context = useStudioContextStore.getState();
    context.setActiveBoard('board-main');
    context.setActiveComponent('comp-u1');
    context.requestMechanicalMode('webgl-3d');
    context.clearContext();

    expect(useStudioContextStore.getState()).toMatchObject({
      activeBoardId: null,
      activeComponentDefinitionId: null,
      activeComponentId: null,
      activeNetName: null,
      selected: null,
      originView: null,
      returnView: null,
      requestedMechanicalMode: null,
    });
  });
});

describe('golden-path regression guards', () => {
  it('does not send an empty PCB editor to the removed dashboard generator', () => {
    const boardDesigner = source('../components/board/BoardDesigner.tsx');
    expect(boardDesigner).not.toContain('Generate a Full Product Plan from the Project Dashboard');
    expect(boardDesigner).not.toContain('Go to Dashboard');
    expect(boardDesigner).toContain('Create starter board');
    expect(boardDesigner).toContain("setActiveView('board-settings')");
    expect(boardDesigner).toContain("setActiveView('component-library')");
    expect(boardDesigner).toContain("setActiveView('schematic-editor')");
  });

  it('mounts one persistent build map and shared engineering context above workbenches', () => {
    const appShell = source('../components/AppShell.tsx');
    expect(appShell).toContain('<StudioBuildMap />');
    expect(appShell).toContain('<EngineeringContextBar />');
    expect(appShell).toContain('UnifiedComponentLibraryWorkbench');
    expect(appShell).toContain('UnifiedSchematicWorkbench');
    expect(appShell).toContain('UnifiedMechanicalWorkbench');
  });

  it('adapts existing editors to the selected canonical component instance', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const contextBar = source('../components/studio/EngineeringContextBar.tsx');
    expect(adapters).toContain('placeComponentOnSchematic');
    expect(adapters).toContain('setActiveComponent(added.id)');
    expect(contextBar).toContain("requestMechanicalMode('webgl-3d')");
    expect(contextBar).toContain("viewId === 'board-designer' && !selectedBoard");
  });
});
