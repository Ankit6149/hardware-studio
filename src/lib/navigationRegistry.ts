export type NavigationDomainId =
  | 'overview'
  | 'product'
  | 'electronics'
  | 'mechanical'
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
 * V1 navigation is intentionally small and stable.
 *
 * A destination belongs here only when it represents a primary user job. Supporting
 * tools (power, pin mapping, board setup, DRC, factory QA, drawings, etc.) remain
 * routable for existing projects but live inside their owning workbench instead of
 * becoming competing global destinations.
 */
export const navigationDomains: readonly NavigationDomain[] = [
  {
    id: 'overview',
    label: 'Home',
    purpose: 'Project state, blockers, and the next meaningful engineering action.',
    items: [
      item('dashboard', 'Project Home', 'See project state, blockers, recent progress, and the next meaningful action.', 'dashboard', 'dashboard', 'HOME'),
    ],
  },
  {
    id: 'product',
    label: 'Define',
    purpose: 'Define measurable product intent and the architecture that will satisfy it.',
    items: [
      item('requirements', 'Requirements', 'Define measurable product needs, constraints, and acceptance criteria.', 'requirements', 'product-studio', 'REQ'),
      item('product-architecture', 'Architecture', 'Organize functions, devices, interfaces, and system relationships.', 'architecture', 'product-studio', 'ARCH'),
    ],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    purpose: 'Move one canonical component identity from part choice through schematic, PCB, and BOM.',
    items: [
      item('component-library', 'Components', 'Choose and inspect canonical component definitions before using them in a design.', 'components', 'component-library', 'PART'),
      item('schematic-editor', 'Schematic', 'Place project components and define authoritative electrical connectivity.', 'schematic', 'schematic-editor', 'SCH'),
      item('board-designer', 'PCB', 'Configure the board, place footprints, route nets, inspect layers, and review DRC.', 'board', 'board-designer', 'PCB'),
      item('bom', 'BOM', 'Review sourcing identity, quantities, lifecycle information, and project component linkage.', 'bom', 'bom', 'BOM'),
    ],
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    purpose: 'Define the physical envelope, clearances, assembly intent, and product packaging.',
    items: [
      item('mechanical-studio', 'Design', 'Create and inspect physical layout features, dimensions, and enclosure intent.', 'mechanical', 'mechanical-canvas', '2D'),
      item('assembly-stack', 'Assembly', 'Review layers, materials, thicknesses, fastening, and assembly order.', 'assembly', 'mechanical-assembly', 'ASM'),
    ],
  },
  {
    id: 'firmware',
    label: 'Firmware',
    purpose: 'Connect software behavior and source to the exact hardware it controls.',
    items: [
      item('firmware-studio', 'Behavior', 'Define firmware responsibilities, modules, and product behavior.', 'firmware', 'firmware-modules', 'FW'),
      item('hardware-mapping', 'Hardware Map', 'Link firmware functions to canonical components, buses, and pins.', 'mapping', 'firmware-hardware-map', 'MAP'),
      item('source-skeleton', 'Source', 'Edit project source files and explicitly generated workspace files.', 'source', 'firmware-source', 'SRC'),
    ],
  },
  {
    id: 'validation',
    label: 'Validate',
    purpose: 'Plan tests, capture evidence, and show which requirements are actually verified.',
    items: [
      item('validation-studio', 'Tests & Evidence', 'Create test definitions, procedures, measurements, runs, and evidence.', 'validation', 'validation-tests', 'TEST'),
      item('requirement-coverage', 'Coverage', 'See which requirements have linked validation work and which remain unresolved.', 'coverage', 'validation-coverage', 'COV'),
    ],
  },
  {
    id: 'outputs',
    label: 'Release',
    purpose: 'Review readiness, generate supported outputs, and preserve controlled revisions.',
    items: [
      item('readiness', 'Readiness', 'Review evidence, unresolved findings, and release blockers before handoff.', 'readiness', 'readiness', 'GATE'),
      item('exports', 'Outputs', 'Download project backups and clearly classified supported draft outputs.', 'exports', 'exports', 'OUT'),
      item('revisions', 'Revisions', 'Create snapshots and inspect controlled revision and release records.', 'revisions', 'revisions', 'REV'),
    ],
  },
] as const;

/**
 * Compatibility-only IDs are accepted for old projects, imports, and deep links.
 * They are not normal V1 navigation. Once loaded, new UI should direct the user to
 * the owning primary workbench instead of teaching these as alternate workflows.
 */
export const compatibleNavigationItems: readonly NavigationItem[] = [
  item('product-design', 'Product Design', 'Experimental concept-design workbench retained while repository convergence is completed.', 'product', 'product-studio', 'EXP'),
  item('product-studio', 'Product Design', 'Legacy product overview shortcut retained for safe project loading.', 'product', 'product-studio', 'LEG'),
  item('risks-interfaces', 'Architecture', 'Legacy architecture shortcut retained for safe project loading.', 'risk', 'product-studio', 'LEG'),
  item('blueprint-editor', 'System Blueprint', 'Legacy architecture canvas retained for safe project loading.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('master', 'System Blueprint', 'Legacy default view used by older local projects.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('dossier', 'System Blueprint', 'Legacy dossier view retained only for safe project loading.', 'blueprint', 'legacy-blueprint', 'LEG', { layout: 'canvas', showVisualizer: true }),
  item('electronics', 'Electronics', 'Legacy product-electronics section retained for safe project loading.', 'components', 'component-library', 'LEG'),
  item('power-tree', 'Power', 'Power analysis is now a contextual Electronics tool.', 'power', 'power-budget', 'TOOL'),
  item('power-budget', 'Power', 'Legacy power-budget ID retained for safe project loading.', 'power', 'power-budget', 'LEG'),
  item('pin-map', 'Pin Mapping', 'Pin mapping is now contextual to Electronics and Firmware.', 'pin-map', 'pin-map', 'TOOL'),
  item('board-settings', 'Board Setup', 'Board setup is now part of the PCB workbench.', 'layers', 'board-studio', 'TOOL'),
  item('board-studio', 'Board Setup', 'Legacy board-studio ID retained for safe project loading.', 'layers', 'board-studio', 'LEG'),
  item('board-components', 'Board Setup', 'Legacy board-components ID retained for safe project loading.', 'layers', 'board-studio', 'LEG'),
  item('pcb-constraints', 'PCB Rules', 'PCB rules are now contextual to the PCB workbench.', 'rules', 'pcb-constraints', 'TOOL'),
  item('pcb-drc', 'PCB DRC', 'DRC is now contextual to the PCB workbench.', 'drc', 'board-designer', 'TOOL'),
  item('state-machines', 'State Machines', 'State-machine editing is contextual to the Firmware workbench.', 'state-machine', 'firmware-state-machine', 'TOOL'),
  item('firmware-evidence', 'Build & Device Evidence', 'Build and device evidence is contextual to Firmware and Validation.', 'validation', 'firmware-modules', 'TOOL'),
  item('factory-qa', 'Factory QA', 'Factory QA is contextual to Validation and Release.', 'factory-qa', 'validation-factory-qa', 'TOOL'),
  item('blueprint-sheets', 'Drawing Sheets', 'Drawing sheets are contextual to Release outputs.', 'blueprint', 'blueprint-sheets', 'TOOL'),
  item('factory-builder', 'Factory Package', 'Factory package preparation is contextual to Release.', 'factory-package', 'factory-builder', 'TOOL'),
  item('branches', 'Revisions', 'Legacy branches route retained for safe project loading.', 'branches', 'revisions', 'LEG'),
  item('releases', 'Revisions', 'Legacy releases route retained for safe project loading.', 'releases', 'revisions', 'LEG'),
] as const;

export const visibleNavigationItems: readonly NavigationItem[] = navigationDomains.flatMap((domain) => domain.items);
export const allNavigationItems: readonly NavigationItem[] = [...visibleNavigationItems, ...compatibleNavigationItems];

const navigationItemById = new Map(allNavigationItems.map((navigationItem) => [navigationItem.id, navigationItem]));

export function getNavigationItem(viewId: string): NavigationItem | undefined {
  return navigationItemById.get(viewId);
}

export function getNavigationDomainForView(viewId: string): NavigationDomain | undefined {
  const visibleDomain = navigationDomains.find((domain) => domain.items.some((candidate) => candidate.id === viewId));
  if (visibleDomain) return visibleDomain;

  const navigationItem = getNavigationItem(viewId);
  if (!navigationItem) return undefined;

  if (['component-library', 'schematic-editor', 'power-budget', 'pin-map', 'bom', 'board-designer', 'board-studio', 'pcb-constraints'].includes(navigationItem.surface)) {
    return navigationDomains.find((domain) => domain.id === 'electronics');
  }
  if (navigationItem.surface === 'product-studio' || navigationItem.surface === 'legacy-blueprint') {
    return navigationDomains.find((domain) => domain.id === 'product');
  }
  if (navigationItem.surface === 'validation-factory-qa') {
    return navigationDomains.find((domain) => domain.id === 'validation');
  }
  if (navigationItem.surface === 'blueprint-sheets' || navigationItem.surface === 'factory-builder' || navigationItem.surface === 'revisions') {
    return navigationDomains.find((domain) => domain.id === 'outputs');
  }

  return navigationDomains.find((domain) => domain.items.some((candidate) => candidate.surface === navigationItem.surface));
}

export function isCanvasNavigationItem(navigationItem: NavigationItem | undefined): boolean {
  return navigationItem?.layout === 'canvas';
}
