export const ENTITY_TYPES = [
  'project',
  'workspace',
  'version',
  'release-candidate',
  'release',
  'requirement',
  'architecture-node',
  'interface',
  'risk',
  'decision',
  'component-definition',
  'component',
  'board',
  'net',
  'schematic-symbol',
  'footprint',
  'pad',
  'trace',
  'via',
  'mechanical-part',
  'mechanical-assembly',
  'firmware-module',
  'firmware-file',
  'validation-test',
  'validation-run',
  'evidence',
  'artifact',
  'relation',
  'command',
  'event',
  'proposal',
  'approval',
  'job',
  'representation',
  'adoption-session',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

declare const entityIdBrand: unique symbol;

export type EntityId<T extends EntityType = EntityType> = string & {
  readonly [entityIdBrand]: T;
};

const ENTITY_TYPE_SET = new Set<string>(ENTITY_TYPES);
const ENTITY_ID_PATTERN = /^hs_([a-z][a-z0-9-]*)_([0-9a-f]{32})$/;

export interface ParsedEntityId<T extends EntityType = EntityType> {
  type: T;
  value: EntityId<T>;
  payload: string;
}

function requireCryptoRandomUuid(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid !== 'function') {
    throw new Error('Secure random UUID generation is unavailable in this runtime');
  }
  return randomUuid.call(globalThis.crypto).replace(/-/g, '').toLowerCase();
}

export function createEntityId<T extends EntityType>(type: T): EntityId<T> {
  return `hs_${type}_${requireCryptoRandomUuid()}` as EntityId<T>;
}

export function parseEntityId(value: string): ParsedEntityId | undefined {
  const match = ENTITY_ID_PATTERN.exec(value);
  if (!match) return undefined;

  const [, rawType, payload] = match;
  if (!ENTITY_TYPE_SET.has(rawType)) return undefined;

  const type = rawType as EntityType;
  return {
    type,
    value: value as EntityId,
    payload,
  };
}

export function isEntityId<T extends EntityType>(
  value: unknown,
  expectedType?: T,
): value is EntityId<T> {
  if (typeof value !== 'string') return false;
  const parsed = parseEntityId(value);
  if (!parsed) return false;
  return expectedType === undefined || parsed.type === expectedType;
}

export function asEntityId<T extends EntityType>(
  value: string,
  expectedType: T,
): EntityId<T> {
  if (!isEntityId(value, expectedType)) {
    throw new Error(`Invalid Hardware Studio ${expectedType} id: ${value}`);
  }
  return value;
}

export async function deriveEntityId<T extends EntityType>(
  type: T,
  namespace: string,
  stableKey: string,
): Promise<EntityId<T>> {
  const normalizedNamespace = namespace.trim();
  const normalizedStableKey = stableKey.trim();

  if (!normalizedNamespace || !normalizedStableKey) {
    throw new Error('Deterministic entity IDs require non-empty namespace and stable key');
  }

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('SHA-256 is unavailable in this runtime');
  }

  const input = new TextEncoder().encode(
    `hardware-studio:v1:${type}:${normalizedNamespace}:${normalizedStableKey}`,
  );
  const digest = await subtle.digest('SHA-256', input);
  const payload = Array.from(new Uint8Array(digest).slice(0, 16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `hs_${type}_${payload}` as EntityId<T>;
}
