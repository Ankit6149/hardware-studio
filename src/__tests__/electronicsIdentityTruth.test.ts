import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { useStudioContextStore } from '../store/studioContextStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Electronics canonical identity and representation truth', () => {
  it('keeps component identity alive while a net becomes the immediate selected context', () => {
    const context = useStudioContextStore.getState();
    context.clearContext();
    context.setActiveBoard('board-main');
    context.setActiveComponent('component-u1');
    context.setActiveNet('VDD_3V3');

    const state = useStudioContextStore.getState();
    expect(state.activeBoardId).toBe('board-main');
    expect(state.activeComponentId).toBe('component-u1');
    expect(state.activeNetName).toBe('VDD_3V3');
    expect(state.selected).toEqual({ entity: 'net', id: 'VDD_3V3', label: 'VDD_3V3', netName: 'VDD_3V3' });

    state.clearContext();
  });

  it('makes Component Library own definition and project-instance context explicitly', () => {
    const library = source('../components/component-library/ComponentLibraryWorkbench.tsx');
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');

    expect(library).toContain('setActiveComponentDefinition(libraryId)');
    expect(library).toContain('setContextBoard(component.boardId)');
    expect(library).toContain('setActiveComponent(component.id)');
    expect(library).toContain("focusProjectInstance(instance.id, 'schematic-editor')");
    expect(library).toContain("focusProjectInstance(instance.id, 'board-designer')");
    expect(library).toContain("focusProjectInstance(instance.id, 'bom')");
    expect(library).toContain('<option value="">Select a board…</option>');
    expect(library).not.toContain("setSelectedBoardId(boards[0]?.id ?? '')");

    expect(adapters).not.toContain('previousIds');
    expect(adapters).not.toContain('useProjectStore');
    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('if (requestedMode) requestMechanicalMode(null);');
  });

  it('never invents a selected BOM component and stores canonical BOM linkage', () => {
    const bom = source('../components/studio/UnifiedBOMWorkbench.tsx');

    expect(bom).not.toContain('|| contextualComponents[0]');
    expect(bom).toContain('componentId: selectedComponent.id');
    expect(bom).toContain('component.bomItemId === item.id');
    expect(bom).toContain('focusComponent(linkedComponent.id)');
    expect(bom).toContain('No canonical component is selected');
  });

  it('requires explicit board ownership for integrated PCB checks and drawer context', () => {
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');
    const drawer = source('../components/board/PcbProjectDrawer.tsx');

    expect(pcb).toContain('const activeBoard = boards.find((board) => board.id === viewState.activeBoardId) || null;');
    expect(pcb).not.toContain('|| boards[0]');
    expect(pcb).toContain('Create or select a board before layout');
    expect(pcb).toContain('runBoardDRC({ ...useProjectStore.getState(), activeBoardId: effectiveViewState.activeBoardId || \'\' })');
    expect(drawer).toContain('boards.some((board) => board.id === candidate)');
    expect(drawer).not.toContain('boards[0]');
    expect(drawer).toContain('No explicit board selected');
    expect(existsSync(new URL('../components/studio/UnifiedBoardDRCWorkbench.tsx', import.meta.url))).toBe(false);
  });

  it('does not fabricate board, placement, package, or mechanical geometry in 3D', () => {
    const view3d = source('../components/mechanical/UnifiedBoard3DView.tsx');

    expect(view3d).toContain('const board = boards.find((candidate) => candidate.id === activeBoardId);');
    expect(view3d).not.toContain('|| boards[0]');
    expect(view3d).toContain('return null;');
    expect(view3d).toContain('new THREE.PlaneGeometry(size.width, size.height)');
    expect(view3d).toContain('renderable: hasPlacement && hasDimensions');
    expect(view3d).toContain('dimensions.widthMm, dimensions.heightZMm, dimensions.heightMm');
    expect(view3d).not.toContain('return { width: 50, height: 30');
    expect(view3d).not.toContain('dimensions?.widthMm || 6');
    expect(view3d).not.toContain('index * 7');
    expect(view3d).not.toContain("obj.name.toLowerCase().includes('boss')");
    expect(view3d).toContain('Board outline is unresolved');
    expect(view3d).toContain('not rendered because exact positive package dimensions are missing');
  });
});
