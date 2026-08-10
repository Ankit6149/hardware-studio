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

export const navigationDomains: readonly NavigationDomain[] = [
  {
    id: 'overview',
    label: 'Overview',
    purpose: 'Project health, progress, and release blockers.',
    items: [
      item('dashboard', 'Project Dashboard', 'See project health, next actions, and current blockers.', 'dashboard', 'dashboard', 'HOME'),
      item('product-studio', 'Product Workspace', 'Open the connected Product Design, Requirements, and Architecture workbenches.', 'product', 'product-studio', 'WORK'),
      item('readiness', 'Release Readiness', 'Review evidence, unresolved findings, and release blockers.', 'readiness', 'readiness', 'GATE'),
    ],
  },
  {
    id: 'product',
    label: 'Product',
    purpose: 'Explore product form, define intent, and connect it to engineering.',
    items: [
      item('product-design', 'Product Design', 'Create layered product concepts, references, dimensions, concept parts, and lightweight 3D previews.', 'product', 'product-studio', 'DESIGN'),
      item('requirements', 'Requirements', 'Define measurable product needs and acceptance criteria.', 'requirements', 'product-studio', 'REQ'),
      item('product-architecture', 'Product Architecture', 'Organize functions, interfaces, and system relationships.', 'architecture', 'product-studio', 'ARCH'),
      item('risks-interfaces', 'Risks & Interfaces', 'Track product risks, assumptions, and cross-domain interfaces.', 'risk', 'product-studio', 'RISK'),
      item(
        'blueprint-editor',
        'System Blueprint',
        'Arrange early product blocks and inspect their connected properties.',
        'blueprint',
        'legacy-blueprint',
        'MAP',
        { layout: 'canvas', showVisualizer: true },
      ),
    ],
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    purpose: 'Coordinate enclosure, layout, assembly, and clearances.',
    items: [
      item('mechanical-studio', 'Mechanical Studio', 'Create and inspect 2D mechanical layout objects.', 'mechanical', 'mechanical-canvas', '2D'),
      item('assembly-stack', 'Assembly Stack', 'Review layers, materials, thicknesses, and assembly order.', 'assembly', 'mechanical-assembly', 'ASM'),
    ],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    purpose: 'Define parts, connectivity, power, pins, and sourcing.',
    items: [
      item('component-library', 'Component Library', 'Find and inspect component definitions and representations.', 'components', 'component-library', 'LIB'),
      item('schematic-editor', 'Schematic Editor', 'Place symbols and define electrical connectivity.', 'schematic', 'schematic-editor', 'SCH'),
      item('power-tree', 'Power Tree', 'Estimate rail loads, duty cycles, and battery runtime.', 'power', 'power-budget', 'PWR'),
      item('pin-map', 'Pin Map', 'Map product functions to component and controller pins.', 'pin-map', 'pin-map', 'PIN'),
      item('bom', 'Bill of Materials', 'Review parts, quantities, sourcing data, and lifecycle notes.', 'bom', 'bom', 'BOM'),
    ],
  },
  {
    id: 'pcb',
    label: 'PCB',
    purpose: 'Configure boards, place footprints, route nets, and inspect rules.',
    items: [
      item('board-designer', 'Board Designer', 'Place footprints, route nets, and inspect board geometry.', 'board', 'board-designer', 'PCB'),
      item('board-settings', 'Board Settings', 'Manage board definitions, outlines, dimensions, and notes.', 'layers', 'board-studio', 'SET'),
      item('pcb-constraints', 'PCB Rules', 'Define trace, clearance, via, and manufacturing constraints.', 'rules', 'pcb-constraints', 'RULE'),
      item('pcb-drc', 'Design Rule Check', 'Review current board-rule and connectivity findings.', 'drc', 'board-designer', 'DRC'),
    ],
  },
  {
    id: 'firmware',
    label: 'Firmware',
    purpose: 'Coordinate modules, behavior, hardware mappings, and source.',
    items: [
      item('firmware-studio', 'Firmware Modules', 'Define firmware responsibilities, dependencies, and tasks.', 'firmware', 'firmware-modules', 'MOD'),
      item('state-machines', 'State Machines', 'Describe product modes, events, transitions, and actions.', 'state-machine', 'firmware-state-machine', 'STATE'),
      item('hardware-mapping', 'Hardware Mapping', 'Link firmware functions to components, buses, and pins.', 'mapping', 'firmware-hardware-map', 'MAP'),
      item('source-skeleton', 'Source Workspace', 'Inspect the current source-file and generated-code foundation.', 'source', 'firmware-source', 'SRC'),
    ],
  },
  {
    id: 'validation',
    label: 'Validation',
    purpose: 'Plan tests, capture results, and trace requirement coverage.',
    items: [
      item('validation-studio', 'Validation Studio', 'Create test definitions, procedures, measurements, and evidence.', 'validation', 'validation-tests', 'TEST'),
      item('requirement-coverage', 'Requirement Coverage', 'See which requirements have linked validation work.', 'coverage', 'validation-coverage', 'COV'),
      item('factory-qa', 'Factory QA', 'Review production-oriented checks and factory test records.', 'factory-qa', 'validation-factory-qa', 'QA'),
    ],
  },
  {
    id: 'outputs',
    label: 'Outputs',
    purpose: 'Review drawings, exports, versions, and release packages.',
    items: [
      item('blueprint-sheets', 'Blueprint Studio', 'Review generated engineering drawing sheets and annotations.', 'blueprint', 'blueprint-sheets', 'DRAW'),
      item('exports', 'Export Center', 'Download project backups and clearly classified draft outputs.', 'exports', 'exports', 'OUT'),
      item('factory-builder', 'Factory Package', 'Review draft manufacturing files, gaps, and checklist state.', 'factory-package', 'factory-builder', 'MFG'),
      item('revisions', 'Revisions', 'Create and inspect named project snapshots.', 'revisions', 'revisions', 'REV'),
      item('branches', 'Branches', 'Inspect experimental project branches and comparison foundations.', 'branches', 'revisions', 'BR'),
      item('releases', 'Releases', 'Review candidate and release-record foundations and blockers.', 'releases', 'revisions', 'REL'),
    ],
  },
] as const;

/**
 * Compatibility-only IDs that may still exist in templates, imports, or saved local projects.
 * They are deliberately explicit so an unknown ID never falls through to an unrelated canvas.
 */
export const compatibleNavigationItems: readonly NavigationItem[] = [
  item('master', 'System Blueprint', 'Legacy default view used by older local projects.', 'blueprint', 'legacy-blueprint', 'MAP', {
    layout: 'canvas',
    showVisualizer: true,
  }),
  item('dossier', 'System Blueprint', 'Legacy dossier view retained only for safe project loading.', 'blueprint', 'legacy-blueprint', 'MAP', {
    layout: 'canvas',
    showVisualizer: true,
  }),
  item('electronics', 'Product Workspace', 'Legacy product-electronics section retained for safe project loading.', 'product', 'product-studio', 'WORK'),
  item('power-budget', 'Power Tree', 'Legacy power-budget ID retained for safe project loading.', 'power', 'power-budget', 'PWR'),
  item('board-studio', 'Board Settings', 'Legacy board-studio ID retained for safe project loading.', 'layers', 'board-studio', 'SET'),
  item('board-components', 'Board Settings', 'Legacy board-components ID retained for safe project loading.', 'layers', 'board-studio', 'SET'),
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
