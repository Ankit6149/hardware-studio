import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCanonicalPcbPlacement,
  resolvePcbPlacement,
  stripLegacyPcbPlacementPatch,
} from '../lib/pcb/pcbPlacementAuthority';
import { useProjectStore } from '../store/projectStore';
import type { BoardComponent } from '../types';

function makeComponent(overrides: Partial<BoardComponent> = {}): BoardComponent {
  return {
    id: 'cmp_authority_1',
    boardId: 'board_authority_1',
    referenceDesignator: 'U1',
    componentName: 'Controller',
    componentType: 'MCU',
    value: '',
    packageName: 'QFN',
    footprint: 'QFN40',
    partNumber: '',
    placementCriticality: 'Medium',
    notes: '',
    pcb: {
      placed: false,
      xMm: undefined,
      yMm: undefined,
      rotationDeg: 0,
      side: 'Top',
      locked: false,
      placementStatus: 'Unplaced',
    },
    ...overrides,
  };
}

describe('PCB placement authority', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useProjectStore.setState({
      boardComponents: [],
      boards: [],
      activeBoardId: '',
    });
  });

  it('prefers canonical nested PCB placement when legacy projection conflicts', () => {
    const component = makeComponent({
      placementX: 900,
      placementY: 800,
      rotationDeg: 180,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Verified',
      pcb: {
        placed: true,
        xMm: 12.5,
        yMm: 8.25,
        rotationDeg: 90,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
    });

    expect(resolvePcbPlacement(component)).toMatchObject({
      source: 'canonical',
      placed: true,
      xMm: 12.5,
      yMm: 8.25,
      rotationDeg: 90,
      side: 'Top',
      locked: false,
      placementStatus: 'Placed',
    });
  });

  it('reads flat placement only as a compatibility source when canonical PCB state is absent', () => {
    const component = makeComponent({
      pcb: undefined,
      placementX: 4,
      placementY: 7,
      rotationDeg: 45,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Placed',
    });

    expect(resolvePcbPlacement(component)).toMatchObject({
      source: 'legacy',
      placed: true,
      xMm: 4,
      yMm: 7,
      rotationDeg: 45,
      side: 'Bottom',
      locked: true,
      placementStatus: 'Placed',
    });
  });

  it('keeps partial coordinate edits unplaced and promotes complete coordinates to needs review', () => {
    const withX = applyCanonicalPcbPlacement(makeComponent(), { xMm: 10 });
    expect(withX.pcb).toMatchObject({
      placed: false,
      xMm: 10,
      yMm: undefined,
      placementStatus: 'Unplaced',
    });

    const complete = applyCanonicalPcbPlacement(withX, { yMm: 20 });
    expect(complete.pcb).toMatchObject({
      placed: true,
      xMm: 10,
      yMm: 20,
      placementStatus: 'Needs Review',
    });

    const cleared = applyCanonicalPcbPlacement(complete, { xMm: undefined });
    expect(cleared.pcb).toMatchObject({
      placed: false,
      xMm: undefined,
      yMm: 20,
      placementStatus: 'Unplaced',
    });
  });

  it('emits flat fields only as a one-way compatibility projection', () => {
    const component = applyCanonicalPcbPlacement(makeComponent(), {
      placed: true,
      xMm: 3.2,
      yMm: 6.4,
      rotationDeg: 270,
      side: 'Bottom',
      locked: true,
      placementStatus: 'Needs Review',
    });

    expect(component.pcb).toMatchObject({
      placed: true,
      xMm: 3.2,
      yMm: 6.4,
      rotationDeg: 270,
      side: 'Bottom',
      locked: true,
      placementStatus: 'Needs Review',
    });
    expect(component).toMatchObject({
      placementX: 3.2,
      placementY: 6.4,
      rotationDeg: 270,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Needs Review',
    });
  });

  it('strips deprecated placement fields from generic component mutations', () => {
    const stripped = stripLegacyPcbPlacementPatch({
      componentName: 'Updated Controller',
      placementX: 100,
      placementY: 200,
      rotationDeg: 90,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Verified',
    });

    expect(stripped).toEqual({ componentName: 'Updated Controller' });
  });

  it('does not let generic store updates overwrite canonical PCB placement', () => {
    const store = useProjectStore.getState();
    store.addBoardComponent(makeComponent({
      id: 'cmp_store_authority',
      pcb: {
        placed: true,
        xMm: 11,
        yMm: 13,
        rotationDeg: 0,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
    }));

    useProjectStore.getState().updateBoardComponent('cmp_store_authority', {
      placementX: 999,
      placementY: 999,
      rotationDeg: 180,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Verified',
    });

    let component = useProjectStore.getState().boardComponents?.find(
      (candidate) => candidate.id === 'cmp_store_authority',
    );
    expect(component?.pcb).toMatchObject({
      xMm: 11,
      yMm: 13,
      rotationDeg: 0,
      side: 'Top',
      locked: false,
      placementStatus: 'Placed',
    });

    useProjectStore.getState().updatePCBPlacement('cmp_store_authority', {
      xMm: 21,
      yMm: 34,
      rotationDeg: 90,
      side: 'Bottom',
      locked: true,
      placementStatus: 'Needs Review',
    });

    component = useProjectStore.getState().boardComponents?.find(
      (candidate) => candidate.id === 'cmp_store_authority',
    );
    expect(component?.pcb).toMatchObject({
      placed: true,
      xMm: 21,
      yMm: 34,
      rotationDeg: 90,
      side: 'Bottom',
      locked: true,
      placementStatus: 'Needs Review',
    });
    expect(component).toMatchObject({
      placementX: 21,
      placementY: 34,
      rotationDeg: 90,
      side: 'Bottom',
      lockedPlacement: true,
      placementStatus: 'Needs Review',
    });
  });
});
