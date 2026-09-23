import type {
  ProductRequirement,
  Project,
  RequirementReconciliationSuppression,
} from '../../types';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyRequirementsAdoption,
  type LegacyRequirementProposal,
} from './legacyRequirementsAdoption';
import {
  requirementSnapshot,
  requirementSourceSnapshot,
} from './legacyRequirementsAdoptionApply';
import {
  fingerprintLegacyRequirementsReconciliation,
  type RequirementsReconciliationClassification,
  type RequirementsReconciliationPreview,
} from './legacyRequirementsReconciliation';

export type RequirementsReconciliationAction =
  | 'keep-local'
  | 'take-source'
  | 'manual'
  | 'delete-canonical'
  | 'adopt-source'
  | 'reject-source';

export interface RequirementSemanticValues {
  title: string;
  description: string;
  type: ProductRequirement['type'];
  priority: ProductRequirement['priority'];
  status: ProductRequirement['status'];
  source?: string;
  acceptanceCriteria: string[];
  linkedArchitectureNodeIds: string[];
  linkedComponentIds: string[];
  linkedFirmwareModuleIds: string[];
  linkedTestIds: string[];
  risks: string[];
  notes?: string;
}

export interface RequirementsReconciliationResolution {
  sourceNodeId: string;
  action: RequirementsReconciliationAction;
  manual?: Partial<RequirementSemanticValues>;
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
    | 'resolution-missing'
    | 'resolution-duplicate'
    | 'action-not-allowed'
    | 'canonical-requirement-missing'
    | 'source-proposal-missing'
    | 'source-semantics-unresolved'
    | 'manual-resolution-incomplete'
    | 'source-fingerprint-missing'
    | 'duplicate-canonical-id'
    | 'requirement-reference-blocks-delete'
    | 'nothing-to-apply';
  sourceNodeId?: string;
  canonicalRequirementId?: string;
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
  suppressions: RequirementReconciliationSuppression[];
  issues: RequirementsReconciliationApplyIssue[];
  canApply: boolean;
}

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
}

function reviewValid(review: RequirementsReconciliationReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
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
      return new Set(['keep-local', 'delete-canonical']);
    case 'new-source':
      return new Set(['adopt-source', 'reject-source']);
  }
}

function semantic(requirement: ProductRequirement): RequirementSemanticValues {
  return {
    title: requirement.title,
    description: requirement.description,
    type: requirement.type,
    priority: requirement.priority,
    status: requirement.status,
    source: requirement.source,
    acceptanceCriteria: [...requirement.acceptanceCriteria],
    linkedArchitectureNodeIds: [...requirement.linkedArchitectureNodeIds],
    linkedComponentIds: [...requirement.linkedComponentIds],
    linkedFirmwareModuleIds: [...requirement.linkedFirmwareModuleIds],
    linkedTestIds: [...requirement.linkedTestIds],
    risks: [...requirement.risks],
    notes: requirement.notes,
  };
}

function applySemantic(
  requirement: ProductRequirement,
  values: Partial<RequirementSemanticValues>,
): ProductRequirement {
  return {
    ...requirement,
    ...(Object.prototype.hasOwnProperty.call(values, 'title') ? { title: values.title! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'description') ? { description: values.description! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'type') ? { type: values.type! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'priority') ? { priority: values.priority! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'status') ? { status: values.status! } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'source') ? { source: values.source } : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'acceptanceCriteria')
      ? { acceptanceCriteria: [...(values.acceptanceCriteria || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedArchitectureNodeIds')
      ? { linkedArchitectureNodeIds: [...(values.linkedArchitectureNodeIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedComponentIds')
      ? { linkedComponentIds: [...(values.linkedComponentIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedFirmwareModuleIds')
      ? { linkedFirmwareModuleIds: [...(values.linkedFirmwareModuleIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'linkedTestIds')
      ? { linkedTestIds: [...(values.linkedTestIds || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'risks')
      ? { risks: [...(values.risks || [])] }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(values, 'notes') ? { notes: values.notes } : {}),
  };
}

function applySourceSupported(
  requirement: ProductRequirement,
  proposal: LegacyRequirementProposal,
): ProductRequirement {
  return {
    ...requirement,
    title: proposal.sourceValues.title,
    description: proposal.sourceValues.description,
  };
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

function refreshedRequirement(
  requirement: ProductRequirement,
  proposal: LegacyRequirementProposal,
  review: RequirementsReconciliationReviewMetadata,
  resolution: 'keep-local' | 'take-source' | 'manual',
): ProductRequirement {
  const refreshed: ProductRequirement = {
    ...requirement,
    sourceIdentity: proposal.sourceIdentity,
    provenance: importedProvenance(requirement.provenance, proposal.sourceIdentity, review),
  };
  refreshed.reconciliationBaseline = {
    adoptionSessionId: requirement.reconciliationBaseline?.adoptionSessionId || 'legacy-requirements-reconciliation',
    sourceContentHash: proposal.sourceIdentity.contentHash || requirement.reconciliationBaseline?.sourceContentHash || '',
    adoptedAt: requirement.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: requirementSnapshot(refreshed),
    sourceSnapshot: requirementSourceSnapshot(proposal),
    sourcePresence: 'present',
    resolution,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };
  return refreshed;
}

function retainedAfterSourceDelete(
  requirement: ProductRequirement,
  review: RequirementsReconciliationReviewMetadata,
): ProductRequirement {
  const retained: ProductRequirement = {
    ...requirement,
    provenance: requirement.sourceIdentity
      ? importedProvenance(requirement.provenance, requirement.sourceIdentity, review)
      : requirement.provenance,
  };
  retained.reconciliationBaseline = {
    adoptionSessionId: requirement.reconciliationBaseline?.adoptionSessionId || 'legacy-requirements-reconciliation',
    sourceContentHash: requirement.reconciliationBaseline?.sourceContentHash || requirement.sourceIdentity?.contentHash || '',
    adoptedAt: requirement.reconciliationBaseline?.adoptedAt || review.reviewedAt,
    canonicalSnapshot: requirementSnapshot(retained),
    sourceSnapshot: requirement.reconciliationBaseline?.sourceSnapshot,
    sourcePresence: 'deleted',
    resolution: 'keep-after-source-delete',
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
  };
  return retained;
}

function updateSuppression(
  suppressions: RequirementReconciliationSuppression[],
  sourceIdentity: SourceIdentity,
  review: RequirementsReconciliationReviewMetadata,
): RequirementReconciliationSuppression[] {
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

function completeNewRequirementManual(
  manual: Partial<RequirementSemanticValues> | undefined,
): manual is Pick<RequirementSemanticValues, 'type' | 'priority'> & Partial<RequirementSemanticValues> {
  return Boolean(manual?.type && manual?.priority);
}

function requirementReferenced(project: Project, requirementId: string): boolean {
  return (project.architectureNodes || []).some(
    (node) => (node.linkedRequirementIds || []).includes(requirementId),
  ) || (project.validationTests || []).some(
    (test) => (test.linkedRequirementIds || []).includes(requirementId),
  );
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
  for (const issue of preview.issues) {
    issues.push({
      code: 'preview-integrity-issue',
      sourceNodeId: issue.sourceEntityId,
      canonicalRequirementId: issue.canonicalEntityId,
      message: issue.message,
    });
  }

  const grouped = new Map<string, RequirementsReconciliationResolution[]>();
  for (const resolution of resolutions) {
    grouped.set(resolution.sourceNodeId, [...(grouped.get(resolution.sourceNodeId) || []), resolution]);
  }
  for (const [sourceNodeId, group] of grouped.entries()) {
    if (group.length > 1) {
      issues.push({
        code: 'resolution-duplicate',
        sourceNodeId,
        message: `Multiple requirements reconciliation decisions were supplied for "${sourceNodeId}".`,
      });
    }
  }

  const sourcePreview = await previewLegacyRequirementsAdoption(project);
  const proposals = new Map(
    sourcePreview.requirementProposals.map((proposal) => [proposal.sourceNodeId, proposal]),
  );

  let finalRequirements = [...(project.requirements || [])];
  let suppressions = [...(project.requirementReconciliationSuppressions || [])];

  for (const item of preview.items) {
    if (item.classification === 'unchanged') continue;

    const resolution = (grouped.get(item.sourceNodeId) || [])[0];
    if (!resolution) {
      issues.push({
        code: 'resolution-missing',
        sourceNodeId: item.sourceNodeId,
        canonicalRequirementId: item.canonicalRequirementId,
        message: `No reviewed decision exists for requirement source "${item.sourceNodeId}".`,
      });
      continue;
    }
    if (!allowedActions(item.classification).has(resolution.action)) {
      issues.push({
        code: 'action-not-allowed',
        sourceNodeId: item.sourceNodeId,
        message: `Action "${resolution.action}" is not valid for requirements classification "${item.classification}".`,
      });
      continue;
    }

    const proposal = proposals.get(item.sourceNodeId);
    const current = item.canonicalRequirementId
      ? finalRequirements.find((requirement) => requirement.id === item.canonicalRequirementId)
      : undefined;

    if (item.classification === 'new-source') {
      if (!proposal) {
        issues.push({
          code: 'source-proposal-missing',
          sourceNodeId: item.sourceNodeId,
          message: 'The new legacy requirement source is missing from the current preview.',
        });
        continue;
      }
      if (resolution.action === 'reject-source') {
        if (!proposal.sourceIdentity.contentHash) {
          issues.push({
            code: 'source-fingerprint-missing',
            sourceNodeId: item.sourceNodeId,
            message: 'A new requirement source cannot be durably rejected without a source fingerprint.',
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

      if (!completeNewRequirementManual(resolution.manual)) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceNodeId: item.sourceNodeId,
          message: 'Adopting a new legacy requirement requires explicit canonical type and priority.',
        });
        continue;
      }
      const title = resolution.manual.title?.trim() || proposal.sourceValues.title.trim();
      const description = resolution.manual.description?.trim() || proposal.sourceValues.description.trim();
      if (!title || !description) {
        issues.push({
          code: 'source-semantics-unresolved',
          sourceNodeId: item.sourceNodeId,
          message: 'The legacy requirement source lacks a usable title or description. Supply both explicitly.',
        });
        continue;
      }
      if (finalRequirements.some((requirement) => requirement.id === proposal.canonicalId)) {
        issues.push({
          code: 'duplicate-canonical-id',
          sourceNodeId: item.sourceNodeId,
          canonicalRequirementId: proposal.canonicalId,
          message: `Canonical requirement id "${proposal.canonicalId}" already exists.`,
        });
        continue;
      }

      let created: ProductRequirement = {
        id: proposal.canonicalId,
        title,
        description,
        type: resolution.manual.type,
        priority: resolution.manual.priority,
        status: 'Draft',
        source: resolution.manual.source,
        acceptanceCriteria: [...(resolution.manual.acceptanceCriteria || [])],
        linkedArchitectureNodeIds: [...(resolution.manual.linkedArchitectureNodeIds || [])],
        linkedComponentIds: [...(resolution.manual.linkedComponentIds || [])],
        linkedFirmwareModuleIds: [...(resolution.manual.linkedFirmwareModuleIds || [])],
        linkedTestIds: [...(resolution.manual.linkedTestIds || [])],
        risks: [...(resolution.manual.risks || [])],
        notes: resolution.manual.notes,
        sourceIdentity: proposal.sourceIdentity,
        provenance: importedProvenance(undefined, proposal.sourceIdentity, review),
      };
      created = applySemantic(created, resolution.manual);
      created.status = 'Draft';
      created.reconciliationBaseline = {
        adoptionSessionId: 'legacy-requirements-reconciliation',
        sourceContentHash: proposal.sourceIdentity.contentHash || '',
        adoptedAt: review.reviewedAt,
        canonicalSnapshot: requirementSnapshot(created),
        sourceSnapshot: requirementSourceSnapshot(proposal),
        sourcePresence: 'present',
        resolution: 'manual',
        reviewedBy: review.reviewerId,
        reviewedAt: review.reviewedAt,
      };

      finalRequirements = [...finalRequirements, created];
      mutations.push({ kind: 'upsert-requirement', entityId: created.id, value: created });
      continue;
    }

    if (!current) {
      issues.push({
        code: 'canonical-requirement-missing',
        sourceNodeId: item.sourceNodeId,
        canonicalRequirementId: item.canonicalRequirementId,
        message: 'The canonical requirement referenced by this preview no longer exists.',
      });
      continue;
    }

    if (item.classification === 'source-deleted') {
      if (resolution.action === 'delete-canonical') {
        if (requirementReferenced(project, current.id)) {
          issues.push({
            code: 'requirement-reference-blocks-delete',
            sourceNodeId: item.sourceNodeId,
            canonicalRequirementId: current.id,
            message: 'Canonical requirement cannot be deleted while architecture or validation records still reference it.',
          });
          continue;
        }
        finalRequirements = finalRequirements.filter((requirement) => requirement.id !== current.id);
        mutations.push({ kind: 'delete-requirement', entityId: current.id });
      } else {
        const retained = retainedAfterSourceDelete(current, review);
        finalRequirements = finalRequirements.map((requirement) => requirement.id === retained.id ? retained : requirement);
        mutations.push({ kind: 'upsert-requirement', entityId: retained.id, value: retained });
      }
      continue;
    }

    if (!proposal) {
      issues.push({
        code: 'source-proposal-missing',
        sourceNodeId: item.sourceNodeId,
        message: 'The current legacy requirement source proposal is unavailable.',
      });
      continue;
    }

    let next = current;
    let resolutionKind: 'keep-local' | 'take-source' | 'manual';
    if (resolution.action === 'keep-local') {
      resolutionKind = 'keep-local';
    } else if (resolution.action === 'take-source') {
      if (!proposal.sourceValues.title.trim() || !proposal.sourceValues.description.trim()) {
        issues.push({
          code: 'source-semantics-unresolved',
          sourceNodeId: item.sourceNodeId,
          message: 'Legacy requirement title or description is unresolved; keep local or provide a manual resolution.',
        });
        continue;
      }
      next = applySourceSupported(current, proposal);
      resolutionKind = 'take-source';
    } else {
      if (!resolution.manual || Object.keys(resolution.manual).length === 0) {
        issues.push({
          code: 'manual-resolution-incomplete',
          sourceNodeId: item.sourceNodeId,
          message: 'Manual requirements reconciliation requires at least one explicit semantic value.',
        });
        continue;
      }
      next = applySemantic(current, resolution.manual);
      resolutionKind = 'manual';
    }

    next = refreshedRequirement(next, proposal, review, resolutionKind);
    finalRequirements = finalRequirements.map((requirement) => requirement.id === next.id ? next : requirement);
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
): Pick<Project, 'requirements' | 'requirementReconciliationSuppressions'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable requirements reconciliation plan');
  }
  return {
    requirements: plan.requirements,
    requirementReconciliationSuppressions: plan.suppressions,
  };
}
