import type { ProductRequirement, Project } from '../../types';

export type RequirementsAuthoritySource = 'canonical' | 'legacy-compatibility' | 'empty';

export interface RequirementProjection {
  id: string;
  title: string;
  description: string;
  source: Exclude<RequirementsAuthoritySource, 'empty'>;
  canonical?: ProductRequirement;
  legacy?: {
    sourceNodeId: string;
    sourceNodeName: string;
    risks?: string;
    mitigation?: string;
    testingNotes?: string;
  };
}

export interface RequirementsAuthorityProjection {
  source: RequirementsAuthoritySource;
  requirements: RequirementProjection[];
  canonicalRequirements: ProductRequirement[];
  legacyRequirementNotes: RequirementProjection[];
}

function canonicalProjection(requirement: ProductRequirement): RequirementProjection {
  return {
    id: requirement.id,
    title: requirement.title,
    description: requirement.description,
    source: 'canonical',
    canonical: requirement,
  };
}

function legacyRequirementNotes(project: Project): RequirementProjection[] {
  return (project.nodes || [])
    .filter((node) => node.type !== 'boundaryNode' && Boolean(node.data?.requirements?.trim()))
    .map((node) => ({
      id: `legacy-requirement:${node.id}`,
      title: node.data?.name?.trim()
        ? `${node.data.name.trim()} requirement notes`
        : 'Legacy requirement notes',
      description: node.data.requirements.trim(),
      source: 'legacy-compatibility' as const,
      legacy: {
        sourceNodeId: node.id,
        sourceNodeName: node.data?.name?.trim() || node.id,
        risks: node.data?.risks?.trim() || undefined,
        mitigation: node.data?.mitigation?.trim() || undefined,
        testingNotes: node.data?.testingNotes?.trim() || undefined,
      },
    }));
}

/**
 * Requirement reads have one authority.
 *
 * Canonical ProductRequirement records win whenever they exist. Legacy
 * free-text node requirements remain visible only as compatibility context
 * and are never split, prioritized, approved, linked, or verified implicitly.
 */
export function resolveRequirementsAuthority(project: Project): RequirementsAuthorityProjection {
  const canonicalRequirements = project.requirements || [];
  const legacyNotes = legacyRequirementNotes(project);

  if (canonicalRequirements.length > 0) {
    return {
      source: 'canonical',
      requirements: canonicalRequirements.map(canonicalProjection),
      canonicalRequirements,
      legacyRequirementNotes: legacyNotes,
    };
  }

  if (legacyNotes.length > 0) {
    return {
      source: 'legacy-compatibility',
      requirements: legacyNotes,
      canonicalRequirements,
      legacyRequirementNotes: legacyNotes,
    };
  }

  return {
    source: 'empty',
    requirements: [],
    canonicalRequirements,
    legacyRequirementNotes: [],
  };
}

export function requirementsUseLegacyCompatibility(project: Project): boolean {
  return resolveRequirementsAuthority(project).source === 'legacy-compatibility';
}
