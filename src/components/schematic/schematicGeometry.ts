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
  const layouts: SymbolPinLayout[] = [];
  const len = pins.length;

  // Simple box symbol layout logic
  // Resistors/Capacitors: left pin & right pin
  if (comp.componentType.toUpperCase() === 'RESISTOR' || comp.componentType.toUpperCase() === 'CAPACITOR' || comp.componentType.toUpperCase() === 'DIODE' || comp.componentType.toUpperCase() === 'LED') {
    layouts.push({ x: symbolX - 30, y: symbolY, label: '1', number: '1', side: 'left' });
    layouts.push({ x: symbolX + 30, y: symbolY, label: '2', number: '2', side: 'right' });
    return layouts;
  }

  // Generic MCU / IC: Left side pins, Right side pins
  const half = Math.ceil(len / 2);
  for (let i = 0; i < len; i++) {
    const pin = pins[i];
    const isLeftSide = i < half;
    const offsetIdx = isLeftSide ? i : i - half;
    const pinX = isLeftSide ? symbolX - 40 : symbolX + 40;
    const pinY = symbolY - 30 + offsetIdx * 20;
    layouts.push({
      x: pinX,
      y: pinY,
      label: pin.pinName,
      number: pin.pinNumber,
      side: isLeftSide ? 'left' : 'right'
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
