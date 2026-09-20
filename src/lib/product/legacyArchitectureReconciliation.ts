import type {
  ProductArchitectureConnection,
  ProductArchitectureNode,
  Project,
} from '../../types';
import type { SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyArchitectureAdoption,
  type LegacyArchitectureAdoptionIssue,
  type LegacyArchitectureConnectionProposal,
  type LegacyArchitectureNodeProposal,
} from './legacyArchitectureAdoption';

export type ArchitectureReconciliationClassification =
  | 'unchanged'
  | 'source-only-change'
  | 'local-only-change'
  | 'conflict'
  | 'source-deleted'
  | 'new-source';

export interface ArchitectureReconciliationFieldDiff {
  field: string;
  baseline: string | number | boolean | null | undefined;
  currentCanonical: string | number | boolean | null | undefined;
  currentSource: string | number | boolean | null | undefined;
  localChanged: boolean;
  sourceChanged: boolean;
}

export interface ArchitectureReconciliationItem {
  kind: 'node' | 'connection';
  classification: ArchitectureReconciliationClassification;
  sourceEntityId: string;
  canonicalEntityId?: string;
  sourceIdentity: SourceIdentity;
  previousSourceContentHash?: string;
  currentSourceContentHash?: string;
  sourceContentChanged: boolean;
  localSemanticChanged: boolean;
  sourceSemanticChanged: boolean;
  sourceSemanticsResolved: boolean;
  fieldDiffs: ArchitectureReconciliationFieldDiff[];
  sourceIssues: LegacyArchitectureAdoptionIssue[];
  message: string;
}

export interface ArchitectureReconciliationPreviewIssue {
  code:
    | 'duplicate-canonical-source-identity'
    | 'missing-reconciliation-baseline'
    | 'source-fingerprint-missing';
  sourceEntityId?: string;
  canonicalEntityId?: string;
  message: string;
}

export interface ArchitectureReconciliationPreview {
  projectId: string;
  sourceSystem: 'hardware-studio-legacy-react-flow';
  items: ArchitectureReconciliationItem[];
  issues: ArchitectureReconciliationPreviewIssue[];
  summary: Record<ArchitectureReconciliationClassification, number>;
  hasConflicts: boolean;
  mutationFree: true;
}

type SemanticSnapshot = Record<string, string | number | boolean | null | undefined>;

const SOURCE_SYSTEM = 'hardware-studio-legacy-react-flow';

function sourceKey(source: SourceIdentity): string {
  return [
    source.system,
    source.documentId || '',
    source.entityId,
  ].join('|');
}

function normalizedNodeSnapshot(node: ProductArchitectureNode): SemanticSnapshot {
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

function normalizedConnectionSnapshot(
  connection: ProductArchitectureConnection,
): SemanticSnapshot {
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

function equalValue(
  left: string | number | boolean | null | undefined,
  right: string | number | boolean | null | undefined,
): boolean {
  return Object.is(left, right);
}

function diffSnapshots(
  baseline: SemanticSnapshot,
  currentCanonical: SemanticSnapshot,
  currentSource?: SemanticSnapshot,
): ArchitectureReconciliationFieldDiff[] {
  const fields = new Set([
    ...Object.keys(baseline),
    ...Object.keys(currentCanonical),
    ...Object.keys(currentSource || {}),
  ]);

  return [...fields]
    .sort()
    .map((field) => {
      const baselineValue = baseline[field];
      const canonicalValue = currentCanonical[field];
      const sourceValue = currentSource?.[field];
      return {
        field,
        baseline: baselineValue,
        currentCanonical: canonicalValue,
        currentSource: sourceValue,
        localChanged: !equalValue(canonicalValue, baselineValue),
        sourceChanged: currentSource !== undefined && !equalValue(sourceValue, baselineValue),
      };
    });
}

function classify(
  sourceExists: boolean,
  canonicalExists: boolean,
  localSemanticChanged: boolean,
  sourceSemanticChanged: boolean,
  sourceContentChanged: boolean,
  sourceSemanticsResolved: boolean,
): ArchitectureReconciliationClassification {
  if (!canonicalExists && sourceExists) return 'new-source';
  if (canonicalExists && !sourceExists) return 'source-deleted';

  if (!sourceSemanticsResolved && sourceContentChanged) {
    return localSemanticChanged ? 'conflict' : 'source-only-change';
  }

  if (localSemanticChanged && (sourceSemanticChanged || sourceContentChanged)) {
    return 'conflict';
  }
  if (localSemanticChanged) return 'local-only-change';
  if (sourceSemanticChanged || sourceContentChanged) return 'source-only-change';
  return 'unchanged';
}

function nodeMessage(
  classification: ArchitectureReconciliationClassification,
  sourceEntityId: string,
): string {
  switch (classification) {
    case 'unchanged':
      return `Legacy node "${sourceEntityId}" and its adopted canonical node are unchanged since adoption.`;
    case 'source-only-change':
      return `Legacy node "${sourceEntityId}" changed after adoption while the adopted canonical semantics remained at baseline.`;
    case 'local-only-change':
      return `The adopted canonical node for "${sourceEntityId}" changed locally while the source remained at its adoption baseline.`;
    case 'conflict':
      return `Legacy node "${sourceEntityId}" and its adopted canonical node both changed after adoption and require explicit reconciliation.`;
    case 'source-deleted':
      return `Legacy node "${sourceEntityId}" no longer exists in the source graph; canonical deletion must not be inferred automatically.`;
    case 'new-source':
      return `Legacy node "${sourceEntityId}" has no canonical entity matched by preserved source identity and is a new adoption candidate.`;
  }
}

function connectionMessage(
  classification: ArchitectureReconciliationClassification,
  sourceEntityId: string,
): string {
  return nodeMessage(classification, sourceEntityId).replace(/node/g, 'connection');
}

function baselineFor(
  entity: ProductArchitectureNode | ProductArchitectureConnection,
): SemanticSnapshot | undefined {
  return entity.reconciliationBaseline?.canonicalSnapshot;
}

function buildCanonicalIndexes(project: Project): {
  nodes: Map<string, ProductArchitectureNode[]>;
  connections: Map<string, ProductArchitectureConnection[]>;
} {
  const nodes = new Map<string, ProductArchitectureNode[]>();
  const connections = new Map<string, ProductArchitectureConnection[]>();

  for (const node of project.architectureNodes || []) {
    if (
      node.sourceIdentity?.system !== SOURCE_SYSTEM
      || node.sourceIdentity.documentId !== project.id
    ) {
      continue;
    }
    const key = sourceKey(node.sourceIdentity);
    nodes.set(key, [...(nodes.get(key) || []), node]);
  }

  for (const connection of project.architectureConnections || []) {
    if (
      connection.sourceIdentity?.system !== SOURCE_SYSTEM
      || connection.sourceIdentity.documentId !== project.id
    ) {
      continue;
    }
    const key = sourceKey(connection.sourceIdentity);
    connections.set(key, [...(connections.get(key) || []), connection]);
  }

  return { nodes, connections };
}

function itemFromMatchedNode(
  canonical: ProductArchitectureNode,
  proposal: LegacyArchitectureNodeProposal,
  issues: ArchitectureReconciliationPreviewIssue[],
): ArchitectureReconciliationItem {
  const baseline = baselineFor(canonical);
  if (!baseline) {
    issues.push({
      code: 'missing-reconciliation-baseline',
      sourceEntityId: proposal.sourceNodeId,
      canonicalEntityId: canonical.id,
      message: `Canonical architecture node "${canonical.id}" has source identity but no reconciliation baseline.`,
    });
  }

  const previousHash = canonical.reconciliationBaseline?.sourceContentHash;
  const currentHash = proposal.sourceIdentity.contentHash;
  if (!currentHash) {
    issues.push({
      code: 'source-fingerprint-missing',
      sourceEntityId: proposal.sourceNodeId,
      canonicalEntityId: canonical.id,
      message: `Current legacy node "${proposal.sourceNodeId}" is missing a source content fingerprint.`,
    });
  }

  const canonicalSnapshot = normalizedNodeSnapshot(canonical);
  const sourceSnapshot = proposal.proposed
    ? normalizedNodeSnapshot(proposal.proposed)
    : undefined;
  const effectiveBaseline = baseline || canonicalSnapshot;
  const fieldDiffs = diffSnapshots(effectiveBaseline, canonicalSnapshot, sourceSnapshot);
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const sourceSemanticChanged = fieldDiffs.some((diff) => diff.sourceChanged);
  const sourcePresenceChanged = canonical.reconciliationBaseline?.sourcePresence === 'deleted';
  const sourceContentChanged = sourcePresenceChanged
    || Boolean(previousHash && currentHash && previousHash !== currentHash);
  const sourceSemanticsResolved = Boolean(sourceSnapshot);
  const classification = baseline
    ? classify(
        true,
        true,
        localSemanticChanged,
        sourceSemanticChanged,
        sourceContentChanged,
        sourceSemanticsResolved,
      )
    : 'conflict';

  return {
    kind: 'node',
    classification,
    sourceEntityId: proposal.sourceNodeId,
    canonicalEntityId: canonical.id,
    sourceIdentity: proposal.sourceIdentity,
    previousSourceContentHash: previousHash,
    currentSourceContentHash: currentHash,
    sourceContentChanged,
    localSemanticChanged,
    sourceSemanticChanged,
    sourceSemanticsResolved,
    fieldDiffs,
    sourceIssues: proposal.issues,
    message: nodeMessage(classification, proposal.sourceNodeId),
  };
}

function itemFromMatchedConnection(
  canonical: ProductArchitectureConnection,
  proposal: LegacyArchitectureConnectionProposal,
  issues: ArchitectureReconciliationPreviewIssue[],
): ArchitectureReconciliationItem {
  const baseline = baselineFor(canonical);
  if (!baseline) {
    issues.push({
      code: 'missing-reconciliation-baseline',
      sourceEntityId: proposal.sourceEdgeId,
      canonicalEntityId: canonical.id,
      message: `Canonical architecture connection "${canonical.id}" has source identity but no reconciliation baseline.`,
    });
  }

  const previousHash = canonical.reconciliationBaseline?.sourceContentHash;
  const currentHash = proposal.sourceIdentity.contentHash;
  if (!currentHash) {
    issues.push({
      code: 'source-fingerprint-missing',
      sourceEntityId: proposal.sourceEdgeId,
      canonicalEntityId: canonical.id,
      message: `Current legacy connection "${proposal.sourceEdgeId}" is missing a source content fingerprint.`,
    });
  }

  const canonicalSnapshot = normalizedConnectionSnapshot(canonical);
  const sourceSnapshot = proposal.proposed
    ? normalizedConnectionSnapshot(proposal.proposed)
    : undefined;
  const effectiveBaseline = baseline || canonicalSnapshot;
  const fieldDiffs = diffSnapshots(effectiveBaseline, canonicalSnapshot, sourceSnapshot);
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const sourceSemanticChanged = fieldDiffs.some((diff) => diff.sourceChanged);
  const sourcePresenceChanged = canonical.reconciliationBaseline?.sourcePresence === 'deleted';
  const sourceContentChanged = sourcePresenceChanged
    || Boolean(previousHash && currentHash && previousHash !== currentHash);
  const sourceSemanticsResolved = Boolean(sourceSnapshot);
  const classification = baseline
    ? classify(
        true,
        true,
        localSemanticChanged,
        sourceSemanticChanged,
        sourceContentChanged,
        sourceSemanticsResolved,
      )
    : 'conflict';

  return {
    kind: 'connection',
    classification,
    sourceEntityId: proposal.sourceEdgeId,
    canonicalEntityId: canonical.id,
    sourceIdentity: proposal.sourceIdentity,
    previousSourceContentHash: previousHash,
    currentSourceContentHash: currentHash,
    sourceContentChanged,
    localSemanticChanged,
    sourceSemanticChanged,
    sourceSemanticsResolved,
    fieldDiffs,
    sourceIssues: proposal.issues,
    message: connectionMessage(classification, proposal.sourceEdgeId),
  };
}

function newNodeItem(proposal: LegacyArchitectureNodeProposal): ArchitectureReconciliationItem {
  return {
    kind: 'node',
    classification: 'new-source',
    sourceEntityId: proposal.sourceNodeId,
    sourceIdentity: proposal.sourceIdentity,
    currentSourceContentHash: proposal.sourceIdentity.contentHash,
    sourceContentChanged: true,
    localSemanticChanged: false,
    sourceSemanticChanged: Boolean(proposal.proposed),
    sourceSemanticsResolved: Boolean(proposal.proposed),
    fieldDiffs: [],
    sourceIssues: proposal.issues,
    message: nodeMessage('new-source', proposal.sourceNodeId),
  };
}

function newConnectionItem(
  proposal: LegacyArchitectureConnectionProposal,
): ArchitectureReconciliationItem {
  return {
    kind: 'connection',
    classification: 'new-source',
    sourceEntityId: proposal.sourceEdgeId,
    sourceIdentity: proposal.sourceIdentity,
    currentSourceContentHash: proposal.sourceIdentity.contentHash,
    sourceContentChanged: true,
    localSemanticChanged: false,
    sourceSemanticChanged: Boolean(proposal.proposed),
    sourceSemanticsResolved: Boolean(proposal.proposed),
    fieldDiffs: [],
    sourceIssues: proposal.issues,
    message: connectionMessage('new-source', proposal.sourceEdgeId),
  };
}

function deletedNodeItem(node: ProductArchitectureNode): ArchitectureReconciliationItem {
  const source = node.sourceIdentity!;
  const baseline = baselineFor(node);
  const fieldDiffs = baseline
    ? diffSnapshots(baseline, normalizedNodeSnapshot(node))
    : [];
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const deletionAlreadyReviewed = node.reconciliationBaseline?.sourcePresence === 'deleted';
  const classification: ArchitectureReconciliationClassification = deletionAlreadyReviewed
    ? (localSemanticChanged ? 'local-only-change' : 'unchanged')
    : 'source-deleted';
  const sourceEntityId = source.entityId.replace(/^node:/, '');

  return {
    kind: 'node',
    classification,
    sourceEntityId,
    canonicalEntityId: node.id,
    sourceIdentity: source,
    previousSourceContentHash: node.reconciliationBaseline?.sourceContentHash,
    sourceContentChanged: !deletionAlreadyReviewed,
    localSemanticChanged,
    sourceSemanticChanged: !deletionAlreadyReviewed,
    sourceSemanticsResolved: false,
    fieldDiffs,
    sourceIssues: [],
    message: deletionAlreadyReviewed
      ? localSemanticChanged
        ? `Canonical node retained after source deletion has changed locally since the deletion was reviewed.`
        : `Source deletion for legacy node "${sourceEntityId}" was already reviewed and the retained canonical node is unchanged.`
      : nodeMessage('source-deleted', sourceEntityId),
  };
}

function deletedConnectionItem(
  connection: ProductArchitectureConnection,
): ArchitectureReconciliationItem {
  const source = connection.sourceIdentity!;
  const baseline = baselineFor(connection);
  const fieldDiffs = baseline
    ? diffSnapshots(baseline, normalizedConnectionSnapshot(connection))
    : [];
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const deletionAlreadyReviewed = connection.reconciliationBaseline?.sourcePresence === 'deleted';
  const classification: ArchitectureReconciliationClassification = deletionAlreadyReviewed
    ? (localSemanticChanged ? 'local-only-change' : 'unchanged')
    : 'source-deleted';
  const sourceEntityId = source.entityId.replace(/^edge:/, '');

  return {
    kind: 'connection',
    classification,
    sourceEntityId,
    canonicalEntityId: connection.id,
    sourceIdentity: source,
    previousSourceContentHash: connection.reconciliationBaseline?.sourceContentHash,
    sourceContentChanged: !deletionAlreadyReviewed,
    localSemanticChanged,
    sourceSemanticChanged: !deletionAlreadyReviewed,
    sourceSemanticsResolved: false,
    fieldDiffs,
    sourceIssues: [],
    message: deletionAlreadyReviewed
      ? localSemanticChanged
        ? `Canonical connection retained after source deletion has changed locally since the deletion was reviewed.`
        : `Source deletion for legacy connection "${sourceEntityId}" was already reviewed and the retained canonical connection is unchanged.`
      : connectionMessage('source-deleted', sourceEntityId),
  };
}

function emptySummary(): Record<ArchitectureReconciliationClassification, number> {
  return {
    unchanged: 0,
    'source-only-change': 0,
    'local-only-change': 0,
    conflict: 0,
    'source-deleted': 0,
    'new-source': 0,
  };
}

export async function previewLegacyArchitectureReconciliation(
  project: Project,
): Promise<ArchitectureReconciliationPreview> {
  const sourcePreview = await previewLegacyArchitectureAdoption(project);
  const canonical = buildCanonicalIndexes(project);
  const issues: ArchitectureReconciliationPreviewIssue[] = [];
  const items: ArchitectureReconciliationItem[] = [];
  const matchedCanonicalNodeIds = new Set<string>();
  const matchedCanonicalConnectionIds = new Set<string>();

  for (const proposal of sourcePreview.nodeProposals) {
    const candidates = canonical.nodes.get(sourceKey(proposal.sourceIdentity)) || [];
    if (candidates.length > 1) {
      issues.push({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: proposal.sourceNodeId,
        message: `Multiple canonical architecture nodes claim source identity "${proposal.sourceIdentity.entityId}".`,
      });
      for (const candidate of candidates) matchedCanonicalNodeIds.add(candidate.id);
      items.push({
        ...newNodeItem(proposal),
        classification: 'conflict',
        message: `Legacy node "${proposal.sourceNodeId}" matches multiple canonical nodes by source identity and requires integrity repair before reconciliation.`,
      });
      continue;
    }

    const canonicalNode = candidates[0];
    if (!canonicalNode) {
      items.push(newNodeItem(proposal));
      continue;
    }

    matchedCanonicalNodeIds.add(canonicalNode.id);
    items.push(itemFromMatchedNode(canonicalNode, proposal, issues));
  }

  for (const proposal of sourcePreview.connectionProposals) {
    const candidates = canonical.connections.get(sourceKey(proposal.sourceIdentity)) || [];
    if (candidates.length > 1) {
      issues.push({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: proposal.sourceEdgeId,
        message: `Multiple canonical architecture connections claim source identity "${proposal.sourceIdentity.entityId}".`,
      });
      for (const candidate of candidates) matchedCanonicalConnectionIds.add(candidate.id);
      items.push({
        ...newConnectionItem(proposal),
        classification: 'conflict',
        message: `Legacy connection "${proposal.sourceEdgeId}" matches multiple canonical connections by source identity and requires integrity repair before reconciliation.`,
      });
      continue;
    }

    const canonicalConnection = candidates[0];
    if (!canonicalConnection) {
      items.push(newConnectionItem(proposal));
      continue;
    }

    matchedCanonicalConnectionIds.add(canonicalConnection.id);
    items.push(itemFromMatchedConnection(canonicalConnection, proposal, issues));
  }

  for (const nodes of canonical.nodes.values()) {
    for (const node of nodes) {
      if (!matchedCanonicalNodeIds.has(node.id)) {
        items.push(deletedNodeItem(node));
      }
    }
  }

  for (const connections of canonical.connections.values()) {
    for (const connection of connections) {
      if (!matchedCanonicalConnectionIds.has(connection.id)) {
        items.push(deletedConnectionItem(connection));
      }
    }
  }

  const summary = emptySummary();
  for (const item of items) summary[item.classification] += 1;

  return {
    projectId: project.id,
    sourceSystem: SOURCE_SYSTEM,
    items,
    issues,
    summary,
    hasConflicts: summary.conflict > 0,
    mutationFree: true,
  };
}

function stableReconciliationSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableReconciliationSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableReconciliationSerialize(record[key])}`)
    .join(',')}}`;
}

export async function fingerprintLegacyArchitectureReconciliation(
  preview: ArchitectureReconciliationPreview,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');

  const payload = {
    projectId: preview.projectId,
    items: preview.items.map((item) => ({
      kind: item.kind,
      classification: item.classification,
      sourceEntityId: item.sourceEntityId,
      canonicalEntityId: item.canonicalEntityId,
      previousSourceContentHash: item.previousSourceContentHash,
      currentSourceContentHash: item.currentSourceContentHash,
      sourceContentChanged: item.sourceContentChanged,
      localSemanticChanged: item.localSemanticChanged,
      sourceSemanticChanged: item.sourceSemanticChanged,
      sourceSemanticsResolved: item.sourceSemanticsResolved,
      fieldDiffs: item.fieldDiffs,
      sourceIssueCodes: item.sourceIssues.map((issue) => issue.code).sort(),
    })),
    issueCodes: preview.issues.map((issue) => issue.code).sort(),
  };

  const bytes = new TextEncoder().encode(stableReconciliationSerialize(payload));
  const digest = await subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
