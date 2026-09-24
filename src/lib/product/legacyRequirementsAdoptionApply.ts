import type { ProductRequirement, Project } from '../../types';
import type { EngineeringProvenance } from '../../core/domain/provenance';
import type { EntityId } from '../../core/domain/identity';
import {
  requirementCanonicalSnapshot,
  requirementSourceSnapshot,
  type LegacyRequirementsAdoptionPreview,
} from './legacyRequirementsAdoption';

export type LegacyRequirementResolutionDecision = 'adopt' | 'skip';

export interface LegacyRequirementResolution {
  sourceNodeId: string;
  decision: LegacyRequirementResolutionDecision;
  title?: string;
  type?: ProductRequirement['type'];
  priority?: ProductRequirement['priority'];
}

export interface LegacyRequirementsReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface LegacyRequirementsApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-revision-stale'
    | 'canonical-state-present'
    | 'requirement-resolution-missing'
    | 'requirement-source-missing'
    | 'requirement-resolution-incomplete'
    | 'review-metadata-invalid'
    | 'nothing-to-apply';
  sourceEntityId?: string;
  message: string;
}

export interface LegacyRequirementsAdoptionCommand {
  kind: 'add-requirement';
  entityId: EntityId<'requirement'>;
  payload: ProductRequirement;
}

export interface LegacyRequirementsAdoptionApplyPlan {
  adoptionSessionId: EntityId<'adoption-session'>;
  projectId: string;
  sourceRevision: string;
  reviewerId: string;
  reviewedAt: string;
  commands: LegacyRequirementsAdoptionCommand[];
  adoptedRequirementIds: EntityId<'requirement'>[];
  skippedSourceNodeIds: string[];
  issues: LegacyRequirementsApplyIssue[];
  canApply: boolean;
}

function reviewValid(review: LegacyRequirementsReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function importedProvenance(
  review: LegacyRequirementsReviewMetadata,
  source: ProductRequirement['sourceIdentity'],
): EngineeringProvenance {
  return {
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: 'Adopted from legacy Hardware Studio requirement notes after explicit review.',
  };
}

export function buildLegacyRequirementsAdoptionApplyPlan(
  project: Project,
  preview: LegacyRequirementsAdoptionPreview,
  resolutions: readonly LegacyRequirementResolution[],
  review: LegacyRequirementsReviewMetadata,
): LegacyRequirementsAdoptionApplyPlan {
  const issues: LegacyRequirementsApplyIssue[] = [];
  const commands: LegacyRequirementsAdoptionCommand[] = [];
  const adoptedRequirementIds: EntityId<'requirement'>[] = [];
  const skippedSourceNodeIds: string[] = [];

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Reviewed requirement adoption requires a reviewer identity and valid reviewedAt timestamp.',
    });
  }

  const documentIds = new Set(
    preview.proposals.map((proposal) => proposal.sourceIdentity.documentId).filter(Boolean),
  );
  if (documentIds.size > 0 && (documentIds.size !== 1 || !documentIds.has(project.id))) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The requirement adoption preview belongs to a different project.',
    });
  }

  const revisions = new Set(
    preview.proposals.map((proposal) => proposal.sourceIdentity.revision).filter(Boolean),
  );
  if (revisions.size > 0 && (revisions.size !== 1 || !revisions.has(project.version))) {
    issues.push({
      code: 'preview-revision-stale',
      message: 'The project revision changed after requirement preview. Regenerate the preview before applying.',
    });
  }

  if (preview.canonicalStatePresent || (project.requirements || []).length > 0) {
    issues.push({
      code: 'canonical-state-present',
      message: 'Canonical requirements already exist. Use reconciliation instead of one-way adoption.',
    });
  }

  for (const proposal of preview.proposals) {
    const resolution = resolutions.find(
      (candidate) => candidate.sourceNodeId === proposal.sourceNodeId,
    );

    if (!resolution) {
      issues.push({
        code: 'requirement-resolution-missing',
        sourceEntityId: proposal.sourceNodeId,
        message: `No reviewed decision exists for legacy requirement source "${proposal.sourceNodeId}".`,
      });
      continue;
    }

    if (resolution.decision === 'skip') {
      skippedSourceNodeIds.push(proposal.sourceNodeId);
      continue;
    }

    const sourceNode = (project.nodes || []).find((node) => node.id === proposal.sourceNodeId);
    if (!sourceNode || !sourceNode.data?.requirements?.trim()) {
      issues.push({
        code: 'requirement-source-missing',
        sourceEntityId: proposal.sourceNodeId,
        message: `Legacy requirement source "${proposal.sourceNodeId}" is no longer available.`,
      });
      continue;
    }

    const title = resolution.title?.trim() || proposal.proposedTitle;
    if (!title || !resolution.type || !resolution.priority) {
      issues.push({
        code: 'requirement-resolution-incomplete',
        sourceEntityId: proposal.sourceNodeId,
        message: `Legacy requirement source "${proposal.sourceNodeId}" still lacks an explicit title, type, or priority after review.`,
      });
      continue;
    }

    const requirement: ProductRequirement = {
      id: proposal.canonicalId,
      title,
      description: sourceNode.data.requirements.trim(),
      type: resolution.type,
      priority: resolution.priority,
      status: 'Draft',
      source: 'Legacy Product Blueprint requirement notes',
      acceptanceCriteria: [],
      linkedArchitectureNodeIds: [],
      linkedComponentIds: [],
      linkedFirmwareModuleIds: [],
      linkedTestIds: [],
      risks: [],
      sourceIdentity: proposal.sourceIdentity,
      provenance: importedProvenance(review, proposal.sourceIdentity),
    };

    if (proposal.sourceIdentity.contentHash) {
      requirement.reconciliationBaseline = {
        adoptionSessionId: preview.adoptionSessionId,
        sourceContentHash: proposal.sourceIdentity.contentHash,
        adoptedAt: review.reviewedAt,
        canonicalSnapshot: requirementCanonicalSnapshot(requirement),
        sourceSnapshot: requirementSourceSnapshot(
          proposal.proposedTitle,
          proposal.sourceDescription,
        ),
        sourcePresence: 'present',
        resolution: 'adopted',
        reviewedBy: review.reviewerId,
        reviewedAt: review.reviewedAt,
      };
    }

    commands.push({
      kind: 'add-requirement',
      entityId: proposal.canonicalId,
      payload: requirement,
    });
    adoptedRequirementIds.push(proposal.canonicalId);
  }

  if (commands.length === 0 && issues.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The reviewed requirement adoption contains no adopted requirements.',
    });
  }

  return {
    adoptionSessionId: preview.adoptionSessionId,
    projectId: project.id,
    sourceRevision: project.version,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    commands,
    adoptedRequirementIds,
    skippedSourceNodeIds,
    issues,
    canApply: issues.length === 0 && commands.length > 0,
  };
}

export function projectPatchFromLegacyRequirementsApplyPlan(
  plan: LegacyRequirementsAdoptionApplyPlan,
): Pick<Project, 'requirements'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable requirements adoption plan');
  }

  return {
    requirements: plan.commands.map((command) => command.payload),
  };
}
