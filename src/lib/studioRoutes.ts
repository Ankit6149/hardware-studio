export const STUDIO_ROOT_PATH = '/studio';

const canonicalPathByViewId: Readonly<Record<string, string>> = {
  dashboard: '/studio',
  requirements: '/studio/requirements',
  'product-architecture': '/studio/architecture',
  'component-library': '/studio/components',
  'schematic-editor': '/studio/schematic',
  'power-budget': '/studio/schematic/power',
  'pin-map': '/studio/schematic/pins',
  'board-designer': '/studio/pcb',
  'board-settings': '/studio/pcb/setup',
  'pcb-constraints': '/studio/pcb/rules',
  'pcb-drc': '/studio/pcb/drc',
  bom: '/studio/pcb/bom',
  'mechanical-studio': '/studio/mechanical',
  'assembly-stack': '/studio/mechanical/assembly',
  'firmware-studio': '/studio/firmware',
  'state-machines': '/studio/firmware/state-machine',
  'hardware-mapping': '/studio/firmware/hardware-map',
  'source-skeleton': '/studio/firmware/source',
  'firmware-evidence': '/studio/firmware/evidence',
  'validation-studio': '/studio/validate',
  'requirement-coverage': '/studio/validate/coverage',
  'factory-qa': '/studio/validate/factory-qa',
  readiness: '/studio/release',
  exports: '/studio/release/outputs',
  revisions: '/studio/release/revisions',
  'blueprint-sheets': '/studio/release/drawings',
  'factory-builder': '/studio/release/factory-package',
};

const canonicalViewIdByPath = new Map(
  Object.entries(canonicalPathByViewId).map(([viewId, path]) => [path, viewId]),
);

const legacyViewAlias: Readonly<Record<string, string>> = {
  'product-design': 'product-architecture',
  'product-studio': 'product-architecture',
  'risks-interfaces': 'product-architecture',
  'blueprint-editor': 'product-architecture',
  master: 'product-architecture',
  dossier: 'product-architecture',
  electronics: 'component-library',
  'power-tree': 'power-budget',
  'board-studio': 'board-settings',
  'board-components': 'board-settings',
  branches: 'revisions',
  releases: 'revisions',
};

const shortHashAlias: Readonly<Record<string, string>> = {
  home: 'dashboard',
  architecture: 'product-architecture',
  components: 'component-library',
  schematic: 'schematic-editor',
  pcb: 'board-designer',
  mechanical: 'mechanical-studio',
  firmware: 'firmware-studio',
  validate: 'validation-studio',
  validation: 'validation-studio',
  release: 'readiness',
  power: 'power-budget',
  pins: 'pin-map',
  'board-setup': 'board-settings',
  rules: 'pcb-constraints',
  drc: 'pcb-drc',
  'state-machine': 'state-machines',
  'hardware-map': 'hardware-mapping',
  source: 'source-skeleton',
  evidence: 'firmware-evidence',
  coverage: 'requirement-coverage',
  outputs: 'exports',
  drawings: 'blueprint-sheets',
  'factory-package': 'factory-builder',
};

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] || STUDIO_ROOT_PATH;
  if (withoutQuery === '/') return '/';
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery;
}

export function canonicalizeStudioViewId(viewId: string): string {
  return legacyViewAlias[viewId] || viewId;
}

export function getStudioPathForView(viewId: string): string | undefined {
  return canonicalPathByViewId[canonicalizeStudioViewId(viewId)];
}

export function getStudioViewForPath(pathname: string): string | undefined {
  return canonicalViewIdByPath.get(normalizePathname(pathname));
}

export function getStudioViewForLegacyHash(hash: string): string | undefined {
  const raw = decodeURIComponent(hash.replace(/^#/, '').trim()).replace(/^\/+/, '');
  if (!raw) return undefined;
  const candidate = shortHashAlias[raw] || legacyViewAlias[raw] || raw;
  return getStudioPathForView(candidate) ? canonicalizeStudioViewId(candidate) : undefined;
}

export function isStudioPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === STUDIO_ROOT_PATH || normalized.startsWith(`${STUDIO_ROOT_PATH}/`);
}
