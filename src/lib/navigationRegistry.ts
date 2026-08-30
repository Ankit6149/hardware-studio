export type NavigationWorkbenchId =
  | 'home'
  | 'requirements'
  | 'architecture'
  | 'components'
  | 'schematic'
  | 'pcb'
  | 'mechanical'
  | 'firmware'
  | 'validation'
  | 'release';

export type NavigationIconKey =
  | 'dashboard'
  | 'product'
  | 'readiness'
  | 'requirements'
  | 'architecture'
  | 'risk'
  | 'blueprint'
  | 'mechanical'
  | 'assembly'
  | 'components'
  | 'schematic'
  | 'power'
  | 'pin-map'
  | 'bom'
  | 'board'
  | 'layers'
  | 'rules'
  | 'drc'
  | 'firmware'
  | 'state-machine'
  | 'mapping'
  | 'source'
  | 'validation'
  | 'coverage'
  | 'factory-qa'
  | 'exports'
  | 'factory-package'
  | 'revisions'
  | 'branches'
  | 'releases';

export type NavigationSurface =
  | 'dashboard'
  | 'legacy-blueprint'
  | 'product-studio'
  | 'readiness'
  | 'mechanical-canvas'
  | 'mechanical-assembly'
  | 'component-library'
  | 'schematic-editor'
  | 'power-budget'
  | 'pin-map'
  | 'bom'
  | 'board-designer'
  | 'board-studio'
  | 'pcb-constraints'
  | 'firmware-modules'
  | 'firmware-state-machine'
  | 'firmware-hardware-map'
  | 'firmware-source'
  | 'validation-tests'
  | 'validation-coverage'
  | 'validation-factory-qa'
  | 'blueprint-sheets'
  | 'exports'
  | 'revisions'
  | 'factory-builder';

export type NavigationLayout = 'workspace' | 'canvas';

export interface NavigationItem {
  id: string;
  label: string;
  purpose: string;
  icon: NavigationIconKey;
  surface: NavigationSurface;
  layout: NavigationLayout;
  badge: string;
  showVisualizer?: boolean;
}

export interface NavigationWorkbench {
  id: NavigationWorkbenchId;
  label: string;
  purpose: string;
  icon: NavigationIconKey;
  defaultView: string;
}

const item = (
  id: string,
  label: string,
  purpose: string,
  icon: NavigationIconKey,
  surface: NavigationSurface,
  badge: string,
  options: Pick<NavigationItem, 'layout' | 'showVisualizer'> = { layout: 'workspace' },
): NavigationItem => ({
  id,
  label,
  purpose,
  icon,
  surface,
  badge,
  layout: options.layout,
  showVisualizer: options.showVisualizer,
});

const primaryItems = [
  item('dashboard', 'Project Home', 'See project state, blockers, recent progress, and the next meaningful action.', 'dashboard', 'dashboard', 'HOME'),
  item('requirements', 'Requirements', 'Define measurable product needs, constraints, and acceptance criteria.', 'requirements', 'product-studio', 'REQ'),
  item('product-architecture', 'Architecture', 'Organize functions, devices, interfaces, and system relationships.', 'architecture', 'product-studio', 'ARCH'),
  item('component-library', 'Components', 'Choose and inspect canonical component definitions before using them in a design.', 'components', 'component-library', 'PART'),
  item('schematic-editor', 'Schematic', 'Place project components and define authoritative electrical connectivity.', 'schematic', 'schematic-editor', 'SCH'),
  item('board-designer', 'PCB', 'Place canonical footprints, route explicit nets, and inspect physical board state.', 'board', 'board-designer', 'PCB'),
  item('mechanical-studio', 'Mechanical', 'Create and inspect physical layout features, dimensions, enclosure intent, and 3D coordination.', 'mechanical', 'mechanical-canvas', 'MECH'),
  item('firmware-studio', 'Firmware', 'Connect software behavior, source, and evidence to the exact hardware it controls.', 'firmware', 'firmware-modules', 'FW'),
  item('validation-studio', 'Validate', 'Define tests, execute supported checks, capture evidence, and review coverage.', 'validation', 'validation-tests', 'TEST'),
  item('readiness', 'Release', 'Review evidence, unresolved findings, exact outputs, revisions, and release blockers.', 'readiness', 'readiness', 'REL'),
] as const;

const contextualItems = [
  item('power-budget', 'Power', 'Review power assumptions without creating a second electrical connectivity model.', 'power', 'power-budget', 'POWER'),
  item('pin-map', 'Pin Map', 'Review hardware pin intent shared by Electronics and Firmware.', 'pin-map', 'pin-map', 'PINS'),
  item('board-settings', 'Board Setup', 'Create or select the board and define explicit board geometry before layout.', 'layers', 'board-studio', 'BOARD'),
  item('pcb-constraints', 'Rules', 'Review physical board constraints and design rules in PCB context.', 'rules', 'pcb-constraints', 'RULES'),
  item('pcb-drc', 'DRC', 'Inspect current PCB rule and connectivity findings without leaving the PCB context.', 'drc', 'board-designer', 'DRC'),
  item('bom', 'BOM', 'Review sourcing identity, quantities, lifecycle information, and canonical component linkage.', 'bom', 'bom', 'BOM'),
  item('assembly-stack', 'Assembly', 'Review layers, materials, thicknesses, fastening, and assembly order.', 'assembly', 'mechanical-assembly', 'ASM'),
  item('state-machines', 'State Machine', 'Edit firmware behavior as a contextual Firmware work surface.', 'state-machine', 'firmware-state-machine', 'STATE'),
  item('hardware-mapping', 'Hardware Map', 'Link firmware functions to canonical components, buses, pins, and nets.', 'mapping', 'firmware-hardware-map', 'MAP'),
  item('source-skeleton', 'Source', 'Edit project source files and explicitly generated workspace files.', 'source', 'firmware-source', 'SRC'),
  item('firmware-evidence', 'Build & Device Evidence', 'Review recorded build and device evidence without presenting metadata as an executed build.', 'validation', 'firmware-modules', 'EVID'),
  item('requirement-coverage', 'Coverage', 'See which requirements have linked validation work and which remain unresolved.', 'coverage', 'validation-coverage', 'COV'),
  item('factory-qa', 'Factory QA', 'Author and review factory-quality validation in the Validation context.', 'factory-qa', 'validation-factory-qa', 'QA'),
  item('exports', 'Outputs', 'Download project backups and clearly classified supported draft outputs.', 'exports', 'exports', 'OUT'),
  item('revisions', 'Revisions', 'Create snapshots and inspect controlled revision and release records.', 'revisions', 'revisions', 'REV'),
  item('blueprint-sheets', 'Drawing Sheets', 'Review engineering drawing sheets as a Release output tool.', 'blueprint', 'blueprint-sheets', 'DRAW'),
  item('factory-builder', 'Factory Package', 'Prepare a reviewable factory package from explicit project evidence.', 'factory-package', 'factory-builder', 'PKG'),
] as const;

/**
 * Major product work surfaces. These are intentionally views of one product rather
 * than a permanent taxonomy of every Hardware Studio feature.
 */
export const workbenchTabs: readonly NavigationWorkbench[] = [
  { id: 'home', label: 'Home', purpose: 'Project state and next meaningful action.', icon: 'dashboard', defaultView: 'dashboard' },
  { id: 'requirements', label: 'Requirements', purpose: 'Measurable product intent and acceptance criteria.', icon: 'requirements', defaultView: 'requirements' },
  { id: 'architecture', label: 'Architecture', purpose: 'Functions, devices, interfaces, and system relationships.', icon: 'architecture', defaultView: 'product-architecture' },
  { id: 'components', label: 'Components', purpose: 'Canonical part identity and reusable representations.', icon: 'components', defaultView: 'component-library' },
  { id: 'schematic', label: 'Schematic', purpose: 'Authoritative electrical connectivity.', icon: 'schematic', defaultView: 'schematic-editor' },
  { id: 'pcb', label: 'PCB', purpose: 'Board geometry, placement, routing, rules, and sourcing context.', icon: 'board', defaultView: 'board-designer' },
  { id: 'mechanical', label: 'Mechanical', purpose: 'Physical design, assembly, and 3D coordination.', icon: 'mechanical', defaultView: 'mechanical-studio' },
  { id: 'firmware', label: 'Firmware', purpose: 'Behavior, source, hardware mapping, build, and device evidence.', icon: 'firmware', defaultView: 'firmware-studio' },
  { id: 'validation', label: 'Validate', purpose: 'Test definitions, evidence, execution, and coverage.', icon: 'validation', defaultView: 'validation-studio' },
  { id: 'release', label: 'Release', purpose: 'Readiness, outputs, revisions, packages, and controlled handoff.', icon: 'readiness', defaultView: 'readiness' },
] as const;

const contextualItemsByWorkbench: Readonly<Record<NavigationWorkbenchId, readonly NavigationItem[]>> = {
  home: [],
  requirements: [],
  architecture: [],
  components: [],
  schematic: contextualItems.filter((candidate) => ['power-budget', 'pin-map'].includes(candidate.id)),
  pcb: contextualItems.filter((candidate) => ['board-settings', 'pcb-constraints', 'pcb-drc', 'bom'].includes(candidate.id)),
  mechanical: contextualItems.filter((candidate) => candidate.id === 'assembly-stack'),
  firmware: contextualItems.filter((candidate) => ['state-machines', 'hardware-mapping', 'source-skeleton', 'firmware-evidence'].includes(candidate.id)),
  validation: contextualItems.filter((candidate) => ['requirement-coverage', 'factory-qa'].includes(candidate.id)),
  release: contextualItems.filter((candidate) => ['exports', 'revisions', 'blueprint-sheets', 'factory-builder'].includes(candidate.id)),
};

/**
 * Compatibility-only IDs are accepted for old projects, imports, and deep links.
 * They never appear as primary workbench tabs or contextual tools unless explicitly
 * represented above.
 */
export const compatibleNavigationItems: readonly NavigationItem[] = [
  item('product-design', 'Product Design', 'Experimental concept-design workbench retained while repository convergence is completed.', 'product', 'product-studio', 'EXP'),
  item('product-studio', 'Product Design', 'Legacy product overview shortcut retained for safe project loading.', 'product', 'product-studio', 'LEG'),
  item('risks-interfaces', 'Architecture', 'Legacy architecture shortcut retained for safe project loading.', 'risk', 'product-studio', 'LEG'),
  item('blueprint-editor', 'System Blueprint', 'Legacy architecture canvas retained for safe project loading.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('master', 'System Blueprint', 'Legacy default view used by older local projects.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('dossier', 'System Blueprint', 'Legacy dossier view retained only for safe project loading.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('electronics', 'Electronics', 'Legacy Electronics shortcut retained for safe project loading.', 'components', 'component-library', 'LEG'),
  item('power-tree', 'Power', 'Legacy power shortcut retained for safe project loading.', 'power', 'power-budget', 'LEG'),
  item('board-studio', 'Board Setup', 'Legacy board-studio ID retained for safe project loading.', 'layers', 'board-studio', 'LEG'),
  item('board-components', 'Board Setup', 'Legacy board-components ID retained for safe project loading.', 'layers', 'board-studio', 'LEG'),
  item('branches', 'Revisions', 'Legacy branches route retained for safe project loading.', 'branches', 'revisions', 'LEG'),
  item('releases', 'Revisions', 'Legacy releases route retained for safe project loading.', 'releases', 'revisions', 'LEG'),
] as const;

export const primaryNavigationItems: readonly NavigationItem[] = primaryItems;
/** @deprecated Use primaryNavigationItems. Kept during compatibility migration. */
export const visibleNavigationItems: readonly NavigationItem[] = primaryNavigationItems;

export const allNavigationItems: readonly NavigationItem[] = [
  ...primaryNavigationItems,
  ...contextualItems,
  ...compatibleNavigationItems,
];

const navigationItemById = new Map(allNavigationItems.map((navigationItem) => [navigationItem.id, navigationItem]));
const workbenchById = new Map(workbenchTabs.map((workbench) => [workbench.id, workbench]));

const workbenchByViewId: Readonly<Record<string, NavigationWorkbenchId>> = {
  dashboard: 'home',
  requirements: 'requirements',
  'product-architecture': 'architecture',
  'product-design': 'architecture',
  'product-studio': 'architecture',
  'risks-interfaces': 'architecture',
  'blueprint-editor': 'architecture',
  master: 'architecture',
  dossier: 'architecture',
  'component-library': 'components',
  electronics: 'components',
  'schematic-editor': 'schematic',
  'power-tree': 'schematic',
  'power-budget': 'schematic',
  'pin-map': 'schematic',
  'board-designer': 'pcb',
  'board-settings': 'pcb',
  'board-studio': 'pcb',
  'board-components': 'pcb',
  'pcb-constraints': 'pcb',
  'pcb-drc': 'pcb',
  bom: 'pcb',
  'mechanical-studio': 'mechanical',
  'assembly-stack': 'mechanical',
  'firmware-studio': 'firmware',
  'state-machines': 'firmware',
  'hardware-mapping': 'firmware',
  'source-skeleton': 'firmware',
  'firmware-evidence': 'firmware',
  'validation-studio': 'validation',
  'requirement-coverage': 'validation',
  'factory-qa': 'validation',
  readiness: 'release',
  exports: 'release',
  revisions: 'release',
  'blueprint-sheets': 'release',
  'factory-builder': 'release',
  branches: 'release',
  releases: 'release',
};

export function getNavigationItem(viewId: string): NavigationItem | undefined {
  return navigationItemById.get(viewId);
}

export function getWorkbenchForView(viewId: string): NavigationWorkbench | undefined {
  const workbenchId = workbenchByViewId[viewId];
  return workbenchId ? workbenchById.get(workbenchId) : undefined;
}

export function getContextualNavigationItemsForView(viewId: string): readonly NavigationItem[] {
  const workbench = getWorkbenchForView(viewId);
  return workbench ? contextualItemsByWorkbench[workbench.id] : [];
}

export function isCanvasNavigationItem(navigationItem: NavigationItem | undefined): boolean {
  return navigationItem?.layout === 'canvas';
}
