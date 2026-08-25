import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, migrateProjectSchema } from '../lib/projectMigrations';

function legacyProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'legacy-project',
    projectName: 'Legacy Project',
    description: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: '1',
    schemaVersion: 5,
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    ...overrides,
  };
}

describe('project migration determinism and truthful unresolved geometry', () => {
  it('assigns stable component IDs and remains idempotent', () => {
    const input = legacyProject({
      boards: [{ id: 'board-real', name: 'Main', boardType: 'Main PCB' }],
      boardComponents: [{
        boardId: 'board_main',
        referenceDesignator: 'U1',
        componentName: 'Controller',
        partNumber: 'MCU-1',
        footprint: 'QFN-32',
        pins: [{ pinNumber: '1', pinName: 'VCC' }],
      }],
    });

    const first = migrateProjectSchema(input);
    const second = migrateProjectSchema(input);
    const repeated = migrateProjectSchema(first);

    const firstComponent = first.boardComponents?.[0];
    const secondComponent = second.boardComponents?.[0];
    const repeatedComponent = repeated.boardComponents?.[0];

    expect(CURRENT_SCHEMA_VERSION).toBe(6);
    expect(first.schemaVersion).toBe(6);
    expect(firstComponent?.id).toMatch(/^cmp_legacy_/);
    expect(secondComponent?.id).toBe(firstComponent?.id);
    expect(repeatedComponent?.id).toBe(firstComponent?.id);
    expect(firstComponent?.pins?.[0].componentId).toBe(firstComponent?.id);
    expect(repeatedComponent?.pins?.[0].componentId).toBe(firstComponent?.id);
    expect(firstComponent?.boardId).toBe('board-real');
  });

  it('does not invent schematic coordinates for an unplaced component', () => {
    const migrated = migrateProjectSchema(legacyProject({
      boardComponents: [{
        referenceDesignator: 'U2',
        componentName: 'Sensor',
        schematic: { placed: true },
      }],
    }));

    const schematic = migrated.boardComponents?.[0].schematic;
    expect(schematic?.placed).toBe(false);
    expect(schematic?.x).toBeUndefined();
    expect(schematic?.y).toBeUndefined();
  });

  it('preserves valid zero schematic coordinates', () => {
    const migrated = migrateProjectSchema(legacyProject({
      boardComponents: [{
        referenceDesignator: 'U3',
        componentName: 'Zero Origin Part',
        schematic: { placed: true, x: 0, y: 0, rotation: 90 },
      }],
    }));

    const schematic = migrated.boardComponents?.[0].schematic;
    expect(schematic).toMatchObject({ placed: true, x: 0, y: 0, rotation: 90 });
  });

  it('does not guess a board when a legacy sentinel is ambiguous', () => {
    const migrated = migrateProjectSchema(legacyProject({
      boards: [
        { id: 'board-a', name: 'A', boardType: 'Main PCB' },
        { id: 'board-b', name: 'B', boardType: 'Daughterboard' },
      ],
      boardComponents: [{
        boardId: 'board_main',
        referenceDesignator: 'U4',
        componentName: 'Ambiguous Part',
      }],
    }));

    expect(migrated.boardComponents?.[0].boardId).toBe('');
  });

  it('gives duplicate legacy components distinct but repeatable IDs by input position', () => {
    const component = {
      referenceDesignator: 'R1',
      componentName: 'Resistor',
      partNumber: 'R-10K',
    };
    const input = legacyProject({ boardComponents: [component, component] });

    const first = migrateProjectSchema(input).boardComponents || [];
    const second = migrateProjectSchema(input).boardComponents || [];

    expect(first[0].id).not.toBe(first[1].id);
    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id));
  });
});
