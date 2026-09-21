import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { generateBlueprintPack } from '../lib/blueprintGenerator';
import { runDesignReview } from '../lib/designReview';
import {
  exportConceptualMechanicalLayoutJson,
  exportEnclosureSTL,
} from '../lib/nativeExports';
import {
  resolveMechanicalBodyGeometry,
} from '../lib/mechanical/mechanicalAuthority';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'mechanical-projection-fixture',
    projectName: 'Mechanical Projection Fixture',
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

describe('mechanical authority projections', () => {
  it('does not let legacy planning zones make a mechanical blueprint authoritative', () => {
    const source = project({
      projectName: 'The Ring',
      templateName: 'Ring',
      mechanicalZones: [{
        id: 'legacy-shell-zone',
        name: 'Legacy shell sketch',
        zoneType: 'Enclosure',
        x: 100,
        y: 100,
        width: 220,
        height: 100,
        material: 'Titanium',
        dimensionNote: '18.5 mm',
        notes: 'Planning-only legacy zone',
      }],
    });

    const pack = generateBlueprintPack(source);
    const mechanicalSheet = pack.sheets.find((sheet) => sheet.id === 'sh-3');

    expect(mechanicalSheet).toBeDefined();
    expect(mechanicalSheet?.status).toBe('Missing Data');
    expect(mechanicalSheet?.drawing.objects).toEqual([]);
    expect(mechanicalSheet?.sourceObjects).toEqual([]);
    expect(mechanicalSheet?.tables.some(
      (table) => table.title === 'Planning Compatibility Zones — Not Engineering Geometry',
    )).toBe(true);
    expect(mechanicalSheet?.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'No Explicit Mechanical Geometry',
      }),
    ]));
  });

  it('does not invent ring-specific engineering requirements from product/template names', () => {
    const results = runDesignReview(project({
      projectName: 'The Ring',
      templateName: 'Ring',
    }));

    expect(results.some((result) => result.id === 'rev_mech_empty')).toBe(true);
    expect(results.some((result) => result.id === 'rev_mech_seal')).toBe(false);
    expect(results.some((result) => result.id === 'rev_mech_batt_pocket')).toBe(false);
    expect(results.some((result) => result.id === 'rev_mech_antenna')).toBe(false);
  });

  it('projects explicit mechanical geometry while keeping planning zones visibly separate', () => {
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
        id: 'overall-width',
        name: 'Overall width',
        from: { xMm: 2, yMm: 3 },
        to: { xMm: 42, yMm: 3 },
        valueMm: 40,
        tolerancePlusMm: 0.2,
        toleranceMinusMm: 0.1,
        linkedObjectIds: ['enclosure'],
      }],
      mechanicalZones: [{
        id: 'planning-zone',
        name: 'Old planning zone',
        zoneType: 'Envelope',
        material: '',
        dimensionNote: 'TBD',
        notes: '',
      }],
    });

    const pack = generateBlueprintPack(source);
    const mechanicalSheet = pack.sheets.find((sheet) => sheet.id === 'sh-3');

    expect(mechanicalSheet?.status).toBe('Generated In App');
    expect(mechanicalSheet?.sourceObjects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'mechanical-object',
        id: 'enclosure',
      }),
      expect.objectContaining({
        type: 'mechanical-dimension',
        id: 'overall-width',
      }),
    ]));
    expect(mechanicalSheet?.sourceObjects.some((sourceObject) => sourceObject.id === 'planning-zone')).toBe(false);
    expect(mechanicalSheet?.drawing.objects).toEqual([
      expect.objectContaining({
        sourceType: 'mechanical-object',
        sourceId: 'enclosure',
        metadata: expect.objectContaining({
          authoritySource: 'canonical',
          displayProjectionOnly: true,
        }),
      }),
    ]);
    expect(mechanicalSheet?.drawing.dimensions).toEqual([
      expect.objectContaining({
        label: '40 mm',
        unit: 'mm',
      }),
    ]);
  });

  it('exports canonical mechanical state and labels legacy zones as compatibility data', () => {
    const payload = JSON.parse(exportConceptualMechanicalLayoutJson(project({
      mechanicalObjects: [{
        id: 'enclosure',
        name: 'Outer enclosure',
        type: 'Outer Profile',
        shape: 'rect',
        xMm: 0,
        yMm: 0,
        widthMm: 20,
        heightMm: 10,
        depthMm: 5,
        rotationDeg: 0,
        locked: false,
        visible: true,
      }],
      mechanicalZones: [{
        id: 'legacy-zone',
        name: 'Legacy zone',
        zoneType: 'Planning',
        material: '',
        dimensionNote: '',
        notes: '',
      }],
    })));

    expect(payload.authoritySource).toBe('canonical');
    expect(payload.engineeringObjects.map((object: { id: string }) => object.id)).toEqual(['enclosure']);
    expect(payload.planningCompatibilityZones.map((zone: { id: string }) => zone.id)).toEqual(['legacy-zone']);
    expect(payload).not.toHaveProperty('mechanicalZones');
  });

  it('normalizes both supported mechanical-body field shapes through one resolver', () => {
    expect(resolveMechanicalBodyGeometry({
      id: 'flat',
      xMm: 1,
      yMm: 2,
      zMm: 3,
      widthMm: 10,
      heightMm: 20,
      depthMm: 30,
    })).toEqual({
      xMm: 1,
      yMm: 2,
      zMm: 3,
      widthMm: 10,
      heightMm: 20,
      depthMm: 30,
    });

    expect(resolveMechanicalBodyGeometry({
      id: 'nested',
      position: { x: 4, y: 5, z: 6 },
      dimensions: { x: 7, y: 8, z: 9 },
    })).toEqual({
      xMm: 4,
      yMm: 5,
      zMm: 6,
      widthMm: 7,
      heightMm: 8,
      depthMm: 9,
    });
  });

  it('does not treat annotations as solids during draft STL export', () => {
    const stl = exportEnclosureSTL(project({
      mechanicalObjects: [
        {
          id: 'enclosure',
          name: 'Outer enclosure',
          type: 'Outer Profile',
          shape: 'rect',
          xMm: 0,
          yMm: 0,
          widthMm: 20,
          heightMm: 10,
          depthMm: 5,
          rotationDeg: 0,
          locked: false,
          visible: true,
        },
        {
          id: 'annotation',
          name: 'Display note',
          type: 'Annotation',
          shape: 'circle',
          xMm: 5,
          yMm: 5,
          radiusMm: 2,
          rotationDeg: 0,
          locked: false,
          visible: true,
        },
      ],
    }));

    expect(stl).toContain('solid Mechanical_Projection_Fixture_DRAFT');
    expect(stl).toContain('facet normal');
  });
});
