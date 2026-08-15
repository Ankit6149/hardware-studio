import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultComponents } from '../lib/components/componentLibrary';
import { useProjectStore } from '../store/projectStore';

const storeSource = readFileSync(
  resolve(process.cwd(), 'src/store/projectStore.ts'),
  'utf8',
);

function resetBoardState() {
  const state = useProjectStore.getState();
  useProjectStore.setState({
    ...state,
    boards: [],
    circuitBlocks: [],
    boardComponents: [],
    bom: [],
    pcbConstraints: [],
    activeBoardId: '',
  });
}

describe('canonical project-store board identity', () => {
  beforeEach(() => {
    resetBoardState();
  });

  it('does not persist the retired synthetic board identity or dimension fallbacks', () => {
    expect(storeSource).not.toContain("activeBoardId: state.activeBoardId || 'board-main'");
    expect(storeSource).not.toContain("activeBoardId: initialProject.activeBoardId || 'board-main'");
    expect(storeSource).not.toContain("get().activeBoardId || 'board_main'");
    expect(storeSource).not.toContain("mainBoard.dimensionsMm || '100x60'");
    expect(storeSource).not.toContain("dimensionsMm: item.dimensionsMm || '50x50'");
  });

  it('keeps a new board dimension unresolved when no geometry was supplied', () => {
    const board = useProjectStore.getState().addBoard({ name: 'Unknown Geometry PCB' });
    expect(board.dimensionsMm).toBeUndefined();
  });

  it('does not invent a board relationship for a generic board component', () => {
    useProjectStore.getState().addBoardComponent({
      referenceDesignator: 'U1',
      componentName: 'Controller',
      componentType: 'MCU',
      footprint: 'QFN_32',
      packageName: 'QFN_32',
      placementCriticality: 'Medium',
      quantity: 1,
      side: 'Top',
      placementStatus: 'Unplaced',
    });

    const component = useProjectStore.getState().boardComponents?.[0];
    expect(component?.boardId).toBe('');
  });

  it('rejects a library component handoff when no real board exists', () => {
    const definition = defaultComponents.find((component) => component.pins.length > 0);
    expect(definition).toBeDefined();

    expect(() => useProjectStore.getState().addProjectComponentFromLibrary(definition!))
      .toThrow('A real project board must be selected before adding a component from the library.');
  });

  it('creates one unplaced canonical component and Not Started BOM record on a real board', () => {
    const store = useProjectStore.getState();
    const board = store.addBoard({ name: 'Controller PCB' });
    const definition = defaultComponents.find((component) => component.pins.length > 0);
    expect(definition).toBeDefined();

    const component = useProjectStore.getState().addProjectComponentFromLibrary(definition!, board.id);
    const current = useProjectStore.getState();
    const bomItem = current.bom.find((item) => item.id === component.bomItemId);

    expect(component.boardId).toBe(board.id);
    expect(component.circuitBlockId).toBeUndefined();
    expect(component.pcb).toMatchObject({
      placed: false,
      placementStatus: 'Unplaced',
    });
    expect(component.pcb?.xMm).toBeUndefined();
    expect(component.pcb?.yMm).toBeUndefined();
    expect(component.placementX).toBeUndefined();
    expect(component.placementY).toBeUndefined();
    expect(bomItem).toMatchObject({
      componentId: component.id,
      blockName: 'Unassigned',
      status: 'Not Started',
    });
    expect(current.activeBoardId).toBe(board.id);
  });

  it('rejects a circuit block that belongs to another board', () => {
    const store = useProjectStore.getState();
    const boardA = store.addBoard({ name: 'Controller PCB' });
    const boardB = useProjectStore.getState().addBoard({ name: 'Sensor PCB' });
    useProjectStore.getState().addCircuitBlock({
      name: 'Sensor Front End',
      circuitType: 'Sensor',
      boardId: boardB.id,
      description: '',
      requiredComponents: '',
      referenceDesignators: '',
      powerNets: '',
      signalNets: '',
      interfaceType: '',
      datasheetNotes: '',
      designNotes: '',
      risks: '',
      status: 'Concept',
    });
    const foreignBlock = useProjectStore.getState().circuitBlocks?.find((block) => block.boardId === boardB.id);
    const definition = defaultComponents.find((component) => component.pins.length > 0);
    expect(foreignBlock).toBeDefined();
    expect(definition).toBeDefined();

    expect(() => useProjectStore.getState().addProjectComponentFromLibrary(definition!, boardA.id, foreignBlock!.id))
      .toThrow('The selected circuit block does not belong to the target board.');
  });

  it('does not guess the first board for PCB constraints in an ambiguous multi-board project', () => {
    const store = useProjectStore.getState();
    store.addBoard({ name: 'Controller PCB', dimensionsMm: '40 x 30' });
    useProjectStore.getState().addBoard({ name: 'Sensor PCB', dimensionsMm: '20 x 20' });
    useProjectStore.getState().setActiveBoard('');

    useProjectStore.getState().generatePCBConstraintsFromBoard();
    expect(useProjectStore.getState().pcbConstraints).toEqual([]);
  });

  it('does not manufacture a board-outline dimension constraint when dimensions are unknown', () => {
    const board = useProjectStore.getState().addBoard({ name: 'Unknown Outline PCB' });
    useProjectStore.getState().setActiveBoard(board.id);

    useProjectStore.getState().generatePCBConstraintsFromBoard();
    const constraints = useProjectStore.getState().pcbConstraints || [];

    expect(constraints.some((constraint) => constraint.constraintType === 'Board Outline')).toBe(false);
    expect(constraints.some((constraint) => constraint.value === '100x60')).toBe(false);
  });

  it('creates repair components unplaced on the explicit real board', () => {
    const board = useProjectStore.getState().addBoard({ name: 'Repair Target PCB' });
    useProjectStore.getState().setActiveBoard(board.id);

    useProjectStore.getState().addI2cPullupResistor();
    const created = useProjectStore.getState().boardComponents || [];

    expect(created).toHaveLength(2);
    expect(created.every((component) => component.boardId === board.id)).toBe(true);
    expect(created.every((component) => component.placementStatus === 'Unplaced')).toBe(true);
    expect(created.every((component) => component.placementX == null && component.placementY == null)).toBe(true);
  });
});
