export interface SchematicNetEndpoint {
  componentId: string;
  referenceDesignator: string;
  pinNumber: string;
  assignedNetName?: string | null;
}

export type SchematicNetResolution =
  | {
      ok: true;
      netName: string;
      source: 'existing' | 'generated';
    }
  | {
      ok: false;
      error: string;
      sourceNetName: string;
      targetNetName: string;
    };

function normalizedNetName(value?: string | null): string {
  return value?.trim() || '';
}

function safeToken(value: string): string {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return normalized || 'X';
}

export function generatedSchematicNetName(
  source: SchematicNetEndpoint,
  target: SchematicNetEndpoint,
): string {
  const endpoints = [source, target].sort((left, right) => (
    `${left.componentId}:${left.pinNumber}`.localeCompare(`${right.componentId}:${right.pinNumber}`)
  ));
  return `NET_${safeToken(endpoints[0].referenceDesignator)}_${safeToken(endpoints[0].pinNumber)}_${safeToken(endpoints[1].referenceDesignator)}_${safeToken(endpoints[1].pinNumber)}`;
}

export function resolveSchematicNetIdentity(
  source: SchematicNetEndpoint,
  target: SchematicNetEndpoint,
): SchematicNetResolution {
  const sourceNetName = normalizedNetName(source.assignedNetName);
  const targetNetName = normalizedNetName(target.assignedNetName);

  if (sourceNetName && targetNetName) {
    if (sourceNetName !== targetNetName) {
      return {
        ok: false,
        error: `Cannot connect ${source.referenceDesignator}.${source.pinNumber} (${sourceNetName}) to ${target.referenceDesignator}.${target.pinNumber} (${targetNetName}) because the pins already belong to different nets.`,
        sourceNetName,
        targetNetName,
      };
    }
    return { ok: true, netName: sourceNetName, source: 'existing' };
  }

  if (sourceNetName || targetNetName) {
    return { ok: true, netName: sourceNetName || targetNetName, source: 'existing' };
  }

  return {
    ok: true,
    netName: generatedSchematicNetName(source, target),
    source: 'generated',
  };
}
