import type { Project, TestStage, ValidationTest } from '../../types';
import type { EntityId } from '../../core/domain/identity';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import type {
  LegacyValidationAdoptionPreview,
  LegacyValidationAdoptionIssueCode,
} from './legacyValidationAdoption';

export type LegacyValidationResolutionDecision = 'adopt' | 'skip';

export interface LegacyValidationTestResolution {
  sourceTestStageId: string;
  decision: LegacyValidationResolutionDecision;
  name?: string;
  stage?: ValidationTest['stage'];
  category?: string;
  status?: string;
  linkedArchitectureNodeIds?: string[];
}

export interface LegacyValidationReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface LegacyValidationAdoptionCommand {
  kind: 'add-validation-test';
  entityId: EntityId<'validation-test'>;
  payload: ValidationTest;
}

export interface LegacyValidationApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-revision-stale'
    | 'canonical-state-present'
    | 'test-resolution-missing'
    | 'test-source-missing'
    | 'test-resolution-incomplete'
    | 'review-metadata-invalid'
    | 'nothing-to-apply';
  sourceEntityId?: string;
  message: string;
}

export interface LegacyValidationAdoptionApplyPlan {
  adoptionSessionId: EntityId<'adoption-session'>;
  projectId: string;
  sourceRevision: string;
  reviewerId: string;
  reviewedAt: string;
  commands: LegacyValidationAdoptionCommand[];
  adoptedTestIds: EntityId<'validation-test'>[];
  skippedSourceTestStageIds: string[];
  issues: LegacyValidationApplyIssue[];
  canApply: boolean;
}

function reviewValid(review: LegacyValidationReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function findResolution(
  sourceTestStageId: string,
  resolutions: readonly LegacyValidationTestResolution[],
): LegacyValidationTestResolution | undefined {
  return resolutions.find((resolution) => resolution.sourceTestStageId === sourceTestStageId);
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

function importedProvenance(
  review: LegacyValidationReviewMetadata,
  source: SourceIdentity,
  unresolvedIssueCodes: LegacyValidationAdoptionIssueCode[],
): EngineeringProvenance {
  const issueNote = unresolvedIssueCodes.length > 0
    ? ` Unpromoted legacy details remain in source: ${unresolvedIssueCodes.join(', ')}.`
    : '';

  return {
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: `Adopted from legacy Hardware Studio testing after explicit review.${issueNote}`,
  };
}

function baseTestFromLegacyStage(
  stage: TestStage,
  canonicalId: EntityId<'validation-test'>,
): ValidationTest {
  const category = stage.category?.trim();
  const stageFromCategory = (
    category === 'EVT'
    || category === 'DVT'
    || category === 'PVT'
    || category === 'Factory QA'
  ) ? category : undefined;

  return {
    id: canonicalId,
    name: stage.name?.trim() || '',
    stage: stage.stage || stageFromCategory,
    category: stageFromCategory === category ? undefined : category,
    linkedRequirementIds: [...(stage.linkedRequirementIds || [])],
    linkedArchitectureNodeIds: [],
    linkedComponentIds: [...(stage.linkedComponentIds || [])],
    linkedNetIds: [...(stage.linkedNetIds || [])],
    linkedFirmwareModuleIds: [...(stage.linkedFirmwareModuleIds || [])],
    steps: [],
    measurements: [],
    passCriteria: stage.passCriteria?.trim() ? [stage.passCriteria.trim()] : [],
    status: stage.status,
    evidence: [],
    resultNotes: stage.resultNotes?.trim() || undefined,
  };
}

function buildAdoptedTest(
  project: Project,
  preview: LegacyValidationAdoptionPreview,
  sourceTestStageId: string,
  resolution: LegacyValidationTestResolution,
  review: LegacyValidationReviewMetadata,
): { test?: ValidationTest; issue?: LegacyValidationApplyIssue } {
  const proposal = preview.testProposals.find(
    (candidate) => candidate.sourceTestStageId === sourceTestStageId,
  );
  const sourceStage = (project.testing || []).find((stage) => stage.id === sourceTestStageId);

  if (!proposal || !sourceStage) {
    return {
      issue: {
        code: 'test-source-missing',
        sourceEntityId: sourceTestStageId,
        message: `Legacy test stage "${sourceTestStageId}" is no longer available in the current project.`,
      },
    };
  }

  if (resolution.decision === 'skip') return {};

  const base = proposal.proposed
    ? { ...proposal.proposed }
    : baseTestFromLegacyStage(sourceStage, proposal.canonicalId);

  const name = resolution.name?.trim() || base.name?.trim() || '';
  if (!name) {
    return {
      issue: {
        code: 'test-resolution-incomplete',
        sourceEntityId: sourceTestStageId,
        message: `Legacy test stage "${sourceTestStageId}" still has no canonical test name after review.`,
      },
    };
  }

  const sourceIdentity = proposal.sourceIdentity;
  const unresolvedIssueCodes = proposal.issues
    .filter((issue) => issue.severity !== 'info')
    .map((issue) => issue.code);

  const test: ValidationTest = {
    ...base,
    id: proposal.canonicalId,
    name,
    ...(resolution.stage !== undefined ? { stage: resolution.stage } : {}),
    ...(resolution.category !== undefined ? { category: resolution.category.trim() || undefined } : {}),
    ...(resolution.status !== undefined ? { status: resolution.status } : {}),
    ...(resolution.linkedArchitectureNodeIds !== undefined
      ? { linkedArchitectureNodeIds: [...resolution.linkedArchitectureNodeIds] }
      : {}),
    sourceIdentity,
    provenance: importedProvenance(review, sourceIdentity, unresolvedIssueCodes),
  };

  if (sourceIdentity.contentHash) {
    test.reconciliationBaseline = {
      adoptionSessionId: preview.adoptionSessionId,
      sourceContentHash: sourceIdentity.contentHash,
      adoptedAt: review.reviewedAt,
      canonicalSnapshot: validationSnapshot(test),
      sourceSnapshot: proposal.proposed
        ? validationSnapshot(proposal.proposed)
        : validationSnapshot(baseTestFromLegacyStage(sourceStage, proposal.canonicalId)),
      sourcePresence: 'present',
      resolution: 'adopted',
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    };
  }

  return { test };
}

export function buildLegacyValidationAdoptionApplyPlan(
  project: Project,
  preview: LegacyValidationAdoptionPreview,
  resolutions: readonly LegacyValidationTestResolution[],
  review: LegacyValidationReviewMetadata,
): LegacyValidationAdoptionApplyPlan {
  const issues: LegacyValidationApplyIssue[] = [];
  const commands: LegacyValidationAdoptionCommand[] = [];
  const adoptedTestIds: EntityId<'validation-test'>[] = [];
  const skippedSourceTestStageIds: string[] = [];

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Reviewed validation adoption requires a reviewer identity and valid reviewedAt timestamp.',
    });
  }

  const documentIds = new Set(
    preview.testProposals
      .map((proposal) => proposal.sourceIdentity.documentId)
      .filter(Boolean),
  );
  if (documentIds.size > 0 && (documentIds.size !== 1 || !documentIds.has(project.id))) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The validation adoption preview belongs to a different project.',
    });
  }

  const revisions = new Set(
    preview.testProposals
      .map((proposal) => proposal.sourceIdentity.revision)
      .filter(Boolean),
  );
  if (revisions.size > 0 && (revisions.size !== 1 || !revisions.has(project.version))) {
    issues.push({
      code: 'preview-revision-stale',
      message: 'The project revision changed after validation preview. Regenerate the preview before applying.',
    });
  }

  if (preview.canonicalStatePresent || (project.validationTests?.length || 0) > 0) {
    issues.push({
      code: 'canonical-state-present',
      message: 'Canonical validation tests already exist. Use validation reconciliation instead of one-way adoption.',
    });
  }

  for (const proposal of preview.testProposals) {
    const resolution = findResolution(proposal.sourceTestStageId, resolutions);
    if (!resolution) {
      issues.push({
        code: 'test-resolution-missing',
        sourceEntityId: proposal.sourceTestStageId,
        message: `No reviewed decision exists for legacy test stage "${proposal.sourceTestStageId}".`,
      });
      continue;
    }

    if (resolution.decision === 'skip') {
      skippedSourceTestStageIds.push(proposal.sourceTestStageId);
      continue;
    }

    const result = buildAdoptedTest(
      project,
      preview,
      proposal.sourceTestStageId,
      resolution,
      review,
    );
    if (result.issue) {
      issues.push(result.issue);
      continue;
    }
    if (!result.test) continue;

    adoptedTestIds.push(result.test.id as EntityId<'validation-test'>);
    commands.push({
      kind: 'add-validation-test',
      entityId: result.test.id as EntityId<'validation-test'>,
      payload: result.test,
    });
  }

  if (commands.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The reviewed validation adoption contains no tests to apply.',
    });
  }

  return {
    adoptionSessionId: preview.adoptionSessionId,
    projectId: project.id,
    sourceRevision: project.version,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    commands,
    adoptedTestIds,
    skippedSourceTestStageIds,
    issues,
    canApply: issues.length === 0 && commands.length > 0,
  };
}

export function projectPatchFromLegacyValidationApplyPlan(
  plan: LegacyValidationAdoptionApplyPlan,
): Pick<Project, 'validationTests'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable validation adoption plan');
  }

  return {
    validationTests: plan.commands.map((command) => command.payload),
  };
}
