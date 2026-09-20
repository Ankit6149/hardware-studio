import { describe, expect, it } from 'vitest';
import type { Project, TestStage } from '../types';
import { previewLegacyValidationAdoption } from '../lib/validation/legacyValidationAdoption';
import {
  buildLegacyValidationAdoptionApplyPlan,
  projectPatchFromLegacyValidationApplyPlan,
} from '../lib/validation/legacyValidationAdoptionApply';
import {
  fingerprintLegacyValidationReconciliation,
  previewLegacyValidationReconciliation,
} from '../lib/validation/legacyValidationReconciliation';

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
    id: 'validation-reconcile-project',
    projectName: 'Validation Reconciliation Fixture',
    description: '',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    version: '11',
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

async function adopt(source: Project): Promise<Project> {
  const preview = await previewLegacyValidationAdoption(source);
  const plan = buildLegacyValidationAdoptionApplyPlan(
    source,
    preview,
    preview.testProposals.map((proposal) => ({
      sourceTestStageId: proposal.sourceTestStageId,
      decision: 'adopt' as const,
    })),
    {
      reviewerId: 'initial-validation-reviewer',
      reviewedAt: '2026-09-21T00:30:00.000Z',
    },
  );

  if (!plan.canApply) {
    throw new Error(`Unable to adopt validation fixture: ${JSON.stringify(plan.issues)}`);
  }

  return {
    ...source,
    ...projectPatchFromLegacyValidationApplyPlan(plan),
  };
}

describe('legacy validation reconciliation preview', () => {
  it('is mutation-free and classifies unchanged adopted validation tests', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const before = JSON.stringify(adopted);

    const preview = await previewLegacyValidationReconciliation(adopted);

    expect(JSON.stringify(adopted)).toBe(before);
    expect(preview.mutationFree).toBe(true);
    expect(preview.summary.unchanged).toBe(1);
    expect(preview.hasConflicts).toBe(false);
    expect(preview.items[0]).toMatchObject({
      classification: 'unchanged',
      sourceTestStageId: 'legacy-validation-1',
      sourceContentChanged: false,
      localSemanticChanged: false,
      sourceSemanticChanged: false,
      sourceSemanticsResolved: true,
    });
  });

  it('classifies a legacy source semantic update as source-only when canonical stayed at baseline', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const source = adopted.testing?.[0];
    if (!source) throw new Error('missing legacy test fixture');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [{
        ...source,
        name: 'Updated power rail validation',
        passCriteria: '3V3 rail remains within 2%.',
      }],
    });

    const item = preview.items[0];
    expect(item).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      localSemanticChanged: false,
      sourceSemanticChanged: true,
    });
    expect(item.fieldDiffs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'name',
        baseline: 'Power rail validation',
        currentCanonical: 'Power rail validation',
        currentSource: 'Updated power rail validation',
        sourceChanged: true,
      }),
    ]));
  });

  it('classifies structured canonical steps/evidence added locally as local-only changes', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical validation fixture');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      validationTests: [{
        ...canonical,
        steps: [{
          stepNumber: 1,
          instruction: 'Measure the 3V3 rail.',
          expectedResult: 'Rail remains within tolerance.',
          completed: true,
        }],
        evidence: [{
          id: 'ev-1',
          type: 'Measurement',
          value: '3.31 V',
          createdAt: '2026-09-21T01:00:00.000Z',
        }],
      }],
    });

    expect(preview.items[0]).toMatchObject({
      classification: 'local-only-change',
      sourceContentChanged: false,
      localSemanticChanged: true,
      sourceSemanticChanged: false,
    });
    expect(preview.items[0].fieldDiffs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'steps',
        localChanged: true,
        sourceChanged: false,
      }),
      expect.objectContaining({
        field: 'evidence',
        localChanged: true,
        sourceChanged: false,
      }),
    ]));
  });

  it('classifies concurrent source and canonical definition changes as conflict', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const source = adopted.testing?.[0];
    const canonical = adopted.validationTests?.[0];
    if (!source || !canonical) throw new Error('missing conflict fixture');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [{
        ...source,
        name: 'Source-renamed validation',
      }],
      validationTests: [{
        ...canonical,
        name: 'Locally-renamed validation',
      }],
    });

    expect(preview.items[0]).toMatchObject({
      classification: 'conflict',
      sourceContentChanged: true,
      localSemanticChanged: true,
      sourceSemanticChanged: true,
    });
    expect(preview.hasConflicts).toBe(true);
  });

  it('treats a source-id rename as deletion plus a new source instead of fuzzy matching by name', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage({ id: 'old-stage' })],
    }));

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [legacyStage({ id: 'new-stage' })],
    });

    expect(preview.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceTestStageId: 'old-stage',
        classification: 'source-deleted',
      }),
      expect.objectContaining({
        sourceTestStageId: 'new-stage',
        classification: 'new-source',
      }),
    ]));
  });

  it('classifies a deleted legacy source without deleting the canonical test or its runs', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonicalId = adopted.validationTests?.[0]?.id;
    if (!canonicalId) throw new Error('missing canonical id');

    const withRun = {
      ...adopted,
      validationRuns: [{
        id: 'run-1',
        testId: canonicalId,
        runNumber: 1,
        timestamp: '2026-09-21T01:05:00.000Z',
        status: 'Passed' as const,
        evidence: [],
        logs: ['Run completed successfully.'],
      }],
      testing: [],
    };

    const beforeRuns = JSON.stringify(withRun.validationRuns);
    const preview = await previewLegacyValidationReconciliation(withRun);

    expect(preview.items[0]).toMatchObject({
      classification: 'source-deleted',
      canonicalTestId: canonicalId,
    });
    expect(JSON.stringify(withRun.validationRuns)).toBe(beforeRuns);
    expect(withRun.validationTests).toHaveLength(1);
  });

  it('keeps changed unstructured legacy steps visible without fabricating structured canonical steps', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const source = adopted.testing?.[0];
    if (!source) throw new Error('missing source');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      testing: [{
        ...source,
        steps: 'Power the board, then measure 3V3 with the calibrated DMM.',
      }],
    });

    expect(preview.items[0]).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      sourceSemanticsResolved: true,
      localSemanticChanged: false,
    });
    expect(preview.items[0].sourceIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'legacy-steps-unstructured',
        severity: 'warning',
      }),
    ]));
    expect(preview.items[0].currentSourceContentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('reports a missing reconciliation baseline as conflict', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing baseline fixture');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      validationTests: [{
        ...canonical,
        reconciliationBaseline: undefined,
      }],
    });

    expect(preview.items[0].classification).toBe('conflict');
    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'missing-reconciliation-baseline',
        canonicalEntityId: canonical.id,
      }),
    ]));
  });

  it('reports duplicate canonical source identity as an integrity conflict', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));
    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing duplicate fixture');

    const preview = await previewLegacyValidationReconciliation({
      ...adopted,
      validationTests: [
        canonical,
        { ...canonical, id: 'duplicate-validation-test' },
      ],
    });

    expect(preview.hasConflicts).toBe(true);
    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: 'legacy-validation-1',
      }),
    ]));
  });

  it('produces a stable reconciliation fingerprint and changes it when reviewed state changes', async () => {
    const adopted = await adopt(project({
      testing: [legacyStage()],
    }));

    const first = await previewLegacyValidationReconciliation(adopted);
    const second = await previewLegacyValidationReconciliation(adopted);
    expect(await fingerprintLegacyValidationReconciliation(first))
      .toBe(await fingerprintLegacyValidationReconciliation(second));

    const canonical = adopted.validationTests?.[0];
    if (!canonical) throw new Error('missing canonical fingerprint fixture');

    const changed = await previewLegacyValidationReconciliation({
      ...adopted,
      validationTests: [{
        ...canonical,
        resultNotes: 'Local note added after review.',
      }],
    });

    expect(await fingerprintLegacyValidationReconciliation(changed))
      .not.toBe(await fingerprintLegacyValidationReconciliation(first));
  });
});
