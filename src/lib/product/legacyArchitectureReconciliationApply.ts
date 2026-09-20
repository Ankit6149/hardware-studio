import type {
  ArchitectureReconciliationSuppression,
  ProductArchitectureConnection,
  ProductArchitectureNode,
  Project,
} from '../../types';
import type { EngineeringProvenance, SourceIdentity } from '../../core/domain/provenance';
import type {
  LegacyArchitectureConnectionProposal,
  LegacyArchitectureNodeProposal,
} from './legacyArchitectureAdoption';
import { previewLegacyArchitectureAdoption } from './legacyArchitectureAdoption';
import {
  fingerprintLegacyArchitectureReconciliation,
  type ArchitectureReconciliationClassification,
  type ArchitectureReconciliationItem,
  type ArchitectureReconciliationPreview,
} from './legacyArchitectureReconciliation';

export type ArchitectureReconciliationAction =
  | 'keep-local'
  | 'take-source'
  | 'manual'
  | 'delete-canonical'
  | 'adopt-source'
  | 'reject-source';

export interface ArchitectureNodeSemanticValues {
  name: string;
  category: ProductArchitectureNode['category'];
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: ProductArchitectureNode['status'];
}

export interface ArchitectureConnectionSemanticValues {
  name?: string;
  type: ProductArchitectureConnection['type'];
  protocol?: string;
  voltage?: number;
  direction: ProductArchitectureConnection['direction'];
}

export interface ArchitectureReconciliationResolution {
  kind: 'node' | 'connection';
  sourceEntityId: string;
  action: ArchitectureReconciliationAction;
  manualNode?: Partial<ArchitectureNodeSemanticValues>;
  manualConnection?: Partial<ArchitectureConnectionSemanticValues>;
}

export interface ArchitectureReconciliationReviewMetadata {
  reviewerId: string;
  reviewedAt: string;
}

export interface ArchitectureReconciliationApplyIssue {
  code:
    | 'preview-project-mismatch'
    | 'preview-integrity-issue'
    | 'review-metadata-invalid'
    | 'resolution-missing'
    | 'resolution-duplicate'
    | 'action-not-allowed'
    | 'canonical-entity-missing'
    | 'source-proposal-missing'
    | 'source-semantics-unresolved'
    | 'manual-resolution-incomplete'
    | 'source-fingerprint-missing'
    | 'duplicate-canonical-id'
    | 'connection-endpoint-missing'
    | 'nothing-to-apply';
  kind?: 'node' | 'connection';
  sourceEntityId?: string;
  canonicalEntityId?: string;
  message: string;
}

export type ArchitectureReconciliationMutation =
  | {
      kind: 'upsert-node';
      entityId: string;
      value: ProductArchitectureNode;
    }
  | {
      kind: 'delete-node';
      entityId: string;
    }
  | {
      kind: 'upsert-connection';
      entityId: string;
      value: ProductArchitectureConnection;
    }
  | {
      kind: 'delete-connection';
      entityId: string;
    }
  | {
      kind: 'suppress-new-source';
      sourceIdentity: SourceIdentity;
      sourceContentHash: string;
    };

export interface ArchitectureReconciliationApplyPlan {
  projectId: string;
  previewFingerprint: string;
  reviewerId: string;
  reviewedAt: string;
  mutations: ArchitectureReconciliationMutation[];
  architectureNodes: ProductArchitectureNode[];
  architectureConnections: ProductArchitectureConnection[];
  suppressions: ArchitectureReconciliationSuppression[];
  issues: ArchitectureReconciliationApplyIssue[];
  canApply: boolean;
}

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
}

function nodeSnapshot(node: ProductArchitectureNode): Record<string, string | number | boolean | null | undefined> {
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

function connectionSnapshot(
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

function reviewValid(review: ArchitectureReconciliationReviewMetadata): boolean {
  return Boolean(review.reviewerId.trim()) && !Number.isNaN(Date.parse(review.reviewedAt));
}

function importedProvenance(
  current: EngineeringProvenance | undefined,
  source: SourceIdentity,
  review: ArchitectureReconciliationReviewMetadata,
): EngineeringProvenance {
  return {
    ...current,
    origin: 'imported',
    qualification: 'provisional',
    recordedAt: current?.recordedAt || review.reviewedAt,
    source,
    reviewedBy: review.reviewerId,
    reviewedAt: review.reviewedAt,
    note: 'Reconciled from legacy Hardware Studio architecture after explicit review.',
  };
}

function allowedActions(
  classification: ArchitectureReconciliationClassification,
): ReadonlySet<ArchitectureReconciliationAction> {
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

function resolutionsByItem(
  resolutions: readonly ArchitectureReconciliationResolution[],
): Map<string, ArchitectureReconciliationResolution[]> {
  const map = new Map<string, ArchitectureReconciliationResolution[]>();
  for (const resolution of resolutions) {
    const key = `${resolution.kind}:${resolution.sourceEntityId}`;
    map.set(key, [...(map.get(key) || []), resolution]);
  }
  return map;
}

function semanticNodeFromProposal(
  proposal: LegacyArchitectureNodeProposal,
): ArchitectureNodeSemanticValues | undefined {
  const source = proposal.proposed;
  if (!source) return undefined;
  return {
    name: source.name,
    category: source.category,
    description: source.description,
    x: source.x,
    y: source.y,
    width: source.width,
    height: source.height,
    status: source.status,
  };
}

function semanticConnectionFromProposal(
  proposal: LegacyArchitectureConnectionProposal,
): ArchitectureConnectionSemanticValues | undefined {
  const source = proposal.proposed;
  if (!source) return undefined;
  return {
    name: source.name,
    type: source.type,
    protocol: source.protocol,
    voltage: source.voltage,
    direction: source.direction,
  };
}

function nodeSemanticSnapshot(
  semantic: ArchitectureNodeSemanticValues | undefined,
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!semantic) return undefined;
  return {
    name: semantic.name,
    category: semantic.category,
    description: semantic.description,
    x: semantic.x,
    y: semantic.y,
    width: semantic.width,
    height: semantic.height,
    status: semantic.status,
  };
}

function connectionSemanticSnapshot(
  semantic: ArchitectureConnectionSemanticValues | undefined,
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!semantic) return undefined;
  return {
    name: semantic.name,
    type: semantic.type,
    protocol: semantic.protocol,
    voltage: semantic.voltage,
    direction: semantic.direction,
  };
}

function completeNodeManual(
  manual: Partial<ArchitectureNodeSemanticValues> | undefined,
): manual is ArchitectureNodeSemanticValues {
  return Boolean(
    manual
    && typeof manual.name === 'string'
    && manual.name.trim()
    && typeof manual.category === 'string'
    && typeof manual.description === 'string'
    && typeof manual.x === 'number'
    && Number.isFinite(manual.x)
    && typeof manual.y === 'number'
    && Number.isFinite(manual.y)
    && typeof manual.width === 'number'
    && Number.isFinite(manual.width)
    && manual.width > 0
    && typeof manual.height === 'number'
    && Number.isFinite(manual.height)
    && manual.height > 0
    && typeof manual.status === 'string'
  );
}

function applyNodeSemantic(
  node: ProductArchitectureNode,
  semantic: Partial<ArchitectureNodeSemanticValues>,
): ProductArchitectureNode {
  return {
    ...node,
    ...(Object.prototype.hasOwnProperty.call(semantic, 'name') ? { name: semantic.name! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'category') ? { category: semantic.category! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'description') ? { description: semantic.description! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'x') ? { x: semantic.x! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'y') ? { y: semantic.y! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'width') ? { width: semantic.width! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'height') ? { height: semantic.height! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'status') ? { status: semantic.status! } : {}),
  };
}

function applyConnectionSemantic(
  connection: ProductArchitectureConnection,
  semantic: Partial<ArchitectureConnectionSemanticValues>,
): ProductArchitectureConnection {
  return {
    ...connection,
    ...(Object.prototype.hasOwnProperty.call(semantic, 'name') ? { name: semantic.name } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'type') ? { type: semantic.type! } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'protocol') ? { protocol: semantic.protocol } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'voltage') ? { voltage: semantic.voltage } : {}),
    ...(Object.prototype.hasOwnProperty.call(semantic, 'direction') ? { direction: semantic.direction! } : {}),
  };
}

function refreshedNode(
  node: ProductArchitectureNode,
  sourceIdentity: SourceIdentity,
  sourceSemantic: ArchitectureNodeSemanticValues | undefined,
  review: ArchitectureReconciliationReviewMetadata,
  resolution: 'keep-local' | 'take-source' | 'manual',
): ProductArchitectureNode {
  return {
    ...node,
    sourceIdentity,
    provenance: importedProvenance(node.provenance, sourceIdentity, review),
    reconciliationBaseline: {
      adoptionSessionId: node.reconciliationBaseline?.adoptionSessionId || 'legacy-reconciliation',
      sourceContentHash: sourceIdentity.contentHash || node.reconciliationBaseline?.sourceContentHash || '',
      adoptedAt: node.reconciliationBaseline?.adoptedAt || review.reviewedAt,
      canonicalSnapshot: nodeSnapshot(node),
      sourceSnapshot: nodeSemanticSnapshot(sourceSemantic),
      sourcePresence: 'present',
      resolution,
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    },
  };
}

function refreshedConnection(
  connection: ProductArchitectureConnection,
  sourceIdentity: SourceIdentity,
  sourceSemantic: ArchitectureConnectionSemanticValues | undefined,
  review: ArchitectureReconciliationReviewMetadata,
  resolution: 'keep-local' | 'take-source' | 'manual',
): ProductArchitectureConnection {
  return {
    ...connection,
    sourceIdentity,
    provenance: importedProvenance(connection.provenance, sourceIdentity, review),
    reconciliationBaseline: {
      adoptionSessionId: connection.reconciliationBaseline?.adoptionSessionId || 'legacy-reconciliation',
      sourceContentHash: sourceIdentity.contentHash || connection.reconciliationBaseline?.sourceContentHash || '',
      adoptedAt: connection.reconciliationBaseline?.adoptedAt || review.reviewedAt,
      canonicalSnapshot: connectionSnapshot(connection),
      sourceSnapshot: nodeSemanticSnapshot(sourceSemantic),
      sourcePresence: 'present',
      resolution,
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    },
  };
}

function retainedAfterSourceDeleteNode(
  node: ProductArchitectureNode,
  review: ArchitectureReconciliationReviewMetadata,
): ProductArchitectureNode {
  return {
    ...node,
    provenance: node.sourceIdentity
      ? importedProvenance(node.provenance, node.sourceIdentity, review)
      : node.provenance,
    reconciliationBaseline: {
      adoptionSessionId: node.reconciliationBaseline?.adoptionSessionId || 'legacy-reconciliation',
      sourceContentHash: node.reconciliationBaseline?.sourceContentHash || node.sourceIdentity?.contentHash || '',
      adoptedAt: node.reconciliationBaseline?.adoptedAt || review.reviewedAt,
      canonicalSnapshot: nodeSnapshot(node),
      sourceSnapshot: node.reconciliationBaseline?.sourceSnapshot,
      sourcePresence: 'deleted',
      resolution: 'keep-after-source-delete',
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    },
  };
}

function retainedAfterSourceDeleteConnection(
  connection: ProductArchitectureConnection,
  review: ArchitectureReconciliationReviewMetadata,
): ProductArchitectureConnection {
  return {
    ...connection,
    provenance: connection.sourceIdentity
      ? importedProvenance(connection.provenance, connection.sourceIdentity, review)
      : connection.provenance,
    reconciliationBaseline: {
      adoptionSessionId: connection.reconciliationBaseline?.adoptionSessionId || 'legacy-reconciliation',
      sourceContentHash: connection.reconciliationBaseline?.sourceContentHash || connection.sourceIdentity?.contentHash || '',
      adoptedAt: connection.reconciliationBaseline?.adoptedAt || review.reviewedAt,
      canonicalSnapshot: connectionSnapshot(connection),
      sourceSnapshot: connection.reconciliationBaseline?.sourceSnapshot,
      sourcePresence: 'deleted',
      resolution: 'keep-after-source-delete',
      reviewedBy: review.reviewerId,
      reviewedAt: review.reviewedAt,
    },
  };
}

function proposalMaps(
  proposals: Awaited<ReturnType<typeof previewLegacyArchitectureAdoption>>,
): {
  nodes: Map<string, LegacyArchitectureNodeProposal>;
  connections: Map<string, LegacyArchitectureConnectionProposal>;
} {
  return {
    nodes: new Map(proposals.nodeProposals.map((proposal) => [proposal.sourceNodeId, proposal])),
    connections: new Map(proposals.connectionProposals.map((proposal) => [proposal.sourceEdgeId, proposal])),
  };
}

function currentNodeByItem(
  nodes: readonly ProductArchitectureNode[],
  item: ArchitectureReconciliationItem,
): ProductArchitectureNode | undefined {
  if (!item.canonicalEntityId) return undefined;
  return nodes.find((node) => node.id === item.canonicalEntityId);
}

function currentConnectionByItem(
  connections: readonly ProductArchitectureConnection[],
  item: ArchitectureReconciliationItem,
): ProductArchitectureConnection | undefined {
  if (!item.canonicalEntityId) return undefined;
  return connections.find((connection) => connection.id === item.canonicalEntityId);
}

function finalNodeIdMapFromSource(
  project: Project,
  sourceProposals: Map<string, LegacyArchitectureNodeProposal>,
  finalNodes: readonly ProductArchitectureNode[],
): Map<string, string> {
  const bySourceIdentity = new Map<string, string>();
  for (const node of finalNodes) {
    if (node.sourceIdentity) bySourceIdentity.set(sourceKey(node.sourceIdentity), node.id);
  }

  const result = new Map<string, string>();
  for (const [sourceNodeId, proposal] of sourceProposals.entries()) {
    const matched = bySourceIdentity.get(sourceKey(proposal.sourceIdentity));
    if (matched) {
      result.set(sourceNodeId, matched);
      continue;
    }
    if (finalNodes.some((node) => node.id === proposal.canonicalId)) {
      result.set(sourceNodeId, proposal.canonicalId);
    }
  }
  return result;
}

function updateSuppression(
  suppressions: ArchitectureReconciliationSuppression[],
  sourceIdentity: SourceIdentity,
  review: ArchitectureReconciliationReviewMetadata,
): ArchitectureReconciliationSuppression[] {
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

export async function buildLegacyArchitectureReconciliationApplyPlan(
  project: Project,
  preview: ArchitectureReconciliationPreview,
  resolutions: readonly ArchitectureReconciliationResolution[],
  review: ArchitectureReconciliationReviewMetadata,
): Promise<ArchitectureReconciliationApplyPlan> {
  const issues: ArchitectureReconciliationApplyIssue[] = [];
  const mutations: ArchitectureReconciliationMutation[] = [];
  const previewFingerprint = await fingerprintLegacyArchitectureReconciliation(preview);

  if (preview.projectId !== project.id) {
    issues.push({
      code: 'preview-project-mismatch',
      message: 'The reconciliation preview belongs to a different project.',
    });
  }

  if (!reviewValid(review)) {
    issues.push({
      code: 'review-metadata-invalid',
      message: 'Reconciliation apply requires a reviewer identity and valid reviewedAt timestamp.',
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

  const groupedResolutions = resolutionsByItem(resolutions);
  for (const [key, group] of groupedResolutions.entries()) {
    if (group.length > 1) {
      const [kind, sourceEntityId] = key.split(':', 2);
      issues.push({
        code: 'resolution-duplicate',
        kind: kind as 'node' | 'connection',
        sourceEntityId,
        message: `Multiple reconciliation decisions were supplied for ${key}.`,
      });
    }
  }

  const sourcePreview = await previewLegacyArchitectureAdoption(project);
  const sourceProposals = proposalMaps(sourcePreview);
  let finalNodes = [...(project.architectureNodes || [])];
  let finalConnections = [...(project.architectureConnections || [])];
  let suppressions = [...(project.architectureReconciliationSuppressions || [])];

  const nodeItems = preview.items.filter((item) => item.kind === 'node');
  const connectionItems = preview.items.filter((item) => item.kind === 'connection');

  // Nodes are resolved first so source connections can target the final node set.
  for (const item of nodeItems) {
    if (item.classification === 'unchanged') continue;

    const key = `node:${item.sourceEntityId}`;
    const group = groupedResolutions.get(key) || [];
    const resolution = group[0];
    if (!resolution) {
      issues.push({
        code: 'resolution-missing',
        kind: 'node',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: `No reviewed decision exists for architecture node reconciliation item "${item.sourceEntityId}".`,
      });
      continue;
    }

    if (!allowedActions(item.classification).has(resolution.action)) {
      issues.push({
        code: 'action-not-allowed',
        kind: 'node',
        sourceEntityId: item.sourceEntityId,
        message: `Action "${resolution.action}" is not valid for node classification "${item.classification}".`,
      });
      continue;
    }

    const proposal = sourceProposals.nodes.get(item.sourceEntityId);
    const current = currentNodeByItem(finalNodes, item);

    if (item.classification === 'new-source') {
      if (!proposal) {
        issues.push({
          code: 'source-proposal-missing',
          kind: 'node',
          sourceEntityId: item.sourceEntityId,
          message: 'New source node is missing from the current adoption preview.',
        });
        continue;
      }

      if (resolution.action === 'reject-source') {
        if (!proposal.sourceIdentity.contentHash) {
          issues.push({
            code: 'source-fingerprint-missing',
            kind: 'node',
            sourceEntityId: item.sourceEntityId,
            message: 'A new source node cannot be durably rejected without its source fingerprint.',
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

      const sourceSemantic = semanticNodeFromProposal(proposal);
      const semantic = sourceSemantic || (completeNodeManual(resolution.manualNode)
        ? resolution.manualNode
        : undefined);
      if (!semantic) {
        issues.push({
          code: 'manual-resolution-incomplete',
          kind: 'node',
          sourceEntityId: item.sourceEntityId,
          message: 'Adopting an unresolved new source node requires complete manual canonical node semantics.',
        });
        continue;
      }

      if (finalNodes.some((node) => node.id === proposal.canonicalId)) {
        issues.push({
          code: 'duplicate-canonical-id',
          kind: 'node',
          sourceEntityId: item.sourceEntityId,
          canonicalEntityId: proposal.canonicalId,
          message: `Canonical node id "${proposal.canonicalId}" already exists.`,
        });
        continue;
      }

      const sourceIdentity = proposal.sourceIdentity;
      const created: ProductArchitectureNode = {
        id: proposal.canonicalId,
        ...semantic,
        linkedRequirementIds: [],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        sourceIdentity,
        provenance: importedProvenance(undefined, sourceIdentity, review),
      };
      created.reconciliationBaseline = {
        adoptionSessionId: 'legacy-reconciliation',
        sourceContentHash: sourceIdentity.contentHash || '',
        adoptedAt: review.reviewedAt,
        canonicalSnapshot: nodeSnapshot(created),
        sourceSnapshot: nodeSemanticSnapshot(sourceSemantic),
        sourcePresence: 'present',
        resolution: sourceSemantic ? 'take-source' : 'manual',
        reviewedBy: review.reviewerId,
        reviewedAt: review.reviewedAt,
      };

      finalNodes = [...finalNodes, created];
      mutations.push({ kind: 'upsert-node', entityId: created.id, value: created });
      continue;
    }

    if (!current) {
      issues.push({
        code: 'canonical-entity-missing',
        kind: 'node',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: 'The canonical node referenced by the reconciliation preview no longer exists.',
      });
      continue;
    }

    if (item.classification === 'source-deleted') {
      if (resolution.action === 'delete-canonical') {
        finalNodes = finalNodes.filter((node) => node.id !== current.id);
        mutations.push({ kind: 'delete-node', entityId: current.id });
      } else {
        const retained = retainedAfterSourceDeleteNode(current, review);
        finalNodes = finalNodes.map((node) => node.id === current.id ? retained : node);
        mutations.push({ kind: 'upsert-node', entityId: retained.id, value: retained });
      }
      continue;
    }

    if (!proposal) {
      issues.push({
        code: 'source-proposal-missing',
        kind: 'node',
        sourceEntityId: item.sourceEntityId,
        message: 'The current source node proposal is unavailable.',
      });
      continue;
    }

    const sourceSemantic = semanticNodeFromProposal(proposal);
    let next = current;
    let resolutionKind: 'keep-local' | 'take-source' | 'manual';

    if (resolution.action === 'keep-local') {
      resolutionKind = 'keep-local';
    } else if (resolution.action === 'take-source') {
      if (!sourceSemantic) {
        issues.push({
          code: 'source-semantics-unresolved',
          kind: 'node',
          sourceEntityId: item.sourceEntityId,
          message: 'Source node semantics are unresolved; choose keep-local or provide a manual resolution.',
        });
        continue;
      }
      next = applyNodeSemantic(current, sourceSemantic);
      resolutionKind = 'take-source';
    } else {
      if (!resolution.manualNode || Object.keys(resolution.manualNode).length === 0) {
        issues.push({
          code: 'manual-resolution-incomplete',
          kind: 'node',
          sourceEntityId: item.sourceEntityId,
          message: 'Manual node reconciliation requires at least one explicit semantic value.',
        });
        continue;
      }
      next = applyNodeSemantic(current, resolution.manualNode);
      resolutionKind = 'manual';
    }

    next = refreshedNode(next, proposal.sourceIdentity, sourceSemantic, review, resolutionKind);
    finalNodes = finalNodes.map((node) => node.id === next.id ? next : node);
    mutations.push({ kind: 'upsert-node', entityId: next.id, value: next });
  }

  const finalSourceNodeIds = finalNodeIdMapFromSource(project, sourceProposals.nodes, finalNodes);

  for (const item of connectionItems) {
    if (item.classification === 'unchanged') continue;

    const key = `connection:${item.sourceEntityId}`;
    const group = groupedResolutions.get(key) || [];
    const resolution = group[0];
    if (!resolution) {
      issues.push({
        code: 'resolution-missing',
        kind: 'connection',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: `No reviewed decision exists for architecture connection reconciliation item "${item.sourceEntityId}".`,
      });
      continue;
    }

    if (!allowedActions(item.classification).has(resolution.action)) {
      issues.push({
        code: 'action-not-allowed',
        kind: 'connection',
        sourceEntityId: item.sourceEntityId,
        message: `Action "${resolution.action}" is not valid for connection classification "${item.classification}".`,
      });
      continue;
    }

    const proposal = sourceProposals.connections.get(item.sourceEntityId);
    const current = currentConnectionByItem(finalConnections, item);

    if (item.classification === 'new-source') {
      if (!proposal) {
        issues.push({
          code: 'source-proposal-missing',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          message: 'New source connection is missing from the current adoption preview.',
        });
        continue;
      }

      if (resolution.action === 'reject-source') {
        if (!proposal.sourceIdentity.contentHash) {
          issues.push({
            code: 'source-fingerprint-missing',
            kind: 'connection',
            sourceEntityId: item.sourceEntityId,
            message: 'A new source connection cannot be durably rejected without its source fingerprint.',
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

      const sourceEdge = (project.edges || []).find((edge) => edge.id === item.sourceEntityId);
      const sourceNodeId = sourceEdge ? finalSourceNodeIds.get(sourceEdge.source) : undefined;
      const targetNodeId = sourceEdge ? finalSourceNodeIds.get(sourceEdge.target) : undefined;
      if (!sourceNodeId || !targetNodeId) {
        issues.push({
          code: 'connection-endpoint-missing',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          message: 'New source connection cannot be adopted because one or both final canonical endpoints are unavailable.',
        });
        continue;
      }

      const sourceSemantic = semanticConnectionFromProposal(proposal);
      const semantic: ArchitectureConnectionSemanticValues | undefined = sourceSemantic
        || (
          resolution.manualConnection?.type
          && resolution.manualConnection.direction
            ? {
                name: resolution.manualConnection.name,
                type: resolution.manualConnection.type,
                protocol: resolution.manualConnection.protocol,
                voltage: resolution.manualConnection.voltage,
                direction: resolution.manualConnection.direction,
              }
            : undefined
        );

      if (!semantic) {
        issues.push({
          code: 'manual-resolution-incomplete',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          message: 'Adopting an unresolved new source connection requires explicit type and direction.',
        });
        continue;
      }

      if (finalConnections.some((connection) => connection.id === proposal.canonicalId)) {
        issues.push({
          code: 'duplicate-canonical-id',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          canonicalEntityId: proposal.canonicalId,
          message: `Canonical connection id "${proposal.canonicalId}" already exists.`,
        });
        continue;
      }

      const sourceIdentity = proposal.sourceIdentity;
      const created: ProductArchitectureConnection = {
        id: proposal.canonicalId,
        sourceNodeId,
        targetNodeId,
        ...semantic,
        sourceIdentity,
        provenance: importedProvenance(undefined, sourceIdentity, review),
      };
      created.reconciliationBaseline = {
        adoptionSessionId: 'legacy-reconciliation',
        sourceContentHash: sourceIdentity.contentHash || '',
        adoptedAt: review.reviewedAt,
        canonicalSnapshot: connectionSnapshot(created),
        sourceSnapshot: sourceSemantic
          ? {
              ...connectionSemanticSnapshot(sourceSemantic),
              sourceNodeId,
              targetNodeId,
            }
          : undefined,
        sourcePresence: 'present',
        resolution: sourceSemantic ? 'take-source' : 'manual',
        reviewedBy: review.reviewerId,
        reviewedAt: review.reviewedAt,
      };

      finalConnections = [...finalConnections, created];
      mutations.push({ kind: 'upsert-connection', entityId: created.id, value: created });
      continue;
    }

    if (!current) {
      issues.push({
        code: 'canonical-entity-missing',
        kind: 'connection',
        sourceEntityId: item.sourceEntityId,
        canonicalEntityId: item.canonicalEntityId,
        message: 'The canonical connection referenced by the reconciliation preview no longer exists.',
      });
      continue;
    }

    if (item.classification === 'source-deleted') {
      if (resolution.action === 'delete-canonical') {
        finalConnections = finalConnections.filter((connection) => connection.id !== current.id);
        mutations.push({ kind: 'delete-connection', entityId: current.id });
      } else {
        const retained = retainedAfterSourceDeleteConnection(current, review);
        finalConnections = finalConnections.map((connection) => connection.id === current.id ? retained : connection);
        mutations.push({ kind: 'upsert-connection', entityId: retained.id, value: retained });
      }
      continue;
    }

    if (!proposal) {
      issues.push({
        code: 'source-proposal-missing',
        kind: 'connection',
        sourceEntityId: item.sourceEntityId,
        message: 'The current source connection proposal is unavailable.',
      });
      continue;
    }

    const sourceEdge = (project.edges || []).find((edge) => edge.id === item.sourceEntityId);
    const sourceNodeId = sourceEdge ? finalSourceNodeIds.get(sourceEdge.source) : undefined;
    const targetNodeId = sourceEdge ? finalSourceNodeIds.get(sourceEdge.target) : undefined;
    const sourceSemantic = semanticConnectionFromProposal(proposal);
    let next = current;
    let resolutionKind: 'keep-local' | 'take-source' | 'manual';

    if (resolution.action === 'keep-local') {
      resolutionKind = 'keep-local';
    } else if (resolution.action === 'take-source') {
      if (!sourceSemantic || !sourceNodeId || !targetNodeId) {
        issues.push({
          code: 'source-semantics-unresolved',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          message: 'Source connection semantics or endpoints are unresolved; choose keep-local or provide a manual resolution.',
        });
        continue;
      }
      next = {
        ...applyConnectionSemantic(current, sourceSemantic),
        sourceNodeId,
        targetNodeId,
      };
      resolutionKind = 'take-source';
    } else {
      if (!resolution.manualConnection || Object.keys(resolution.manualConnection).length === 0) {
        issues.push({
          code: 'manual-resolution-incomplete',
          kind: 'connection',
          sourceEntityId: item.sourceEntityId,
          message: 'Manual connection reconciliation requires at least one explicit semantic value.',
        });
        continue;
      }
      next = applyConnectionSemantic(current, resolution.manualConnection);
      resolutionKind = 'manual';
    }

    const sourceSnapshot = sourceSemantic && sourceNodeId && targetNodeId
      ? {
          ...sourceSemantic,
          sourceNodeId,
          targetNodeId,
        }
      : undefined;
    next = refreshedConnection(next, proposal.sourceIdentity, sourceSnapshot, review, resolutionKind);
    finalConnections = finalConnections.map((connection) => connection.id === next.id ? next : connection);
    mutations.push({ kind: 'upsert-connection', entityId: next.id, value: next });
  }

  const finalNodeIds = new Set(finalNodes.map((node) => node.id));
  for (const connection of finalConnections) {
    if (!finalNodeIds.has(connection.sourceNodeId) || !finalNodeIds.has(connection.targetNodeId)) {
      issues.push({
        code: 'connection-endpoint-missing',
        kind: 'connection',
        canonicalEntityId: connection.id,
        message: `Final architecture connection "${connection.id}" references a node removed or unavailable in this reconciliation plan.`,
      });
    }
  }

  if (mutations.length === 0) {
    issues.push({
      code: 'nothing-to-apply',
      message: 'The reconciliation preview contains no reviewed changes to apply.',
    });
  }

  return {
    projectId: project.id,
    previewFingerprint,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    mutations,
    architectureNodes: finalNodes,
    architectureConnections: finalConnections,
    suppressions,
    issues,
    canApply: issues.length === 0 && mutations.length > 0,
  };
}

export function projectPatchFromArchitectureReconciliationPlan(
  plan: ArchitectureReconciliationApplyPlan,
): Pick<
  Project,
  'architectureNodes' | 'architectureConnections' | 'architectureReconciliationSuppressions'
> {
  if (!plan.canApply) {
    throw new Error('Cannot build project patch from a non-applicable architecture reconciliation plan');
  }

  return {
    architectureNodes: plan.architectureNodes,
    architectureConnections: plan.architectureConnections,
    architectureReconciliationSuppressions: plan.suppressions,
  };
}
