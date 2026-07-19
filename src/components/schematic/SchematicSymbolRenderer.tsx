import React from 'react';

export interface SymbolPinLayout {
  number: string;
  label: string;
  x: number;
  y: number;
  side: 'left' | 'right';
  electricalType?: string;
}

interface SchematicSymbolRendererProps {
  componentType: string;
  referenceDesignator: string;
  value?: string;
  packageName?: string;
  pins: { pinNumber: string; pinName: string; electricalType?: string }[];
  rotation: number;
  isSelected: boolean;
  hoveredPinNumber?: string | null;
  onPinClick?: (e: React.MouseEvent, pinNumber: string, pinLabel: string) => void;
  onPinMouseEnter?: (pinNumber: string) => void;
  onPinMouseLeave?: () => void;
}

export const getSymbolPinLayouts = (
  componentType: string,
  pins: { pinNumber: string; pinName: string }[]
): SymbolPinLayout[] => {
  const type = componentType.toLowerCase();
  const sortedPins = [...pins].sort((a, b) => Number(a.pinNumber) - Number(b.pinNumber));

  if (type === 'resistor' || type === 'capacitor' || type === 'inductor' || type === 'diode' || type === 'led' || type === 'switch' || type === 'button') {
    // 2-pin passives
    const p1 = sortedPins[0] || { pinNumber: '1', pinName: '1' };
    const p2 = sortedPins[1] || { pinNumber: '2', pinName: '2' };
    return [
      { number: p1.pinNumber, label: p1.pinName, x: -30, y: 0, side: 'left' },
      { number: p2.pinNumber, label: p2.pinName, x: 30, y: 0, side: 'right' }
    ];
  }

  if (type === 'transistor' || type === 'mosfet') {
    // 3-pin actives (BJT: Base, Collector, Emitter or FET: Gate, Drain, Source)
    const p1 = sortedPins[0] || { pinNumber: '1', pinName: 'G' };
    const p2 = sortedPins[1] || { pinNumber: '2', pinName: 'D' };
    const p3 = sortedPins[2] || { pinNumber: '3', pinName: 'S' };
    return [
      { number: p1.pinNumber, label: p1.pinName, x: -20, y: 0, side: 'left' },
      { number: p2.pinNumber, label: p2.pinName, x: 20, y: -20, side: 'right' },
      { number: p3.pinNumber, label: p3.pinName, x: 20, y: 20, side: 'right' }
    ];
  }

  if (type === 'ground') {
    const p1 = sortedPins[0] || { pinNumber: '1', pinName: 'GND' };
    return [
      { number: p1.pinNumber, label: p1.pinName, x: 0, y: -20, side: 'left' }
    ];
  }

  if (type === 'power' || type === 'vcc') {
    const p1 = sortedPins[0] || { pinNumber: '1', pinName: 'VCC' };
    return [
      { number: p1.pinNumber, label: p1.pinName, x: 0, y: 20, side: 'right' }
    ];
  }

  // Multi-pin ICs, MCUs, regulators, Custom parts
  const half = Math.ceil(sortedPins.length / 2);
  const layouts: SymbolPinLayout[] = [];
  
  // Left side pins
  for (let i = 0; i < half; i++) {
    layouts.push({
      number: sortedPins[i].pinNumber,
      label: sortedPins[i].pinName,
      x: -40,
      y: -30 + i * 20,
      side: 'left'
    });
  }
  
  // Right side pins
  for (let i = half; i < sortedPins.length; i++) {
    layouts.push({
      number: sortedPins[i].pinNumber,
      label: sortedPins[i].pinName,
      x: 40,
      y: -30 + (i - half) * 20,
      side: 'right'
    });
  }

  return layouts;
};

export const SchematicSymbolRenderer: React.FC<SchematicSymbolRendererProps> = ({
  componentType,
  referenceDesignator,
  value,
  pins,
  rotation,
  isSelected,
  hoveredPinNumber,
  onPinClick,
  onPinMouseEnter,
  onPinMouseLeave
}) => {
  const type = componentType.toLowerCase();
  const pinLayouts = getSymbolPinLayouts(componentType, pins);
  
  // Calculate bounding boxes based on type
  let width = 60;
  let height = 40;
  let drawContent = null;

  if (type === 'resistor') {
    width = 40;
    height = 20;
    drawContent = (
      <g>
        {/* US style zig-zag resistor symbol */}
        <path d="M -30 0 L -20 0 L -15 -7 L -7 7 L 0 -7 L 7 7 L 15 -7 L 20 0 L 30 0" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
      </g>
    );
  } else if (type === 'capacitor') {
    width = 20;
    height = 20;
    drawContent = (
      <g>
        <line x1="-30" y1="0" x2="-6" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        <line x1="6" y1="0" x2="30" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Capacitor plates */}
        <line x1="-6" y1="-12" x2="-6" y2="12" stroke="#f1f5f9" strokeWidth="2" />
        <line x1="6" y1="-12" x2="6" y2="12" stroke="#f1f5f9" strokeWidth="2" />
      </g>
    );
  } else if (type === 'inductor') {
    width = 40;
    height = 20;
    drawContent = (
      <g>
        <path d="M -30 0 L -20 0 C -20 -8, -10 -8, -10 0 C -10 -8, 0 -8, 0 0 C 0 -8, 10 -8, 10 0 C 10 -8, 20 -8, 20 0 L 30 0" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
      </g>
    );
  } else if (type === 'diode' || type === 'led') {
    width = 30;
    height = 25;
    drawContent = (
      <g>
        <line x1="-30" y1="0" x2="-10" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        <line x1="10" y1="0" x2="30" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Diode triangle */}
        <polygon points="-10,-10 -10,10 10,0" fill="#f1f5f9" />
        <line x1="10" y1="-10" x2="10" y2="10" stroke="#f1f5f9" strokeWidth="2" />
        {/* LED arrows */}
        {type === 'led' && (
          <g stroke="#38bdf8" strokeWidth="1" fill="none">
            <path d="M -5 -12 L 2 -19 M 2 -19 L -2 -19 M 2 -19 L 2 -15" />
            <path d="M 5 -12 L 12 -19 M 12 -19 L 8 -19 M 12 -19 L 12 -15" />
          </g>
        )}
      </g>
    );
  } else if (type === 'transistor' || type === 'mosfet') {
    width = 40;
    height = 40;
    drawContent = (
      <g>
        {/* Outer circle */}
        <circle cx="5" cy="0" r="18" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Base / Gate line */}
        <line x1="-5" y1="-10" x2="-5" y2="10" stroke="#f1f5f9" strokeWidth="2.5" />
        <line x1="-20" y1="0" x2="-5" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Collector / Drain */}
        <path d="M -5 -6 L 15 -16 L 20 -16" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Emitter / Source */}
        <path d="M -5 6 L 15 16 L 20 16" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Transistor arrow */}
        <polygon points="12,12 5,10 9,6" fill="#f1f5f9" />
      </g>
    );
  } else if (type === 'ground') {
    width = 20;
    height = 20;
    drawContent = (
      <g>
        <line x1="0" y1="-20" x2="0" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* GND tapered lines */}
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#f1f5f9" strokeWidth="2" />
        <line x1="-8" y1="5" x2="8" y2="5" stroke="#f1f5f9" strokeWidth="2" />
        <line x1="-4" y1="10" x2="4" y2="10" stroke="#f1f5f9" strokeWidth="2" />
      </g>
    );
  } else if (type === 'power' || type === 'vcc') {
    width = 20;
    height = 20;
    drawContent = (
      <g>
        <line x1="0" y1="20" x2="0" y2="0" stroke="#ef4444" strokeWidth="1.5" />
        {/* Power arrow */}
        <polygon points="-6,4 0,-6 6,4" fill="#ef4444" />
      </g>
    );
  } else if (type === 'switch' || type === 'button') {
    width = 30;
    height = 20;
    drawContent = (
      <g>
        <line x1="-30" y1="0" x2="-14" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        <line x1="14" y1="0" x2="30" y2="0" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Terminals */}
        <circle cx="-14" cy="0" r="2" fill="#f1f5f9" />
        <circle cx="14" cy="0" r="2" fill="#f1f5f9" />
        {/* Lever */}
        <line x1="-14" y1="0" x2="10" y2="-12" stroke="#f1f5f9" strokeWidth="1.8" />
      </g>
    );
  } else {
    // Default rectangular chip layout for ICs, MCUs, regulators, and connectors
    const pinCount = pins.length;
    const sidePinCount = Math.ceil(pinCount / 2);
    width = 60;
    height = Math.max(30, sidePinCount * 20);

    drawContent = (
      <g>
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          fill="#1e293b"
          stroke={isSelected ? '#10b981' : '#475569'}
          strokeWidth={isSelected ? 2 : 1.5}
          rx={4}
        />
        {/* Notch for orientation */}
        <path d={`M -6 ${-height / 2} A 6 6 0 0 0 6 ${-height / 2}`} fill="#0f172a" stroke="#475569" strokeWidth="1" />
      </g>
    );
  }

  return (
    <g transform={`rotate(${rotation})`}>
      {/* Symbol Body */}
      {drawContent}

      {/* Selection bounding box highlight */}
      {isSelected && type !== 'resistor' && type !== 'capacitor' && type !== 'inductor' && type !== 'diode' && type !== 'led' && type !== 'transistor' && type !== 'mosfet' && type !== 'ground' && type !== 'power' && type !== 'vcc' && (
        <rect
          x={-width / 2 - 4}
          y={-height / 2 - 4}
          width={width + 8}
          height={height + 8}
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      )}

      {/* Text labels (Reference designator & value) */}
      <g transform={`rotate(${-rotation})`} style={{ pointerEvents: 'none' }}>
        <text
          y={type === 'ground' || type === 'power' ? 22 : -height / 2 - 6}
          fill={isSelected ? '#10b981' : '#f1f5f9'}
          fontSize={8}
          fontWeight="bold"
          textAnchor="middle"
        >
          {referenceDesignator}
        </text>
        {value && (
          <text
            y={type === 'ground' || type === 'power' ? 32 : height / 2 + 12}
            fill="#94a3b8"
            fontSize={7}
            textAnchor="middle"
          >
            {value}
          </text>
        )}
      </g>

      {/* Symbol Pins and Terminals */}
      {pinLayouts.map(p => {
        const isHovered = hoveredPinNumber === p.number;
        return (
          <g key={p.number}>
            {/* Terminal Line */}
            {type !== 'resistor' && type !== 'capacitor' && type !== 'inductor' && type !== 'diode' && type !== 'led' && type !== 'transistor' && type !== 'mosfet' && type !== 'ground' && type !== 'power' && type !== 'vcc' && (
              <line
                x1={p.side === 'left' ? p.x : p.x - 10}
                y1={p.y}
                x2={p.side === 'left' ? p.x + 10 : p.x}
                y2={p.y}
                stroke="#475569"
                strokeWidth={1}
              />
            )}

            {/* Clickable Terminal dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={isHovered ? 4.5 : 2.5}
              fill={isHovered ? '#10b981' : '#ef4444'}
              className="cursor-pointer transition-all"
              onClick={(e) => onPinClick && onPinClick(e, p.number, p.label)}
              onMouseEnter={() => onPinMouseEnter && onPinMouseEnter(p.number)}
              onMouseLeave={() => onPinMouseLeave && onPinMouseLeave()}
            />

            {/* Pin label inside symbol body (only for ICs/multi-pins) */}
            {type !== 'resistor' && type !== 'capacitor' && type !== 'inductor' && type !== 'diode' && type !== 'led' && type !== 'transistor' && type !== 'mosfet' && type !== 'ground' && type !== 'power' && type !== 'vcc' && (
              <text
                x={p.side === 'left' ? p.x + 14 : p.x - 14}
                y={p.y + 2.5}
                fill="#cbd5e1"
                fontSize={7}
                fontFamily="monospace"
                textAnchor={p.side === 'left' ? 'start' : 'end'}
                style={{ pointerEvents: 'none' }}
              >
                {p.label}
              </text>
            )}

            {/* Pin number outside body */}
            {type !== 'ground' && type !== 'power' && type !== 'vcc' && (
              <text
                x={p.side === 'left' ? p.x - 8 : p.x + 8}
                y={p.y - 4}
                fill="#64748b"
                fontSize={6.5}
                fontFamily="monospace"
                textAnchor={p.side === 'left' ? 'end' : 'start'}
                style={{ pointerEvents: 'none' }}
              >
                {p.number}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
