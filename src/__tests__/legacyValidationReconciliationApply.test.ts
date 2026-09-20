import { beforeEach, describe, expect, it } from 'vitest';
import type { Project, TestStage, ValidationRun, ValidationTest } from '../types';
import { previewLegacyValidationAdoption } from '../lib/validation/legacyValidationAdoption';
import {
  buildLegacyValidationAdoptionApplyPlan,
  projectPatchFromLegacyValidationApplyPlan,
} from '../lib/validation/legacyValidationAdoptionApply';
import {
  previewLegacyValidationReconciliation,
} from '../lib/validation/legacyValidationReconciliation';
import {
  buildLegacyValidationReconciliationApplyPlan,
} from '../lib/validation/legacyValidationReconciliationApply';
import { serializeProject, deserializeProject } from '../lib/projectSerialization';
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
    category: 'EVT',
    stage: 'EVT',
    linkedRequirementIds: ['req-power'],
    linkedComponentIds: ['component-regulator'],
    linkedNetIds: ['net-3v3'],
    linkedFirmwareModuleIds: ['fw-power'],
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'validation-reconcile-project',
    projectName: 'Validation Reconciliation Fixture',
    description: '',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    version: '12',
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
    validationReconciliationSuppressions: [],
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

const initialReview = {
  reviewerId: 'initial-validation-reviewer',
  reviewedAt: '2026-09-21T00:30:00.000Z',
};

const reconcileReview = {
  reviewerId: 'validation-reconcile-reviewer',
  reviewedAt: '2026-09-21T01:00:00.000Z',
};

async function adopt(source: Project): Promise<Project> {
  const preview = await previewLegacyValidationAdoption(source);
  const plan = buildLegacyValidationAdoptionApplyPlan(
    source,
    preview,
    preview.testProposals.map((proposal) => ({
      sourceTestStageId: proposal.sourceTestStageId,
      decision: 'adopt' as const,
    })),
    initialReview,
  );

  if (!plan.canApply) {
    throw new Error(`Could not build validation adoption fixture: ${JSON.stringify(plan.issues)}`);
  }

  return {
    ...source,
    ...projectPatchFromLegacyValidationApplyPlan(plan),
  };
}

describe('legacy validation reconciliation', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('classifies unchanged, source-only, local-only and conflict through the real adoption baseline', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));

    const unchanged = await previewLegacyValidationReconciliation(adopted);
    expect(unchanged.summary.unchanged).toBe(1);

    const sourceStage = adopted.testing[0];
    const sourceChanged = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [{
        ...sourceStage,
        name: 'Updated source rail validation',
      }],
    });
    expect(sourceChanged.items[0]).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      localSemanticChanged: false,
      sourceSemanticChanged: true,
    });

    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fixture');
    const localChanged = await previewLegacyValidationReconciliation({
      ...adopted,
      validationTests: [{
        ...canonical,
        name: 'Locally renamed validation',
      }],
    });
    expect(localChanged.items[0]).toMatchObject({
      classification: 'local-only-change',
      sourceContentChanged: false,
      localSemanticChanged: true,
      sourceSemanticChanged: false,
    });

    const conflict = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [{
        ...sourceStage,
        name: 'Updated source rail validation',
      }],
      validationTests: [{
        ...canonical,
        name: 'Locally renamed validation',
      }],
    });
    expect(conflict.items[0]).toMatchObject({
      classification: 'conflict',
      sourceContentChanged: true,
      localSemanticChanged: true,
      sourceSemanticChanged: true,
    });
    expect(conflict.hasConflicts).toBe(true);
  });

  it('classifies source deletion and new source by source identity rather than display name', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage({ id: 'legacy-old', name: 'Same visible name' })],
    }));

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [legacyStage({ id: 'legacy-new', name: 'Same visible name' })],
    });

    expect(preview.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceTestStageId: 'legacy-old',
        classification: 'source-deleted',
      }),
      expect.objectContaining({
        sourceTestStageId: 'legacy-new',
        classification: 'new-source',
      }),
    ]));
  });

  it('keeps local canonical semantics durably while acknowledging the current source revision', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const changed = {
      ...adopted,
      testing: [{
        ...adopted.testing[0],
        name: 'Source name changed',
      }],
      validationTests: [{
        ...canonical,
        name: 'Local validation name',
        steps: [{
          stepNumber: 1,
          instruction: 'Measure rail with DMM.',
          expectedResult: 'Rail is in range.',
          completed: false,
        }],
      }],
    };

    const preview = await previewLegacyValidationReconciliation(changed);
    expect(preview.items[0].classification).toBe('conflict');

    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'keep-local',
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.validationTests[0]).toMatchObject({
      name: 'Local validation name',
      steps: [expect.objectContaining({ instruction: 'Measure rail with DMM.' })],
      reconciliationBaseline: {
        sourcePresence: 'present',
        resolution: 'keep-local',
        reviewedBy: reconcileReview.reviewerId,
      },
    });

    const post = await previewLegacyValidationReconciliation({
      ...changed,
      validationTests: plan.validationTests,
      validationReconciliationSuppressions: plan.suppressions,
    });
    expect(post.items[0].classification).toBe('unchanged');
  });

  it('takes source semantics without destroying local structured steps, measurements, or evidence', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const enriched: ValidationTest = {
      ...canonical,
      steps: [{
        stepNumber: 1,
        instruction: 'Probe rail.',
        expectedResult: '3.3 V nominal.',
        completed: true,
      }],
      measurements: [{
        id: 'measurement-1',
        name: '3V3',
        type: 'Numeric',
        expectedValue: 3.3,
        actualValue: 3.29,
        unit: 'V',
        required: true,
        status: 'Pass',
      }],
      evidence: [{
        id: 'evidence-1',
        type: 'Text',
        value: 'Bench evidence',
        createdAt: '2026-09-21T00:40:00.000Z',
      }],
    };

    const changed = {
      ...adopted,
      testing: [{
        ...adopted.testing[0],
        name: 'Updated source validation name',
        passCriteria: '3V3 stays between 3.2 V and 3.4 V.',
      }],
      validationTests: [enriched],
    };
    const preview = await previewLegacyValidationReconciliation(changed);

    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'take-source',
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.validationTests[0]).toMatchObject({
      name: 'Updated source validation name',
      passCriteria: ['3V3 stays between 3.2 V and 3.4 V.'],
      steps: enriched.steps,
      measurements: enriched.measurements,
      evidence: enriched.evidence,
    });
  });

  it('supports manual conflict resolution while keeping unmentioned structured validation data', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const changed = {
      ...adopted,
      testing: [{ ...adopted.testing[0], name: 'Source changed' }],
      validationTests: [{
        ...canonical,
        name: 'Local changed',
        evidence: [{
          id: 'evidence-manual',
          type: 'Text' as const,
          value: 'Keep this evidence',
          createdAt: '2026-09-21T00:45:00.000Z',
        }],
      }],
    };

    const preview = await previewLegacyValidationReconciliation(changed);
    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'manual',
        manual: {
          name: 'Reviewed final validation',
          category: 'Electrical',
        },
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.validationTests[0]).toMatchObject({
      name: 'Reviewed final validation',
      category: 'Electrical',
      evidence: [expect.objectContaining({ id: 'evidence-manual' })],
      reconciliationBaseline: {
        resolution: 'manual',
      },
    });
  });

  it('acknowledges a source deletion when keeping canonical validation', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const changed = { ...adopted, testing: [] };
    const preview = await previewLegacyValidationReconciliation(changed);

    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'keep-local',
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.validationTests[0].reconciliationBaseline).toMatchObject({
      sourcePresence: 'deleted',
      resolution: 'keep-after-source-delete',
    });

    const post = await previewLegacyValidationReconciliation({
      ...changed,
      validationTests: plan.validationTests,
    });
    expect(post.items[0].classification).toBe('unchanged');
  });

  it('blocks deletion of a source-deleted canonical test while runs still reference it', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const run: ValidationRun = {
      id: 'run-1',
      testId: canonical.id,
      status: 'Pass',
      logs: ['completed'],
    };
    const changed = {
      ...adopted,
      testing: [],
      validationRuns: [run],
    };
    const preview = await previewLegacyValidationReconciliation(changed);

    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'delete-canonical',
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'validation-run-reference-blocks-delete',
        canonicalTestId: canonical.id,
      }),
    ]));
  });

  it('durably rejects a new source only for the exact source fingerprint', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const added = legacyStage({
      id: 'legacy-validation-new',
      name: 'New environmental validation',
      category: 'Environmental',
      stage: 'DVT',
    });
    const changed = {
      ...adopted,
      testing: [...adopted.testing, added],
    };
    const preview = await previewLegacyValidationReconciliation(changed);

    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-new',
        action: 'reject-source',
      }],
      reconcileReview,
    );

    expect(plan.canApply).toBe(true);
    expect(plan.suppressions).toHaveLength(1);

    const suppressed = await previewLegacyValidationReconciliation({
      ...changed,
      validationReconciliationSuppressions: plan.suppressions,
    });
    expect(suppressed.items.find((item) => item.sourceTestStageId === 'legacy-validation-new'))
      .toMatchObject({ classification: 'unchanged', suppressed: true });

    const changedAgain = await previewLegacyValidationReconciliation({
      ...changed,
      testing: [
        adopted.testing[0],
        { ...added, passCriteria: 'Updated criteria after rejection.' },
      ],
      validationReconciliationSuppressions: plan.suppressions,
    });
    expect(changedAgain.items.find((item) => item.sourceTestStageId === 'legacy-validation-new'))
      .toMatchObject({ classification: 'new-source', suppressed: false });
  });

  it('serializes and restores validation reconciliation suppressions', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const added = legacyStage({
      id: 'legacy-validation-new',
      name: 'New validation',
    });
    const changed = {
      ...adopted,
      testing: [...adopted.testing, added],
    };
    const preview = await previewLegacyValidationReconciliation(changed);
    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-new',
        action: 'reject-source',
      }],
      reconcileReview,
    );

    const restored = deserializeProject(serializeProject({
      ...changed,
      validationReconciliationSuppressions: plan.suppressions,
    }));

    expect(restored.validationReconciliationSuppressions).toEqual(plan.suppressions);
  });

  it('applies through the store as one command with undo/redo', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const changed = {
      ...adopted,
      testing: [{
        ...adopted.testing[0],
        name: 'Source changed name',
      }],
    };

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...changed,
      pastCommands: [],
      futureCommands: [],
    });

    const preview = await previewLegacyValidationReconciliation(changed);
    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'take-source',
      }],
      reconcileReview,
    );

    const result = await useProjectStore.getState()
      .applyLegacyValidationReconciliationPlan(plan);
    expect(result).toEqual({ success: true });

    let state = useProjectStore.getState();
    expect(state.validationTests?.[0].name).toBe('Source changed name');
    expect(state.pastCommands).toHaveLength(1);
    expect(state.pastCommands[0].type).toBe('RECONCILE_LEGACY_VALIDATION');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.validationTests?.[0].name).toBe('Power rail validation');

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.validationTests?.[0].name).toBe('Source changed name');
  });

  it('refuses a stale reviewed plan when source changes after review', async () => {
    const adopted = await adopt(project({ testing: [legacyStage()] }));
    const changed = {
      ...adopted,
      testing: [{
        ...adopted.testing[0],
        name: 'Source changed once',
      }],
    };
    const preview = await previewLegacyValidationReconciliation(changed);
    const plan = await buildLegacyValidationReconciliationApplyPlan(
      changed,
      preview,
      [{
        sourceTestStageId: 'legacy-validation-1',
        action: 'take-source',
      }],
      reconcileReview,
    );

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...changed,
      testing: [{
        ...changed.testing[0],
        name: 'Source changed after review',
      }],
      pastCommands: [],
      futureCommands: [],
    });

    const result = await useProjectStore.getState()
      .applyLegacyValidationReconciliationPlan(plan);

    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/stale/i);
    expect(useProjectStore.getState().pastCommands).toHaveLength(0);
  });
});
