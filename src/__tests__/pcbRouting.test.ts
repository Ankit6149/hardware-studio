import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import {
  resolvePCBAnchor,
  validateRouteStartAnchor,
  validateRouteFinishAnchor,
  beginRouteFromAnchor,
  computeNetConnectivity
} from '../lib/pcb/pcbRoutingEngine';
import { getComponentPads } from '../components/board/boardGeometry';

describe('Slice 2 Production PCB Editor & Routing Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useProjectStore.setState({
      traces: [],
      vias: [],
      drillHoles: [],
      keepoutZones: [],
      boardComponents: []
    });
  });

  it('should enforce activeBoardId for component placement and PCB operations', () => {
    const store = useProjectStore.getState();

    // 1. Create two boards
    const board1 = store.addBoard({ name: 'Main Motherboard' });
    const board2 = store.addBoard({ name: 'Daughter Display Board' });

    expect(board1.id).toBeDefined();
    expect(board2.id).toBeDefined();

    // 2. Select second board
    store.setActiveBoard(board2.id);
    expect(useProjectStore.getState().activeBoardId).toBe(board2.id);

    // 3. Place component on second board using updatePCBPlacement
    store.addBoardComponent({
      id: 'comp_test_u1',
      boardId: board2.id,
      referenceDesignator: 'U1',
      componentName: 'ESP32 Microcontroller',
      componentType: 'MCU',
      footprint: 'QFN40',
      quantity: 1,
      value: 'ESP32-S3',
      partNumber: 'ESP32-S3-WROOM',
      notes: ''
    });

    store.updatePCBPlacement('comp_test_u1', {
      boardId: board2.id,
      placementX: 50,
      placementY: 40,
      side: 'Top',
      placementStatus: 'Placed'
    });

    const comp = useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_test_u1');
    expect(comp?.boardId).toBe(board2.id);
    expect(comp?.placementX).toBe(50);
    expect(comp?.placementY).toBe(40);
    expect(comp?.pcb?.xMm).toBe(50);
    expect(comp?.pcb?.yMm).toBe(40);
    expect(comp?.pcb?.placed).toBe(true);

    // 4. Add via, drill, keepout on second board
    store.addVia({
      boardId: board2.id,
      x: 55,
      y: 45,
      drillDiameter: 0.3,
      outerDiameter: 0.6,
      netId: 'GND',
      fromLayer: 'top-copper',
      toLayer: 'bottom-copper'
    });

    store.addDrillHole({
      boardId: board2.id,
      x: 10,
      y: 10,
      diameter: 3.2,
      plated: false,
      purpose: 'Mounting Hole'
    });

    store.addKeepoutZone({
      boardId: board2.id,
      x: 30,
      y: 30,
      width: 10,
      height: 10,
      shape: 'rect',
      layerScope: 'All',
      reason: 'Antenna Keepout'
    });

    // 5. Verify all objects belong to board2 and not board1
    const state = useProjectStore.getState();
    const board2Vias = (state.vias || []).filter(v => v.boardId === board2.id);
    const board1Vias = (state.vias || []).filter(v => v.boardId === board1.id);
    expect(board2Vias.length).toBe(1);
    expect(board1Vias.length).toBe(0);

    const board2Drills = (state.drillHoles || []).filter(d => d.boardId === board2.id);
    const board1Drills = (state.drillHoles || []).filter(d => d.boardId === board1.id);
    expect(board2Drills.length).toBe(1);
    expect(board1Drills.length).toBe(0);

    const board2Keepouts = (state.keepoutZones || []).filter(k => k.boardId === board2.id);
    const board1Keepouts = (state.keepoutZones || []).filter(k => k.boardId === board1.id);
    expect(board2Keepouts.length).toBe(1);
    expect(board1Keepouts.length).toBe(0);
  });

  it('should reject starting route in empty space and enforce valid route start anchor', () => {
    const store = useProjectStore.getState();
    const activeBoard = store.activeBoardId || 'board-main';

    const anchor = resolvePCBAnchor(
      { x: 100, y: 100 },
      store.boardComponents || [],
      store.padNetAssignments || [],
      store.vias || [],
      store.traces || [],
      activeBoard,
      'top-copper'
    );

    expect(anchor).toBeNull();

    const validation = validateRouteStartAnchor(anchor, 'GND');
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Cannot start route in empty space');
  });

  it('should allow route start from a valid net pad and reject wrong-net finish target', () => {
    const store = useProjectStore.getState();
    const activeBoard = store.activeBoardId || 'board-main';

    store.addBoardComponent({
      id: 'comp_u1',
      boardId: activeBoard,
      referenceDesignator: 'U1',
      componentName: 'LDO Regulator',
      componentType: 'Power',
      footprint: 'SOT23',
      quantity: 1,
      value: '3.3V',
      partNumber: 'AMS1117',
      notes: ''
    });

    store.updatePCBPlacement('comp_u1', {
      boardId: activeBoard,
      placementX: 20,
      placementY: 20
    });

    const compU1 = useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u1')!;
    const padsU1 = getComponentPads(compU1);

    store.addBoardComponent({
      id: 'comp_u2',
      boardId: activeBoard,
      referenceDesignator: 'U2',
      componentName: 'MCU',
      componentType: 'MCU',
      footprint: 'QFN40',
      quantity: 1,
      value: 'MCU',
      partNumber: 'STM32',
      notes: ''
    });

    store.updatePCBPlacement('comp_u2', {
      boardId: activeBoard,
      placementX: 50,
      placementY: 20
    });

    const compU2 = useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u2')!;
    const padsU2 = getComponentPads(compU2);

    store.setPadNetAssignments([
      { id: 'pna1', componentId: 'comp_u1', referenceDesignator: 'U1', padName: padsU1[0].padName, netName: '3V3' },
      { id: 'pna2', componentId: 'comp_u2', referenceDesignator: 'U2', padName: padsU2[0].padName, netName: 'GND' }
    ]);

    const pad1Anchor = resolvePCBAnchor(
      { x: padsU1[0].x, y: padsU1[0].y },
      useProjectStore.getState().boardComponents || [],
      useProjectStore.getState().padNetAssignments || [],
      [],
      [],
      activeBoard,
      'top-copper',
      2.0
    );

    expect(pad1Anchor).not.toBeNull();
    expect(pad1Anchor?.type).toBe('pad');
    expect(pad1Anchor?.netName).toBe('3V3');

    const startVal = validateRouteStartAnchor(pad1Anchor, '3V3');
    expect(startVal.valid).toBe(true);

    const session = beginRouteFromAnchor(pad1Anchor!, activeBoard, 'top-copper');
    expect(session.isRouting).toBe(true);
    expect(session.netName).toBe('3V3');

    const pad2Anchor = resolvePCBAnchor(
      { x: padsU2[0].x, y: padsU2[0].y },
      useProjectStore.getState().boardComponents || [],
      useProjectStore.getState().padNetAssignments || [],
      [],
      [],
      activeBoard,
      'top-copper',
      2.0
    );

    expect(pad2Anchor).not.toBeNull();
    expect(pad2Anchor?.netName).toBe('GND');

    const finishVal = validateRouteFinishAnchor(session.netName, pad2Anchor);
    expect(finishVal.valid).toBe(false);
    expect(finishVal.error).toContain('Wrong Net Connection Rejected');
  });

  it('should support explicit dangling draft creation with targetAnchor dangling status', () => {
    const store = useProjectStore.getState();
    const activeBoard = store.activeBoardId || 'board-main';

    store.addTrace({
      boardId: activeBoard,
      layerId: 'top-copper',
      netId: 'net_sig_1',
      netName: 'SIG_1',
      points: [{ x: 10, y: 10 }, { x: 30, y: 30 }],
      width: 0.15,
      status: 'Draft',
      targetAnchor: {
        type: 'dangling',
        xMm: 30,
        yMm: 30
      }
    });

    const traces = useProjectStore.getState().traces || [];
    expect(traces.length).toBe(1);
    expect(traces[0].status).toBe('Draft');
    expect(traces[0].targetAnchor?.type).toBe('dangling');
    if (traces[0].targetAnchor && 'xMm' in traces[0].targetAnchor) {
      expect(traces[0].targetAnchor.xMm).toBe(30);
    }
  });

  it('should compute net connectivity graph correctly', () => {
    const store = useProjectStore.getState();
    const activeBoard = store.activeBoardId || 'board-main';

    store.addNet({
      netName: 'CLK_1',
      netType: 'Signal',
      voltage: '3.3V',
      currentEstimate: '10mA',
      notes: '',
      protocol: 'Clock'
    });

    store.addBoardComponent({
      id: 'comp_c1',
      boardId: activeBoard,
      referenceDesignator: 'Y1',
      componentName: 'Oscillator',
      componentType: 'Clock',
      footprint: 'SOT23',
      quantity: 1,
      value: '24MHz',
      partNumber: 'OSC24',
      notes: ''
    });

    store.updatePCBPlacement('comp_c1', {
      boardId: activeBoard,
      placementX: 10,
      placementY: 10
    });

    store.addBoardComponent({
      id: 'comp_c2',
      boardId: activeBoard,
      referenceDesignator: 'U1',
      componentName: 'MCU',
      componentType: 'MCU',
      footprint: 'QFN40',
      quantity: 1,
      value: 'MCU',
      partNumber: 'STM32',
      notes: ''
    });

    store.updatePCBPlacement('comp_c2', {
      boardId: activeBoard,
      placementX: 40,
      placementY: 10
    });

    const compC1 = useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_c1')!;
    const padsC1 = getComponentPads(compC1);

    const compC2 = useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_c2')!;
    const padsC2 = getComponentPads(compC2);

    store.setPadNetAssignments([
      { id: 'pna_c1', componentId: 'comp_c1', referenceDesignator: 'Y1', padName: padsC1[0].padName, netName: 'CLK_1' },
      { id: 'pna_c2', componentId: 'comp_c2', referenceDesignator: 'U1', padName: padsC2[0].padName, netName: 'CLK_1' }
    ]);

    let connectivity = computeNetConnectivity(useProjectStore.getState(), activeBoard);
    expect(connectivity['CLK_1']).toBe(false);

    store.addTrace({
      boardId: activeBoard,
      layerId: 'top-copper',
      netId: 'CLK_1',
      netName: 'CLK_1',
      points: [{ x: padsC1[0].x, y: padsC1[0].y }, { x: padsC2[0].x, y: padsC2[0].y }],
      width: 0.15,
      status: 'Routed'
    });

    connectivity = computeNetConnectivity(useProjectStore.getState(), activeBoard);
    expect(connectivity['CLK_1']).toBe(true);
  });
});
