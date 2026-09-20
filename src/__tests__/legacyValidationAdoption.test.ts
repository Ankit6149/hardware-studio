import { describe, expect, it } from 'vitest';
import type { Project, TestStage } from '../types';
import { previewLegacyValidationAdoption } from '../lib/validation/legacyValidationAdoption';

function legacyStage(overrides: Partial<TestStage> = {}): TestStage {
  return {
    id: 'legacy-test-1',
    name: 'Power rail validation',
    goal: '',
    partsNeeded: '',
    steps: '',
    passCriteria: '3V3 rail remains within tolerance.',
    risks: '',
    status: 'Not Started',
    notes: '',
    category: 'EVT',
    stage: 'EVT',
    linkedRequirementIds: ['req-1'],
    linkedComponentIds: ['component-1'],
    linkedNetIds: ['net-3v3'],
    linkedFirmwareModuleIds: ['fw-power'],
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'legacy-validation-project',
    projectName: 'Legacy Validation Fixture',
    description: '',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    version: '4',
    schemaVersion: 6,
    activeView: 'validation',
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
    validationTests: [],
    validationRuns: [],
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
    ...overrides,
  } as Project;
}

describe('legacy validation adoption preview', () => {
  it('maps defensible validation semantics without mutating the project', async () => {
    const source = project({ testing: [legacyStage()] });
    const before = JSON.stringify(source);

    const preview = await previewLegacyValidationAdoption(source);

    expect(JSON.stringify(source)).toBe(before);
    expect(preview.canonicalStatePresent).toBe(false);
    expect(preview.canApplyWithoutResolution).toBe(true);
    expect(preview.testProposals).toHaveLength(1);
    expect(preview.testProposals[0].proposed).toMatchObject({
      name: 'Power rail validation',
      stage: 'EVT',
      linkedRequirementIds: ['req-1'],
      linkedComponentIds: ['component-1'],
      linkedNetIds: ['net-3v3'],
      linkedFirmwareModuleIds: ['fw-power'],
      steps: [],
      measurements: [],
      passCriteria: ['3V3 rail remains within tolerance.'],
      status: 'Not Started',
      evidence: [],
    });
  });

  it('creates deterministic canonical IDs, adoption-session IDs, and source fingerprints', async () => {
    const source = project({ testing: [legacyStage()] });

    const first = await previewLegacyValidationAdoption(source);
    const second = await previewLegacyValidationAdoption(source);

    expect(first.adoptionSessionId).toBe(second.adoptionSessionId);
    expect(first.testProposals[0].canonicalId).toBe(second.testProposals[0].canonicalId);
    expect(first.testProposals[0].sourceIdentity.contentHash).toBe(
      second.testProposals[0].sourceIdentity.contentHash,
    );
    expect(first.testProposals[0].sourceIdentity).toMatchObject({
      system: 'hardware-studio-legacy-testing',
      documentId: 'legacy-validation-project',
      entityId: 'test-stage:legacy-test-1',
      revision: '4',
      adapterId: 'legacy-validation-adoption',
      adapterVersion: '1',
    });
    expect(first.testProposals[0].sourceIdentity.contentHash)
      .toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('does not invent structured steps or evidence from legacy free text', async () => {
    const source = project({
      testing: [legacyStage({
        steps: '1. Connect supply. 2. Measure rail. 3. Record result.',
        evidenceLink: 'https://example.com/evidence',
        evidence: 'scope-capture.png',
        goal: 'Verify regulator output.',
        partsNeeded: 'Bench supply, DMM',
        risks: 'Overvoltage could damage board.',
        notes: 'Run after assembly inspection.',
        linkedBlocks: ['legacy-power-block'],
        order: 3,
      })],
    });

    const preview = await previewLegacyValidationAdoption(source);
    const proposal = preview.testProposals[0];

    expect(proposal.canAdopt).toBe(true);
    expect(proposal.proposed?.steps).toEqual([]);
    expect(proposal.proposed?.evidence).toEqual([]);
    expect(proposal.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'legacy-steps-unstructured', severity: 'warning' }),
      expect.objectContaining({ code: 'legacy-evidence-unstructured', severity: 'warning' }),
      expect.objectContaining({ code: 'legacy-enrichment-unmapped', severity: 'warning' }),
      expect.objectContaining({ code: 'legacy-block-links-unresolved', severity: 'warning' }),
      expect.objectContaining({ code: 'legacy-order-display-only', severity: 'info' }),
    ]));
  });

  it('preserves result notes and a pass-criteria sentence because their semantics match directly', async () => {
    const preview = await previewLegacyValidationAdoption(project({
      testing: [legacyStage({
        resultNotes: 'Rail passed at room temperature.',
        passCriteria: 'Output must stay between 3.2 V and 3.4 V.',
      })],
    }));

    expect(preview.testProposals[0].proposed).toMatchObject({
      passCriteria: ['Output must stay between 3.2 V and 3.4 V.'],
      resultNotes: 'Rail passed at room temperature.',
    });
  });

  it('can infer a validation stage only when the legacy category exactly names that stage', async () => {
    const inferred = await previewLegacyValidationAdoption(project({
      testing: [legacyStage({ stage: undefined, category: 'DVT' })],
    }));
    expect(inferred.testProposals[0].proposed).toMatchObject({
      stage: 'DVT',
      category: undefined,
    });

    const notInferred = await previewLegacyValidationAdoption(project({
      testing: [legacyStage({ stage: undefined, category: 'Electrical' })],
    }));
    expect(notInferred.testProposals[0].proposed).toMatchObject({
      category: 'Electrical',
    });
    expect(notInferred.testProposals[0].proposed?.stage).toBeUndefined();
  });

  it('blocks a stage with no usable name instead of fabricating one', async () => {
    const preview = await previewLegacyValidationAdoption(project({
      testing: [legacyStage({ name: '   ' })],
    }));

    expect(preview.canApplyWithoutResolution).toBe(false);
    expect(preview.testProposals[0].canAdopt).toBe(false);
    expect(preview.testProposals[0].proposed).toBeUndefined();
    expect(preview.testProposals[0].issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'legacy-test-name-missing',
        severity: 'blocker',
      }),
    ]));
  });

  it('blocks one-way adoption when canonical validation already exists', async () => {
    const preview = await previewLegacyValidationAdoption(project({
      testing: [legacyStage()],
      validationTests: [{
        id: 'canonical-test',
        name: 'Canonical test',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        evidence: [],
      }],
    }));

    expect(preview.canonicalStatePresent).toBe(true);
    expect(preview.canApplyWithoutResolution).toBe(false);
    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'canonical-validation-already-present',
        severity: 'blocker',
      }),
    ]));
  });

  it('refuses an empty legacy source instead of creating an empty adoption', async () => {
    const preview = await previewLegacyValidationAdoption(project());

    expect(preview.testProposals).toEqual([]);
    expect(preview.canApplyWithoutResolution).toBe(false);
    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'legacy-validation-empty',
        severity: 'blocker',
      }),
    ]));
  });
});
