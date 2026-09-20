import type {
  Project,
  ValidationReconciliationSuppression,
  ValidationTest,
} from '../../types';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyValidationAdoption,
  type LegacyValidationTestProposal,
} from './legacyValidationAdoption';
import {
  fingerprintLegacyValidationReconciliation,
  type ValidationReconciliationClassification,
  type ValidationReconciliationPreview,
} from './legacyValidationReconciliation';

export type ValidationReconciliationAction =
  | 'keep-local'
  | 'take-source'
  | 'manual'
  | 'delete-canonical'
  | 'adopt-source'
  | 'reject-source';

export interface ValidationSemanticValues {
  name: string;
  testName?: string;
  stage?: ValidationTest['stage'];
  category?: string;
  status?: string;
  linkedRequirementIds: string[];
  linkedArchitectureNodeIds?: string[];
  linkedComponentIds?: string[];
  linkedNetIds?: string[];
  linkedFirmwareModuleIds?: string[];
  passCriteria: string[];
  resultNotes?: string;
}

export interface ValidationReconciliationResolution {
  sourceTestStageId: string;
  action: ValidationReconciliationAction;
  manual?: Partial<ValidationSemanticValues>;
}

export interface ValidationReconciliationReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface ValidationReconciliationApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-integrity-issue'
    | 'review-metadata-invalid'
    | 'resolution-missing'
    | 'resolution-duplicate'
    | 'action-not-allowed'
    | 'canonical-test-missing'
    | 'source-proposal-missing'
    | 'source-semantics-unresolved'
    | 'manual-resolution-incomplete'
    | 'source-fingerprint-missing'
    | 'duplicate-canonical-id'
    | 'validation-run-reference-blocks-delete'
    | 'nothing-to-apply';
  sourceTestStageId?: string;
  canonicalTestId?: string;
  message: string;
}

export type ValidationReconciliationMutation =
  | { kind: 'upsert-test'; entityId: string; value: ValidationTest }
  | { kind: 'delete-test'; entityId: string }
  | {
      kind: 'suppress-new-source';
      sourceIdentity: SourceIdentity;
      sourceContentHash: string;
    };

export interface ValidationReconciliationApplyPlan {
  projectId: string;
  previewFingerprint: string;
  reviewerId: string;
  reviewedAt: string;
  mutations: ValidationReconciliationMutation[];
  validationTests: ValidationTest[];
  suppressions: ValidationReconciliationSuppression[];
  issues: ValidationReconciliationApplyIssue[];
  canApply: boolean;
}

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
}

function stableList(values: readonly string[] | undefined): string {
  return JSON.stringify(values || []);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function validationSnapshot(
  test: ValidationTest,
): Record<string, string | number | boolean | null | undefined> {
  return {
    name: test.name,
    testName: test.testName,
    stage: test.stage,
    category: test.category,
    status: test.status,
    linkedRequirementIds: stableList(test.linkedRequirementIds),
    linkedArchitectureNodeIds: stableList(test.linkedArchitectureNodeIds),
    linkedComponentIds: stableList(test.linkedComponentIds),
    linkedNetIds: stableList(test.linkedNetIds),
    linkedFirmwareModuleIds: stableList(test.linkedFirmwareModuleIds),
    passCriteria: stableList(test.passCriteria),
    steps: stableJson(test.steps),
    measurements: stableJson(test.measurements),
    evidence: stableJson(test.evidence),
    resultNotes: test.resultNotes,
  };
}

function semanticFromProposal(
  proposal: LegacyValidationTestProposal,
): ValidationSemanticValues | undefined {
  const test = proposal.proposed;
  if (!test) return undefined;
  return {
    name: test.name,
    testName: test.testName,
    stage: test.stage,
    category: test.category,
    status: test.status,
    linkedRequirementIds: [...test.linkedRequirementIds],
    linkedArchitectureNodeIds: [...(test.linkedArchitectureNodeIds || [])],
    linkedComponentIds: [...(test.linkedComponentIds || [])],
    linkedNetIds: [...(test.linkedNetIds || [])],
    linkedFirmwareModuleIds: [...(test.linkedFirmwareModuleIds || [])],
    passCriteria: [...test.passCriteria],
    resultNotes: test.resultNotes,
  };
}

function applySemantic(
  test: ValidationTest,
  values: Partial<ValidationSemanticValues>,
): ValidationTest {
  return {
    ...test,
    ...(Object.prototype.hasOwnProperty.call(values, 'name') ? { name: values.name! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'testName') ? { testName: values.testName } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'stage') ? { stage: values.stage } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'category') ? { category: values.category } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'status') ? { status: values.status } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedRequirementIds')
      ? { linkedRequirementIds: [...(values.linkedRequirementIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedArchitectureNodeIds')
      ? { linkedArchitectureNodeIds: [...(values.linkedArchitectureNodeIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedComponentIds')
      ? { linkedComponentIds: [...(values.linkedComponentIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedNetIds')
      ? { linkedNetIds: [...(values.linkedNetIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedFirmwareModuleIds')
      ? { linkedFirmwareModuleIds: [...(values.linkedFirmwareModuleIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'passCriteria')
      ? { passCriteria: [...(values.passCriteria || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'resultNotes')
      ? { resultNotes: values.resultNotes }
      : {}),
  };
}

function reviewValid(review: ValidationReconciliationReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function allowedActions(
  classification: ValidationReconciliationClassification,
): ReadonlySet<ValidationReconciliationAction> {
  switch (classification) {
    case 'unchanged':
      return new Set();
    case 'source-only-change':
    case 'local-only-change':
    case 'conflict':
      return new Set(['keep-local', 'take-source', 'manual']);
    case 'source-deleted':
      return new Set(['keep-local', 'delete-canonical']);
    case 'new-source':
      return new Set(['adopt-source', 'reject-source']);
  }
}

function importedProvenance(
  current: EngineeringProvenance | undefined,
  source: SourceIdentity,
  review: ValidationReconciliationReviewMetadata,
): EngineeringProvenance {
  return {
    ...current,
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: current?.recordedAt || review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: 'Reconciled from legacy Hardware Studio testing after explicit review.',
  };
}

function updateSuppression(
  suppressions: ValidationReconciliationSuppression[],
  sourceIdentity: SourceIdentity,
  review: ValidationReconciliationReviewMetadata,
): ValidationReconciliationSuppression[] {
  const hash = sourceIdentity.contentHash;
  if (!hash) return suppressions;

  const next = suppressions.filter((suppression) => (
    sourceKey(suppression.sourceIdentity) !== sourceKey(sourceIdentity)
    || suppression.sourceContentHash !== hash
  ));

  next.push({
    sourceIdentity,
    sourceContentHash: hash,
    decision: 'reject-new-source',
    reviewedAt: review.reviewedAt,
    reviewedBy: review.reviewerId,
  });
  return next;
}

function refreshedTest(
  test: ValidationTest,
  sourceIdentity: SourceIdentity,
  sourceSemantic: ValidationSemanticValues | undefined,
  review: ValidationReconciliationReviewMetadata,
  resolution: 'keep-local' | 'take-source' | 'manual',
): ValidationTest {
  const refreshed: ValidationTest = {
    ...test,
    sourceIdentity,
    provenance: importedProvenance(test.provenance, sourceIdentity, review),
  };

  refreshed.reconciliationBaseline = {
    adoptionSessionId: test.reconciliationBaseline?.adoptionSessionId || 'legacy-validation-reconciliation',
    sourceContentHash: sourceIdentity.contentHash || test.reconciliationBaseline?.sourceContentHash || '',
    adoptedAt: test.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: validationSnapshot(refreshed),
    sourceSnapshot: sourceSemantic
      ? validationSnapshot({
          ...refreshed,
          ...sourceSemantic,
        })
      : undefined,
    sourcePresence: 'present',
    resolution,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };
  return refreshed;
}

function retainedAfterSourceDelete(
  test: ValidationTest,
  review: ValidationReconciliationReviewMetadata,
): ValidationTest {
  const retained: ValidationTest = {
    ...test,
    provenance: test.sourceIdentity
      ? importedProvenance(test.provenance, test.sourceIdentity, review)
      : test.provenance,
  };
  retained.reconciliationBaseline = {
    adoptionSessionId: test.reconciliationBaseline?.adoptionSessionId || 'legacy-validation-reconciliation',
    sourceContentHash: test.reconciliationBaseline?.sourceContentHash || test.sourceIdentity?.contentHash || '',
    adoptedAt: test.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: validationSnapshot(retained),
    sourceSnapshot: test.reconciliationBaseline?.sourceSnapshot,
    sourcePresence: 'deleted',
    resolution: 'keep-after-source-delete',
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };
  return retained;
}

function fullManualForNewSource(
  manual: Partial<ValidationSemanticValues> | undefined,
): manual is ValidationSemanticValues {
  return Boolean(
    manual
    && typeof manual.name === 'string'
    && manual.name.trim()
    && Array.isArray(manual.linkedRequirementIds)
    && Array.isArray(manual.passCriteria)
  );
}

export async function buildLegacyValidationReconciliationApplyPlan(
  project: Project,
  preview: ValidationReconciliationPreview,
  resolutions: readonly ValidationReconciliationResolution[],
  review: ValidationReconciliationReviewMetadata,
): Promise<ValidationReconciliationApplyPlan> {
  const issues: ValidationReconciliationApplyIssue[] = [];
  const mutations: ValidationReconciliationMutation[] = [];
  const previewFingerprint = await fingerprintLegacyValidationReconciliation(preview);

  if (preview.projectId !== project.id) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The validation reconciliation preview belongs to a different project.',
    });
  }

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Validation reconciliation requires a reviewer identity and valid reviewedAt timestamp.',
    });
  }

  for (const issue of preview.issues) {
    issues.push({
      code: 'preview-integrity-issue',
      sourceTestStageId: issue.sourceTestStageId,
      canonicalTestId: issue.canonicalTestId,
      message: issue.message,
    });
  }

  const grouped = new Map<string, ValidationReconciliationResolution[]>();
  for (const resolution of resolutions) {
    grouped.set(
      resolution.sourceTestStageId,
      [...(grouped.get(resolution.sourceTestStageId) || []), resolution],
    );
  }
  for (const [sourceTestStageId, group] of grouped.entries()) {
    if (group.length > 1) {
      issues.push({
        code: 'resolution-duplicate',
        sourceTestStageId,
        message: `Multiple validation reconciliation decisions were supplied for "${sourceTestStageId}".`,
      });
    }
  }

  const sourcePreview = await previewLegacyValidationAdoption(project);
  const proposals = new Map(
    sourcePreview.testProposals.map((proposal) => [proposal.sourceTestStageId, proposal]),
  );

  let finalTests = [...(project.validationTests || [])];
  let suppressions = [...(project.validationReconciliationSuppressions || [])];

  for (const item of preview.items) {
    if (item.classification === 'unchanged') continue;

    const group = grouped.get(item.sourceTestStageId) || [];
    const resolution = group[0];
    if (!resolution) {
      issues.push({
        code: 'resolution-missing',
        sourceTestStageId: item.sourceTestStageId,
        canonicalTestId: item.canonicalTestId,
        message: `No reviewed decision exists for validation item "${item.sourceTestStageId}".`,
      });
      continue;
    }

    if (!allowedActions(item.classification).has(resolution.action)) {
      issues.push({
        code: 'action-not-allowed',
        sourceTestStageId: item.sourceTestStageId,
        message: `Action "${resolution.action}" is not valid for validation classification "${item.classification}".`,
      });
      continue;
    }

    const proposal = proposals.get(item.sourceTestStageId);
    const current = item.canonicalTestId
      ? finalTests.find((test) => test.id === item.canonicalTestId)
      : undefined;

    if (item.classification === 'new-source') {
      if (!proposal) {
        issues.push({
          code: 'source-proposal-missing',
          sourceTestStageId: item.sourceTestStageId,
          message: 'The new legacy validation source is missing from the current preview.',
        });
        continue;
      }

      if (resolution.action === 'reject-source') {
        if (!proposal.sourceIdentity.contentHash) {
          issues.push({
            code: 'source-fingerprint-missing',
            sourceTestStageId: item.sourceTestStageId,
            message: 'A new validation source cannot be durably rejected without a source fingerprint.',
          });
          continue;
        }
        suppressions = updateSuppression(suppressions, proposal.sourceIdentity, review);
        mutations.push({
          kind: 'suppress-new-source',
          sourceIdentity: proposal.sourceIdentity,
          sourceContentHash: proposal.sourceIdentity.contentHash,
        });
        continue;
      }

      const sourceSemantic = semanticFromProposal(proposal);
      const semantic = sourceSemantic
        || (fullManualForNewSource(resolution.manual) ? resolution.manual : undefined);
      if (!semantic) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceTestStageId: item.sourceTestStageId,
          message: 'Adopting an unresolved new validation source requires complete manual validation semantics.',
        });
        continue;
      }

      if (finalTests.some((test) => test.id === proposal.canonicalId)) {
        issues.push({
          code: 'duplicate-canonical-id',
          sourceTestStageId: item.sourceTestStageId,
          canonicalTestId: proposal.canonicalId,
          message: `Canonical validation test id "${proposal.canonicalId}" already exists.`,
        });
        continue;
      }

      const sourceIdentity = proposal.sourceIdentity;
      const created: ValidationTest = {
        id: proposal.canonicalId,
        name: semantic.name,
        testName: semantic.testName,
        stage: semantic.stage,
        category: semantic.category,
        status: semantic.status,
        linkedRequirementIds: [...semantic.linkedRequirementIds],
        linkedArchitectureNodeIds: [...(semantic.linkedArchitectureNodeIds || [])],
        linkedComponentIds: [...(semantic.linkedComponentIds || [])],
        linkedNetIds: [...(semantic.linkedNetIds || [])],
        linkedFirmwareModuleIds: [...(semantic.linkedFirmwareModuleIds || [])],
        steps: [],
        measurements: [],
        passCriteria: [...semantic.passCriteria],
        evidence: [],
        resultNotes: semantic.resultNotes,
        sourceIdentity,
        provenance: importedProvenance(undefined, sourceIdentity, review),
      };
      created.reconciliationBaseline = {
        adoptionSessionId: 'legacy-validation-reconciliation',
        sourceContentHash: sourceIdentity.contentHash || '',
        adoptedAt: review.reviewedAt,
        canonicalSnapshot: validationSnapshot(created),
        sourceSnapshot: sourceSemantic
          ? validationSnapshot({ ...created, ...sourceSemantic })
          : undefined,
        sourcePresence: 'present',
        resolution: sourceSemantic ? 'take-source' : 'manual',
        reviewedBy: review.reviewerId,
        reviewedAt: review.reviewedAt,
      };

      finalTests = [...finalTests, created];
      mutations.push({ kind: 'upsert-test', entityId: created.id, value: created });
      continue;
    }

    if (!current) {
      issues.push({
        code: 'canonical-test-missing',
        sourceTestStageId: item.sourceTestStageId,
        canonicalTestId: item.canonicalTestId,
        message: 'The canonical validation test referenced by this preview no longer exists.',
      });
      continue;
    }

    if (item.classification === 'source-deleted') {
      if (resolution.action === 'delete-canonical') {
        const referencedByRuns = (project.validationRuns || []).some(
          (run) => run.testId === current.id,
        );
        if (referencedByRuns) {
          issues.push({
            code: 'validation-run-reference-blocks-delete',
            sourceTestStageId: item.sourceTestStageId,
            canonicalTestId: current.id,
            message: 'Canonical validation test cannot be deleted while validation runs still reference it. Preserve or re-home the evidence first.',
          });
          continue;
        }
        finalTests = finalTests.filter((test) => test.id !== current.id);
        mutations.push({ kind: 'delete-test', entityId: current.id });
      } else {
        const retained = retainedAfterSourceDelete(current, review);
        finalTests = finalTests.map((test) => test.id === retained.id ? retained : test);
        mutations.push({ kind: 'upsert-test', entityId: retained.id, value: retained });
      }
      continue;
    }

    if (!proposal) {
      issues.push({
        code: 'source-proposal-missing',
        sourceTestStageId: item.sourceTestStageId,
        message: 'The current legacy validation source proposal is unavailable.',
      });
      continue;
    }

    const sourceSemantic = semanticFromProposal(proposal);
    let next = current;
    let resolutionKind: 'keep-local' | 'take-source' | 'manual';

    if (resolution.action === 'keep-local') {
      resolutionKind = 'keep-local';
    } else if (resolution.action === 'take-source') {
      if (!sourceSemantic) {
        issues.push({
          code: 'source-semantics-unresolved',
          sourceTestStageId: item.sourceTestStageId,
          message: 'Legacy validation semantics are unresolved; choose keep-local or provide a manual resolution.',
        });
        continue;
      }
      next = applySemantic(current, sourceSemantic);
      resolutionKind = 'take-source';
    } else {
      if (!resolution.manual || Object.keys(resolution.manual).length === 0) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceTestStageId: item.sourceTestStageId,
          message: 'Manual validation reconciliation requires at least one explicit semantic value.',
        });
        continue;
      }
      next = applySemantic(current, resolution.manual);
      resolutionKind = 'manual';
    }

    next = refreshedTest(
      next,
      proposal.sourceIdentity,
      sourceSemantic,
      review,
      resolutionKind,
    );
    finalTests = finalTests.map((test) => test.id === next.id ? next : test);
    mutations.push({ kind: 'upsert-test', entityId: next.id, value: next });
  }

  if (mutations.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The validation reconciliation preview contains no reviewed changes to apply.',
    });
  }

  return {
    projectId: project.id,
    previewFingerprint,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    mutations,
    validationTests: finalTests,
    suppressions,
    issues,
    canApply: issues.length === 0 && mutations.length > 0,
  };
}

export function projectPatchFromValidationReconciliationPlan(
  plan: ValidationReconciliationApplyPlan,
): Pick<Project, 'validationTests' | 'validationReconciliationSuppressions'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable validation reconciliation plan');
  }

  return {
    validationTests: plan.validationTests,
    validationReconciliationSuppressions: plan.suppressions,
  };
}
