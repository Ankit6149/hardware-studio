import { describe, it, expect } from 'vitest';
import { getSymbolPinLayouts } from '../components/schematic/schematicGeometry';
import { BoardComponent, Project } from '../types';

describe('Pin-Anchored Schematic Wire Engine Tests', () => {
  it('should compute dynamic pin layout positions for moving component symbols', () => {
    const comp: BoardComponent = {
      id: 'cmp_mcu_1',
      boardId: 'b1',
      circuitBlockId: 'cb1',
      referenceDesignator: 'U1',
      componentName: 'MCU',
      componentType: 'MCU',
      value: 'STM32',
      packageName: 'QFN-32',
      footprint: 'QFN-32',
      partNumber: 'STM32F4',
      quantity: 1,
      side: 'Top',
      placementCriticality: 'High',
      notes: '',
      pins: [
        { id: 'p1', componentId: 'cmp_mcu_1', pinNumber: '1', pinName: 'PA0', electricalType: 'Input' },
        { id: 'p2', componentId: 'cmp_mcu_1', pinNumber: '2', pinName: 'PA1', electricalType: 'Output' },
      ],
      schematic: { placed: true, x: 100, y: 100 }
    };

    const initialLayouts = getSymbolPinLayouts(comp, 100, 100);
    expect(initialLayouts.length).toBeGreaterThan(0);

    const pin1Initial = initialLayouts.find(p => p.number === '1');
    expect(pin1Initial).toBeDefined();

    // Move symbol to x=300, y=200
    const movedLayouts = getSymbolPinLayouts(comp, 300, 200);
    const pin1Moved = movedLayouts.find(p => p.number === '1');

    // Delta must match movement delta (+200 x, +100 y)
    expect(pin1Moved!.x - pin1Initial!.x).toBe(200);
    expect(pin1Moved!.y - pin1Initial!.y).toBe(100);
  });
});
