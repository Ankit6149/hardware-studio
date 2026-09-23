import type { ProductRequirement, Project } from '../../types';
import type { EntityId } from '../../core/domain/identity';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import type {
  LegacyRequirementsAdoptionIssueCode,
  LegacyRequirementsAdoptionPreview,
  LegacyRequirementProposal,
} from './legacyRequirementsAdoption';

export type LegacyRequirementResolutionDecision = 'adopt' | 'skip';

export interface LegacyRequirementResolution {
  sourceNodeId: string;
  decision: LegacyRequirementResolutionDecision;
  title?: string;
  description?: string;
  type?: ProductRequirement['type'];
  priority?: ProductRequirement['priority'];
  acceptanceCriteria?: string[];
  linkedArchitectureNodeIds?: string[];
  linkedComponentIds?: string[];
  linkedFirmwareModuleIds?: string[];
  linkedTestIds?: string[];
  risks?: string[];
  notes?: string;
}

export interface LegacyRequirementsReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface LegacyRequirementAdoptionCommand {
  kind: 'add-requirement';
  entityId: EntityId<'requirement'>;
  payload: ProductRequirement;
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

export interface LegacyRequirementsAdoptionApplyPlan {
  adoptionSessionId: EntityId<'adoption-session'>;
  projectId: string;
  sourceRevision: string;
  reviewerId: string;
  reviewedAt: string;
  commands: LegacyRequirementAdoptionCommand[];
  adoptedRequirementIds: EntityId<'requirement'>[];
  skippedSourceNodeIds: string[];
  issues: LegacyRequirementsApplyIssue[];
  canApply: boolean;
}

function reviewValid(review: LegacyRequirementsReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function stableList(values: readonly string[] | undefined): string {
  return JSON.stringify(values || []);
}

export function requirementSnapshot(
  requirement: ProductRequirement,
): Record<string, string | number | boolean | null | undefined> {
  return {
    title: requirement.title,
    description: requirement.description,
    type: requirement.type,
    priority: requirement.priority,
    status: requirement.status,
    source: requirement.source,
    acceptanceCriteria: stableList(requirement.acceptanceCriteria),
    linkedArchitectureNodeIds: stableList(requirement.linkedArchitectureNodeIds),
    linkedComponentIds: stableList(requirement.linkedComponentIds),
    linkedFirmwareModuleIds: stableList(requirement.linkedFirmwareModuleIds),
    linkedTestIds: stableList(requirement.linkedTestIds),
    risks: stableList(requirement.risks),
    notes: requirement.notes,
  };
}

export function requirementSourceSnapshot(
  proposal: LegacyRequirementProposal,
): Record<string, string | number | boolean | null | undefined> {
  return {
    title: proposal.sourceValues.title,
    description: proposal.sourceValues.description,
  };
}

function importedProvenance(
  review: LegacyRequirementsReviewMetadata,
  source: SourceIdentity,
  unresolvedIssueCodes: LegacyRequirementsAdoptionIssueCode[],
): EngineeringProvenance {
  const note = unresolvedIssueCodes.length > 0
    ? ` Source context retained without automatic promotion: ${unresolvedIssueCodes.join(', ')}.`
    : '';
  return {
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: `Adopted from legacy Hardware Studio requirement notes after explicit review.${note}`,
  };
}

function findResolution(
  sourceNodeId: string,
  resolutions: readonly LegacyRequirementResolution[],
): LegacyRequirementResolution | undefined {
  return resolutions.find((resolution) => resolution.sourceNodeId === sourceNodeId);
}

function buildRequirement(
  proposal: LegacyRequirementProposal,
  resolution: LegacyRequirementResolution,
  preview: LegacyRequirementsAdoptionPreview,
  review: LegacyRequirementsReviewMetadata,
): { requirement?: ProductRequirement; issue?: LegacyRequirementsApplyIssue } {
  if (resolution.decision === 'skip') return {};

  const title = resolution.title?.trim() || proposal.sourceValues.title.trim();
  const description = resolution.description?.trim() || proposal.sourceValues.description.trim();

  if (!title || !description || !resolution.type || !resolution.priority) {
    return {
      issue: {
        code: 'requirement-resolution-incomplete',
        sourceEntityId: proposal.sourceNodeId,
        message: `Legacy requirement note "${proposal.sourceNodeId}" requires an explicit title, description, type, and priority before adoption.`,
      },
    };
  }

  const sourceIdentity = proposal.sourceIdentity;
  const unresolvedIssueCodes = proposal.issues
    .filter((issue) => issue.code === 'legacy-enrichment-unmapped')
    .map((issue) => issue.code);

  const requirement: ProductRequirement = {
    id: proposal.canonicalId,
    title,
    description,
    type: resolution.type,
    priority: resolution.priority,
    status: 'Draft',
    acceptanceCriteria: [...(resolution.acceptanceCriteria || [])],
    linkedArchitectureNodeIds: [...(resolution.linkedArchitectureNodeIds || [])],
    linkedComponentIds: [...(resolution.linkedComponentIds || [])],
    linkedFirmwareModuleIds: [...(resolution.linkedFirmwareModuleIds || [])],
    linkedTestIds: [...(resolution.linkedTestIds || [])],
    risks: [...(resolution.risks || [])],
    notes: resolution.notes?.trim() || undefined,
    sourceIdentity,
    provenance: importedProvenance(review, sourceIdentity, unresolvedIssueCodes),
  };

  if (sourceIdentity.contentHash) {
    requirement.reconciliationBaseline = {
      adoptionSessionId: preview.adoptionSessionId,
      sourceContentHash: sourceIdentity.contentHash,
      adoptedAt: review.reviewedAt,
      canonicalSnapshot: requirementSnapshot(requirement),
      sourceSnapshot: requirementSourceSnapshot(proposal),
      sourcePresence: 'present',
      resolution: 'adopted',
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    };
  }

  return { requirement };
}

export function buildLegacyRequirementsAdoptionApplyPlan(
  project: Project,
  preview: LegacyRequirementsAdoptionPreview,
  resolutions: readonly LegacyRequirementResolution[],
  review: LegacyRequirementsReviewMetadata,
): LegacyRequirementsAdoptionApplyPlan {
  const issues: LegacyRequirementsApplyIssue[] = [];
  const commands: LegacyRequirementAdoptionCommand[] = [];
  const adoptedRequirementIds: EntityId<'requirement'>[] = [];
  const skippedSourceNodeIds: string[] = [];

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Reviewed requirements adoption requires a reviewer identity and valid reviewedAt timestamp.',
    });
  }

  const documentIds = new Set(
    preview.requirementProposals
      .map((proposal) => proposal.sourceIdentity.documentId)
      .filter(Boolean),
  );
  if (documentIds.size > 0 && (documentIds.size !== 1 || !documentIds.has(project.id))) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The requirements adoption preview belongs to a different project.',
    });
  }

  const revisions = new Set(
    preview.requirementProposals
      .map((proposal) => proposal.sourceIdentity.revision)
      .filter(Boolean),
  );
  if (revisions.size > 0 && (revisions.size !== 1 || !revisions.has(project.version))) {
    issues.push({
      code: 'preview-revision-stale',
      message: 'The project revision changed after requirements preview. Regenerate the preview before applying.',
    });
  }

  if (preview.canonicalStatePresent || (project.requirements?.length || 0) > 0) {
    issues.push({
      code: 'canonical-state-present',
      message: 'Canonical requirements already exist. Use requirements reconciliation instead of one-way adoption.',
    });
  }

  for (const proposal of preview.requirementProposals) {
    const resolution = findResolution(proposal.sourceNodeId, resolutions);
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

    const sourceExists = (project.nodes || []).some(
      (node) => node.id === proposal.sourceNodeId && Boolean(node.data?.requirements?.trim()),
    );
    if (!sourceExists) {
      issues.push({
        code: 'requirement-source-missing',
        sourceEntityId: proposal.sourceNodeId,
        message: `Legacy requirement source "${proposal.sourceNodeId}" is no longer available.`,
      });
      continue;
    }

    const result = buildRequirement(proposal, resolution, preview, review);
    if (result.issue) {
      issues.push(result.issue);
      continue;
    }
    if (!result.requirement) continue;

    commands.push({
      kind: 'add-requirement',
      entityId: result.requirement.id as EntityId<'requirement'>,
      payload: result.requirement,
    });
    adoptedRequirementIds.push(result.requirement.id as EntityId<'requirement'>);
  }

  if (commands.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The reviewed requirements adoption contains no requirements to apply.',
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
