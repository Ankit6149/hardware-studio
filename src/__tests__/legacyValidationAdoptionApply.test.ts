import { beforeEach, describe, expect, it } from 'vitest';
import type { Project, TestStage } from '../types';
import { previewLegacyValidationAdoption } from '../lib/validation/legacyValidationAdoption';
import {
  buildLegacyValidationAdoptionApplyPlan,
  projectPatchFromLegacyValidationApplyPlan,
} from '../lib/validation/legacyValidationAdoptionApply';
import { useProjectStore } from '../store/projectStore';

function legacyStage(overrides: Partial<TestStage> = {}): TestStage {
  return {
    id: 'legacy-validation-1',
    name: 'Power rail validation',
    goal: '',
    partsNeeded: '',
    steps: '',
    passCriteria: '3V3 rail remains within tolerance.',
    risks: '',
    status: 'Not Started',
    notes: '',
    stage: 'EVT',
    category: 'EVT',
    linkedRequirementIds: ['req-power'],
    linkedComponentIds: ['component-regulator'],
    linkedNetIds: ['net-3v3'],
    linkedFirmwareModuleIds: ['fw-power'],
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'validation-apply-project',
    projectName: 'Validation Apply Fixture',
    description: '',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    version: '8',
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

const review = {
  reviewerId: 'validation-reviewer',
  reviewedAt: '2026-09-21T00:30:00.000Z',
};

describe('reviewed legacy validation adoption apply', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('adopts a reviewed test with deterministic identity, provenance, and reconciliation baseline', async () => {
    const source = project({ testing: [legacyStage()] });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    expect(plan.canApply).toBe(true);
    const patch = projectPatchFromLegacyValidationApplyPlan(plan);
    expect(patch.validationTests).toHaveLength(1);

    const test = patch.validationTests?.[0];
    expect(test?.id).toBe(preview.testProposals[0].canonicalId);
    expect(test).toMatchObject({
      name: 'Power rail validation',
      stage: 'EVT',
      linkedRequirementIds: ['req-power'],
      linkedComponentIds: ['component-regulator'],
      linkedNetIds: ['net-3v3'],
      linkedFirmwareModuleIds: ['fw-power'],
      passCriteria: ['3V3 rail remains within tolerance.'],
      sourceIdentity: {
        system: 'hardware-studio-legacy-testing',
        documentId: 'validation-apply-project',
        entityId: 'test-stage:legacy-validation-1',
        revision: '8',
      },
      provenance: {
        origin: 'imported',
        qualification: 'provisional',
        reviewedBy: 'validation-reviewer',
        reviewedAt: review.reviewedAt,
      },
      reconciliationBaseline: {
        adoptionSessionId: preview.adoptionSessionId,
        sourcePresence: 'present',
        resolution: 'adopted',
        reviewedBy: 'validation-reviewer',
        reviewedAt: review.reviewedAt,
      },
    });
    expect(test?.sourceIdentity?.contentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(test?.reconciliationBaseline?.sourceContentHash)
      .toBe(test?.sourceIdentity?.contentHash);
  });

  it('records unresolved legacy detail in provenance without fabricating steps or evidence', async () => {
    const source = project({
      testing: [legacyStage({
        steps: 'Connect supply; measure rail.',
        evidenceLink: 'https://example.com/scope',
        goal: 'Verify regulator output.',
        risks: 'Overvoltage risk.',
      })],
    });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    const test = plan.commands[0]?.payload;
    expect(test.steps).toEqual([]);
    expect(test.evidence).toEqual([]);
    expect(test.provenance?.note).toContain('legacy-steps-unstructured');
    expect(test.provenance?.note).toContain('legacy-evidence-unstructured');
    expect(test.provenance?.note).toContain('legacy-enrichment-unmapped');
  });

  it('can resolve a missing legacy name explicitly without inventing one in preview', async () => {
    const source = project({
      testing: [legacyStage({ name: '   ' })],
    });
    const preview = await previewLegacyValidationAdoption(source);
    expect(preview.testProposals[0].proposed).toBeUndefined();

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        decision: 'adopt',
        name: 'Reviewed regulator validation',
        category: 'Electrical',
      }],
      review,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.commands[0].payload).toMatchObject({
      name: 'Reviewed regulator validation',
      category: 'Electrical',
      steps: [],
      evidence: [],
    });
  });

  it('supports explicit architecture-link resolution during adoption', async () => {
    const source = project({
      testing: [legacyStage({ linkedBlocks: ['legacy-power-block'] })],
    });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        decision: 'adopt',
        linkedArchitectureNodeIds: ['canonical-power-node'],
      }],
      review,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.commands[0].payload.linkedArchitectureNodeIds)
      .toEqual(['canonical-power-node']);
  });

  it('requires a reviewed decision for every legacy test stage', async () => {
    const source = project({
      testing: [
        legacyStage(),
        legacyStage({ id: 'legacy-validation-2', name: 'Second validation' }),
      ],
    });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'test-resolution-missing',
        sourceEntityId: 'legacy-validation-2',
      }),
    ]));
  });

  it('allows reviewed skipping but refuses a plan that adopts nothing', async () => {
    const source = project({ testing: [legacyStage()] });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'skip' }],
      review,
    );

    expect(plan.canApply).toBe(false);
    expect(plan.skippedSourceTestStageIds).toEqual(['legacy-validation-1']);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'nothing-to-apply' }),
    ]));
  });

  it('rejects a stale preview after the project version changes', async () => {
    const source = project({ testing: [legacyStage()] });
    const preview = await previewLegacyValidationAdoption(source);

    const plan = buildLegacyValidationAdoptionApplyPlan(
      { ...source, version: '9' },
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'preview-revision-stale' }),
    ]));
  });

  it('rejects one-way adoption if canonical validation appears after preview', async () => {
    const source = project({ testing: [legacyStage()] });
    const preview = await previewLegacyValidationAdoption(source);
    const changed = {
      ...source,
      validationTests: [{
        id: 'existing-test',
        name: 'Existing validation',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        evidence: [],
      }],
    };

    const plan = buildLegacyValidationAdoptionApplyPlan(
      changed,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'canonical-state-present' }),
    ]));
  });

  it('applies as one command and undo/redo preserves the legacy source stage', async () => {
    const source = project({ testing: [legacyStage()] });
    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      pastCommands: [],
      futureCommands: [],
    });

    const preview = await previewLegacyValidationAdoption(source);
    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    const result = useProjectStore.getState().applyLegacyValidationAdoptionPlan(plan);
    expect(result).toEqual({ success: true });

    let state = useProjectStore.getState();
    expect(state.validationTests).toHaveLength(1);
    expect(state.testing).toHaveLength(1);
    expect(state.pastCommands).toHaveLength(1);
    expect(state.pastCommands[0].type).toBe('ADOPT_LEGACY_VALIDATION');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.validationTests || []).toHaveLength(0);
    expect(state.testing).toHaveLength(1);

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.validationTests).toHaveLength(1);
    expect(state.testing).toHaveLength(1);
  });

  it('store rejects a reviewed plan if canonical validation appears before apply', async () => {
    const source = project({ testing: [legacyStage()] });
    const preview = await previewLegacyValidationAdoption(source);
    const plan = buildLegacyValidationAdoptionApplyPlan(
      source,
      preview,
      [{ sourceTestStageId: 'legacy-validation-1', decision: 'adopt' }],
      review,
    );

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      validationTests: [{
        id: 'existing-test',
        name: 'Existing validation',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        evidence: [],
      }],
      pastCommands: [],
      futureCommands: [],
    });

    const result = useProjectStore.getState().applyLegacyValidationAdoptionPlan(plan);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/reconciliation/i);
    expect(useProjectStore.getState().pastCommands).toHaveLength(0);
  });
});
