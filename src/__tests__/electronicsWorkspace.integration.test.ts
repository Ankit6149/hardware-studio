import { beforeEach, describe, expect, it } from 'vitest';
import { defaultComponents } from '../lib/components/componentLibrary';
import { evaluateElectronicsWorkflow } from '../lib/electronics/electronicsWorkflow';
import { useProjectStore } from '../store/projectStore';

function resetElectronicsState() {
  const state = useProjectStore.getState();
  useProjectStore.setState({
    ...state,
    boards: [],
    activeBoardId: '',
    boardOutlines: [],
    boardComponents: [],
    schematicWires: [],
    nets: [],
    traces: [],
    padNetAssignments: [],
    bom: [],
  });
}

describe('electronics workspace lifecycle evidence', () => {
  beforeEach(resetElectronicsState);

  it('guides one canonical component through schematic, board, PCB and BOM state', () => {
    const initial = evaluateElectronicsWorkflow(useProjectStore.getState());
    expect(initial.nextStage).toBe('component-library');
    expect(initial.blockers).toContain('Define a real board before PCB placement or routing.');

    const store = useProjectStore.getState();
    const board = store.addBoard({ name: 'Lifecycle Board', boardType: 'Main PCB', layerCount: 2, substrate: 'FR4' });
    store.updateProjectState({
      activeBoardId: board.id,
      boardOutlines: [{
        id: `outline_${board.id}`,
        boardId: board.id,
        points: [{ x: 0, y: 0 }, { x: 48, y: 0 }, { x: 48, y: 32 }, { x: 0, y: 32 }],
        width: 48,
        height: 32,
        units: 'mm',
      }],
    });

    const definition = defaultComponents.find((candidate) => candidate.pins.length > 0);
    expect(definition).toBeTruthy();
    const component = store.addProjectComponentFromLibrary(definition!, board.id);

    let snapshot = evaluateElectronicsWorkflow(useProjectStore.getState());
    expect(snapshot).toMatchObject({
      activeBoardId: board.id,
      hasBoardOutline: true,
      componentCount: 1,
      schematicPlacedCount: 0,
      pcbPlacedCount: 0,
      linkedBomCount: 1,
      nextStage: 'schematic-editor',
    });
    expect(useProjectStore.getState().boardComponents[0].bomItemId).toBeTruthy();

    store.placeComponentOnSchematic(component.id, 120, 120);
    snapshot = evaluateElectronicsWorkflow(useProjectStore.getState());
    expect(snapshot.nextStage).toBe('board-designer');

    store.placeComponentOnBoard(component.id, 12, 10, 'Top');
    snapshot = evaluateElectronicsWorkflow(useProjectStore.getState());
    expect(snapshot).toMatchObject({
      componentCount: 1,
      schematicPlacedCount: 1,
      pcbPlacedCount: 1,
      linkedBomCount: 1,
      hasBoardOutline: true,
      nextStage: 'pcb-drc',
    });
  });
});
