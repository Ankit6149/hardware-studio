import { describe, expect, it } from 'vitest';
import type { CustomNode, ProductArchitectureNode, ProductRequirement, Project } from '../types';
import {
  requirementsUseLegacyCompatibility,
  resolveRequirementsAuthority,
} from '../lib/product/requirementsAuthority';
import { buildProjectHomeModel } from '../lib/projectHome';
import { generateBlueprintPack } from '../lib/blueprintGenerator';
import { validateReleaseEligibility } from '../lib/releaseEngine';

function legacyNode(
  id: string,
  name: string,
  requirements: string,
): CustomNode {
  return {
    id,
    type: 'default',
    position: { x: 10, y: 20 },
    data: {
      name,
      category: 'Processing',
      status: 'MVP',
      description: '',
      purpose: '',
      requirements,
      candidateComponents: '',
      risks: 'Legacy risk',
      mitigation: 'Legacy mitigation',
      notes: '',
      testingNotes: 'Legacy verification note',
      views: ['master'],
    },
  };
}

function canonicalRequirement(id: string, title: string): ProductRequirement {
  return {
    id,
    title,
    description: 'Canonical measurable requirement',
    type: 'Functional',
    priority: 'High',
    status: 'Approved',
    acceptanceCriteria: ['Measured result satisfies the accepted threshold.'],
    linkedArchitectureNodeIds: [],
    linkedComponentIds: [],
    linkedFirmwareModuleIds: [],
    linkedTestIds: [],
    risks: [],
  };
}

function architectureNode(id: string): ProductArchitectureNode {
  return {
    id,
    name: `Architecture ${id}`,
    category: 'Processing',
    description: '',
    x: 0,
    y: 0,
    width: 160,
    height: 72,
    linkedRequirementIds: [],
    linkedCircuitIds: [],
    linkedComponentIds: [],
    linkedFirmwareModuleIds: [],
    linkedTestIds: [],
    status: 'MVP',
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'requirements-authority-project',
    projectName: 'Requirements Authority Fixture',
    description: '',
    createdAt: '2026-09-22T00:00:00.000Z',
    updatedAt: '2026-09-22T00:00:00.000Z',
    version: '1',
    schemaVersion: 6,
    activeView: 'requirements',
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
    mechanicalObjects: [],
    mechanicalDimensions: [],
    mechanicalBodies: [],
    firmwareModules: [],
    firmwareStates: [],
    firmwareTransitions: [],
    validationTests: [],
    validationRuns: [],
    ...overrides,
  } as Project;
}

describe('requirements read authority', () => {
  it('prefers canonical requirements over contradictory legacy requirement notes', () => {
    const source = project({
      requirements: [canonicalRequirement('req-1', 'Canonical requirement')],
      nodes: [legacyNode('legacy-1', 'Legacy block', 'Legacy text must not become equal truth.')],
    });

    const authority = resolveRequirementsAuthority(source);

    expect(authority.source).toBe('canonical');
    expect(authority.requirements).toHaveLength(1);
    expect(authority.requirements[0]).toMatchObject({
      id: 'req-1',
      title: 'Canonical requirement',
      source: 'canonical',
    });
    expect(authority.legacyRequirementNotes).toHaveLength(1);
    expect(requirementsUseLegacyCompatibility(source)).toBe(false);
  });

  it('preserves each legacy free-text field as one compatibility note without parsing it', () => {
    const text = 'Must run for 8 hours; maybe IP54; battery target TBD.';
    const authority = resolveRequirementsAuthority(project({
      nodes: [legacyNode('legacy-1', 'Controller', text)],
    }));

    expect(authority.source).toBe('legacy-compatibility');
    expect(authority.requirements).toHaveLength(1);
    expect(authority.requirements[0]).toMatchObject({
      id: 'legacy-requirement:legacy-1',
      title: 'Controller requirement notes',
      description: text,
      source: 'legacy-compatibility',
      legacy: {
        sourceNodeId: 'legacy-1',
        risks: 'Legacy risk',
        mitigation: 'Legacy mitigation',
      },
    });
  });

  it('guides the user to review legacy notes instead of treating them as measurable requirements', () => {
    const model = buildProjectHomeModel(project({
      nodes: [legacyNode('legacy-1', 'Controller', 'Legacy requirement text')],
    }));

    expect(model.nextAction).toMatchObject({
      eyebrow: 'Review existing intent',
      title: 'Turn requirement notes into measurable decisions',
      viewId: 'requirements',
      label: 'Review requirements',
    });
    expect(model.areas.find((area) => area.id === 'define')).toMatchObject({
      state: 'In progress',
      viewId: 'requirements',
    });
    expect(model.attention).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'requirements-legacy-review' }),
    ]));
  });

  it('uses canonical architecture authority in Project Home instead of maxing legacy and canonical counts', () => {
    const model = buildProjectHomeModel(project({
      requirements: [canonicalRequirement('req-1', 'Requirement')],
      architectureNodes: [architectureNode('canonical-1')],
      nodes: [
        legacyNode('legacy-1', 'Legacy 1', ''),
        legacyNode('legacy-2', 'Legacy 2', ''),
        legacyNode('legacy-3', 'Legacy 3', ''),
      ],
    }));

    expect(model.inventory.architecture).toBe(1);
  });

  it('does not allow legacy requirement notes to satisfy release requirement qualification', () => {
    const blockers = validateReleaseEligibility(project({
      nodes: [legacyNode('legacy-1', 'Controller', 'Legacy requirement text')],
    }));

    expect(blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        domain: 'Requirements & Validation',
        severity: 'Critical',
        message: 'Legacy requirement notes must be reviewed into measurable canonical requirements before release.',
      }),
    ]));
  });

  it('requires at least one canonical measurable requirement before release', () => {
    const blockers = validateReleaseEligibility(project());

    expect(blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        domain: 'Requirements & Validation',
        severity: 'Critical',
        message: 'At least one measurable canonical requirement is required before release.',
      }),
    ]));
  });

  it('marks legacy requirement blueprint output as compatibility context rather than qualified requirements', () => {
    const pack = generateBlueprintPack(project({
      nodes: [legacyNode('legacy-1', 'Controller', 'Legacy requirement text')],
    }));
    const sheet = pack.sheets.find((candidate) => candidate.id === 'sh-2');

    expect(sheet).toBeDefined();
    expect(sheet?.status).not.toBe('Ready');
    expect(sheet?.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'Requirement Notes Need Review' }),
    ]));
    const rows = sheet?.tables.find((table) => table.title === 'Requirements Matrix')?.rows || [];
    expect(rows[0]).toEqual([
      'Controller requirement notes',
      'Legacy requirement text',
      'Unresolved',
      'Needs review',
      'Compatibility note only',
    ]);
  });

  it('returns an explicitly empty authority when no canonical or legacy requirement content exists', () => {
    expect(resolveRequirementsAuthority(project())).toMatchObject({
      source: 'empty',
      requirements: [],
      canonicalRequirements: [],
      legacyRequirementNotes: [],
    });
  });
});
