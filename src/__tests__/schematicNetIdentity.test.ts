import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  generatedSchematicNetName,
  resolveSchematicNetIdentity,
  type SchematicNetEndpoint,
} from '../lib/schematic/schematicNetIdentity';

function endpoint(overrides: Partial<SchematicNetEndpoint> = {}): SchematicNetEndpoint {
  return {
    componentId: 'component-u1',
    referenceDesignator: 'U1',
    pinNumber: '1',
    assignedNetName: null,
    ...overrides,
  };
}

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('schematic net identity resolution', () => {
  it('extends an existing canonical net when only one endpoint is assigned', () => {
    const result = resolveSchematicNetIdentity(
      endpoint({ assignedNetName: 'I2C_SDA' }),
      endpoint({ componentId: 'component-r1', referenceDesignator: 'R1', pinNumber: '2' }),
    );

    expect(result).toEqual({ ok: true, netName: 'I2C_SDA', source: 'existing' });
  });

  it('keeps the same existing net when both endpoint assignments agree', () => {
    const result = resolveSchematicNetIdentity(
      endpoint({ assignedNetName: 'VBAT' }),
      endpoint({ componentId: 'component-c1', referenceDesignator: 'C1', pinNumber: '1', assignedNetName: 'VBAT' }),
    );

    expect(result).toEqual({ ok: true, netName: 'VBAT', source: 'existing' });
  });

  it('rejects a connection between endpoints already assigned to different nets', () => {
    const result = resolveSchematicNetIdentity(
      endpoint({ assignedNetName: '3V3' }),
      endpoint({ componentId: 'component-u2', referenceDesignator: 'U2', pinNumber: '4', assignedNetName: 'GND' }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.sourceNetName).toBe('3V3');
      expect(result.targetNetName).toBe('GND');
      expect(result.error).toContain('already belong to different nets');
    }
  });

  it('generates a neutral deterministic net name when neither endpoint has a net', () => {
    const sourceEndpoint = endpoint({ componentId: 'component-u1', referenceDesignator: 'U1', pinNumber: '7' });
    const targetEndpoint = endpoint({ componentId: 'component-r2', referenceDesignator: 'R2', pinNumber: '2' });

    const forward = generatedSchematicNetName(sourceEndpoint, targetEndpoint);
    const reverse = generatedSchematicNetName(targetEndpoint, sourceEndpoint);
    expect(forward).toBe(reverse);
    expect(forward).toMatch(/^NET_/);
    expect(resolveSchematicNetIdentity(sourceEndpoint, targetEndpoint)).toEqual({
      ok: true,
      netName: forward,
      source: 'generated',
    });
  });

  it('does not use displayed pin labels or power-name heuristics as net identity', () => {
    const canvas = source('../components/schematic/SchematicCanvas.tsx');

    expect(canvas).toContain('resolveSchematicNetIdentity');
    expect(canvas).toContain('assignedNetName: sourcePinRecord.netName');
    expect(canvas).toContain('assignedNetName: targetPinRecord.netName');
    expect(canvas).toContain('onPinClick={(e, pinNum) => handlePinClick(e, c.id, pinNum)}');
    expect(canvas).not.toContain('defaultNet');
    expect(canvas).not.toContain('pinLabel) => handlePinClick');
    expect(canvas).not.toContain("upName(sourcePinName) === 'GND'");
    expect(canvas).not.toContain("netName = '3V3'");
    expect(canvas).toContain('comp.schematic?.x ?? 150');
    expect(canvas).not.toContain('comp.schematic?.x || 150');
  });
});
