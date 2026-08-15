import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { useStudioContextStore } from '../store/studioContextStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('shared engineering context store', () => {
  beforeEach(() => {
    useStudioContextStore.getState().clearContext();
  });

  it('preserves definition, board, component, net, origin, and requested 3D mode across handoffs', () => {
    const store = useStudioContextStore.getState();
    store.setActiveComponentDefinition('def_sensor');
    store.setActiveBoard('board_controller');
    store.setActiveComponent('cmp_u1');
    store.setActiveNet('I2C_SDA');
    store.beginHandoff('component-library', 'schematic-editor');
    store.requestMechanicalMode('webgl-3d');

    expect(useStudioContextStore.getState()).toMatchObject({
      activeComponentDefinitionId: 'def_sensor',
      activeBoardId: 'board_controller',
      activeComponentId: 'cmp_u1',
      activeNetName: 'I2C_SDA',
      originView: 'component-library',
      returnView: 'schematic-editor',
      requestedMechanicalMode: 'webgl-3d',
    });
  });

  it('clears only UI context without mutating project engineering data', () => {
    const store = useStudioContextStore.getState();
    store.setActiveBoard('board_controller');
    store.setActiveComponent('cmp_u1');
    store.clearContext();
    expect(useStudioContextStore.getState()).toMatchObject({
      activeComponentDefinitionId: null,
      activeBoardId: null,
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
  it('does not send an empty PCB editor to the removed dashboard generator or manufacture starter geometry', () => {
    const boardDesigner = source('../components/board/BoardDesigner.tsx');
    expect(boardDesigner).not.toContain('Generate a Full Product Plan from the Project Dashboard');
    expect(boardDesigner).not.toContain('Go to Dashboard');
    expect(boardDesigner).not.toContain('Create starter board');
    expect(boardDesigner).not.toContain("dimensionsMm: '50 x 30'");
    expect(boardDesigner).toContain('PCB layout needs an explicit board');
    expect(boardDesigner).toContain("setActiveView('board-settings')");
    expect(boardDesigner).toContain("setActiveView('component-library')");
    expect(boardDesigner).toContain("setActiveView('schematic-editor')");
  });

  it('mounts one shared engineering context and one connected electronics workspace instead of duplicate global navigation', () => {
    const appShell = source('../components/AppShell.tsx');
    const electronicsWorkspace = source('../components/studio/ElectronicsWorkspace.tsx');
    expect(appShell).not.toContain('<StudioBuildMap />');
    expect(appShell).toContain('<EngineeringContextBar />');
    expect(appShell).toContain('<ElectronicsWorkspace />');
    expect(appShell).toContain('ELECTRONICS_WORKSPACE_VIEW_IDS.has(viewId)');
    expect(appShell).toContain('UnifiedMechanicalWorkbench');
    expect(appShell).toContain('<UnifiedValidationWorkbench initialMode="tests" />');
    expect(electronicsWorkspace).toContain('UnifiedComponentLibraryWorkbench');
    expect(electronicsWorkspace).toContain('UnifiedSchematicWorkbench');
    expect(electronicsWorkspace).toContain('UnifiedBoardDesignerWorkbench');
    expect(electronicsWorkspace).toContain('<UnifiedBoardDRCWorkbench />');
    expect(electronicsWorkspace).toContain('<UnifiedBOMWorkbench />');
  });

  it('adapts editors to selected canonical context without mutating the schematic on open', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const schematic = source('../components/schematic/UnifiedSchematicEditor.tsx');
    const contextBar = source('../components/studio/EngineeringContextBar.tsx');
    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('Opening an editor must never mutate engineering state');
    expect(adapters).toContain('setActiveComponentDefinition(added.libraryId || null)');
    expect(adapters).toContain('setActiveComponent(added.id)');
    expect(adapters).toContain('UnifiedBoardDesignerWorkbench');
    expect(schematic).toContain('placeComponentOnSchematic');
    expect(contextBar).toContain("requestMechanicalMode(viewId === 'mechanical-studio' ? 'webgl-3d' : null)");
    expect(contextBar).toContain("viewId === 'board-designer' && !selectedBoard");
    expect(contextBar).toContain("viewId: 'bom'");
    expect(contextBar).toContain("viewId: 'validation-studio'");
  });

  it('routes the live schematic surface through canonical project actions and in-app confirmation', () => {
    const adapter = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const schematic = source('../components/schematic/UnifiedSchematicEditor.tsx');
    expect(adapter).toContain('<UnifiedSchematicEditor');
    expect(schematic).toContain('placeComponentOnSchematic');
    expect(schematic).toContain("deleteProjectComponent(deleteImpact.componentId, 'entire-product')");
    expect(schematic).toContain('<Dialog.Root');
    expect(schematic).not.toContain('window.confirm');
    expect(schematic).not.toContain('addProjectComponentFromLibrary');
  });

  it('keeps BOM records linked to the selected canonical component', () => {
    const bom = source('../components/studio/UnifiedBOMWorkbench.tsx');
    expect(bom).toContain('activeComponentId');
    expect(bom).toContain('selectedComponent?.bomItemId');
    expect(bom).toContain('updateBoardComponent(selectedComponent.id, { bomItemId: id })');
  });

  it('links validation to the selected component and its actual net IDs', () => {
    const validation = source('../components/studio/UnifiedValidationWorkbench.tsx');
    expect(validation).toContain('activeComponentId');
    expect(validation).toContain('activeNetName');
    expect(validation).toContain('linkedNetIds');
  });

  it('routes board checks back to the responsible shared object', () => {
    const drc = source('../components/studio/UnifiedBoardDRCWorkbench.tsx');
    expect(drc).toContain('setActiveComponent');
    expect(drc).toContain('setActiveNet');
    expect(drc).toContain("setActiveView('board-designer')");
  });

  it('uses an event-driven selected-board 3D preview instead of permanent animation', () => {
    const view3d = source('../components/mechanical/UnifiedBoard3DView.tsx');
    expect(view3d).toContain('activeBoardId');
    expect(view3d).toContain("controls.addEventListener('change', render)");
    expect(view3d).toContain('IntersectionObserver');
    expect(view3d).not.toContain('requestAnimationFrame');
  });
});