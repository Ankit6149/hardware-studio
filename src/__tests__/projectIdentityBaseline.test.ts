import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW_STATE } from '../components/board/boardInteraction';
import { CURRENT_SCHEMA_VERSION, migrateProjectSchema } from '../lib/projectMigrations';

describe('project identity baseline', () => {
  it('starts the PCB editor without inventing an active board', () => {
    expect(DEFAULT_VIEW_STATE.activeBoardId).toBeNull();
  });

  it('keeps missing board and circuit-block relationships explicitly unassigned', () => {
    const migrated = migrateProjectSchema({
      boardComponents: [
        {
          id: 'component-unassigned',
          referenceDesignator: 'U1',
          componentName: 'Controller',
        },
      ],
    });

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.boardComponents?.[0]?.boardId).toBe('');
    expect(migrated.boardComponents?.[0]?.circuitBlockId).toBeUndefined();
  });

  it('repairs old sentinel relationships when exactly one real target exists', () => {
    const migrated = migrateProjectSchema({
      boards: [{ id: 'board-real', name: 'Main controller' }],
      circuitBlocks: [{ id: 'block-real', name: 'Compute' }],
      boardComponents: [
        {
          id: 'component-legacy',
          referenceDesignator: 'U1',
          componentName: 'Controller',
          boardId: 'board_0',
          circuitBlockId: 'block_0',
        },
      ],
    });

    expect(migrated.boardComponents?.[0]?.boardId).toBe('board-real');
    expect(migrated.boardComponents?.[0]?.circuitBlockId).toBe('block-real');
  });

  it('does not guess a target for legacy sentinels in an ambiguous multi-board project', () => {
    const migrated = migrateProjectSchema({
      boards: [
        { id: 'board-a', name: 'Controller' },
        { id: 'board-b', name: 'Sensors' },
      ],
      circuitBlocks: [
        { id: 'block-a', name: 'Compute' },
        { id: 'block-b', name: 'Power' },
      ],
      boardComponents: [
        {
          id: 'component-legacy',
          referenceDesignator: 'U1',
          componentName: 'Controller',
          boardId: 'board-main',
          circuitBlockId: 'block_0',
        },
      ],
    });

    expect(migrated.boardComponents?.[0]?.boardId).toBe('');
    expect(migrated.boardComponents?.[0]?.circuitBlockId).toBeUndefined();
  });
});
