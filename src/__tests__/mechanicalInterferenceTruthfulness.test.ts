import { describe, expect, it } from 'vitest';
import type { BoardComponent, MechanicalBody, Project } from '../types';
import { checkMechanicalInterference } from '../lib/mechanical/mechanicalGeometry';

function project(input: Partial<Project>): Project {
  return {
    boards: [],
    boardComponents: [],
    mechanicalBodies: [],
    mechanicalObjects: [],
    ...input,
  } as Project;
}

const explicitBatteryBody: MechanicalBody = {
  id: 'battery-body',
  name: 'Battery body',
  objectType: 'Battery',
  xMm: 0,
  yMm: 0,
  zMm: 0,
  widthMm: 20,
  heightMm: 20,
  depthMm: 8,
};

const explicitPlacedComponent: BoardComponent = {
  id: 'component-1',
  boardId: 'board-real',
  referenceDesignator: 'U1',
  componentName: 'Controller',
  componentType: 'IC',
  value: 'MCU',
  packageName: 'QFN',
  footprint: 'QFN',
  partNumber: 'MCU-1',
  placementCriticality: 'Low',
  notes: '',
  pcb: {
    placed: true,
    xMm: 5,
    yMm: 5,
    rotationDeg: 0,
    side: 'Top',
    locked: false,
    placementStatus: 'Placed',
  },
  packageDimensions: { widthMm: 8, heightMm: 8, heightZMm: 2 },
};

describe('mechanical interference input truthfulness', () => {
  it('does not invent a clearance value when there is nothing explicit to compare', () => {
    const result = checkMechanicalInterference(project({}));

    expect(result.hasCollision).toBe(false);
    expect(result.collisions).toEqual([]);
    expect(result.minClearanceMm).toBeNull();
  });

  it('does not treat legacy board_main as an active physical board', () => {
    const result = checkMechanicalInterference(project({
      activeBoardId: 'board_main',
      mechanicalBodies: [explicitBatteryBody],
      boardComponents: [{ ...explicitPlacedComponent, boardId: 'board_main' }],
    }));

    expect(result.hasCollision).toBe(false);
    expect(result.minClearanceMm).toBeNull();
  });

  it('uses an explicitly selected real board and explicit package geometry for screening', () => {
    const result = checkMechanicalInterference(project({
      activeBoardId: 'board-real',
      boards: [{ id: 'board-real', name: 'Real board', boardType: 'Main PCB' }],
      mechanicalBodies: [explicitBatteryBody],
      boardComponents: [explicitPlacedComponent],
    }));

    expect(result.hasCollision).toBe(true);
    expect(result.collisions.length).toBeGreaterThan(0);
    expect(result.minClearanceMm).toBe(0);
  });

  it('does not fabricate package dimensions for a placed component', () => {
    const withoutPackageDimensions: BoardComponent = {
      ...explicitPlacedComponent,
      packageDimensions: undefined,
    };
    const result = checkMechanicalInterference(project({
      activeBoardId: 'board-real',
      boards: [{ id: 'board-real', name: 'Real board', boardType: 'Main PCB' }],
      mechanicalBodies: [explicitBatteryBody],
      boardComponents: [withoutPackageDimensions],
    }));

    expect(result.hasCollision).toBe(false);
    expect(result.minClearanceMm).toBeNull();
  });
});
