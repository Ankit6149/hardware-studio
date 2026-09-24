import type { ProductRequirement, Project } from '../../types';
import { deriveEntityId, type EntityId } from '../../core/domain/identity';
import type { SourceIdentity } from '../../core/domain/provenance';

export type LegacyRequirementsAdoptionIssueSeverity = 'blocker' | 'warning' | 'info';

export type LegacyRequirementsAdoptionIssueCode =
  | 'canonical-requirements-already-present'
  | 'legacy-requirements-empty'
  | 'legacy-requirement-title-unresolved'
  | 'legacy-requirement-type-unresolved'
  | 'legacy-requirement-priority-unresolved'
  | 'legacy-requirement-context-unmapped';

export interface LegacyRequirementsAdoptionIssue {
  code: LegacyRequirementsAdoptionIssueCode;
  severity: LegacyRequirementsAdoptionIssueSeverity;
  sourceEntityId?: string;
  message: string;
  resolution?: string;
}

export interface LegacyRequirementProposal {
  sourceNodeId: string;
  canonicalId: EntityId<'requirement'>;
  sourceIdentity: SourceIdentity;
  proposedTitle: string;
  sourceDescription: string;
  canAdoptWithoutResolution: boolean;
  issues: LegacyRequirementsAdoptionIssue[];
}

export interface LegacyRequirementsAdoptionPreview {
  adoptionSessionId: EntityId<'adoption-session'>;
  sourceSystem: 'hardware-studio-legacy-node-requirements';
  canonicalStatePresent: boolean;
  canApplyWithoutResolution: boolean;
  proposals: LegacyRequirementProposal[];
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
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(stableSerialize(value)));
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}

function sourceIdentity(
  project: Project,
  sourceNodeId: string,
  contentHash: string,
): SourceIdentity {
  return {
    system: 'hardware-studio-legacy-node-requirements',
    documentId: project.id,
    entityId: `node:${sourceNodeId}:requirements`,
    revision: project.version,
    contentHash,
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
  };
}

async function previewRequirement(
  project: Project,
  sourceNodeId: string,
): Promise<LegacyRequirementProposal> {
  const node = (project.nodes || []).find((candidate) => candidate.id === sourceNodeId);
  if (!node) throw new Error(`Legacy requirement source node "${sourceNodeId}" is unavailable`);

  const sourceDescription = node.data?.requirements?.trim() || '';
  const proposedTitle = node.data?.name?.trim()
    ? `${node.data.name.trim()} requirement notes`
    : '';

  const issues: LegacyRequirementsAdoptionIssue[] = [];
  if (!proposedTitle) {
    issues.push({
      code: 'legacy-requirement-title-unresolved',
      severity: 'blocker',
      sourceEntityId: sourceNodeId,
      message: `Legacy requirement notes on node "${sourceNodeId}" have no explicit requirement title.`,
      resolution: 'Provide a canonical requirement title during reviewed adoption.',
    });
  }

  issues.push({
    code: 'legacy-requirement-type-unresolved',
    severity: 'blocker',
    sourceEntityId: sourceNodeId,
    message: 'Legacy free-text requirement notes do not encode a canonical requirement type.',
    resolution: 'Choose Functional, Electrical, Mechanical, Firmware, Safety, Manufacturing, or Validation.',
  });
  issues.push({
    code: 'legacy-requirement-priority-unresolved',
    severity: 'blocker',
    sourceEntityId: sourceNodeId,
    message: 'Legacy free-text requirement notes do not encode a canonical requirement priority.',
    resolution: 'Choose Critical, High, Medium, or Low explicitly.',
  });

  if (
    node.data?.risks?.trim()
    || node.data?.mitigation?.trim()
    || node.data?.testingNotes?.trim()
  ) {
    issues.push({
      code: 'legacy-requirement-context-unmapped',
      severity: 'warning',
      sourceEntityId: sourceNodeId,
      message: 'Adjacent legacy risk, mitigation, and testing notes are preserved in the source node but are not promoted into requirement semantics automatically.',
      resolution: 'Adopt those facts through their own reviewed domain mappings.',
    });
  }

  const contentHash = await sha256ContentHash({
    sourceNodeId,
    nodeName: node.data?.name || '',
    requirements: sourceDescription,
    risks: node.data?.risks || '',
    mitigation: node.data?.mitigation || '',
    testingNotes: node.data?.testingNotes || '',
  });

  return {
    sourceNodeId,
    canonicalId: await deriveEntityId(
      'requirement',
      project.id,
      `legacy-node-requirement:${sourceNodeId}`,
    ),
    sourceIdentity: sourceIdentity(project, sourceNodeId, contentHash),
    proposedTitle,
    sourceDescription,
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

  const canonicalStatePresent = (project.requirements || []).length > 0;
  const issues: LegacyRequirementsAdoptionIssue[] = [];

  if (canonicalStatePresent) {
    issues.push({
      code: 'canonical-requirements-already-present',
      severity: 'blocker',
      message: 'Canonical requirements already exist. Legacy notes require reconciliation rather than one-way adoption.',
      resolution: 'Compare preserved source identity and local canonical edits before applying any source changes.',
    });
  }

  const sourceNodeIds = (project.nodes || [])
    .filter((node) => node.type !== 'boundaryNode' && Boolean(node.data?.requirements?.trim()))
    .map((node) => node.id);

  if (sourceNodeIds.length === 0) {
    issues.push({
      code: 'legacy-requirements-empty',
      severity: 'info',
      message: 'No legacy requirement notes are available for adoption.',
      resolution: 'There is nothing to adopt from the legacy product graph.',
    });
  }

  const proposals = await Promise.all(
    sourceNodeIds.map((sourceNodeId) => previewRequirement(project, sourceNodeId)),
  );

  return {
    adoptionSessionId,
    sourceSystem: 'hardware-studio-legacy-node-requirements',
    canonicalStatePresent,
    canApplyWithoutResolution: false,
    proposals,
    issues: [...issues, ...proposals.flatMap((proposal) => proposal.issues)],
  };
}

export function requirementSourceSnapshot(
  title: string,
  description: string,
): Record<string, string | number | boolean | null | undefined> {
  return { title, description };
}

export function requirementCanonicalSnapshot(
  requirement: ProductRequirement,
): Record<string, string | number | boolean | null | undefined> {
  return {
    title: requirement.title,
    description: requirement.description,
    type: requirement.type,
    priority: requirement.priority,
    status: requirement.status,
  };
}
