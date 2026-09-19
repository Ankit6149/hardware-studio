import type {
  CustomEdge,
  CustomNode,
  ProductArchitectureConnection,
  ProductArchitectureNode,
  Project,
} from '../../types';
import {
  deriveEntityId,
  type EntityId,
} from '../../core/domain/identity';
import type { SourceIdentity } from '../../core/domain/provenance';

export type LegacyArchitectureAdoptionIssueSeverity = 'blocker' | 'warning' | 'info';

export type LegacyArchitectureAdoptionIssueCode =
  | 'canonical-architecture-already-present'
  | 'legacy-architecture-empty'
  | 'legacy-node-name-missing'
  | 'legacy-node-category-unmapped'
  | 'legacy-node-status-unmapped'
  | 'legacy-node-enrichment-unmapped'
  | 'display-layout-defaulted'
  | 'legacy-boundary-node-skipped'
  | 'legacy-edge-endpoint-missing'
  | 'legacy-edge-semantic-type-unresolved'
  | 'legacy-edge-semantic-direction-unresolved';

export interface LegacyArchitectureAdoptionIssue {
  code: LegacyArchitectureAdoptionIssueCode;
  severity: LegacyArchitectureAdoptionIssueSeverity;
  sourceEntityId?: string;
  message: string;
  resolution?: string;
}

export interface LegacyArchitectureNodeProposal {
  sourceNodeId: string;
  canonicalId: EntityId<'architecture-node'>;
  sourceIdentity: SourceIdentity;
  canAdopt: boolean;
  proposed?: ProductArchitectureNode;
  issues: LegacyArchitectureAdoptionIssue[];
}

export interface LegacyArchitectureConnectionProposal {
  sourceEdgeId: string;
  canonicalId: EntityId<'relation'>;
  sourceIdentity: SourceIdentity;
  mappedSourceNodeId?: EntityId<'architecture-node'>;
  mappedTargetNodeId?: EntityId<'architecture-node'>;
  canAdopt: boolean;
  proposed?: ProductArchitectureConnection;
  issues: LegacyArchitectureAdoptionIssue[];
}

export interface LegacyArchitectureNodeResolution {
  name?: string;
  category?: ProductArchitectureNode['category'];
  status?: ProductArchitectureNode['status'];
}

export interface LegacyArchitectureConnectionResolution {
  type?: ProductArchitectureConnection['type'];
  direction?: ProductArchitectureConnection['direction'];
  protocol?: string;
  voltage?: number;
}

export interface LegacyArchitectureAdoptionResolution {
  nodes?: Record<string, LegacyArchitectureNodeResolution>;
  connections?: Record<string, LegacyArchitectureConnectionResolution>;
}

export interface LegacyArchitectureAdoptionPreview {
  adoptionSessionId: EntityId<'adoption-session'>;
  sourceSystem: 'hardware-studio-legacy-react-flow';
  canonicalStatePresent: boolean;
  canApply: boolean;
  canApplyWithoutResolution: boolean;
  nodeProposals: LegacyArchitectureNodeProposal[];
  connectionProposals: LegacyArchitectureConnectionProposal[];
  issues: LegacyArchitectureAdoptionIssue[];
}

type CanonicalCategory = ProductArchitectureNode['category'];
type CanonicalStatus = ProductArchitectureNode['status'];
type CanonicalConnectionType = ProductArchitectureConnection['type'];
type CanonicalConnectionDirection = ProductArchitectureConnection['direction'];

const CATEGORY_MAP: Readonly<Record<string, CanonicalCategory>> = {
  Input: 'Input',
  Processing: 'Processing',
  Power: 'Power',
  Communication: 'Communication',
  Wireless: 'Communication',
  Feedback: 'Feedback',
  Mechanical: 'Mechanical',
  Firmware: 'Firmware',
  Safety: 'Safety',
  Manufacturing: 'Manufacturing',
};

const STATUS_MAP: Readonly<Record<string, CanonicalStatus>> = {
  MVP: 'MVP',
  Later: 'Later',
  Future: 'Future',
};

const CONNECTION_TYPES = new Set<CanonicalConnectionType>([
  'Data',
  'Power',
  'Control',
  'Mechanical',
  'Wireless',
  'Firmware',
  'Safety',
]);

const CONNECTION_DIRECTIONS = new Set<CanonicalConnectionDirection>([
  'Forward',
  'Bidirectional',
]);

const ADAPTER_ID = 'legacy-architecture-adoption';
const ADAPTER_VERSION = '1';

function sourceIdentity(
  project: Project,
  entityKind: 'node' | 'edge',
  entityId: string,
): SourceIdentity {
  return {
    system: 'hardware-studio-legacy-react-flow',
    documentId: project.id,
    entityId: `${entityKind}:${entityId}`,
    revision: project.version,
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
  };
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function positiveFinite(value: unknown): value is number {
  return finite(value) && value > 0;
}

function nodeEnrichmentExists(node: CustomNode): boolean {
  const data = node.data;
  return Boolean(
    data.requirements?.trim()
    || data.candidateComponents?.trim()
    || data.risks?.trim()
    || data.mitigation?.trim()
    || data.openQuestions?.trim()
    || data.electricalNotes?.trim()
    || data.mechanicalNotes?.trim()
    || data.firmwareNotes?.trim()
    || data.testingNotes?.trim(),
  );
}

function edgeSemanticData(edge: CustomEdge): {
  type?: CanonicalConnectionType;
  direction?: CanonicalConnectionDirection;
  protocol?: string;
  voltage?: number;
} {
  const raw = edge.data;
  if (!raw || typeof raw !== 'object') return {};

  const data = raw as Record<string, unknown>;
  const rawType = data.semanticType ?? data.connectionType;
  const rawDirection = data.direction;
  const rawProtocol = data.protocol;
  const rawVoltage = data.voltage;

  return {
    type: typeof rawType === 'string' && CONNECTION_TYPES.has(rawType as CanonicalConnectionType)
      ? rawType as CanonicalConnectionType
      : undefined,
    direction: typeof rawDirection === 'string' && CONNECTION_DIRECTIONS.has(rawDirection as CanonicalConnectionDirection)
      ? rawDirection as CanonicalConnectionDirection
      : undefined,
    protocol: typeof rawProtocol === 'string' && rawProtocol.trim()
      ? rawProtocol.trim()
      : undefined,
    voltage: finite(rawVoltage) ? rawVoltage : undefined,
  };
}

async function previewNode(
  project: Project,
  node: CustomNode,
  resolution?: LegacyArchitectureNodeResolution,
): Promise<LegacyArchitectureNodeProposal> {
  const issues: LegacyArchitectureAdoptionIssue[] = [];
  const canonicalId = await deriveEntityId(
    'architecture-node',
    project.id,
    `legacy-architecture-node:${node.id}`,
  );

  const name = resolution?.name?.trim() || node.data?.name?.trim() || '';
  if (!name) {
    issues.push({
      code: 'legacy-node-name-missing',
      severity: 'blocker',
      sourceEntityId: node.id,
      message: `Legacy architecture node "${node.id}" has no usable name.`,
      resolution: 'Provide an explicit architecture-block name before adoption.',
    });
  }

  const category = resolution?.category || CATEGORY_MAP[node.data?.category || ''];
  if (!category) {
    issues.push({
      code: 'legacy-node-category-unmapped',
      severity: 'blocker',
      sourceEntityId: node.id,
      message: `Legacy category "${node.data?.category || 'unknown'}" cannot be promoted to a canonical architecture category without review.`,
      resolution: 'Choose the canonical category explicitly.',
    });
  }

  const status = resolution?.status || STATUS_MAP[node.data?.status || ''];
  if (!status) {
    issues.push({
      code: 'legacy-node-status-unmapped',
      severity: 'blocker',
      sourceEntityId: node.id,
      message: `Legacy status "${node.data?.status || 'unknown'}" cannot be promoted to canonical MVP/Later/Future status without review.`,
      resolution: 'Choose MVP, Later, or Future explicitly.',
    });
  }

  if (nodeEnrichmentExists(node)) {
    issues.push({
      code: 'legacy-node-enrichment-unmapped',
      severity: 'warning',
      sourceEntityId: node.id,
      message: 'Legacy free-text requirements, risks, candidate components, or domain notes are not promoted into canonical linked entities automatically.',
      resolution: 'Adopt those fields through requirement/risk/component reconciliation instead of embedding them in the architecture node.',
    });
  }

  const x = finite(node.position?.x) ? node.position.x : 0;
  const y = finite(node.position?.y) ? node.position.y : 0;
  const width = positiveFinite(node.width) ? node.width : 160;
  const height = positiveFinite(node.height) ? node.height : 72;

  if (!positiveFinite(node.width) || !positiveFinite(node.height)) {
    issues.push({
      code: 'display-layout-defaulted',
      severity: 'info',
      sourceEntityId: node.id,
      message: 'Legacy node display width/height were unavailable, so preview-only layout dimensions were defaulted.',
      resolution: 'This affects diagram layout only and does not establish engineering geometry.',
    });
  }

  const blockers = issues.filter((issue) => issue.severity === 'blocker');
  const proposed = blockers.length === 0 && category && status && name
    ? {
        id: canonicalId,
        name,
        category,
        description: node.data?.description?.trim() || '',
        x,
        y,
        width,
        height,
        linkedRequirementIds: [],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        status,
      } satisfies ProductArchitectureNode
    : undefined;

  return {
    sourceNodeId: node.id,
    canonicalId,
    sourceIdentity: sourceIdentity(project, 'node', node.id),
    canAdopt: Boolean(proposed),
    proposed,
    issues,
  };
}

async function previewConnection(
  project: Project,
  edge: CustomEdge,
  nodeIdMap: ReadonlyMap<string, EntityId<'architecture-node'>>,
  resolution?: LegacyArchitectureConnectionResolution,
): Promise<LegacyArchitectureConnectionProposal> {
  const issues: LegacyArchitectureAdoptionIssue[] = [];
  const canonicalId = await deriveEntityId(
    'relation',
    project.id,
    `legacy-architecture-edge:${edge.id || `${edge.source}->${edge.target}`}`,
  );

  const mappedSourceNodeId = nodeIdMap.get(edge.source);
  const mappedTargetNodeId = nodeIdMap.get(edge.target);

  if (!mappedSourceNodeId || !mappedTargetNodeId) {
    issues.push({
      code: 'legacy-edge-endpoint-missing',
      severity: 'blocker',
      sourceEntityId: edge.id,
      message: `Legacy edge "${edge.id}" references an endpoint that is not adoptable as a canonical architecture node.`,
      resolution: 'Resolve or remove the missing/unsupported endpoint before adopting the connection.',
    });
  }

  const sourceSemantic = edgeSemanticData(edge);
  const semantic = {
    type: resolution?.type || sourceSemantic.type,
    direction: resolution?.direction || sourceSemantic.direction,
    protocol: resolution?.protocol?.trim() || sourceSemantic.protocol,
    voltage: finite(resolution?.voltage) ? resolution.voltage : sourceSemantic.voltage,
  };
  if (!semantic.type) {
    issues.push({
      code: 'legacy-edge-semantic-type-unresolved',
      severity: 'blocker',
      sourceEntityId: edge.id,
      message: `Legacy edge "${edge.id}" has no explicit canonical semantic type. React Flow edge style and label are not treated as engineering semantics.`,
      resolution: 'Choose Data, Power, Control, Mechanical, Wireless, Firmware, or Safety.',
    });
  }

  if (!semantic.direction) {
    issues.push({
      code: 'legacy-edge-semantic-direction-unresolved',
      severity: 'blocker',
      sourceEntityId: edge.id,
      message: `Legacy edge "${edge.id}" has no explicit semantic direction.`,
      resolution: 'Choose Forward or Bidirectional explicitly.',
    });
  }

  const blockers = issues.filter((issue) => issue.severity === 'blocker');
  const proposed = blockers.length === 0
    && mappedSourceNodeId
    && mappedTargetNodeId
    && semantic.type
    && semantic.direction
    ? {
        id: canonicalId,
        sourceNodeId: mappedSourceNodeId,
        targetNodeId: mappedTargetNodeId,
        name: typeof edge.label === 'string' && edge.label.trim()
          ? edge.label.trim()
          : undefined,
        type: semantic.type,
        protocol: semantic.protocol,
        voltage: semantic.voltage,
        direction: semantic.direction,
      } satisfies ProductArchitectureConnection
    : undefined;

  return {
    sourceEdgeId: edge.id,
    canonicalId,
    sourceIdentity: sourceIdentity(project, 'edge', edge.id),
    mappedSourceNodeId,
    mappedTargetNodeId,
    canAdopt: Boolean(proposed),
    proposed,
    issues,
  };
}

export async function previewLegacyArchitectureAdoption(
  project: Project,
  resolutions: LegacyArchitectureAdoptionResolution = {},
): Promise<LegacyArchitectureAdoptionPreview> {
  const adoptionSessionId = await deriveEntityId(
    'adoption-session',
    project.id,
    'legacy-architecture-adoption:v1',
  );

  const canonicalStatePresent = (project.architectureNodes?.length || 0) > 0
    || (project.architectureConnections?.length || 0) > 0;

  const issues: LegacyArchitectureAdoptionIssue[] = [];
  if (canonicalStatePresent) {
    issues.push({
      code: 'canonical-architecture-already-present',
      severity: 'blocker',
      message: 'Canonical architecture already exists. Legacy graph data requires reconciliation rather than one-way adoption.',
      resolution: 'Use a reconciliation flow that compares source identity, local edits, and canonical objects before applying changes.',
    });
  }

  const legacyNodes = project.nodes || [];
  const legacyEdges = project.edges || [];
  const candidateNodes = legacyNodes.filter((node) => node.type !== 'boundaryNode');

  if (candidateNodes.length === 0 && legacyEdges.length === 0) {
    issues.push({
      code: 'legacy-architecture-empty',
      severity: 'info',
      message: 'No adoptable legacy architecture nodes or edges were found.',
      resolution: 'There is nothing to adopt from the legacy architecture surface.',
    });
  }

  const boundaryNodes = legacyNodes.filter((node) => node.type === 'boundaryNode');
  for (const node of boundaryNodes) {
    issues.push({
      code: 'legacy-boundary-node-skipped',
      severity: 'info',
      sourceEntityId: node.id,
      message: `Legacy boundary node "${node.id}" is diagram decoration and is not proposed as a canonical product architecture entity.`,
    });
  }

  const nodeProposals = await Promise.all(
    candidateNodes.map((node) => previewNode(project, node, resolutions.nodes?.[node.id])),
  );

  const nodeIdMap = new Map<string, EntityId<'architecture-node'>>();
  for (const proposal of nodeProposals) {
    if (proposal.canAdopt) {
      nodeIdMap.set(proposal.sourceNodeId, proposal.canonicalId);
    }
  }

  const connectionProposals = await Promise.all(
    legacyEdges.map((edge) => previewConnection(
      project,
      edge,
      nodeIdMap,
      resolutions.connections?.[edge.id],
    )),
  );

  const allIssues = [
    ...issues,
    ...nodeProposals.flatMap((proposal) => proposal.issues),
    ...connectionProposals.flatMap((proposal) => proposal.issues),
  ];

  const canApply = !canonicalStatePresent
    && nodeProposals.length > 0
    && nodeProposals.every((proposal) => proposal.canAdopt)
    && connectionProposals.every((proposal) => proposal.canAdopt)
    && allIssues.every((issue) => issue.severity !== 'blocker');

  const usedResolution = Object.keys(resolutions.nodes || {}).length > 0
    || Object.keys(resolutions.connections || {}).length > 0;

  return {
    adoptionSessionId,
    sourceSystem: 'hardware-studio-legacy-react-flow',
    canonicalStatePresent,
    canApply,
    canApplyWithoutResolution: canApply && !usedResolution,
    nodeProposals,
    connectionProposals,
    issues: allIssues,
  };
}
