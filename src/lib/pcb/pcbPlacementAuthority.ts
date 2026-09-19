import type { BoardComponent } from '../../types';

export type PcbPlacement = NonNullable<BoardComponent['pcb']>;
export type PcbPlacementPatch = Partial<PcbPlacement>;

export interface ResolvedPcbPlacement {
  source: 'canonical' | 'legacy';
  placed: boolean;
  xMm?: number;
  yMm?: number;
  rotationDeg: number;
  side: 'Top' | 'Bottom';
  locked: boolean;
  placementStatus: NonNullable<PcbPlacement['placementStatus']>;
}

const LEGACY_PLACEMENT_KEYS = [
  'placementX',
  'placementY',
  'rotationDeg',
  'side',
  'lockedPlacement',
  'placementStatus',
] as const;

function finiteOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function hasOwn<K extends PropertyKey>(
  value: object,
  key: K,
): value is object & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function normalizeSide(value: unknown): 'Top' | 'Bottom' {
  return value === 'Bottom' ? 'Bottom' : 'Top';
}

function normalizeStatus(
  value: unknown,
  hasCoordinates: boolean,
): PcbPlacement['placementStatus'] {
  switch (value) {
    case 'Unplaced':
    case 'Placed':
    case 'Locked':
    case 'Needs Review':
    case 'Outside Board':
    case 'Missing Footprint':
    case 'Verified':
      return value;
    default:
      return hasCoordinates ? 'Placed' : 'Unplaced';
  }
}

/**
 * Resolve PCB placement for production reads.
 *
 * Once a component has nested `pcb` state, that state is authoritative and
 * stale flat compatibility fields are ignored. Flat fields are read only for
 * historical objects that have not yet been normalized by project migration.
 */
export function resolvePcbPlacement(component: BoardComponent): ResolvedPcbPlacement {
  if (component.pcb) {
    const xMm = finiteOrUndefined(component.pcb.xMm);
    const yMm = finiteOrUndefined(component.pcb.yMm);
    const hasCoordinates = xMm !== undefined && yMm !== undefined;
    const placementStatus = normalizeStatus(component.pcb.placementStatus, hasCoordinates);
    const requestedPlaced = component.pcb.placed === true;

    return {
      source: 'canonical',
      placed: requestedPlaced && hasCoordinates && placementStatus !== 'Unplaced',
      xMm,
      yMm,
      rotationDeg: finiteOrUndefined(component.pcb.rotationDeg) ?? 0,
      side: normalizeSide(component.pcb.side),
      locked: component.pcb.locked === true,
      placementStatus,
    };
  }

  const xMm = finiteOrUndefined(component.placementX);
  const yMm = finiteOrUndefined(component.placementY);
  const hasCoordinates = xMm !== undefined && yMm !== undefined;
  const placementStatus = normalizeStatus(component.placementStatus, hasCoordinates);

  return {
    source: 'legacy',
    placed: hasCoordinates && placementStatus !== 'Unplaced',
    xMm,
    yMm,
    rotationDeg: finiteOrUndefined(component.rotationDeg) ?? 0,
    side: normalizeSide(component.side),
    locked: component.lockedPlacement === true,
    placementStatus,
  };
}

/**
 * Apply a production PCB placement change.
 *
 * Nested `pcb` state is the authority. Flat placement fields are emitted only
 * as a one-way compatibility projection for legacy readers that have not yet
 * migrated. Production code must never derive nested PCB state from those flat
 * fields; that direction is reserved for import/migration.
 */
export function applyCanonicalPcbPlacement(
  component: BoardComponent,
  patch: PcbPlacementPatch,
): BoardComponent {
  const current = resolvePcbPlacement(component);

  const xMm = hasOwn(patch, 'xMm')
    ? finiteOrUndefined(patch.xMm)
    : current.xMm;
  const yMm = hasOwn(patch, 'yMm')
    ? finiteOrUndefined(patch.yMm)
    : current.yMm;
  const hasCoordinates = xMm !== undefined && yMm !== undefined;

  const coordinatesTouched = hasOwn(patch, 'xMm') || hasOwn(patch, 'yMm');
  let placementStatus = hasOwn(patch, 'placementStatus')
    ? normalizeStatus(patch.placementStatus, hasCoordinates)
    : current.placementStatus;

  if (
    !hasCoordinates
    && ['Placed', 'Locked', 'Outside Board', 'Verified'].includes(placementStatus)
  ) {
    placementStatus = 'Unplaced';
  } else if (!hasCoordinates && coordinatesTouched && !hasOwn(patch, 'placementStatus')) {
    placementStatus = 'Unplaced';
  } else if (
    hasCoordinates
    && coordinatesTouched
    && !hasOwn(patch, 'placementStatus')
    && current.placementStatus === 'Unplaced'
  ) {
    placementStatus = 'Needs Review';
  }

  const requestedPlaced = hasOwn(patch, 'placed')
    ? patch.placed === true
    : coordinatesTouched
      ? hasCoordinates && placementStatus !== 'Unplaced'
      : hasOwn(patch, 'placementStatus')
        ? placementStatus !== 'Unplaced'
        : current.placed;

  const rotationDeg = hasOwn(patch, 'rotationDeg')
    ? finiteOrUndefined(patch.rotationDeg) ?? 0
    : current.rotationDeg;
  const side = hasOwn(patch, 'side')
    ? normalizeSide(patch.side)
    : current.side;
  const locked = hasOwn(patch, 'locked')
    ? patch.locked === true
    : current.locked;

  const pcb: PcbPlacement = {
    placed: requestedPlaced && hasCoordinates && placementStatus !== 'Unplaced',
    xMm,
    yMm,
    rotationDeg,
    side,
    locked,
    placementStatus,
  };

  return {
    ...component,
    pcb,
    // Compatibility projection only. These fields are migration-only and must
    // not be accepted as production placement authority.
    placementX: pcb.xMm,
    placementY: pcb.yMm,
    rotationDeg: pcb.rotationDeg,
    side: pcb.side,
    lockedPlacement: pcb.locked,
    placementStatus: pcb.placementStatus,
  };
}

export function stripLegacyPcbPlacementPatch(
  patch: Partial<BoardComponent>,
): Partial<BoardComponent> {
  const clean = { ...patch };
  for (const key of LEGACY_PLACEMENT_KEYS) {
    delete clean[key];
  }
  return clean;
}

export function hasLegacyPcbPlacementPatch(
  patch: Partial<BoardComponent>,
): boolean {
  return LEGACY_PLACEMENT_KEYS.some((key) => hasOwn(patch, key));
}
