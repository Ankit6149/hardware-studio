import type { ProductRequirement, Project } from '../../types';
import { deriveEntityId, type EntityId } from '../../core/domain/identity';
import type { SourceIdentity } from '../../core/domain/provenance';

export type LegacyRequirementsAdoptionIssueSeverity = 'blocker' | 'warning' | 'info';

export type LegacyRequirementsAdoptionIssueCode =
  | 'canonical-requirements-already-present'
  | 'legacy-requirements-empty'
  | 'legacy-node-name-missing'
  | 'requirement-type-unresolved'
  | 'requirement-priority-unresolved'
  | 'legacy-enrichment-unmapped';

export interface LegacyRequirementsAdoptionIssue {
  code: LegacyRequirementsAdoptionIssueCode;
  severity: LegacyRequirementsAdoptionIssueSeverity;
  sourceEntityId?: string;
  message: string;
  resolution?: string;
}

export interface LegacyRequirementSourceValues {
  title: string;
  description: string;
}

export interface LegacyRequirementProposal {
  sourceNodeId: string;
  canonicalId: EntityId<'requirement'>;
  sourceIdentity: SourceIdentity;
  sourceValues: LegacyRequirementSourceValues;
  canAdoptWithoutResolution: false;
  issues: LegacyRequirementsAdoptionIssue[];
}

export interface LegacyRequirementsAdoptionPreview {
  adoptionSessionId: EntityId<'adoption-session'>;
  sourceSystem: 'hardware-studio-legacy-node-requirements';
  canonicalStatePresent: boolean;
  canApplyWithoutResolution: false;
  requirementProposals: LegacyRequirementProposal[];
  issues: LegacyRequirementsAdoptionIssue[];
}

const ADAPTER_ID = 'legacy-requirements-adoption';
const ADAPTER_VERSION = '1';

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
}

async function sha256ContentHash(value: unknown): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');
  const bytes = new TextEncoder().encode(stableSerialize(value));
  const digest = await subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}

function legacyRequirementNodes(project: Project) {
  return (project.nodes || []).filter(
    (node) => node.type !== 'boundaryNode' && Boolean(node.data?.requirements?.trim()),
  );
}

function safeTitle(nodeName: string): string {
  const name = nodeName.trim();
  return name ? `${name} requirement` : '';
}

async function previewNodeRequirement(
  project: Project,
  node: Project['nodes'][number],
): Promise<LegacyRequirementProposal> {
  const sourceNodeId = node.id;
  const nodeName = node.data?.name?.trim() || '';
  const description = node.data.requirements.trim();
  const sourceValues: LegacyRequirementSourceValues = {
    title: safeTitle(nodeName),
    description,
  };
  const sourcePayload = {
    sourceNodeId,
    sourceNodeName: nodeName,
    requirements: description,
    risks: node.data?.risks?.trim() || '',
    mitigation: node.data?.mitigation?.trim() || '',
    testingNotes: node.data?.testingNotes?.trim() || '',
  };
  const contentHash = await sha256ContentHash(sourcePayload);
  const canonicalId = await deriveEntityId(
    'requirement',
    project.id,
    `legacy-requirement:${sourceNodeId}`,
  );
  const sourceIdentity: SourceIdentity = {
    system: 'hardware-studio-legacy-node-requirements',
    documentId: project.id,
    entityId: `node-requirements:${sourceNodeId}`,
    revision: project.version,
    contentHash,
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
  };
  const issues: LegacyRequirementsAdoptionIssue[] = [];

  if (!nodeName) {
    issues.push({
      code: 'legacy-node-name-missing',
      severity: 'blocker',
      sourceEntityId: sourceNodeId,
      message: `Legacy requirement source "${sourceNodeId}" has no usable subject name.`,
      resolution: 'Provide an explicit canonical requirement title during review.',
    });
  }

  issues.push(
    {
      code: 'requirement-type-unresolved',
      severity: 'blocker',
      sourceEntityId: sourceNodeId,
      message: 'Legacy free-text requirement notes do not establish a canonical requirement type.',
      resolution: 'Choose the requirement type explicitly during review.',
    },
    {
      code: 'requirement-priority-unresolved',
      severity: 'blocker',
      sourceEntityId: sourceNodeId,
      message: 'Legacy free-text requirement notes do not establish canonical priority.',
      resolution: 'Choose priority explicitly during review.',
    },
  );

  if (
    node.data?.risks?.trim()
    || node.data?.mitigation?.trim()
    || node.data?.testingNotes?.trim()
  ) {
    issues.push({
      code: 'legacy-enrichment-unmapped',
      severity: 'warning',
      sourceEntityId: sourceNodeId,
      message: 'Legacy risk, mitigation, and testing notes remain source context and are not promoted into requirement semantics automatically.',
      resolution: 'Map useful context explicitly during reviewed adoption.',
    });
  }

  return {
    sourceNodeId,
    canonicalId,
    sourceIdentity,
    sourceValues,
    canAdoptWithoutResolution: false,
    issues,
  };
}

export async function previewLegacyRequirementsAdoption(
  project: Project,
): Promise<LegacyRequirementsAdoptionPreview> {
  const adoptionSessionId = await deriveEntityId(
    'adoption-session',
    project.id,
    'legacy-requirements-adoption:v1',
  );
  const canonicalStatePresent = (project.requirements?.length || 0) > 0;
  const issues: LegacyRequirementsAdoptionIssue[] = [];

  if (canonicalStatePresent) {
    issues.push({
      code: 'canonical-requirements-already-present',
      severity: 'blocker',
      message: 'Canonical requirements already exist. Legacy requirement notes require reconciliation instead of one-way adoption.',
      resolution: 'Preview source-versus-canonical changes and resolve them explicitly.',
    });
  }

  const sourceNodes = legacyRequirementNodes(project);
  if (sourceNodes.length === 0) {
    issues.push({
      code: 'legacy-requirements-empty',
      severity: 'blocker',
      message: 'No legacy node requirement notes are available for adoption.',
    });
  }

  const requirementProposals = await Promise.all(
    sourceNodes.map((node) => previewNodeRequirement(project, node)),
  );
  const allIssues = [
    ...issues,
    ...requirementProposals.flatMap((proposal) => proposal.issues),
  ];

  return {
    adoptionSessionId,
    sourceSystem: 'hardware-studio-legacy-node-requirements',
    canonicalStatePresent,
    canApplyWithoutResolution: false,
    requirementProposals,
    issues: allIssues,
  };
}

export type { ProductRequirement };
