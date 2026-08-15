import { describe, expect, it } from 'vitest';
import { runBoardDRC } from '../lib/boardDRC';
import { Project } from '../types';

describe('board DRC identity boundary', () => {
  it('blocks instead of guessing a board when no active board is selected', () => {
    const results = runBoardDRC({
      activeBoardId: '',
      boards: [{ id: 'board-real', name: 'Controller PCB' }],
    } as unknown as Project);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      severity: 'Blocker',
      title: 'No active board selected',
      linkedObjectType: 'project',
    });
  });

  it('rejects stale active-board references instead of checking unrelated PCB data', () => {
    const results = runBoardDRC({
      activeBoardId: 'board-stale',
      boards: [{ id: 'board-real', name: 'Controller PCB' }],
      boardOutlines: [{ id: 'outline-real', boardId: 'board-real', width: 40, height: 30 }],
    } as unknown as Project);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      severity: 'Blocker',
      title: 'Active board reference is invalid',
    });
  });

  it('does not borrow another board outline when the selected board has none', () => {
    const results = runBoardDRC({
      activeBoardId: 'board-a',
      boards: [
        { id: 'board-a', name: 'Controller PCB' },
        { id: 'board-b', name: 'Sensor PCB' },
      ],
      boardOutlines: [
        { id: 'outline-b', boardId: 'board-b', width: 40, height: 30 },
      ],
      boardComponents: [],
      traces: [],
      vias: [],
      drillHoles: [],
      keepoutZones: [],
      nets: [],
      pcbLayers: [],
      pcbRules: [],
      padNetAssignments: [],
    } as unknown as Project);

    expect(results.some((result) => result.title === 'Missing board outline' && result.linkedObjectId === 'board-a')).toBe(true);
    expect(results.some((result) => result.linkedObjectId === 'outline-b')).toBe(false);
  });
});
