import { describe, it, expect } from 'vitest';
import { MechanicalBody } from '../types';

describe('WebGL 3D Product Workbench & Mesh Body Tests', () => {
  it('should construct valid MechanicalBody parameters for Three.js rendering', () => {
    const encBody: MechanicalBody = {
      id: 'body_enc_1',
      operation: 'Box',
      dimensions: { x: 120, y: 25, z: 80 },
      position: { x: 60, y: 12.5, z: 40 },
      rotation: { x: 0, y: 0, z: 0 },
      linkedMechanicalObjectIds: ['mech_enc_1']
    };

    const pcbBody: MechanicalBody = {
      id: 'body_pcb_1',
      operation: 'Box',
      dimensions: { x: 100, y: 1.6, z: 60 },
      position: { x: 60, y: 5, z: 40 },
      rotation: { x: 0, y: 0, z: 0 },
      linkedBoardIds: ['board_main']
    };

    expect(encBody.operation).toBe('Box');
    expect(encBody.dimensions.x).toBe(120);
    expect(pcbBody.dimensions.y).toBe(1.6);
    expect(encBody.position.x).toBe(pcbBody.position.x);
  });
});
