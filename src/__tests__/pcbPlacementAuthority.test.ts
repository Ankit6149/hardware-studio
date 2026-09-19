import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCanonicalPcbPlacement,
  resolvePcbPlacement,
  stripLegacyPcbPlacementPatch,
} from '../lib/pcb/pcbPlacementAuthority';
import { runBoardDRC } from '../lib/boardDRC';
import { useProjectStore } from '../store/projectStore';
import type { BoardComponent, Project } from '../types';

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

  it('does not let stale flat coordinates affect DRC when canonical placement exists', () => {
    const component = makeComponent({
      id: 'cmp_drc_authority',
      referenceDesignator: 'U1',
      placementX: 999,
      placementY: 999,
      pcb: {
        placed: true,
        xMm: 10,
        yMm: 10,
        rotationDeg: 0,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
    });

    const project = {
      activeBoardId: 'board_authority_1',
      boards: [{
        id: 'board_authority_1',
        name: 'Authority Board',
        boardType: 'Main PCB',
        status: 'Draft',
      }],
      boardComponents: [component],
      boardOutlines: [{
        id: 'outline_authority_1',
        boardId: 'board_authority_1',
        width: 50,
        height: 40,
        units: 'mm',
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 40 },
          { x: 0, y: 40 },
        ],
      }],
      traces: [],
      vias: [],
      drillHoles: [],
      keepoutZones: [],
      nets: [],
      pcbLayers: [],
      pcbRules: [],
      padNetAssignments: [],
    } as unknown as Project;

    const results = runBoardDRC(project);

    expect(results.some((result) => (
      result.linkedObjectId === component.id
      && result.title.startsWith('Component outside board')
    ))).toBe(false);
  });

  it('keeps generic editor layout movement separate from PCB engineering geometry', () => {
    const component = makeComponent({
      id: 'cmp_editor_projection',
      pcb: {
        placed: true,
        xMm: 12,
        yMm: 14,
        rotationDeg: 45,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
    });

    useProjectStore.setState({
      boardComponents: [applyCanonicalPcbPlacement(component, component.pcb!)],
      editorLayouts: {
        product: [],
        mechanical: [],
        assembly: [],
        board: [],
        components: [{
          id: 'editor_component_projection',
          mode: 'components',
          sourceType: 'component',
          sourceId: component.id,
          label: component.referenceDesignator,
          kind: 'component',
          x: 100,
          y: 100,
          width: 80,
          height: 40,
          layer: 'Components',
        }],
        circuits: [],
        nets: [],
        power: [],
        pins: [],
        firmware: [],
        testing: [],
        handoff: [],
      },
    });

    useProjectStore.getState().updateEditorObjectPosition(
      'components',
      'editor_component_projection',
      500,
      600,
    );
    useProjectStore.getState().updateEditorObjectRotation(
      'components',
      'editor_component_projection',
      180,
    );

    const updated = useProjectStore.getState().boardComponents?.find(
      (candidate) => candidate.id === component.id,
    );

    expect(updated?.pcb).toMatchObject({
      xMm: 12,
      yMm: 14,
      rotationDeg: 45,
      side: 'Top',
      placementStatus: 'Placed',
    });
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
