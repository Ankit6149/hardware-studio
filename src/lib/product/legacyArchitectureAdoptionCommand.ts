import type { Project } from '../../types';
import {
  deriveEntityId,
  isEntityId,
  type EntityId,
  type EntityType,
} from '../../core/domain/identity';
import {
  findSourceMapping,
  sourceIdentityKey,
  validateCanonicalSourceMapping,
  type CanonicalSourceMapping,
} from '../../core/domain/adoption';
import {
  previewLegacyArchitectureAdoption,
  type LegacyArchitectureAdoptionResolution,
} from './legacyArchitectureAdoption';

export interface AdoptLegacyArchitectureCommand {
  type: 'adoption.legacy-architecture.apply';
  schemaVersion: 1;
  projectId: string;
  baseUpdatedAt: string;
  baseProjectVersion: string;
  adoptionSessionId: EntityId<'adoption-session'>;
  recordedAt: string;
  resolutions: LegacyArchitectureAdoptionResolution;
}

export type LegacyArchitectureAdoptionCommandIssueCode =
  | 'project-id-mismatch'
  | 'stale-project-base'
  | 'project-version-mismatch'
  | 'invalid-adoption-session-id'
  | 'adoption-session-mismatch'
  | 'invalid-recorded-at'
  | 'preview-not-applyable'
  | 'source-mapping-conflict'
  | 'source-mapping-invalid';

export interface LegacyArchitectureAdoptionCommandIssue {
  code: LegacyArchitectureAdoptionCommandIssueCode;
  message: string;
  sourceEntityId?: string;
}

export interface LegacyArchitectureAdoptionPatch {
  architectureNodes: NonNullable<Project['architectureNodes']>;
  architectureConnections: NonNullable<Project['architectureConnections']>;
  sourceMappings: NonNullable<Project['sourceMappings']>;
}

export type LegacyArchitectureAdoptionCommandResult =
  | {
      ok: true;
      command: AdoptLegacyArchitectureCommand;
      patch: LegacyArchitectureAdoptionPatch;
      createdSourceMappings: CanonicalSourceMapping[];
      warnings: string[];
    }
  | {
      ok: false;
      command: AdoptLegacyArchitectureCommand;
      issues: LegacyArchitectureAdoptionCommandIssue[];
    };

function isValidTimestamp(value: string): boolean {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

async function makeSourceMapping(
  project: Project,
  adoptionSessionId: EntityId<'adoption-session'>,
  canonicalEntityId: EntityId,
  canonicalEntityType: EntityType,
  source: CanonicalSourceMapping['source'],
  recordedAt: string,
): Promise<CanonicalSourceMapping> {
  const id = await deriveEntityId(
    'source-mapping',
    project.id,
    `${sourceIdentityKey(source)}=>${canonicalEntityId}`,
  );

  return {
    id,
    adoptionSessionId,
    canonicalEntityId,
    canonicalEntityType,
    source,
    recordedAt,
  };
}

/**
 * Build the atomic canonical patch for an approved legacy-architecture adoption.
 *
 * This function is intentionally pure with respect to project state:
 * - it never mutates the input project;
 * - it performs optimistic-base checks before creating a patch;
 * - it returns either the complete architecture+source-mapping patch or no patch.
 *
 * Repository/command-runtime persistence belongs outside this function.
 */
export async function applyLegacyArchitectureAdoptionCommand(
  project: Project,
  command: AdoptLegacyArchitectureCommand,
): Promise<LegacyArchitectureAdoptionCommandResult> {
  const issues: LegacyArchitectureAdoptionCommandIssue[] = [];

  if (command.projectId !== project.id) {
    issues.push({
      code: 'project-id-mismatch',
      message: `Command targets project "${command.projectId}" but current project is "${project.id}".`,
    });
  }

  if (command.baseUpdatedAt !== project.updatedAt) {
    issues.push({
      code: 'stale-project-base',
      message: 'Project changed after the adoption preview was approved. Re-preview against the current project before applying.',
    });
  }

  if (command.baseProjectVersion !== project.version) {
    issues.push({
      code: 'project-version-mismatch',
      message: `Command base version "${command.baseProjectVersion}" does not match current project version "${project.version}".`,
    });
  }

  if (!isEntityId(command.adoptionSessionId, 'adoption-session')) {
    issues.push({
      code: 'invalid-adoption-session-id',
      message: 'Command adoption session ID is not a valid typed adoption-session ID.',
    });
  }

  if (!isValidTimestamp(command.recordedAt)) {
    issues.push({
      code: 'invalid-recorded-at',
      message: 'Command recordedAt must be an ISO-compatible timestamp supplied by the caller.',
    });
  }

  if (issues.length > 0) {
    return { ok: false, command, issues };
  }

  const preview = await previewLegacyArchitectureAdoption(project, command.resolutions);

  if (preview.adoptionSessionId !== command.adoptionSessionId) {
    return {
      ok: false,
      command,
      issues: [{
        code: 'adoption-session-mismatch',
        message: 'Approved adoption session does not match the deterministic preview for the current project.',
      }],
    };
  }

  if (!preview.canApply) {
    return {
      ok: false,
      command,
      issues: [{
        code: 'preview-not-applyable',
        message: 'Adoption preview still contains unresolved blockers or existing canonical architecture. Resolve and re-preview before applying.',
      }],
    };
  }

  const architectureNodes = preview.nodeProposals
    .map((proposal) => proposal.proposed)
    .filter((node): node is NonNullable<typeof node> => Boolean(node));

  const architectureConnections = preview.connectionProposals
    .map((proposal) => proposal.proposed)
    .filter((connection): connection is NonNullable<typeof connection> => Boolean(connection));

  const mappingsToCreate: Array<{
    canonicalEntityId: EntityId;
    canonicalEntityType: EntityType;
    source: CanonicalSourceMapping['source'];
    sourceEntityId: string;
  }> = [
    ...preview.nodeProposals.map((proposal) => ({
      canonicalEntityId: proposal.canonicalId as EntityId,
      canonicalEntityType: 'architecture-node' as const,
      source: proposal.sourceIdentity,
      sourceEntityId: proposal.sourceNodeId,
    })),
    ...preview.connectionProposals.map((proposal) => ({
      canonicalEntityId: proposal.canonicalId as EntityId,
      canonicalEntityType: 'relation' as const,
      source: proposal.sourceIdentity,
      sourceEntityId: proposal.sourceEdgeId,
    })),
  ];

  const existingMappings = project.sourceMappings || [];
  for (const candidate of mappingsToCreate) {
    const existing = findSourceMapping(existingMappings, candidate.source);
    if (existing && existing.canonicalEntityId !== candidate.canonicalEntityId) {
      issues.push({
        code: 'source-mapping-conflict',
        sourceEntityId: candidate.sourceEntityId,
        message: `Source "${sourceIdentityKey(candidate.source)}" already maps to canonical entity "${existing.canonicalEntityId}".`,
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, command, issues };
  }

  const createdSourceMappings = await Promise.all(
    mappingsToCreate.map((candidate) => makeSourceMapping(
      project,
      command.adoptionSessionId,
      candidate.canonicalEntityId,
      candidate.canonicalEntityType,
      candidate.source,
      command.recordedAt,
    )),
  );

  for (const mapping of createdSourceMappings) {
    const mappingIssues = validateCanonicalSourceMapping(mapping);
    for (const mappingIssue of mappingIssues) {
      issues.push({
        code: 'source-mapping-invalid',
        sourceEntityId: mapping.source.entityId,
        message: mappingIssue.message,
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, command, issues };
  }

  const dedupedMappings = [...existingMappings];
  for (const mapping of createdSourceMappings) {
    const existing = findSourceMapping(dedupedMappings, mapping.source);
    if (!existing) {
      dedupedMappings.push(mapping);
    }
  }

  return {
    ok: true,
    command,
    patch: {
      architectureNodes,
      architectureConnections,
      sourceMappings: dedupedMappings,
    },
    createdSourceMappings,
    warnings: preview.issues
      .filter((issue) => issue.severity !== 'blocker')
      .map((issue) => issue.message),
  };
}
