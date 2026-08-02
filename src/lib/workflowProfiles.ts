import {
  getNavigationItem,
  navigationDomains,
  type NavigationDomain,
  type NavigationDomainId,
} from './navigationRegistry';

export const WORKFLOW_DOMAIN_IDS = [
  'product',
  'mechanical',
  'electronics',
  'pcb',
  'firmware',
  'validation',
  'outputs',
] as const satisfies readonly NavigationDomainId[];

export type WorkflowDomainId = (typeof WORKFLOW_DOMAIN_IDS)[number];

export const WORKFLOW_PROFILE_IDS = [
  'complete-product',
  'electronics-pcb',
  'mechanical-assembly',
  'firmware-device',
  'validation-handoff',
  'custom',
] as const;

export type WorkflowProfileId = (typeof WORKFLOW_PROFILE_IDS)[number];

export interface WorkflowProfile {
  id: WorkflowProfileId;
  name: string;
  summary: string;
  bestFor: string;
  enabledDomains: readonly WorkflowDomainId[];
  startingView: string;
}

export interface WorkflowPreference {
  version: 1;
  profileId: WorkflowProfileId;
  enabledDomains: WorkflowDomainId[];
  showAllDomains: boolean;
  hasCompletedSetup: boolean;
}

export interface WorkflowConnectionNotice {
  id: string;
  tone: 'info' | 'warning';
  title: string;
  description: string;
  relatedDomains: WorkflowDomainId[];
}

export interface WorkflowProjectSnapshot {
  requirements: number;
  architectureNodes: number;
  risks: number;
  mechanicalObjects: number;
  assemblyLayers: number;
  components: number;
  circuitBlocks: number;
  nets: number;
  boards: number;
  traces: number;
  firmwareModules: number;
  firmwareStates: number;
  validationTests: number;
  validationRuns: number;
  revisions: number;
  factoryPackageStatus: string;
}

export interface GuidedWorkflowAction {
  domainId: WorkflowDomainId;
  title: string;
  description: string;
  viewId: string;
  status: 'start' | 'continue' | 'review';
  evidence: string;
}

const ALL_DOMAINS = [...WORKFLOW_DOMAIN_IDS];

export const workflowProfiles: readonly WorkflowProfile[] = [
  {
    id: 'complete-product',
    name: 'Complete Product',
    summary: 'Keep the full product lifecycle visible from intent through release outputs.',
    bestFor: 'Teams or individuals building electronics, mechanical, firmware, validation, and handoff together.',
    enabledDomains: ALL_DOMAINS,
    startingView: 'dashboard',
  },
  {
    id: 'electronics-pcb',
    name: 'Electronics + PCB',
    summary: 'Focus on components, schematic, power, board layout, checks, and engineering outputs.',
    bestFor: 'PCB design, electronics prototypes, modules, controller boards, and hardware revisions.',
    enabledDomains: ['product', 'electronics', 'pcb', 'validation', 'outputs'],
    startingView: 'component-library',
  },
  {
    id: 'mechanical-assembly',
    name: 'Mechanical + Assembly',
    summary: 'Focus on product intent, enclosure/layout work, assembly structure, validation, and outputs.',
    bestFor: 'Enclosures, fixtures, physical packaging, assembly planning, and mechanical coordination.',
    enabledDomains: ['product', 'mechanical', 'validation', 'outputs'],
    startingView: 'mechanical-studio',
  },
  {
    id: 'firmware-device',
    name: 'Firmware + Device',
    summary: 'Focus on hardware-aware firmware planning, mappings, behavior, tests, and release records.',
    bestFor: 'Firmware built around existing boards, embedded behavior, bring-up, and device validation.',
    enabledDomains: ['product', 'electronics', 'firmware', 'validation', 'outputs'],
    startingView: 'firmware-studio',
  },
  {
    id: 'validation-handoff',
    name: 'Validation + Handoff',
    summary: 'Focus on requirements, tests, evidence, coverage, revisions, and delivery outputs.',
    bestFor: 'Test planning, verification, factory QA preparation, audits, and controlled handoff.',
    enabledDomains: ['product', 'validation', 'outputs'],
    startingView: 'validation-studio',
  },
  {
    id: 'custom',
    name: 'Custom Workflow',
    summary: 'Choose exactly which engineering domains should appear in your workspace.',
    bestFor: 'Standalone work, unusual processes, imported designs, or intentionally narrow projects.',
    enabledDomains: [],
    startingView: 'dashboard',
  },
] as const;

export const DEFAULT_WORKFLOW_PREFERENCE: WorkflowPreference = {
  version: 1,
  profileId: 'complete-product',
  enabledDomains: [...ALL_DOMAINS],
  showAllDomains: false,
  hasCompletedSetup: false,
};

const profileById = new Map(workflowProfiles.map((profile) => [profile.id, profile]));
const validDomainIds = new Set<WorkflowDomainId>(WORKFLOW_DOMAIN_IDS);

export function getWorkflowProfile(profileId: WorkflowProfileId): WorkflowProfile {
  return profileById.get(profileId) ?? workflowProfiles[0];
}

export function createPreferenceFromProfile(
  profileId: WorkflowProfileId,
  previous: Partial<WorkflowPreference> = {},
): WorkflowPreference {
  const profile = getWorkflowProfile(profileId);
  return {
    version: 1,
    profileId,
    enabledDomains: [...profile.enabledDomains],
    showAllDomains: previous.showAllDomains ?? false,
    hasCompletedSetup: previous.hasCompletedSetup ?? false,
  };
}

export function inferProfileId(enabledDomains: readonly WorkflowDomainId[]): WorkflowProfileId {
  const normalized = [...new Set(enabledDomains)].sort();
  const matching = workflowProfiles.find((profile) => {
    if (profile.id === 'custom') return false;
    const profileDomains = [...profile.enabledDomains].sort();
    return profileDomains.length === normalized.length
      && profileDomains.every((domainId, index) => domainId === normalized[index]);
  });
  return matching?.id ?? 'custom';
}

export function normalizeWorkflowPreference(input: unknown): WorkflowPreference {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_WORKFLOW_PREFERENCE, enabledDomains: [...ALL_DOMAINS] };
  }

  const candidate = input as Partial<WorkflowPreference>;
  const enabledDomains = Array.isArray(candidate.enabledDomains)
    ? [...new Set(candidate.enabledDomains.filter((domainId): domainId is WorkflowDomainId => validDomainIds.has(domainId as WorkflowDomainId)))]
    : [...ALL_DOMAINS];

  return {
    version: 1,
    profileId: inferProfileId(enabledDomains),
    enabledDomains,
    showAllDomains: candidate.showAllDomains === true,
    hasCompletedSetup: candidate.hasCompletedSetup === true,
  };
}

export function toggleWorkflowDomain(
  enabledDomains: readonly WorkflowDomainId[],
  domainId: WorkflowDomainId,
): WorkflowDomainId[] {
  const current = new Set(enabledDomains);
  if (current.has(domainId)) current.delete(domainId);
  else current.add(domainId);
  return WORKFLOW_DOMAIN_IDS.filter((candidate) => current.has(candidate));
}

export function getDomainIdForView(viewId: string): NavigationDomainId | undefined {
  const visibleDomain = navigationDomains.find((domain) => domain.items.some((item) => item.id === viewId));
  if (visibleDomain) return visibleDomain.id;

  const item = getNavigationItem(viewId);
  if (!item) return undefined;
  return navigationDomains.find((domain) => domain.items.some((candidate) => candidate.surface === item.surface))?.id;
}

export function getVisibleNavigationDomains(
  enabledDomains: readonly WorkflowDomainId[],
  activeView: string,
  showAllDomains: boolean,
): readonly NavigationDomain[] {
  if (showAllDomains) return navigationDomains;

  const enabled = new Set<NavigationDomainId>(['overview', ...enabledDomains]);
  const activeDomain = getDomainIdForView(activeView);
  if (activeDomain) enabled.add(activeDomain);
  return navigationDomains.filter((domain) => enabled.has(domain.id));
}

export function getHiddenDomainCount(enabledDomains: readonly WorkflowDomainId[]): number {
  return WORKFLOW_DOMAIN_IDS.length - new Set(enabledDomains).size;
}

export function getWorkflowConnectionNotices(
  enabledDomains: readonly WorkflowDomainId[],
): WorkflowConnectionNotice[] {
  const enabled = new Set(enabledDomains);
  const notices: WorkflowConnectionNotice[] = [];

  if (enabled.has('pcb') && !enabled.has('electronics')) {
    notices.push({
      id: 'pcb-without-electronics',
      tone: 'warning',
      title: 'PCB is shown as a standalone workspace',
      description: 'Board planning remains available, but schematic synchronization, linked nets, and component-definition context require the Electronics domain.',
      relatedDomains: ['pcb', 'electronics'],
    });
  }

  if (enabled.has('firmware') && !enabled.has('electronics')) {
    notices.push({
      id: 'firmware-without-electronics',
      tone: 'warning',
      title: 'Firmware is shown without hardware context',
      description: 'Firmware planning remains available, but pin, bus, component, and board mappings require Electronics data.',
      relatedDomains: ['firmware', 'electronics'],
    });
  }

  if (enabled.has('mechanical') && enabled.has('pcb')) {
    notices.push({
      id: 'mechanical-pcb-connected',
      tone: 'info',
      title: 'Mechanical and PCB work can share placement context',
      description: 'Keep both domains visible when coordinating board outline, mounting, connector openings, package height, and enclosure clearances.',
      relatedDomains: ['mechanical', 'pcb'],
    });
  }

  if (enabled.has('validation') && enabledDomains.length === 1) {
    notices.push({
      id: 'validation-standalone',
      tone: 'info',
      title: 'Validation is operating independently',
      description: 'Generic tests can be planned alone. Requirement coverage and automatic impact context become richer when source engineering domains are also visible.',
      relatedDomains: ['validation'],
    });
  }

  if (enabled.has('outputs') && !enabledDomains.some((domainId) => domainId !== 'outputs')) {
    notices.push({
      id: 'outputs-only',
      tone: 'warning',
      title: 'Outputs has no visible source domain',
      description: 'Exports and release records can only package engineering data that already exists in the project. Showing Outputs does not generate missing source work.',
      relatedDomains: ['outputs'],
    });
  }

  return notices;
}

function evidence(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function deriveGuidedWorkflowActions(
  enabledDomains: readonly WorkflowDomainId[],
  snapshot: WorkflowProjectSnapshot,
): GuidedWorkflowAction[] {
  const actions: GuidedWorkflowAction[] = [];
  const enabled = new Set(enabledDomains);

  if (enabled.has('product')) {
    if (snapshot.requirements === 0) {
      actions.push({ domainId: 'product', title: 'Define the first measurable requirement', description: 'Start with what the product must achieve and how success will be checked.', viewId: 'requirements', status: 'start', evidence: evidence(snapshot.requirements, 'requirement') });
    } else if (snapshot.architectureNodes === 0) {
      actions.push({ domainId: 'product', title: 'Turn requirements into product architecture', description: 'Create functions, interfaces, and system relationships without jumping directly into implementation.', viewId: 'product-architecture', status: 'continue', evidence: evidence(snapshot.requirements, 'requirement') });
    } else {
      actions.push({ domainId: 'product', title: 'Review risks and cross-domain interfaces', description: 'Confirm that architecture decisions, assumptions, and interfaces are explicit before downstream work expands.', viewId: 'risks-interfaces', status: 'review', evidence: `${evidence(snapshot.requirements, 'requirement')} · ${evidence(snapshot.architectureNodes, 'architecture node')}` });
    }
  }

  if (enabled.has('mechanical')) {
    if (snapshot.mechanicalObjects === 0) {
      actions.push({ domainId: 'mechanical', title: 'Create the first mechanical layout object', description: 'Define the physical envelope or a meaningful reference before planning the assembly.', viewId: 'mechanical-studio', status: 'start', evidence: evidence(snapshot.mechanicalObjects, 'mechanical object') });
    } else if (snapshot.assemblyLayers === 0) {
      actions.push({ domainId: 'mechanical', title: 'Describe the assembly stack', description: 'Organize physical layers, materials, thicknesses, and order around the existing layout.', viewId: 'assembly-stack', status: 'continue', evidence: evidence(snapshot.mechanicalObjects, 'mechanical object') });
    } else {
      actions.push({ domainId: 'mechanical', title: 'Review layout and assembly assumptions', description: 'Check that dimensions, materials, and clearances are explicit before treating the model as engineering evidence.', viewId: 'mechanical-studio', status: 'review', evidence: `${evidence(snapshot.mechanicalObjects, 'mechanical object')} · ${evidence(snapshot.assemblyLayers, 'assembly layer')}` });
    }
  }

  if (enabled.has('electronics')) {
    if (snapshot.components === 0) {
      actions.push({ domainId: 'electronics', title: 'Choose the first component definition', description: 'Understand the device family, inspect its pins and footprint, then register one project instance.', viewId: 'component-library', status: 'start', evidence: evidence(snapshot.components, 'component') });
    } else if (snapshot.circuitBlocks === 0 || snapshot.nets === 0) {
      actions.push({ domainId: 'electronics', title: 'Build electrical structure and connectivity', description: 'Organize component responsibilities and create explicit electrical connections before PCB placement.', viewId: 'schematic-editor', status: 'continue', evidence: `${evidence(snapshot.components, 'component')} · ${evidence(snapshot.nets, 'net')}` });
    } else {
      actions.push({ domainId: 'electronics', title: 'Review power, pins, and sourcing together', description: 'Confirm that connectivity, power assumptions, pin ownership, and BOM records describe the same design.', viewId: 'power-tree', status: 'review', evidence: `${evidence(snapshot.components, 'component')} · ${evidence(snapshot.nets, 'net')}` });
    }
  }

  if (enabled.has('pcb')) {
    if (snapshot.boards === 0) {
      actions.push({ domainId: 'pcb', title: 'Create or configure a board', description: 'Define the board identity and outline before placing footprints or routing nets.', viewId: 'board-settings', status: 'start', evidence: evidence(snapshot.boards, 'board') });
    } else if (snapshot.components === 0) {
      actions.push({ domainId: 'pcb', title: 'Add board components before placement', description: 'A board can exist independently, but meaningful placement requires component instances or imported board data.', viewId: 'component-library', status: 'start', evidence: `${evidence(snapshot.boards, 'board')} · ${evidence(snapshot.components, 'component')}` });
    } else if (snapshot.traces === 0) {
      actions.push({ domainId: 'pcb', title: 'Place footprints and inspect unrouted work', description: 'Open the board workspace, establish placement, and route only from explicit connectivity.', viewId: 'board-designer', status: 'continue', evidence: `${evidence(snapshot.boards, 'board')} · ${evidence(snapshot.traces, 'trace')}` });
    } else {
      actions.push({ domainId: 'pcb', title: 'Review board rules and current findings', description: 'Inspect routing, constraints, and DRC limitations before preparing manufacturing output.', viewId: 'pcb-constraints', status: 'review', evidence: `${evidence(snapshot.boards, 'board')} · ${evidence(snapshot.traces, 'trace')}` });
    }
  }

  if (enabled.has('firmware')) {
    if (snapshot.firmwareModules === 0) {
      actions.push({ domainId: 'firmware', title: 'Define firmware responsibilities', description: 'Create modules around product behavior before generating or editing source structure.', viewId: 'firmware-studio', status: 'start', evidence: evidence(snapshot.firmwareModules, 'firmware module') });
    } else if (snapshot.firmwareStates === 0) {
      actions.push({ domainId: 'firmware', title: 'Describe device states and transitions', description: 'Make behavior explicit before connecting modules to hardware and source files.', viewId: 'state-machines', status: 'continue', evidence: evidence(snapshot.firmwareModules, 'firmware module') });
    } else {
      actions.push({ domainId: 'firmware', title: 'Review hardware mappings', description: 'Confirm that firmware functions reference real components, buses, and pins rather than free-form assumptions.', viewId: 'hardware-mapping', status: 'review', evidence: `${evidence(snapshot.firmwareModules, 'firmware module')} · ${evidence(snapshot.firmwareStates, 'state')}` });
    }
  }

  if (enabled.has('validation')) {
    if (snapshot.validationTests === 0) {
      actions.push({ domainId: 'validation', title: 'Create the first validation procedure', description: 'Define what will be tested, the expected result, required evidence, and the source requirement or risk.', viewId: 'validation-studio', status: 'start', evidence: evidence(snapshot.validationTests, 'validation test') });
    } else if (snapshot.validationRuns === 0) {
      actions.push({ domainId: 'validation', title: 'Review test readiness and missing evidence', description: 'Check procedures and requirement links before recording any result as verified.', viewId: 'requirement-coverage', status: 'continue', evidence: `${evidence(snapshot.validationTests, 'validation test')} · ${evidence(snapshot.validationRuns, 'run')}` });
    } else {
      actions.push({ domainId: 'validation', title: 'Review coverage and retest needs', description: 'Inspect which requirements are covered and which results may be stale after design changes.', viewId: 'requirement-coverage', status: 'review', evidence: `${evidence(snapshot.validationTests, 'validation test')} · ${evidence(snapshot.validationRuns, 'run')}` });
    }
  }

  if (enabled.has('outputs')) {
    if (snapshot.revisions === 0) {
      actions.push({ domainId: 'outputs', title: 'Create a named project revision', description: 'Capture a deliberate checkpoint before comparing changes or preparing output packages.', viewId: 'revisions', status: 'start', evidence: evidence(snapshot.revisions, 'revision') });
    } else if (snapshot.factoryPackageStatus === 'Draft') {
      actions.push({ domainId: 'outputs', title: 'Inspect output readiness without claiming release', description: 'Review available exports, missing source data, and draft classifications before building a handoff package.', viewId: 'exports', status: 'continue', evidence: `${evidence(snapshot.revisions, 'revision')} · package ${snapshot.factoryPackageStatus}` });
    } else {
      actions.push({ domainId: 'outputs', title: 'Review release and factory-package blockers', description: 'Confirm that outputs remain tied to exact source data and unresolved engineering work remains visible.', viewId: 'factory-builder', status: 'review', evidence: `${evidence(snapshot.revisions, 'revision')} · package ${snapshot.factoryPackageStatus}` });
    }
  }

  return WORKFLOW_DOMAIN_IDS.flatMap((domainId) => actions.filter((action) => action.domainId === domainId));
}
