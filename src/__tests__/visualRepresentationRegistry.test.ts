import { describe, expect, it } from 'vitest';
import {
  getVisualFamily,
  portHandleId,
  portKindFromHandleId,
  REPRESENTATION_KINDS,
  representationStatusCounts,
  resolveVisualFamilyId,
  visualFamilyRegistry,
} from '../lib/visual/representationRegistry';

describe('visual representation registry', () => {
  it('ships unique visual families with every representation contract', () => {
    expect(visualFamilyRegistry.length).toBeGreaterThanOrEqual(20);
    const ids = visualFamilyRegistry.map((family) => family.id);
    expect(new Set(ids).size).toBe(ids.length);

    visualFamilyRegistry.forEach((family) => {
      expect(family.label.trim(), family.id).not.toBe('');
      expect(family.description.trim(), family.id).not.toBe('');
      expect(family.ports.length, family.id).toBeGreaterThan(0);
      expect(new Set(family.ports.map((port) => port.id)).size, family.id).toBe(family.ports.length);

      REPRESENTATION_KINDS.forEach((kind) => {
        const representation = family.representations[kind];
        expect(representation.kind).toBe(kind);
        expect(representation.label.trim(), `${family.id}:${kind}`).not.toBe('');
        expect(representation.description.trim(), `${family.id}:${kind}`).not.toBe('');
        expect(representation.source.trim(), `${family.id}:${kind}`).not.toBe('');
        expect(representation.license.trim(), `${family.id}:${kind}`).not.toBe('');
        expect(representation.qualification.trim(), `${family.id}:${kind}`).not.toBe('');
      });

      const counts = representationStatusCounts(family);
      expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(REPRESENTATION_KINDS.length);
    });
  });

  it('maps the bounded starter families and non-physical concepts deterministically', () => {
    const fixtures = [
      ['4.7k pull-up resistor', 'Electronics', 'resistor'],
      ['100nF decoupling capacitor', 'Electronics', 'capacitor'],
      ['RGB LED Indicator', 'Interaction', 'led'],
      ['Push Button Input', 'Interaction', 'push-button'],
      ['BLE MCU / Controller', 'Electronics', 'microcontroller'],
      ['IMU Sensor', 'Electronics', 'sensor'],
      ['3.3V LDO Regulator', 'Power', 'voltage-regulator'],
      ['Curved LiPo Battery', 'Power', 'battery'],
      ['USB Type-C Receptacle', 'Electronics', 'usb-c'],
      ['Haptic Feedback Motor', 'Interaction', 'motor-actuator'],
      ['OLED Display Panel', 'Interaction', 'display'],
      ['SWD Programming Header', 'Electronics', 'debug-connector'],
      ['ESD Protection Array', 'Electronics', 'protection-device'],
      ['Outer Casing', 'Mechanical', 'enclosure'],
      ['Main PCB Assembly', 'Electronics', 'pcb-assembly'],
      ['Sleep State', 'Firmware', 'firmware-state'],
      ['Mobile App Service', 'Software', 'software-service'],
      ['Factory QA Test', 'Testing', 'validation'],
      ['Hardware Product Container', 'Product', 'product-system'],
    ] as const;

    fixtures.forEach(([name, category, expected]) => {
      expect(resolveVisualFamilyId({ name, category }), name).toBe(expected);
    });
  });

  it('uses a safe generic semantic fallback instead of inventing a physical asset', () => {
    const familyId = resolveVisualFamilyId({ name: 'Unknown experimental idea', category: 'Other' });
    expect(familyId).toBe('generic-function');

    const family = getVisualFamily(familyId);
    expect(family.representations.schematic.status).toBe('unavailable');
    expect(family.representations.footprint.status).toBe('unresolved');
    expect(family.representations.exact3d.status).toBe('unavailable');
  });

  it('keeps exact CAD unresolved for physical starter families while providing a separate preview', () => {
    const physicalFamilies = [
      'microcontroller',
      'battery',
      'usb-c',
      'motor-actuator',
      'display',
      'enclosure',
      'pcb-assembly',
    ] as const;

    physicalFamilies.forEach((familyId) => {
      const family = getVisualFamily(familyId);
      expect(family.representations.render3d.status, familyId).toBe('provisional');
      expect(family.representations.render3d.trust, familyId).toBe('preview');
      expect(family.representations.exact3d.status, familyId).toBe('unresolved');
      expect(family.representations.exact3d.trust, familyId).toBe('authoritative');
    });
  });

  it('does not ship unlicensed photos as available assets', () => {
    visualFamilyRegistry.forEach((family) => {
      expect(family.representations.photo.status, family.id).toBe('unavailable');
      expect(family.representations.photo.description.toLowerCase()).toMatch(/license|rights|manufacturer|random web/);
    });
  });

  it('encodes and decodes typed architecture ports for connections', () => {
    const family = getVisualFamily('microcontroller');
    family.ports.forEach((port) => {
      const handleId = portHandleId(port);
      expect(handleId).toContain(port.id);
      expect(portKindFromHandleId(handleId)).toBe(port.kind);
    });

    expect(portKindFromHandleId('legacy-handle')).toBeUndefined();
    expect(portKindFromHandleId(null)).toBeUndefined();
  });
});
