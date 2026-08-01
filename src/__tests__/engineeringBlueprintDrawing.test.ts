import { describe, expect, it } from 'vitest';
import { createEngineeringLayout } from '../components/blueprints/BlueprintDrawingRenderer';
import type { BlueprintDrawing } from '../lib/blueprintSheetTypes';

describe('engineering blueprint drawing layout', () => {
  it('turns a fixed card grid into a graph-aware architecture drawing', () => {
    const drawing: BlueprintDrawing = {
      viewBox: '0 0 800 500',
      grid: true,
      objects: [
        { id: 'input', type: 'block', label: 'Touch Input', x: 50, y: 50, width: 160, height: 80, sourceType: 'node', metadata: { category: 'Input' } },
        { id: 'power', type: 'block', label: 'Battery Power', x: 230, y: 50, width: 160, height: 80, sourceType: 'node', metadata: { category: 'Power' } },
        { id: 'controller', type: 'block', label: 'MCU Firmware', x: 410, y: 50, width: 160, height: 80, sourceType: 'node', metadata: { category: 'Firmware' } },
        { id: 'app', type: 'block', label: 'Companion App', x: 590, y: 50, width: 160, height: 80, sourceType: 'node', metadata: { category: 'External Software' } },
      ],
      connections: [
        { id: 'input-controller', sourceId: 'input', targetId: 'controller', type: 'signal' },
        { id: 'power-controller', sourceId: 'power', targetId: 'controller', type: 'power' },
        { id: 'controller-app', sourceId: 'controller', targetId: 'app', type: 'firmware' },
      ],
      dimensions: [],
      callouts: [],
    };

    const result = createEngineeringLayout(drawing);
    const input = result.objects.find(object => object.id === 'input');
    const power = result.objects.find(object => object.id === 'power');
    const controller = result.objects.find(object => object.id === 'controller');
    const app = result.objects.find(object => object.id === 'app');

    expect(result.viewBox).not.toBe('0 0 800 500');
    expect(input?.x).toBe(power?.x);
    expect(controller?.x).toBeGreaterThan(input?.x || 0);
    expect(app?.x).toBeGreaterThan(controller?.x || 0);
    expect(new Set(result.objects.map(object => `${object.x}:${object.y}`)).size).toBe(4);
  });

  it('preserves drawings that are not architecture graphs', () => {
    const drawing: BlueprintDrawing = {
      viewBox: '0 0 800 500',
      grid: true,
      objects: [{ id: 'board', type: 'board', label: 'Main PCB', x: 100, y: 100, width: 300, height: 180 }],
      connections: [],
      dimensions: [],
      callouts: [],
    };

    expect(createEngineeringLayout(drawing)).toBe(drawing);
  });
});
