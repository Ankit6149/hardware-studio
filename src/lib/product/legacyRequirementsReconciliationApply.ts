import type {
  ProductRequirement,
  Project,
  RequirementsReconciliationSuppression,
} from '../../types';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyRequirementsAdoption,
  requirementCanonicalSnapshot,
  requirementSourceSnapshot,
  type LegacyRequirementProposal,
} from './legacyRequirementsAdoption';
import {
  fingerprintLegacyRequirementsReconciliation,
  type RequirementsReconciliationClassification,
  type RequirementsReconciliationPreview,
} from './legacyRequirementsReconciliation';

export type RequirementsReconciliationAction =
  | 'keep-local'
  | 'take-source'
  | 'manual'
  | 'keep-canonical'
  | 'delete-canonical'
  | 'adopt-source'
  | 'reject-source';

export interface RequirementManualValues {
  title?: string;
  description?: string;
  type?: ProductRequirement['type'];
  priority?: ProductRequirement['priority'];
}

export interface RequirementsReconciliationResolution {
  sourceEntityId: string;
  action: RequirementsReconciliationAction;
  manualRequirement?: RequirementManualValues;
}

export interface RequirementsReconciliationReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface RequirementsReconciliationApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-integrity-issue'
    | 'review-metadata-invalid'
    | 'resolution-duplicate'
    | 'resolution-missing'
    | 'action-not-allowed'
    | 'source-proposal-missing'
    | 'source-fingerprint-missing'
    | 'canonical-entity-missing'
    | 'manual-resolution-incomplete'
    | 'duplicate-canonical-id'
    | 'nothing-to-apply';
  sourceEntityId?: string;
  canonicalEntityId?: string;
  message: string;
}

export type RequirementsReconciliationMutation =
  | { kind: 'upsert-requirement'; entityId: string; value: ProductRequirement }
  | { kind: 'delete-requirement'; entityId: string }
  | {
      kind: 'suppress-new-source';
      sourceIdentity: SourceIdentity;
      sourceContentHash: string;
    };

export interface RequirementsReconciliationApplyPlan {
  projectId: string;
  previewFingerprint: string;
  reviewerId: string;
  reviewedAt: string;
  mutations: RequirementsReconciliationMutation[];
  requirements: ProductRequirement[];
  suppressions: RequirementsReconciliationSuppression[];
  issues: RequirementsReconciliationApplyIssue[];
  canApply: boolean;
}

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
}

function reviewValid(review: RequirementsReconciliationReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function importedProvenance(
  current: EngineeringProvenance | undefined,
  source: SourceIdentity,
  review: RequirementsReconciliationReviewMetadata,
): EngineeringProvenance {
  return {
    ...current,
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: current?.recordedAt || review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: 'Reconciled from legacy Hardware Studio requirement notes after explicit review.',
  };
}

function allowedActions(
  classification: RequirementsReconciliationClassification,
): ReadonlySet<RequirementsReconciliationAction> {
  switch (classification) {
    case 'unchanged':
      return new Set();
    case 'source-only-change':
    case 'local-only-change':
    case 'conflict':
      return new Set(['keep-local', 'take-source', 'manual']);
    case 'source-deleted':
      return new Set(['keep-canonical', 'delete-canonical']);
    case 'new-source':
      return new Set(['adopt-source', 'reject-source', 'manual']);
  }
}

function resolutionsByItem(
  resolutions: readonly RequirementsReconciliationResolution[],
): Map<string, RequirementsReconciliationResolution[]> {
  const map = new Map<string, RequirementsReconciliationResolution[]>();
  for (const resolution of resolutions) {
    map.set(
      resolution.sourceEntityId,
      [...(map.get(resolution.sourceEntityId) || []), resolution],
    );
  }
  return map;
}

function proposalsBySourceId(
  proposals: readonly LegacyRequirementProposal[],
): Map<string, LegacyRequirementProposal> {
  return new Map(proposals.map((proposal) => [proposal.sourceNodeId, proposal]));
}

function currentRequirement(
  requirements: readonly ProductRequirement[],
  canonicalEntityId?: string,
): ProductRequirement | undefined {
  if (!canonicalEntityId) return undefined;
  return requirements.find((requirement) => requirement.id === canonicalEntityId);
}

function sourceBackedValues(
  proposal: LegacyRequirementProposal,
): Pick<ProductRequirement, 'title' | 'description'> {
  return {
    title: proposal.proposedTitle,
    description: proposal.sourceDescription,
  };
}

function applyManual(
  requirement: ProductRequirement,
  manual: RequirementManualValues,
): ProductRequirement {
  const next = { ...requirement };

  if (Object.prototype.hasOwnProperty.call(manual, 'title')) {
    next.title = manual.title?.trim() || requirement.title;
  }
  if (Object.prototype.hasOwnProperty.call(manual, 'description')) {
    next.description = manual.description?.trim() || '';
  }
  if (manual.type) next.type = manual.type;
  if (manual.priority) next.priority = manual.priority;

  return next;
}

function refreshedRequirement(
  requirement: ProductRequirement,
  sourceIdentity: SourceIdentity,
  proposal: LegacyRequirementProposal,
  review: RequirementsReconciliationReviewMetadata,
  resolution: 'keep-local' | 'take-source' | 'manual',
): ProductRequirement {
  const next: ProductRequirement = {
    ...requirement,
    sourceIdentity,
    provenance: importedProvenance(requirement.provenance, sourceIdentity, review),
  };

  next.reconciliationBaseline = {
    adoptionSessionId: requirement.reconciliationBaseline?.adoptionSessionId
      || 'legacy-requirements-reconciliation',
    sourceContentHash: sourceIdentity.contentHash || '',
    adoptedAt: requirement.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: requirementCanonicalSnapshot(next),
    sourceSnapshot: requirementSourceSnapshot(
      proposal.proposedTitle,
      proposal.sourceDescription,
    ),
    sourcePresence: 'present',
    resolution,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };

  return next;
}

function retainedAfterSourceDelete(
  requirement: ProductRequirement,
  review: RequirementsReconciliationReviewMetadata,
): ProductRequirement {
  const next = {
    ...requirement,
    provenance: requirement.sourceIdentity
      ? importedProvenance(requirement.provenance, requirement.sourceIdentity, review)
      : requirement.provenance,
  };

  next.reconciliationBaseline = {
    adoptionSessionId: requirement.reconciliationBaseline?.adoptionSessionId
      || 'legacy-requirements-reconciliation',
    sourceContentHash: requirement.reconciliationBaseline?.sourceContentHash || '',
    adoptedAt: requirement.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: requirementCanonicalSnapshot(next),
    sourceSnapshot: requirement.reconciliationBaseline?.sourceSnapshot,
    sourcePresence: 'deleted',
    resolution: 'keep-after-source-delete',
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };

  return next;
}

function updateSuppression(
  suppressions: RequirementsReconciliationSuppression[],
  sourceIdentity: SourceIdentity,
  review: RequirementsReconciliationReviewMetadata,
): RequirementsReconciliationSuppression[] {
  const hash = sourceIdentity.contentHash;
  if (!hash) return suppressions;

  const next = suppressions.filter((suppression) => !(
    sourceKey(suppression.sourceIdentity) === sourceKey(sourceIdentity)
    && suppression.sourceContentHash === hash
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

function newRequirementFromSource(
  proposal: LegacyRequirementProposal,
  resolution: RequirementsReconciliationResolution,
  review: RequirementsReconciliationReviewMetadata,
): ProductRequirement | undefined {
  const manual = resolution.manualRequirement;
  const type = manual?.type;
  const priority = manual?.priority;
  if (!type || !priority) return undefined;

  const source = sourceBackedValues(proposal);
  const title = manual?.title?.trim() || source.title;
  if (!title) return undefined;

  const description = Object.prototype.hasOwnProperty.call(manual || {}, 'description')
    ? manual?.description?.trim() || ''
    : source.description;

  const requirement: ProductRequirement = {
    id: proposal.canonicalId,
    title,
    description,
    type,
    priority,
    status: 'Draft',
    source: 'Legacy Product Blueprint requirement notes',
    acceptanceCriteria: [],
    linkedArchitectureNodeIds: [],
    linkedComponentIds: [],
    linkedFirmwareModuleIds: [],
    linkedTestIds: [],
    risks: [],
    sourceIdentity: proposal.sourceIdentity,
    provenance: importedProvenance(undefined, proposal.sourceIdentity, review),
  };

  requirement.reconciliationBaseline = {
    adoptionSessionId: 'legacy-requirements-reconciliation',
    sourceContentHash: proposal.sourceIdentity.contentHash || '',
    adoptedAt: review.reviewedAt,
    canonicalSnapshot: requirementCanonicalSnapshot(requirement),
    sourceSnapshot: requirementSourceSnapshot(
      proposal.proposedTitle,
      proposal.sourceDescription,
    ),
    sourcePresence: 'present',
    resolution: resolution.action === 'manual' ? 'manual' : 'take-source',
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };

  return requirement;
}

export async function buildLegacyRequirementsReconciliationApplyPlan(
  project: Project,
  preview: RequirementsReconciliationPreview,
  resolutions: readonly RequirementsReconciliationResolution[],
  review: RequirementsReconciliationReviewMetadata,
): Promise<RequirementsReconciliationApplyPlan> {
  const issues: RequirementsReconciliationApplyIssue[] = [];
  const mutations: RequirementsReconciliationMutation[] = [];
  const previewFingerprint = await fingerprintLegacyRequirementsReconciliation(preview);

  if (preview.projectId !== project.id) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The requirements reconciliation preview belongs to a different project.',
    });
  }

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Requirements reconciliation requires a reviewer identity and valid reviewedAt timestamp.',
    });
  }

  for (const previewIssue of preview.issues) {
    issues.push({
      code: 'preview-integrity-issue',
      sourceEntityId: previewIssue.sourceEntityId,
      canonicalEntityId: previewIssue.canonicalEntityId,
      message: previewIssue.message,
    });
  }

  const grouped = resolutionsByItem(resolutions);
  for (const [sourceEntityId, group] of grouped.entries()) {
    if (group.length > 1) {
      issues.push({
        code: 'resolution-duplicate',
        sourceEntityId,
        message: `Multiple requirements reconciliation decisions were supplied for "${sourceEntityId}".`,
      });
    }
  }

  const sourcePreview = await previewLegacyRequirementsAdoption(project);
  const proposals = proposalsBySourceId(sourcePreview.proposals);
  let finalRequirements = [...(project.requirements || [])];
  let suppressions = [...(project.requirementsReconciliationSuppressions || [])];

  for (const item of preview.items) {
    if (item.classification === 'unchanged') continue;

    const resolution = (grouped.get(item.sourceEntityId) || [])[0];
    if (!resolution) {
      issues.push({
        code: 'resolution-missing',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: `No reviewed decision exists for requirement reconciliation item "${item.sourceEntityId}".`,
      });
      continue;
    }

    if (!allowedActions(item.classification).has(resolution.action)) {
      issues.push({
        code: 'action-not-allowed',
        sourceEntityId: item.sourceEntityId,
        message: `Action "${resolution.action}" is not valid for classification "${item.classification}".`,
      });
      continue;
    }

    const proposal = proposals.get(item.sourceEntityId);
    const current = currentRequirement(finalRequirements, item.canonicalEntityId);

    if (item.classification === 'new-source') {
      if (!proposal) {
        issues.push({
          code: 'source-proposal-missing',
          sourceEntityId: item.sourceEntityId,
          message: 'The new legacy requirement source is missing from the current source preview.',
        });
        continue;
      }

      if (resolution.action === 'reject-source') {
        if (!proposal.sourceIdentity.contentHash) {
          issues.push({
            code: 'source-fingerprint-missing',
            sourceEntityId: item.sourceEntityId,
            message: 'A new source requirement cannot be durably rejected without its source fingerprint.',
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

      const created = newRequirementFromSource(proposal, resolution, review);
      if (!created) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceEntityId: item.sourceEntityId,
          message: 'Adopting a new legacy requirement requires explicit canonical type, priority, and a usable title.',
        });
        continue;
      }

      if (finalRequirements.some((requirement) => requirement.id === created.id)) {
        issues.push({
          code: 'duplicate-canonical-id',
          sourceEntityId: item.sourceEntityId,
          canonicalEntityId: created.id,
          message: `Canonical requirement id "${created.id}" already exists.`,
        });
        continue;
      }

      finalRequirements = [...finalRequirements, created];
      mutations.push({ kind: 'upsert-requirement', entityId: created.id, value: created });
      continue;
    }

    if (!current) {
      issues.push({
        code: 'canonical-entity-missing',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: 'The canonical requirement referenced by the reconciliation preview no longer exists.',
      });
      continue;
    }

    if (item.classification === 'source-deleted') {
      if (resolution.action === 'delete-canonical') {
        finalRequirements = finalRequirements.filter((requirement) => requirement.id !== current.id);
        mutations.push({ kind: 'delete-requirement', entityId: current.id });
      } else {
        const retained = retainedAfterSourceDelete(current, review);
        finalRequirements = finalRequirements.map(
          (requirement) => requirement.id === retained.id ? retained : requirement,
        );
        mutations.push({ kind: 'upsert-requirement', entityId: retained.id, value: retained });
      }
      continue;
    }

    if (!proposal) {
      issues.push({
        code: 'source-proposal-missing',
        sourceEntityId: item.sourceEntityId,
        message: 'The current legacy requirement source is unavailable.',
      });
      continue;
    }

    let next = current;
    let resolutionKind: 'keep-local' | 'take-source' | 'manual';

    if (resolution.action === 'keep-local') {
      resolutionKind = 'keep-local';
    } else if (resolution.action === 'take-source') {
      const source = sourceBackedValues(proposal);
      next = {
        ...current,
        title: source.title || current.title,
        description: source.description,
      };
      resolutionKind = 'take-source';
    } else {
      if (!resolution.manualRequirement || Object.keys(resolution.manualRequirement).length === 0) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceEntityId: item.sourceEntityId,
          message: 'Manual requirement reconciliation requires at least one explicit semantic value.',
        });
        continue;
      }
      next = applyManual(current, resolution.manualRequirement);
      resolutionKind = 'manual';
    }

    next = refreshedRequirement(
      next,
      proposal.sourceIdentity,
      proposal,
      review,
      resolutionKind,
    );
    finalRequirements = finalRequirements.map(
      (requirement) => requirement.id === next.id ? next : requirement,
    );
    mutations.push({ kind: 'upsert-requirement', entityId: next.id, value: next });
  }

  if (mutations.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The requirements reconciliation preview contains no reviewed changes to apply.',
    });
  }

  return {
    projectId: project.id,
    previewFingerprint,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    mutations,
    requirements: finalRequirements,
    suppressions,
    issues,
    canApply: issues.length === 0 && mutations.length > 0,
  };
}

export function projectPatchFromRequirementsReconciliationPlan(
  plan: RequirementsReconciliationApplyPlan,
): Pick<Project, 'requirements' | 'requirementsReconciliationSuppressions'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable requirements reconciliation plan');
  }

  return {
    requirements: plan.requirements,
    requirementsReconciliationSuppressions: plan.suppressions,
  };
}
