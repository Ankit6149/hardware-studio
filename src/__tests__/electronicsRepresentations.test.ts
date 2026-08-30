import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { BoardComponent, BoardItem, BoardOutline, BOMItem } from '../types';
import { deriveElectronicsRepresentationStatuses } from '../components/electronics/ElectronicsRepresentationStrip';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function component(overrides: Partial<BoardComponent> = {}): BoardComponent {
  return {
    id: 'component-u1',
    boardId: 'board-main',
    referenceDesignator: 'U1',
    componentName: 'Controller',
    componentType: 'MCU',
    value: 'MCU',
    packageName: '',
    footprint: '',
    partNumber: '',
    placementCriticality: 'High',
    notes: '',
    ...overrides,
  };
}

const board: BoardItem = {
  id: 'board-main',
  name: 'Main PCB',
  boardType: 'Main PCB',
};

const outline: BoardOutline = {
  id: 'outline-main',
  boardId: 'board-main',
  width: 40,
  height: 25,
  units: 'mm',
};

describe('Electronics visual representation switching', () => {
  it('shows incomplete authoring surfaces but blocks 3D when evidence is unresolved', () => {
    const statuses = deriveElectronicsRepresentationStatuses(component(), [], [board], []);

    expect(statuses).toEqual([
      expect.objectContaining({ id: 'schematic', state: 'incomplete', stateLabel: 'Unplaced', enabled: true }),
      expect.objectContaining({ id: 'pcb', state: 'blocked', stateLabel: 'No footprint', enabled: true }),
      expect.objectContaining({ id: 'bom', state: 'incomplete', stateLabel: 'Unlinked', enabled: true }),
      expect.objectContaining({ id: '3d', state: 'blocked', stateLabel: 'Unresolved', enabled: false }),
    ]);
  });

  it('marks each representation ready only from explicit canonical evidence', () => {
    const readyComponent = component({
      footprint: 'QFN-32',
      schematic: { placed: true, x: 120, y: 80 },
      pcb: {
        placed: true,
        xMm: 10,
        yMm: 12,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
      packageDimensions: { widthMm: 5, heightMm: 5, heightZMm: 0.9 },
      bomItemId: 'bom-u1',
    });
    const bom: BOMItem[] = [{
      id: 'bom-u1',
      componentId: readyComponent.id,
      blockName: 'Controller',
      candidateComponent: 'MCU',
      stage: 'Prototype',
      status: 'Sourced',
    }];

    const statuses = deriveElectronicsRepresentationStatuses(readyComponent, bom, [board], [outline]);
    expect(statuses.every((status) => status.state === 'ready')).toBe(true);
    expect(statuses.find((status) => status.id === '3d')?.enabled).toBe(true);
  });

  it('does not treat a board or package alone as sufficient 3D evidence', () => {
    const incomplete = component({
      footprint: 'QFN-32',
      placementX: 0,
      placementY: 0,
      packageDimensions: { widthMm: 5, heightMm: 5, heightZMm: 0 },
    });

    const threeD = deriveElectronicsRepresentationStatuses(incomplete, [], [board], [outline])
      .find((status) => status.id === '3d');
    expect(threeD).toMatchObject({ state: 'blocked', enabled: false, stateLabel: 'Unresolved' });
  });

  it('uses one predictable representation strip rather than another navigation layer', () => {
    const strip = source('../components/electronics/ElectronicsRepresentationStrip.tsx');
    const shell = source('../components/editor/EngineeringEditorShell.tsx');

    expect(strip).toContain("label: 'Symbol'");
    expect(strip).toContain("label: 'PCB'");
    expect(strip).toContain("label: 'BOM'");
    expect(strip).toContain("label: '3D'");
    expect(strip).toContain("setActiveView('schematic-editor')");
    expect(strip).toContain("setActiveView('board-designer')");
    expect(strip).toContain("setActiveView('bom')");
    expect(strip).toContain("requestMechanicalMode('webgl-3d')");
    expect(strip).toContain("setActiveView('mechanical-studio')");
    expect(strip).not.toContain('window.location');
    expect(strip).not.toContain('Dialog');

    expect(shell).toContain("'schematic-editor': 'schematic'");
    expect(shell).toContain("'board-designer': 'pcb'");
    expect(shell).toContain('<ElectronicsRepresentationStrip');
  });

  it('keeps the same canonical component selected before changing representation', () => {
    const strip = source('../components/electronics/ElectronicsRepresentationStrip.tsx');

    expect(strip).toContain("entity: 'component-instance'");
    expect(strip).toContain('componentId: component.id');
    expect(strip).toContain('boardId: component.boardId');
    expect(strip).toContain('setActiveBoard(component.boardId)');
    expect(strip).toContain('if (!status?.enabled || representation === current) return;');
  });
});