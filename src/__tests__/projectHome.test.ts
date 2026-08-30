import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { buildProjectHomeModel } from '../lib/projectHome';

type Requirement = NonNullable<Project['requirements']>[number];
type ArchitectureNode = NonNullable<Project['architectureNodes']>[number];
type BoardComponent = NonNullable<Project['boardComponents']>[number];
type Revision = NonNullable<Project['revisions']>[number];

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'home-fixture',
    projectName: 'Home Fixture',
    description: '',
    createdAt: '2026-08-30T00:00:00.000Z',
    updatedAt: '2026-08-30T00:00:00.000Z',
    version: '1',
    schemaVersion: 6,
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [],
    architectureNodes: [],
    architectureConnections: [],
    boards: [],
    boardComponents: [],
    nets: [],
    traces: [],
    boardOutlines: [],
    mechanicalObjects: [],
    firmwareModules: [],
    firmwareSourceFiles: [],
    firmwareBuildRecords: [],
    validationTests: [],
    validationRuns: [],
    revisions: [],
    ...overrides,
  } as Project;
}

describe('Project Home guidance', () => {
  it('starts with measurable intent instead of exposing the rest of the product taxonomy', () => {
    const model = buildProjectHomeModel(project());

    expect(model.nextAction.viewId).toBe('requirements');
    expect(model.nextAction.title).toContain('measurable requirement');
    expect(model.attention[0]).toMatchObject({
      id: 'requirements-missing',
      viewId: 'requirements',
    });
    expect(model.areas.find((area) => area.id === 'define')?.state).toBe('Not started');
  });

  it('moves into Electronics only after requirements and architecture evidence exist', () => {
    const model = buildProjectHomeModel(project({
      requirements: [{
        id: 'req-1',
        title: 'Measure ambient temperature',
        description: 'Report ambient temperature within the defined tolerance.',
        type: 'Functional',
        priority: 'Must Have',
        status: 'Draft',
        acceptanceCriteria: ['Temperature can be measured and reported.'],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedTestIds: [],
      } as unknown as Requirement],
      architectureNodes: [{
        id: 'arch-1',
        name: 'Environmental sensing',
        category: 'Function',
        description: 'Measure ambient environment.',
        x: 0,
        y: 0,
      } as unknown as ArchitectureNode],
    }));

    expect(model.nextAction.viewId).toBe('component-library');
    expect(model.nextAction.title).toContain('component');
    expect(model.areas.find((area) => area.id === 'define')?.state).toBe('Evidence present');
    expect(model.areas.find((area) => area.id === 'electronics')?.state).toBe('Not started');
  });

  it('surfaces real Electronics blockers instead of treating component count as readiness', () => {
    const model = buildProjectHomeModel(project({
      requirements: [{ id: 'req-1' } as unknown as Requirement],
      architectureNodes: [{ id: 'arch-1' } as unknown as ArchitectureNode],
      boardComponents: [{
        id: 'cmp-1',
        referenceDesignator: 'U1',
        componentName: 'Controller',
        libraryId: 'mcu',
        pins: [],
        boardId: '',
        quantity: 1,
        status: 'Draft',
        schematic: { placed: false, rotation: 0, locked: false },
        pcb: { placed: false, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Unplaced' },
      } as unknown as BoardComponent],
    }));

    expect(model.nextAction.viewId).toBe('component-library');
    expect(model.nextAction.detail).toContain('footprint/package');
    expect(model.areas.find((area) => area.id === 'electronics')?.state).toBe('In progress');
    expect(model.attention.some((item) => item.detail.includes('footprint/package'))).toBe(true);
  });

  it('never calls one mechanical object or one revision ready for review', () => {
    const model = buildProjectHomeModel(project({
      mechanicalObjects: [{
        id: 'body-1',
        name: 'Envelope',
        type: 'Outer Profile',
        shape: 'rect',
        layer: 'Enclosure',
        xMm: 0,
        yMm: 0,
        widthMm: 20,
        heightMm: 20,
        depthMm: 8,
        rotationDeg: 0,
        locked: false,
        visible: true,
      }],
      revisions: [{ id: 'rev-1' } as unknown as Revision],
    }));

    expect(model.areas.find((area) => area.id === 'mechanical')?.state).toBe('In progress');
    expect(model.areas.find((area) => area.id === 'release')?.state).toBe('In progress');
    expect(model.areas.find((area) => area.id === 'release')?.evidence).toContain('explicit readiness review');
  });

  it('distinguishes validation definitions from actual run evidence', () => {
    const model = buildProjectHomeModel(project({
      validationTests: [{
        id: 'test-1',
        name: 'Temperature accuracy',
        stage: 'EVT',
        category: 'Requirement',
        linkedRequirementIds: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedNetIds: [],
        linkedFirmwareModuleIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        status: 'Not Started',
        evidence: [],
      }],
    }));

    expect(model.areas.find((area) => area.id === 'validation')?.state).toBe('In progress');
    expect(model.areas.find((area) => area.id === 'validation')?.evidence).toContain('0 recorded runs');
  });

  it('does not mark a firmware module reviewable merely because the module exists', () => {
    const model = buildProjectHomeModel(project({
      firmwareModules: [{
        id: 'fw-1',
        name: 'Sensor driver',
        type: 'Driver',
        description: '',
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedPinIds: [],
        linkedNetIds: [],
        linkedTestIds: [],
        dependencies: [],
        sourceFiles: [],
        status: 'Draft',
      }],
    }));

    expect(model.areas.find((area) => area.id === 'firmware')?.state).toBe('In progress');
    expect(model.areas.find((area) => area.id === 'firmware')?.evidence).toContain('0 reviewable');
  });
});
