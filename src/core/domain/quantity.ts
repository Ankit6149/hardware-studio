export const QUANTITY_DIMENSIONS = [
  'length',
  'angle',
  'voltage',
  'current',
  'resistance',
  'capacitance',
  'inductance',
  'power',
  'energy',
  'frequency',
  'temperature',
  'mass',
  'time',
  'ratio',
] as const;

export type QuantityDimension = (typeof QUANTITY_DIMENSIONS)[number];

export interface QuantityUnitMap {
  length: 'um' | 'mm' | 'cm' | 'm' | 'mil' | 'in';
  angle: 'deg' | 'rad';
  voltage: 'uV' | 'mV' | 'V';
  current: 'uA' | 'mA' | 'A';
  resistance: 'mohm' | 'ohm' | 'kohm' | 'Mohm';
  capacitance: 'pF' | 'nF' | 'uF' | 'mF' | 'F';
  inductance: 'nH' | 'uH' | 'mH' | 'H';
  power: 'mW' | 'W';
  energy: 'mJ' | 'J' | 'Wh';
  frequency: 'Hz' | 'kHz' | 'MHz' | 'GHz';
  temperature: 'C' | 'K' | 'F';
  mass: 'mg' | 'g' | 'kg';
  time: 'us' | 'ms' | 's' | 'min' | 'h';
  ratio: 'ratio' | 'percent';
}

export type UnitFor<D extends QuantityDimension> = QuantityUnitMap[D];

export interface EngineeringQuantity<D extends QuantityDimension = QuantityDimension> {
  dimension: D;
  value: number;
  unit: UnitFor<D>;
  tolerance?: {
    plus: number;
    minus: number;
    unit: UnitFor<D>;
  };
}

export const CANONICAL_UNITS: { [D in QuantityDimension]: UnitFor<D> } = {
  length: 'mm',
  angle: 'deg',
  voltage: 'V',
  current: 'A',
  resistance: 'ohm',
  capacitance: 'F',
  inductance: 'H',
  power: 'W',
  energy: 'J',
  frequency: 'Hz',
  temperature: 'C',
  mass: 'g',
  time: 's',
  ratio: 'ratio',
};

const LINEAR_FACTORS: Partial<Record<QuantityDimension, Record<string, number>>> = {
  length: { um: 0.001, mm: 1, cm: 10, m: 1000, mil: 0.0254, in: 25.4 },
  angle: { deg: 1, rad: 180 / Math.PI },
  voltage: { uV: 1e-6, mV: 1e-3, V: 1 },
  current: { uA: 1e-6, mA: 1e-3, A: 1 },
  resistance: { mohm: 1e-3, ohm: 1, kohm: 1e3, Mohm: 1e6 },
  capacitance: { pF: 1e-12, nF: 1e-9, uF: 1e-6, mF: 1e-3, F: 1 },
  inductance: { nH: 1e-9, uH: 1e-6, mH: 1e-3, H: 1 },
  power: { mW: 1e-3, W: 1 },
  energy: { mJ: 1e-3, J: 1, Wh: 3600 },
  frequency: { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 },
  mass: { mg: 1e-3, g: 1, kg: 1e3 },
  time: { us: 1e-6, ms: 1e-3, s: 1, min: 60, h: 3600 },
  ratio: { ratio: 1, percent: 0.01 },
};

export function createQuantity<D extends QuantityDimension>(
  dimension: D,
  value: number,
  unit: UnitFor<D>,
): EngineeringQuantity<D> {
  if (!Number.isFinite(value)) {
    throw new Error(`Engineering quantity ${dimension} must be finite`);
  }
  return { dimension, value, unit };
}

function temperatureToCelsius(value: number, unit: QuantityUnitMap['temperature']): number {
  if (unit === 'C') return value;
  if (unit === 'K') return value - 273.15;
  return (value - 32) * (5 / 9);
}

export function toCanonicalQuantity<D extends QuantityDimension>(
  quantity: EngineeringQuantity<D>,
): EngineeringQuantity<D> {
  if (!Number.isFinite(quantity.value)) {
    throw new Error(`Engineering quantity ${quantity.dimension} must be finite`);
  }

  if (quantity.dimension === 'temperature') {
    return {
      ...quantity,
      value: temperatureToCelsius(
        quantity.value,
        quantity.unit as QuantityUnitMap['temperature'],
      ),
      unit: CANONICAL_UNITS.temperature as UnitFor<D>,
    };
  }

  const factors = LINEAR_FACTORS[quantity.dimension];
  const factor = factors?.[quantity.unit as string];
  if (factor === undefined) {
    throw new Error(`Unsupported ${quantity.dimension} unit: ${String(quantity.unit)}`);
  }

  return {
    ...quantity,
    value: quantity.value * factor,
    unit: CANONICAL_UNITS[quantity.dimension] as UnitFor<D>,
  };
}
