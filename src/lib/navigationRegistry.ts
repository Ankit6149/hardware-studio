export type NavigationDomainId =
  | 'overview'
  | 'product'
  | 'mechanical'
  | 'electronics'
  | 'pcb'
  | 'firmware'
  | 'validation'
  | 'outputs';

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

export interface NavigationDomain {
  id: NavigationDomainId;
  label: string;
  purpose: string;
  items: readonly NavigationItem[];
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

/**
 * Visible navigation is deliberately small. Deep tools live inside the workbench
 * that owns the engineering decision instead of becoming duplicate destinations.
 */
export const navigationDomains: readonly NavigationDomain[] = [
  {
    id: 'overview',
    label: 'Overview',
    purpose: 'Project health, progress, and release blockers.',
    items: [
      item('dashboard', 'Project Dashboard', 'See project health, next actions, and current blockers.', 'dashboard', 'dashboard', 'HOME'),
      item('readiness', 'Release Readiness', 'Review evidence, unresolved findings, and release blockers.', 'readiness', 'readiness', 'GATE'),
    ],
  },
  {
    id: 'product',
    label: 'Product',
    purpose: 'Define the product, its requirements, and the system architecture connecting every discipline.',
    items: [
      item('product-design', 'Product Design', 'Develop product form, references, dimensions, and concept parts.', 'product', 'product-studio', 'DESIGN'),
      item('requirements', 'Requirements', 'Define measurable product needs and acceptance criteria.', 'requirements', 'product-studio', 'REQ'),
      item('product-architecture', 'Product Architecture', 'Organize real functions, devices, interfaces, and system relationships.', 'architecture', 'product-studio', 'ARCH'),
    ],
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    purpose: 'Design physical features, packaging, clearances, and assembly.',
    items: [
      item('mechanical-studio', 'Mechanical Design', 'Create and inspect physical layout features and dimensions.', 'mechanical', 'mechanical-canvas', '2D'),
      item('assembly-stack', 'Assembly', 'Review layers, materials, thicknesses, fastening, and assembly order.', 'assembly', 'mechanical-assembly', 'ASM'),
    ],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    purpose: 'Choose parts and define electrical connectivity, power, pins, and sourcing.',
    items: [
      item('component-library', 'Components', 'Find, understand, and inspect component definitions and representations.', 'components', 'component-library', 'LIB'),
      item('schematic-editor', 'Schematic', 'Place electrical symbols and define connectivity.', 'schematic', 'schematic-editor', 'SCH'),
      item('power-tree', 'Power', 'Estimate rail loads, duty cycles, and battery runtime.', 'power', 'power-budget', 'PWR'),
      item('pin-map', 'Pin Mapping', 'Map product functions to component and controller pins.', 'pin-map', 'pin-map', 'PIN'),
      item('bom', 'Bill of Materials', 'Review parts, quantities, sourcing data, and lifecycle notes.', 'bom', 'bom', 'BOM'),
    ],
  },
  {
    id: 'pcb',
    label: 'PCB',
    purpose: 'Define the board, place footprints, route nets, and control design rules.',
    items: [
      item('board-designer', 'Board Designer', 'Place footprints, route nets, inspect layers, and run DRC in one workbench.', 'board', 'board-designer', 'PCB'),
      item('board-settings', 'Board Setup', 'Manage board definitions, explicit outlines, stack intent, dimensions, and notes.', 'layers', 'board-studio', 'SET'),
      item('pcb-constraints', 'Design Rules', 'Define trace, clearance, via, and manufacturing constraints.', 'rules', 'pcb-constraints', 'RULE'),
    ],
  },
  {
    id: 'firmware',
    label: 'Firmware',
    purpose: 'Connect software behavior, source, hardware mappings, builds, and device evidence.',
    items: [
      item('firmware-studio', 'Modules', 'Define firmware responsibilities, dependencies, and tasks.', 'firmware', 'firmware-modules', 'MOD'),
      item('state-machines', 'State Machines', 'Describe product modes, events, transitions, and actions.', 'state-machine', 'firmware-state-machine', 'STATE'),
      item('hardware-mapping', 'Hardware Mapping', 'Link firmware functions to components, buses, and pins.', 'mapping', 'firmware-hardware-map', 'MAP'),
      item('source-skeleton', 'Source', 'Edit project source files and explicitly generated workspace files.', 'source', 'firmware-source', 'SRC'),
      item('firmware-evidence', 'Build & Device Evidence', 'Record real external build results and device observations.', 'validation', 'firmware-modules', 'EVID'),
    ],
  },
  {
    id: 'validation',
    label: 'Validate',
    purpose: 'Plan tests, capture evidence, and trace requirement coverage.',
    items: [
      item('validation-studio', 'Tests & Evidence', 'Create test definitions, procedures, measurements, runs, and evidence.', 'validation', 'validation-tests', 'TEST'),
      item('requirement-coverage', 'Requirement Coverage', 'See which requirements have linked validation work.', 'coverage', 'validation-coverage', 'COV'),
      item('factory-qa', 'Factory QA', 'Review production-oriented checks and factory test records.', 'factory-qa', 'validation-factory-qa', 'QA'),
    ],
  },
  {
    id: 'outputs',
    label: 'Release',
    purpose: 'Review drawings, exports, manufacturing packages, revisions, and release evidence.',
    items: [
      item('blueprint-sheets', 'Drawing Sheets', 'Review engineering drawing sheets and annotations.', 'blueprint', 'blueprint-sheets', 'DRAW'),
      item('exports', 'Export Center', 'Download project backups and clearly classified draft outputs.', 'exports', 'exports', 'OUT'),
      item('factory-builder', 'Factory Package', 'Review manufacturing files, missing evidence, and factory handoff state.', 'factory-package', 'factory-builder', 'MFG'),
      item('revisions', 'Revisions & Releases', 'Create snapshots and inspect branch, candidate, and release records together.', 'revisions', 'revisions', 'REV'),
    ],
  },
] as const;

/**
 * Compatibility-only IDs can still exist in templates/imports/local projects.
 * They remain routable but are not shown as competing destinations.
 */
export const compatibleNavigationItems: readonly NavigationItem[] = [
  item('product-studio', 'Product Design', 'Legacy overview shortcut retained for safe project loading.', 'product', 'product-studio', 'WORK'),
  item('risks-interfaces', 'Product Architecture', 'Legacy product architecture route retained for safe project loading.', 'risk', 'product-studio', 'RISK'),
  item('blueprint-editor', 'System Blueprint', 'Legacy architecture canvas retained for safe project loading.', 'blueprint', 'legacy-blueprint', 'MAP', { layout: 'canvas', showVisualizer: true }),
  item('pcb-drc', 'Board Designer', 'Legacy standalone DRC route now resolves to the board workbench.', 'drc', 'board-designer', 'DRC'),
  item('branches', 'Revisions & Releases', 'Legacy branches route retained for safe project loading.', 'branches', 'revisions', 'BR'),
  item('releases', 'Revisions & Releases', 'Legacy releases route retained for safe project loading.', 'releases', 'revisions', 'REL'),
  item('master', 'System Blueprint', 'Legacy default view used by older local projects.', 'blueprint', 'legacy-blueprint', 'MAP', { layout: 'canvas', showVisualizer: true }),
  item('dossier', 'System Blueprint', 'Legacy dossier view retained only for safe project loading.', 'blueprint', 'legacy-blueprint', 'MAP', { layout: 'canvas', showVisualizer: true }),
  item('electronics', 'Product Design', 'Legacy product-electronics section retained for safe project loading.', 'product', 'product-studio', 'WORK'),
  item('power-budget', 'Power', 'Legacy power-budget ID retained for safe project loading.', 'power', 'power-budget', 'PWR'),
  item('board-studio', 'Board Setup', 'Legacy board-studio ID retained for safe project loading.', 'layers', 'board-studio', 'SET'),
  item('board-components', 'Board Setup', 'Legacy board-components ID retained for safe project loading.', 'layers', 'board-studio', 'SET'),
] as const;

export const visibleNavigationItems: readonly NavigationItem[] = navigationDomains.flatMap((domain) => domain.items);
export const allNavigationItems: readonly NavigationItem[] = [...visibleNavigationItems, ...compatibleNavigationItems];

const navigationItemById = new Map(allNavigationItems.map((navigationItem) => [navigationItem.id, navigationItem]));

export function getNavigationItem(viewId: string): NavigationItem | undefined {
  return navigationItemById.get(viewId);
}

export function isCanvasNavigationItem(navigationItem: NavigationItem | undefined): boolean {
  return navigationItem?.layout === 'canvas';
}
