import { describe, it, expect } from 'vitest';
import { SchematicWire } from '../types';

describe('Structured Schematic Wire Anchor Tests', () => {
  it('should support structured SchematicPinAnchor and SchematicPointAnchor', () => {
    const wire: SchematicWire = {
      id: 'wire_struct_1',
      netId: 'net_i2c_sda',
      netName: 'I2C_SDA',
      points: [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      sourceAnchor: {
        type: 'pin',
        componentId: 'comp_mcu',
        pinNumber: 'P0_1'
      },
      targetAnchor: {
        type: 'pin',
        componentId: 'comp_sensor',
        pinNumber: 'SDA'
      },
      status: 'Connected'
    };

    expect(wire.sourceAnchor?.type).toBe('pin');
    if (wire.sourceAnchor?.type === 'pin') {
      expect(wire.sourceAnchor.componentId).toBe('comp_mcu');
      expect(wire.sourceAnchor.pinNumber).toBe('P0_1');
    }

    expect(wire.targetAnchor?.type).toBe('pin');
    if (wire.targetAnchor?.type === 'pin') {
      expect(wire.targetAnchor.componentId).toBe('comp_sensor');
      expect(wire.targetAnchor.pinNumber).toBe('SDA');
    }
  });
});
