// schematicGeometry.ts — Schematic coordinate and snapping helpers
import { BoardComponent } from '../../types';

export function snapToGrid(coord: number, step: number = 10): number {
  return Math.round(coord / step) * step;
}

export interface SymbolPinLayout {
  x: number;
  y: number;
  label: string;
  number: string;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export function getSymbolPinLayouts(
  comp: BoardComponent,
  symbolX: number,
  symbolY: number
): SymbolPinLayout[] {
  const pins = comp.pins || [];
  const len = pins.length;
  const type = comp.componentType.toLowerCase();

  // Basic passive: 2 pins
  if (type === 'resistor' || type === 'capacitor' || type === 'inductor' || type === 'diode' || type === 'led' || type === 'switch' || type === 'button') {
    const p1 = pins[0] || { pinNumber: '1', pinName: '1' };
    const p2 = pins[1] || { pinNumber: '2', pinName: '2' };
    
    // Rotate coordinates based on component schematic rotation
    const rotation = comp.schematic?.rotation || 0;
    const rad = (rotation * Math.PI) / 180;
    
    const rotate = (x: number, y: number) => {
      const rx = symbolX + x * Math.cos(rad) - y * Math.sin(rad);
      const ry = symbolY + x * Math.sin(rad) + y * Math.cos(rad);
      return { x: rx, y: ry };
    };

    const pt1 = rotate(-30, 0);
    const pt2 = rotate(30, 0);

    return [
      { x: pt1.x, y: pt1.y, label: p1.pinName, number: p1.pinNumber, side: 'left' },
      { x: pt2.x, y: pt2.y, label: p2.pinName, number: p2.pinNumber, side: 'right' }
    ];
  }

  if (type === 'transistor' || type === 'mosfet') {
    const p1 = pins[0] || { pinNumber: '1', pinName: 'G' };
    const p2 = pins[1] || { pinNumber: '2', pinName: 'D' };
    const p3 = pins[2] || { pinNumber: '3', pinName: 'S' };

    const rotation = comp.schematic?.rotation || 0;
    const rad = (rotation * Math.PI) / 180;
    const rotate = (x: number, y: number) => {
      const rx = symbolX + x * Math.cos(rad) - y * Math.sin(rad);
      const ry = symbolY + x * Math.sin(rad) + y * Math.cos(rad);
      return { x: rx, y: ry };
    };

    const pt1 = rotate(-20, 0);
    const pt2 = rotate(20, -20);
    const pt3 = rotate(20, 20);

    return [
      { x: pt1.x, y: pt1.y, label: p1.pinName, number: p1.pinNumber, side: 'left' },
      { x: pt2.x, y: pt2.y, label: p2.pinName, number: p2.pinNumber, side: 'right' },
      { x: pt3.x, y: pt3.y, label: p3.pinName, number: p3.pinNumber, side: 'right' }
    ];
  }

  if (type === 'ground') {
    const p1 = pins[0] || { pinNumber: '1', pinName: 'GND' };
    const rotation = comp.schematic?.rotation || 0;
    const rad = (rotation * Math.PI) / 180;
    const rotate = (x: number, y: number) => {
      const rx = symbolX + x * Math.cos(rad) - y * Math.sin(rad);
      const ry = symbolY + x * Math.sin(rad) + y * Math.cos(rad);
      return { x: rx, y: ry };
    };
    const pt1 = rotate(0, -20);
    return [
      { x: pt1.x, y: pt1.y, label: p1.pinName, number: p1.pinNumber, side: 'left' }
    ];
  }

  if (type === 'power' || type === 'vcc') {
    const p1 = pins[0] || { pinNumber: '1', pinName: 'VCC' };
    const rotation = comp.schematic?.rotation || 0;
    const rad = (rotation * Math.PI) / 180;
    const rotate = (x: number, y: number) => {
      const rx = symbolX + x * Math.cos(rad) - y * Math.sin(rad);
      const ry = symbolY + x * Math.sin(rad) + y * Math.cos(rad);
      return { x: rx, y: ry };
    };
    const pt1 = rotate(0, 20);
    return [
      { x: pt1.x, y: pt1.y, label: p1.pinName, number: p1.pinNumber, side: 'right' }
    ];
  }

  // Multi-pin ICs, MCUs, regulators, Custom parts
  const half = Math.ceil(len / 2);
  const layouts: SymbolPinLayout[] = [];
  const rotation = comp.schematic?.rotation || 0;
  const rad = (rotation * Math.PI) / 180;
  const rotate = (x: number, y: number) => {
    const rx = symbolX + x * Math.cos(rad) - y * Math.sin(rad);
    const ry = symbolY + x * Math.sin(rad) + y * Math.cos(rad);
    return { x: rx, y: ry };
  };

  // Left side pins
  for (let i = 0; i < half; i++) {
    const pin = pins[i] || { pinNumber: String(i + 1), pinName: `P${i + 1}` };
    const pt = rotate(-40, -30 + i * 20);
    layouts.push({
      x: pt.x,
      y: pt.y,
      label: pin.pinName,
      number: pin.pinNumber,
      side: 'left'
    });
  }
  
  // Right side pins
  for (let i = half; i < len; i++) {
    const pin = pins[i] || { pinNumber: String(i + 1), pinName: `P${i + 1}` };
    const pt = rotate(40, -30 + (i - half) * 20);
    layouts.push({
      x: pt.x,
      y: pt.y,
      label: pin.pinName,
      number: pin.pinNumber,
      side: 'right'
    });
  }

  return layouts;
}

export function getPinPosition(
  comp: BoardComponent,
  pinNum: string,
  symbolX: number,
  symbolY: number
): { x: number; y: number } {
  const layouts = getSymbolPinLayouts(comp, symbolX, symbolY);
  const match = layouts.find(l => l.number === pinNum);
  return match ? { x: match.x, y: match.y } : { x: symbolX, y: symbolY };
}
