import { beforeEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
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
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');
    expect(pcb).not.toContain('Generate a Full Product Plan from the Project Dashboard');
    expect(pcb).not.toContain('Create starter board');
    expect(pcb).not.toContain("dimensionsMm: '50 x 30'");
    expect(pcb).toContain('Create or select a board before layout');
    expect(pcb).toContain("setActiveView('board-settings')");
    expect(pcb).toContain('Define the board outline first');
  });

  it('mounts one connected workspace without duplicate global strips around every editor', () => {
    const appShell = source('../components/AppShell.tsx');
    const electronicsWorkspace = source('../components/studio/ElectronicsWorkspace.tsx');
    expect(appShell).not.toContain('<StudioBuildMap />');
    expect(appShell).not.toContain('<EngineeringContextBar />');
    expect(appShell).not.toContain('<ReviewWarnings />');
    expect(appShell).toContain('<ElectronicsWorkspace />');
    expect(appShell).toContain('ELECTRONICS_WORKSPACE_VIEW_IDS.has(viewId)');
    expect(appShell).toContain('UnifiedMechanicalWorkbench');
    expect(appShell).toContain('<UnifiedValidationWorkbench initialMode="tests" />');
    expect(electronicsWorkspace).toContain('UnifiedComponentLibraryWorkbench');
    expect(electronicsWorkspace).toContain('UnifiedSchematicWorkbench');
    expect(electronicsWorkspace).toContain('UnifiedBoardDesignerWorkbench');
    expect(electronicsWorkspace).toContain('<UnifiedBoardDRCWorkbench />');
    expect(electronicsWorkspace).toContain('<UnifiedBOMWorkbench />');
    expect(existsSync(new URL('../components/studio/EngineeringContextBar.tsx', import.meta.url))).toBe(false);
  });

  it('adapts editors to selected canonical context without mutating the schematic on open', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const appShell = source('../components/AppShell.tsx');
    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(appShell).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('<EngineeringSchematicWorkbench />');
    expect(adapters).toContain('setActiveComponentDefinition(added.libraryId || null)');
    expect(adapters).toContain('setActiveComponent(added.id)');
    expect(adapters).toContain('<EngineeringBoardWorkbench />');
    expect(schematic).toContain('placingComponentId');
    expect(schematic).toContain('placeAtPointer');
    expect(schematic).toContain('placeComponentOnSchematic(componentId, x, y)');
  });

  it('routes the live schematic surface through canonical project actions without creating a parallel component model', () => {
    const adapter = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const canvas = source('../components/schematic/SchematicCanvas.tsx');
    expect(adapter).toContain('<EngineeringSchematicWorkbench />');
    expect(schematic).toContain('placeComponentOnSchematic');
    expect(schematic).toContain('unplaceComponentFromSchematic');
    expect(canvas).toContain('connectComponentPins');
    expect(schematic).not.toContain('addProjectComponentFromLibrary');
    expect(schematic).not.toContain('window.confirm');
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
