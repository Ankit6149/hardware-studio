import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { useStudioContextStore } from '../store/studioContextStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

afterEach(() => {
  useStudioContextStore.getState().clearContext();
});

describe('shared cross-workbench engineering context', () => {
  it('preserves definition, board, component, net, origin, and requested 3D mode across handoffs', () => {
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
  it('does not send an empty PCB editor to the removed dashboard generator or manufacture starter geometry', () => {
    const boardDesigner = source('../components/board/BoardDesigner.tsx');
    expect(boardDesigner).not.toContain('Generate a Full Product Plan from the Project Dashboard');
    expect(boardDesigner).not.toContain('Go to Dashboard');
    expect(boardDesigner).not.toContain('Create starter board');
    expect(boardDesigner).not.toContain("dimensionsMm: '50 x 30'");
    expect(boardDesigner).toContain('Define or select a real board before PCB layout');
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

  it('adapts editors to the selected canonical definition and component instance', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const contextBar = source('../components/studio/EngineeringContextBar.tsx');
    expect(adapters).toContain('placeComponentOnSchematic');
    expect(adapters).toContain('setActiveComponentDefinition(added.libraryId || null)');
    expect(adapters).toContain('setActiveComponent(added.id)');
    expect(adapters).toContain('UnifiedBoardDesignerWorkbench');
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
    expect(bom).toContain('selectedComponent?.bomItemId');
    expect(bom).toContain("updateBoardComponent(selectedComponent.id, { bomItemId: id })");
    expect(bom).toContain('Linked to ${selectedComponent.referenceDesignator}');
    expect(bom).not.toContain('generateBOMFromMVP');
    expect(bom).not.toContain('selectedComponent.electrical');
  });

  it('links validation to the selected component and its actual net IDs', () => {
    const validation = source('../components/studio/UnifiedValidationWorkbench.tsx');
    expect(validation).toContain('linkedComponentIds: [selectedComponent.id]');
    expect(validation).toContain('linkedNetIds: selectedNetIds');
    expect(validation).toContain('selectedComponent.architectureNodeId');
    expect(validation).toContain("executeProjectCommand('ADD_COMPONENT_TEST'");
  });

  it('routes board checks back to the responsible shared object', () => {
    const drc = source('../components/studio/UnifiedBoardDRCWorkbench.tsx');
    expect(drc).toContain('runBoardDRC(useProjectStore.getState())');
    expect(drc).toContain("result.linkedObjectType === 'component'");
    expect(drc).toContain('setActiveComponent(result.linkedObjectId)');
    expect(drc).toContain("result.linkedObjectType === 'net'");
    expect(drc).toContain('setActiveNet');
    expect(drc).toContain("setActiveView('board-designer')");
  });

  it('uses an event-driven selected-board 3D preview instead of permanent animation', () => {
    const view3d = source('../components/mechanical/UnifiedBoard3DView.tsx');
    expect(view3d).toContain("powerPreference: 'low-power'");
    expect(view3d).toContain('component.boardId === boardId');
    expect(view3d).toContain('component.id === activeComponentId');
    expect(view3d).toContain("controls.addEventListener('change', render)");
    expect(view3d).toContain('renderer.forceContextLoss()');
    expect(view3d).not.toContain('requestAnimationFrame');
    expect(view3d).not.toContain('mainGroup.rotation');
  });
});
