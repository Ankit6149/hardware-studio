import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultComponents } from '../lib/components/componentLibrary';
import { useProjectStore } from '../store/projectStore';

const componentLibrarySource = readFileSync(
  resolve(process.cwd(), 'src/components/component-library/ComponentLibraryWorkbench.tsx'),
  'utf8',
);

describe('component library identity boundary', () => {
  beforeEach(() => {
    const state = useProjectStore.getState();
    useProjectStore.setState({
      ...state,
      boards: [],
      circuitBlocks: [],
      boardComponents: [],
      bom: [],
      activeBoardId: '',
    });
  });

  it('does not synthesize placeholder board or circuit-block IDs in the library workbench', () => {
    expect(componentLibrarySource).not.toContain('board_0');
    expect(componentLibrarySource).not.toContain('block_0');
    expect(componentLibrarySource).toContain('addProjectComponentFromLibrary');
    expect(componentLibrarySource).toContain("setActiveView('board-settings')");
    expect(componentLibrarySource).toContain('A real board is required');
  });

  it('creates a linked Not Started BOM record when a library definition is added to a real board', () => {
    const store = useProjectStore.getState();
    const board = store.addBoard({
      name: 'Identity Test Board',
      boardType: 'Main PCB',
      dimensionsMm: '60 x 40',
      layerCount: 2,
      substrate: 'FR4',
    });
    const definition = defaultComponents.find((component) => component.pins.length > 0);
    expect(definition).toBeDefined();

    const component = useProjectStore.getState().addProjectComponentFromLibrary(definition!, board.id);
    const updated = useProjectStore.getState();
    const bomItem = updated.bom.find((item) => item.id === component.bomItemId);

    expect(component.boardId).toBe(board.id);
    expect(component.bomItemId).toBeTruthy();
    expect(bomItem).toMatchObject({
      componentId: component.id,
      status: 'Not Started',
      candidateComponent: definition!.name,
    });
  });
});
