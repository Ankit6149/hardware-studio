import { describe, expect, it } from 'vitest';
import { evaluateManufacturingContext } from '../lib/manufacturing/manufacturingContext';
import { Project } from '../types';

function baseProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'mfg-context',
    projectName: 'Manufacturing Context',
    description: '',
    createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    version: '1.0.0',
    activeView: 'pcb-board',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    activeBoardId: 'board-a',
    boards: [{ id: 'board-a', name: 'Board A', boardType: 'Rigid', layerCount: 2, status: 'Draft' }],
    boardOutlines: [{ id: 'outline-a', boardId: 'board-a', width: 50, height: 40, units: 'mm' }],
    boardComponents: [],
    traces: [],
    vias: [],
    drillHoles: [],
    copperShapes: [],
    ...overrides,
  } as Project;
}

describe('manufacturing context preflight', () => {
  it('requires an explicit board outline rather than inferring a rectangle from dimensions', () => {
    const result = evaluateManufacturingContext(baseProject({
      boards: [{ id: 'board-a', name: 'Board A', boardType: 'Rigid', dimensionsMm: '50 x 40 mm', layerCount: 2, status: 'Draft' }],
      boardOutlines: [],
    }));

    expect(result.ready).toBe(false);
    expect(result.blockers.some((blocker) => blocker.code === 'MISSING_BOARD_GEOMETRY')).toBe(true);
  });

  it('preserves zero as a valid via coordinate when physical diameters are explicit', () => {
    const result = evaluateManufacturingContext(baseProject({
      vias: [{
        id: 'via-zero',
        boardId: 'board-a',
        xMm: 0,
        yMm: 0,
        drillDiameterMm: 0.3,
        padDiameterMm: 0.6,
      }],
    }));

    expect(result.ready).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it('blocks routed traces that do not carry real width or a resolvable copper side', () => {
    const result = evaluateManufacturingContext(baseProject({
      traces: [{
        id: 'trace-bad',
        boardId: 'board-a',
        layerId: 'mystery-layer',
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      }],
    }));

    expect(result.ready).toBe(false);
    expect(result.blockers.some((blocker) => blocker.code === 'INVALID_TRACE_WIDTH')).toBe(true);
    expect(result.blockers.some((blocker) => blocker.code === 'INVALID_TRACE_LAYER')).toBe(true);
  });

  it('accepts finite routed geometry with explicit physical width and top/bottom layer identity', () => {
    const result = evaluateManufacturingContext(baseProject({
      traces: [{
        id: 'trace-good',
        boardId: 'board-a',
        layerId: 'top-copper',
        width: 0.2,
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      }],
    }));

    expect(result.ready).toBe(true);
    expect(result.context?.traceLayerSides['trace-good']).toBe('Top');
  });

  it('blocks vias whose copper pad cannot physically contain the drill', () => {
    const result = evaluateManufacturingContext(baseProject({
      vias: [{
        id: 'via-bad',
        boardId: 'board-a',
        x: 5,
        y: 5,
        drillDiameter: 0.6,
        outerDiameter: 0.5,
      }],
    }));

    expect(result.ready).toBe(false);
    expect(result.blockers.some((blocker) => blocker.code === 'INVALID_VIA_DIAMETERS')).toBe(true);
  });

  it('blocks drill holes without a recorded positive diameter', () => {
    const result = evaluateManufacturingContext(baseProject({
      drillHoles: [{ id: 'drill-bad', boardId: 'board-a', x: 4, y: 8 }],
    }));

    expect(result.ready).toBe(false);
    expect(result.blockers.some((blocker) => blocker.code === 'INVALID_DRILL_DIAMETER')).toBe(true);
  });

  it('fails closed when copper shapes exist but the current serializer cannot preserve them', () => {
    const result = evaluateManufacturingContext(baseProject({
      copperShapes: [{
        id: 'pour-a',
        boardId: 'board-a',
        layerId: 'top-copper',
        shapeType: 'Polygon',
        points: [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 5 }],
      }],
    }));

    expect(result.ready).toBe(false);
    expect(result.blockers.some((blocker) => blocker.code === 'UNSERIALIZED_COPPER_SHAPE')).toBe(true);
  });
});
