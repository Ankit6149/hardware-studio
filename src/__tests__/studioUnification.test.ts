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

  it('mounts one connected workspace without duplicate global strips or standalone PCB rule/DRC apps', () => {
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
    expect(electronicsWorkspace).toContain("viewId === 'pcb-constraints' || viewId === 'pcb-drc'");
    expect(electronicsWorkspace).not.toContain('UnifiedBoardDRCWorkbench');
    expect(electronicsWorkspace).not.toContain('PCBConstraints');
    expect(electronicsWorkspace).toContain('<UnifiedBOMWorkbench />');
    expect(existsSync(new URL('../components/studio/EngineeringContextBar.tsx', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../components/studio/UnifiedBoardDRCWorkbench.tsx', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../components/PCBConstraints.tsx', import.meta.url))).toBe(false);
  });

  it('adapts editors to selected canonical context without mutating the schematic on open', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const library = source('../components/component-library/ComponentLibraryWorkbench.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const appShell = source('../components/AppShell.tsx');
    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(appShell).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('<EngineeringSchematicWorkbench />');
    expect(adapters).toContain('<EngineeringBoardWorkbench />');
    expect(adapters).not.toContain('useEffect');
    expect(adapters).not.toContain('previousIds');
    expect(adapters).not.toContain('useProjectStore');
    expect(library).toContain('setActiveComponentDefinition(selectedComponent.libraryId)');
    expect(library).toContain('setContextBoard(effectiveBoard.id)');
    expect(library).toContain('setActiveComponent(component.id)');
    expect(library).toContain('focusProjectInstance');
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
    expect(bom).toContain('item.id === selectedComponent.bomItemId');
    expect(bom).toContain('item.componentId === selectedComponent.id');
    expect(bom).toContain('componentId: selectedComponent.id');
    expect(bom).toContain('updateBoardComponent(selectedComponent.id, { bomItemId: id })');
    expect(bom).not.toContain('|| contextualComponents[0]');
  });

  it('links validation to the selected component and its actual net IDs', () => {
    const validation = source('../components/studio/UnifiedValidationWorkbench.tsx');
    expect(validation).toContain('activeComponentId');
    expect(validation).toContain('activeNetName');
    expect(validation).toContain('linkedNetIds');
  });

  it('keeps board checks in the PCB bottom dock and routes findings to shared object context', () => {
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');
    expect(pcb).toContain('runBoardDRC');
    expect(pcb).toContain('<EngineeringBottomDock');
    expect(pcb).toContain('title="PCB DRC"');
    expect(pcb).toContain("result.linkedObjectType === 'component'");
    expect(pcb).toContain("result.linkedObjectType === 'net'");
    expect(pcb).toContain("entity: 'net'");
    expect(pcb).toContain('select({');
  });

  it('uses an event-driven selected-board 3D preview instead of permanent animation', () => {
    const view3d = source('../components/mechanical/UnifiedBoard3DView.tsx');
    expect(view3d).toContain('activeBoardId');
    expect(view3d).toContain("controls.addEventListener('change', render)");
    expect(view3d).toContain('IntersectionObserver');
    expect(view3d).not.toContain('requestAnimationFrame');
  });
});
