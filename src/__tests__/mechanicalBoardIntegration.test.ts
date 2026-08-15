import { describe, expect, it } from 'vitest';
import {
  buildMechanicalBoardEnvelope,
  evaluateMechanicalBoardContext,
} from '../lib/mechanical/boardMechanicalContext';
import type { Project } from '../types';

function projectBase(overrides: Partial<Project> = {}): Project {
  return {
    id: 'mechanical-board-test',
    projectName: 'Mechanical Board Test',
    description: '',
    createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    version: '5',
    activeView: 'mechanical-studio',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    boards: [],
    boardComponents: [],
    boardOutlines: [],
    mechanicalObjects: [],
    ...overrides,
  };
}

describe('PCB → mechanical board context', () => {
  it('never treats text board dimensions as authoritative outline geometry', () => {
    const project = projectBase({
      activeBoardId: 'board-main',
      boards: [{
        id: 'board-main',
        name: 'Main PCB',
        boardType: 'Main PCB',
        dimensionsMm: '52 x 31',
      }],
    });

    expect(evaluateMechanicalBoardContext(project)).toMatchObject({
      boardId: 'board-main',
      syncState: 'missing-outline',
      widthMm: null,
      heightMm: null,
    });
    expect(buildMechanicalBoardEnvelope(project)).toBeNull();
  });

  it('derives a locked board-linked envelope from explicit outline geometry', () => {
    const project = projectBase({
      activeBoardId: 'board-main',
      boards: [{ id: 'board-main', name: 'Main PCB', boardType: 'Main PCB' }],
      boardOutlines: [{
        id: 'outline-main',
        boardId: 'board-main',
        units: 'mm',
        points: [{ x: 4, y: 5 }, { x: 54, y: 5 }, { x: 54, y: 35 }, { x: 4, y: 35 }],
      }],
      boardComponents: [{
        id: 'component-u1',
        boardId: 'board-main',
        referenceDesignator: 'U1',
        componentName: 'Controller',
        componentType: 'MCU',
        value: '',
        packageName: 'QFN',
        footprint: 'QFN-32',
        partNumber: '',
        placementCriticality: 'High',
        notes: '',
      }],
    });

    const envelope = buildMechanicalBoardEnvelope(project);
    expect(envelope).toMatchObject({
      type: 'Board Zone',
      shape: 'rect',
      xMm: 4,
      yMm: 5,
      widthMm: 50,
      heightMm: 30,
      linkedBoardId: 'board-main',
      linkedComponentIds: ['component-u1'],
      locked: true,
    });
  });

  it('reports stale evidence after the authoritative PCB outline changes', () => {
    const source = projectBase({
      activeBoardId: 'board-main',
      boards: [{ id: 'board-main', name: 'Main PCB', boardType: 'Main PCB' }],
      boardOutlines: [{
        id: 'outline-main',
        boardId: 'board-main',
        units: 'mm',
        width: 40,
        height: 25,
      }],
    });
    const envelope = buildMechanicalBoardEnvelope(source);
    expect(envelope).not.toBeNull();

    const synced = projectBase({
      ...source,
      mechanicalObjects: [{ id: 'board-envelope', ...envelope! }],
    });
    expect(evaluateMechanicalBoardContext(synced).syncState).toBe('synced');

    const changed: Project = {
      ...synced,
      boardOutlines: [{
        id: 'outline-main',
        boardId: 'board-main',
        units: 'mm',
        width: 44,
        height: 25,
      }],
    };
    expect(evaluateMechanicalBoardContext(changed).syncState).toBe('stale');
  });
});
