import type {
  ProductArchitectureConnection,
  ProductArchitectureNode,
  Project,
} from '../../types';
import type { EngineeringProvenance } from '../../core/domain/provenance';
import type { EntityId } from '../../core/domain/identity';
import type {
  LegacyArchitectureAdoptionPreview,
} from './legacyArchitectureAdoption';

export type LegacyArchitectureResolutionDecision = 'adopt' | 'skip';

export interface LegacyArchitectureNodeResolution {
  sourceNodeId: string;
  decision: LegacyArchitectureResolutionDecision;
  name?: string;
  category?: ProductArchitectureNode['category'];
  status?: ProductArchitectureNode['status'];
}

export interface LegacyArchitectureConnectionResolution {
  sourceEdgeId: string;
  decision: LegacyArchitectureResolutionDecision;
  type?: ProductArchitectureConnection['type'];
  direction?: ProductArchitectureConnection['direction'];
  protocol?: string;
  voltage?: number;
  name?: string;
}

export interface LegacyArchitectureReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export type LegacyArchitectureAdoptionCommand =
  | {
      kind: 'add-architecture-node';
      entityId: EntityId<'architecture-node'>;
      payload: ProductArchitectureNode;
    }
  | {
      kind: 'add-architecture-connection';
      entityId: EntityId<'relation'>;
      payload: ProductArchitectureConnection;
    };

export interface LegacyArchitectureApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-revision-stale'
    | 'canonical-state-present'
    | 'node-resolution-missing'
    | 'node-source-missing'
    | 'node-resolution-incomplete'
    | 'connection-resolution-missing'
    | 'connection-source-missing'
    | 'connection-resolution-incomplete'
    | 'connection-endpoint-skipped'
    | 'review-metadata-invalid';
  sourceEntityId?: string;
  message: string;
}

export interface LegacyArchitectureAdoptionApplyPlan {
  adoptionSessionId: EntityId<'adoption-session'>;
  projectId: string;
  sourceRevision: string;
  reviewerId: string;
  reviewedAt: string;
  commands: LegacyArchitectureAdoptionCommand[];
  adoptedNodeIds: EntityId<'architecture-node'>[];
  adoptedConnectionIds: EntityId<'relation'>[];
  skippedSourceNodeIds: string[];
  skippedSourceEdgeIds: string[];
  issues: LegacyArchitectureApplyIssue[];
  canApply: boolean;
}

function isValidReviewMetadata(review: LegacyArchitectureReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function findNodeResolution(
  sourceNodeId: string,
  resolutions: readonly LegacyArchitectureNodeResolution[],
): LegacyArchitectureNodeResolution | undefined {
  return resolutions.find((resolution) => resolution.sourceNodeId === sourceNodeId);
}

function findConnectionResolution(
  sourceEdgeId: string,
  resolutions: readonly LegacyArchitectureConnectionResolution[],
): LegacyArchitectureConnectionResolution | undefined {
  return resolutions.find((resolution) => resolution.sourceEdgeId === sourceEdgeId);
}

function nodeBaselineSnapshot(
  node: ProductArchitectureNode,
): Record<string, string | number | boolean | null | undefined> {
  return {
    name: node.name,
    category: node.category,
    description: node.description,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    status: node.status,
  };
}

function connectionBaselineSnapshot(
  connection: ProductArchitectureConnection,
): Record<string, string | number | boolean | null | undefined> {
  return {
    sourceNodeId: connection.sourceNodeId,
    targetNodeId: connection.targetNodeId,
    name: connection.name,
    type: connection.type,
    protocol: connection.protocol,
    voltage: connection.voltage,
    direction: connection.direction,
  };
}

function importedProvenance(
  review: LegacyArchitectureReviewMetadata,
  source: ProductArchitectureNode['sourceIdentity'] | ProductArchitectureConnection['sourceIdentity'],
): EngineeringProvenance {
  return {
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: 'Adopted from legacy Hardware Studio architecture after explicit review.',
  };
}

function cloneNodeWithResolution(
  project: Project,
  preview: LegacyArchitectureAdoptionPreview,
  sourceNodeId: string,
  resolution: LegacyArchitectureNodeResolution,
  review: LegacyArchitectureReviewMetadata,
): { node?: ProductArchitectureNode; issue?: LegacyArchitectureApplyIssue } {
  const proposal = preview.nodeProposals.find((candidate) => candidate.sourceNodeId === sourceNodeId);
  const sourceNode = (project.nodes || []).find((node) => node.id === sourceNodeId);

  if (!proposal || !sourceNode) {
    return {
      issue: {
        code: 'node-source-missing',
        sourceEntityId: sourceNodeId,
        message: `Legacy node "${sourceNodeId}" is no longer available in the current project.`,
      },
    };
  }

  if (resolution.decision === 'skip') return {};

  const base = proposal.proposed;
  const name = resolution.name?.trim() || base?.name || sourceNode.data?.name?.trim() || '';
  const category = resolution.category || base?.category;
  const status = resolution.status || base?.status;

  if (!name || !category || !status) {
    return {
      issue: {
        code: 'node-resolution-incomplete',
        sourceEntityId: sourceNodeId,
        message: `Legacy node "${sourceNodeId}" still lacks an explicit canonical name/category/status after review.`,
      },
    };
  }

  const sourceIdentity = proposal.sourceIdentity;
  const node: ProductArchitectureNode = {
    id: proposal.canonicalId,
    name,
    category,
    description: base?.description || sourceNode.data?.description?.trim() || '',
    x: base?.x ?? sourceNode.position?.x ?? 0,
    y: base?.y ?? sourceNode.position?.y ?? 0,
    width: base?.width ?? (typeof sourceNode.width === 'number' && sourceNode.width > 0 ? sourceNode.width : 160),
    height: base?.height ?? (typeof sourceNode.height === 'number' && sourceNode.height > 0 ? sourceNode.height : 72),
    linkedRequirementIds: [],
    linkedCircuitIds: [],
    linkedComponentIds: [],
    linkedFirmwareModuleIds: [],
    linkedTestIds: [],
    status,
    sourceIdentity,
    provenance: importedProvenance(review, sourceIdentity),
  };

  if (sourceIdentity.contentHash) {
    node.reconciliationBaseline = {
      adoptionSessionId: preview.adoptionSessionId,
      sourceContentHash: sourceIdentity.contentHash,
      adoptedAt: review.reviewedAt,
      canonicalSnapshot: nodeBaselineSnapshot(node),
    };
  }

  return { node };
}

function cloneConnectionWithResolution(
  project: Project,
  preview: LegacyArchitectureAdoptionPreview,
  sourceEdgeId: string,
  resolution: LegacyArchitectureConnectionResolution,
  review: LegacyArchitectureReviewMetadata,
  adoptedNodeMap: ReadonlyMap<string, EntityId<'architecture-node'>>,
): { connection?: ProductArchitectureConnection; issue?: LegacyArchitectureApplyIssue } {
  const proposal = preview.connectionProposals.find((candidate) => candidate.sourceEdgeId === sourceEdgeId);
  const sourceEdge = (project.edges || []).find((edge) => edge.id === sourceEdgeId);

  if (!proposal || !sourceEdge) {
    return {
      issue: {
        code: 'connection-source-missing',
        sourceEntityId: sourceEdgeId,
        message: `Legacy connection "${sourceEdgeId}" is no longer available in the current project.`,
      },
    };
  }

  if (resolution.decision === 'skip') return {};

  const sourceNodeId = adoptedNodeMap.get(sourceEdge.source);
  const targetNodeId = adoptedNodeMap.get(sourceEdge.target);
  if (!sourceNodeId || !targetNodeId) {
    return {
      issue: {
        code: 'connection-endpoint-skipped',
        sourceEntityId: sourceEdgeId,
        message: `Legacy connection "${sourceEdgeId}" cannot be adopted because one or both endpoints were skipped or unresolved.`,
      },
    };
  }

  const base = proposal.proposed;
  const type = resolution.type || base?.type;
  const direction = resolution.direction || base?.direction;

  if (!type || !direction) {
    return {
      issue: {
        code: 'connection-resolution-incomplete',
        sourceEntityId: sourceEdgeId,
        message: `Legacy connection "${sourceEdgeId}" still lacks explicit canonical type/direction after review.`,
      },
    };
  }

  const sourceIdentity = proposal.sourceIdentity;
  const connection: ProductArchitectureConnection = {
    id: proposal.canonicalId,
    sourceNodeId,
    targetNodeId,
    name: resolution.name?.trim()
      || base?.name
      || (typeof sourceEdge.label === 'string' ? sourceEdge.label.trim() || undefined : undefined),
    type,
    protocol: resolution.protocol?.trim() || base?.protocol,
    voltage: Number.isFinite(resolution.voltage) ? resolution.voltage : base?.voltage,
    direction,
    sourceIdentity,
    provenance: importedProvenance(review, sourceIdentity),
  };

  if (sourceIdentity.contentHash) {
    connection.reconciliationBaseline = {
      adoptionSessionId: preview.adoptionSessionId,
      sourceContentHash: sourceIdentity.contentHash,
      adoptedAt: review.reviewedAt,
      canonicalSnapshot: connectionBaselineSnapshot(connection),
    };
  }

  return { connection };
}

export function buildLegacyArchitectureAdoptionApplyPlan(
  project: Project,
  preview: LegacyArchitectureAdoptionPreview,
  nodeResolutions: readonly LegacyArchitectureNodeResolution[],
  connectionResolutions: readonly LegacyArchitectureConnectionResolution[],
  review: LegacyArchitectureReviewMetadata,
): LegacyArchitectureAdoptionApplyPlan {
  const issues: LegacyArchitectureApplyIssue[] = [];
  const commands: LegacyArchitectureAdoptionCommand[] = [];
  const adoptedNodeIds: EntityId<'architecture-node'>[] = [];
  const adoptedConnectionIds: EntityId<'relation'>[] = [];
  const skippedSourceNodeIds: string[] = [];
  const skippedSourceEdgeIds: string[] = [];

  if (!isValidReviewMetadata(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Reviewed adoption requires a non-empty reviewer identity and a valid reviewedAt timestamp.',
    });
  }

  const previewDocumentIds = new Set([
    ...preview.nodeProposals.map((proposal) => proposal.sourceIdentity.documentId),
    ...preview.connectionProposals.map((proposal) => proposal.sourceIdentity.documentId),
  ].filter(Boolean));

  if (previewDocumentIds.size > 0 && (previewDocumentIds.size !== 1 || !previewDocumentIds.has(project.id))) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The adoption preview was created for a different project and cannot be applied here.',
    });
  }

  const previewRevisions = new Set([
    ...preview.nodeProposals.map((proposal) => proposal.sourceIdentity.revision),
    ...preview.connectionProposals.map((proposal) => proposal.sourceIdentity.revision),
  ].filter(Boolean));

  if (previewRevisions.size > 0 && (previewRevisions.size !== 1 || !previewRevisions.has(project.version))) {
    issues.push({
      code: 'preview-revision-stale',
      message: 'The project revision changed after preview. Regenerate the adoption preview before applying.',
    });
  }

  if (
    preview.canonicalStatePresent
    || (project.architectureNodes?.length || 0) > 0
    || (project.architectureConnections?.length || 0) > 0
  ) {
    issues.push({
      code: 'canonical-state-present',
      message: 'Canonical architecture already exists. Use reconciliation instead of one-way legacy adoption.',
    });
  }

  const adoptedNodeMap = new Map<string, EntityId<'architecture-node'>>();

  for (const proposal of preview.nodeProposals) {
    const resolution = findNodeResolution(proposal.sourceNodeId, nodeResolutions);
    if (!resolution) {
      issues.push({
        code: 'node-resolution-missing',
        sourceEntityId: proposal.sourceNodeId,
        message: `No reviewed decision exists for legacy node "${proposal.sourceNodeId}".`,
      });
      continue;
    }

    if (resolution.decision === 'skip') {
      skippedSourceNodeIds.push(proposal.sourceNodeId);
      continue;
    }

    const result = cloneNodeWithResolution(
      project,
      preview,
      proposal.sourceNodeId,
      resolution,
      review,
    );
    if (result.issue) {
      issues.push(result.issue);
      continue;
    }
    if (!result.node) continue;

    adoptedNodeMap.set(proposal.sourceNodeId, result.node.id as EntityId<'architecture-node'>);
    adoptedNodeIds.push(result.node.id as EntityId<'architecture-node'>);
    commands.push({
      kind: 'add-architecture-node',
      entityId: result.node.id as EntityId<'architecture-node'>,
      payload: result.node,
    });
  }

  for (const proposal of preview.connectionProposals) {
    const resolution = findConnectionResolution(proposal.sourceEdgeId, connectionResolutions);
    if (!resolution) {
      issues.push({
        code: 'connection-resolution-missing',
        sourceEntityId: proposal.sourceEdgeId,
        message: `No reviewed decision exists for legacy connection "${proposal.sourceEdgeId}".`,
      });
      continue;
    }

    if (resolution.decision === 'skip') {
      skippedSourceEdgeIds.push(proposal.sourceEdgeId);
      continue;
    }

    const result = cloneConnectionWithResolution(
      project,
      preview,
      proposal.sourceEdgeId,
      resolution,
      review,
      adoptedNodeMap,
    );
    if (result.issue) {
      issues.push(result.issue);
      continue;
    }
    if (!result.connection) continue;

    adoptedConnectionIds.push(result.connection.id as EntityId<'relation'>);
    commands.push({
      kind: 'add-architecture-connection',
      entityId: result.connection.id as EntityId<'relation'>,
      payload: result.connection,
    });
  }

  return {
    adoptionSessionId: preview.adoptionSessionId,
    projectId: project.id,
    sourceRevision: project.version,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    commands,
    adoptedNodeIds,
    adoptedConnectionIds,
    skippedSourceNodeIds,
    skippedSourceEdgeIds,
    issues,
    canApply: issues.length === 0
      && adoptedNodeIds.length > 0
      && commands.length > 0,
  };
}

export function projectPatchFromLegacyArchitectureApplyPlan(
  plan: LegacyArchitectureAdoptionApplyPlan,
): Pick<Project, 'architectureNodes' | 'architectureConnections'> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable architecture adoption plan');
  }

  return {
    architectureNodes: plan.commands
      .filter((command): command is Extract<LegacyArchitectureAdoptionCommand, { kind: 'add-architecture-node' }> => command.kind === 'add-architecture-node')
      .map((command) => command.payload),
    architectureConnections: plan.commands
      .filter((command): command is Extract<LegacyArchitectureAdoptionCommand, { kind: 'add-architecture-connection' }> => command.kind === 'add-architecture-connection')
      .map((command) => command.payload),
  };
}
