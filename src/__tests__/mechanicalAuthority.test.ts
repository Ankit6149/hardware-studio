import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { calculateReadinessScore } from '../lib/readinessScore';
import { generateEditorLayouts } from '../lib/editorLayoutGenerators';
import {
  mechanicalBodyHasExplicitGeometry,
  mechanicalObjectHasExplicitGeometry,
  resolveMechanicalAuthority,
} from '../lib/mechanical/mechanicalAuthority';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'mechanical-authority-fixture',
    projectName: 'Mechanical Authority Fixture',
    description: '',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    version: '1',
    schemaVersion: 6,
    activeView: 'mechanical',
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
    pcbConstraints: [],
    manufacturingChecklist: [],
    mechanicalZones: [],
    assemblyLayers: [],
    mechanicalObjects: [],
    mechanicalDimensions: [],
    mechanicalBodies: [],
    schematicSymbols: [],
    schematicConnections: [],
    schematicWires: [],
    pcbLayers: [],
    copperShapes: [],
    traces: [],
    vias: [],
    drillHoles: [],
    boardOutlines: [],
    pcbRules: [],
    padNetAssignments: [],
    keepoutZones: [],
    reviewResults: [],
    exportHistory: [],
    firmwareModules: [],
    firmwareStates: [],
    firmwareTransitions: [],
    validationTests: [],
    validationRuns: [],
    editorLayouts: {},
    editorConnections: [],
    ...overrides,
  } as Project;
}

describe('mechanical and assembly engineering authority', () => {
  it('does not treat UI-only editor layouts as mechanical or assembly evidence', () => {
    const source = project({
      projectName: 'The Ring',
      templateName: 'Ring',
      editorLayouts: {
        mechanical: [{
          id: 'fake-shell',
          mode: 'mechanical',
          sourceType: 'mechanical-zone',
          label: 'Outer Shell',
          kind: 'circular-zone',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
        }],
        assembly: [{
          id: 'fake-assembly',
          mode: 'assembly',
          sourceType: 'assembly-layer',
          label: 'Fake assembly step',
          kind: 'layer',
          x: 100,
          y: 100,
          width: 200,
          height: 40,
        }],
      },
    });

    const authority = resolveMechanicalAuthority(source);
    const readiness = calculateReadinessScore(source);
    const generated = generateEditorLayouts(source);

    expect(authority).toMatchObject({
      source: 'empty',
      hasMechanicalEvidence: false,
      hasAssemblyEvidence: false,
    });
    expect(readiness.categories.mechanical).toBe(0);
    expect(readiness.categories.assembly).toBe(0);
    expect(generated.layouts.mechanical).toEqual([]);
    expect(generated.layouts.assembly).toEqual([]);
  });

  it('projects only explicit mechanical engineering objects and dimensions into the UI', () => {
    const source = project({
      mechanicalObjects: [{
        id: 'enclosure',
        name: 'Outer enclosure',
        type: 'Outer Profile',
        shape: 'rect',
        xMm: 2,
        yMm: 3,
        widthMm: 40,
        heightMm: 25,
        depthMm: 8,
        rotationDeg: 0,
        material: 'ABS',
        linkedComponentIds: [],
        locked: false,
        visible: true,
      }],
      mechanicalDimensions: [{
        id: 'width-dimension',
        name: 'Overall width',
        from: { xMm: 2, yMm: 3 },
        to: { xMm: 42, yMm: 3 },
        valueMm: 40,
        linkedObjectIds: ['enclosure'],
      }],
      assemblyLayers: [{
        id: 'assembly-enclosure',
        name: 'Install enclosure',
        order: 1,
        layerType: 'Enclosure',
        material: 'ABS',
        fasteningMethod: 'Snap fit',
        inspectionNote: 'Inspect latch engagement',
        linkedObjects: ['enclosure'],
        notes: '',
      }],
    });

    const authority = resolveMechanicalAuthority(source);
    const readiness = calculateReadinessScore(source);
    const generated = generateEditorLayouts(source);

    expect(authority).toMatchObject({
      source: 'canonical',
      hasMechanicalEvidence: true,
      hasAssemblyEvidence: true,
    });
    expect(authority.engineeringObjects.map((object) => object.id)).toEqual(['enclosure']);
    expect(readiness.categories.mechanical).toBe(100);
    expect(readiness.categories.assembly).toBe(100);

    expect(generated.layouts.mechanical).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceId: 'enclosure',
        label: 'Outer enclosure',
        metadata: expect.objectContaining({
          authoritySource: 'canonical',
          displayProjectionOnly: true,
        }),
      }),
      expect.objectContaining({
        sourceId: 'width-dimension',
        label: 'Overall width: 40 mm',
      }),
    ]));
    expect(generated.layouts.assembly).toEqual([
      expect.objectContaining({
        sourceId: 'assembly-enclosure',
        label: '01. Install enclosure',
        metadata: expect.objectContaining({
          authoritySource: 'canonical',
          method: 'Snap fit',
        }),
      }),
    ]);
  });

  it('does not count incomplete mechanical objects as engineering geometry', () => {
    const object = {
      id: 'incomplete',
      name: 'Incomplete enclosure',
      type: 'Outer Profile' as const,
      shape: 'rect' as const,
      xMm: 0,
      yMm: 0,
      widthMm: 40,
      rotationDeg: 0,
      locked: false,
      visible: true,
    };

    expect(mechanicalObjectHasExplicitGeometry(object)).toBe(false);

    const source = project({ mechanicalObjects: [object] });
    expect(resolveMechanicalAuthority(source).hasMechanicalEvidence).toBe(false);
    expect(calculateReadinessScore(source).categories.mechanical).toBe(0);
  });

  it('accepts a fully specified 3D body as explicit mechanical evidence without inventing dimensions', () => {
    const body = {
      id: 'body-1',
      name: 'Enclosure solid',
      xMm: 0,
      yMm: 0,
      zMm: 0,
      widthMm: 40,
      heightMm: 25,
      depthMm: 8,
    };

    expect(mechanicalBodyHasExplicitGeometry(body)).toBe(true);

    const source = project({ mechanicalBodies: [body] });
    const authority = resolveMechanicalAuthority(source);
    const readiness = calculateReadinessScore(source);

    expect(authority.completeBodies.map((candidate) => candidate.id)).toEqual(['body-1']);
    expect(authority.hasMechanicalEvidence).toBe(true);
    expect(readiness.categories.mechanical).toBe(85);
    expect(readiness.suggestions).toContain('Mechanical geometry has no explicit dimensions/tolerances recorded.');
  });

  it('derives assembly connections only from explicit ordered assembly layers', () => {
    const source = project({
      assemblyLayers: [
        {
          id: 'layer-2',
          name: 'Close enclosure',
          order: 2,
          layerType: 'Enclosure',
          material: 'ABS',
          fasteningMethod: 'Snap fit',
          inspectionNote: '',
          notes: '',
        },
        {
          id: 'layer-1',
          name: 'Install PCB',
          order: 1,
          layerType: 'PCBA',
          material: 'FR4',
          fasteningMethod: 'Screws',
          inspectionNote: '',
          notes: '',
        },
      ],
    });

    const generated = generateEditorLayouts(source);
    expect(generated.layouts.assembly?.map((item) => item.sourceId)).toEqual(['layer-1', 'layer-2']);
    expect(generated.connections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'conn_a_layer-1_layer-2',
        sourceObjectId: 'obj_a_layer-1',
        targetObjectId: 'obj_a_layer-2',
        kind: 'assembly',
      }),
    ]));
  });
});
