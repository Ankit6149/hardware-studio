'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { MechanicalObject, BoardComponent } from '../../types';
import { Box, Layers, ShieldAlert, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface Mechanical3DViewProps {
  onClose?: () => void;
}

const TYPE_3D_COLORS: Record<string, string> = {
  'Outer Profile': '#334155',
  'Inner Profile': '#475569',
  'Board Zone': '#2563eb',
  'Battery Cavity': '#d97706',
  'Connector Opening': '#059669',
  'Button Opening': '#7c3aed',
  'Sensor Window': '#0891b2',
  'Mounting Point': '#dc2626',
  'Antenna Keepout': '#db2777',
  'Mechanical Keepout': '#b91c1c',
};

export const Mechanical3DView: React.FC<Mechanical3DViewProps> = () => {
  const store = useProjectStore();
  const mechanicalObjects = store.mechanicalObjects || [];
  const boardComponents = store.boardComponents || [];
  const boardOutlines = store.boardOutlines || [];

  const [angleX, setAngleX] = useState(30);
  const [angleY, setAngleY] = useState(45);
  const [zoom, setZoom] = useState(2.5);
  const [extrusionDepth, setExtrusionDepth] = useState(15);
  const [explodedView, setExplodedView] = useState(false);

  // Isometric projection math (mm to 2D isometric screen coords)
  const project3D = (xMm: number, yMm: number, zMm: number) => {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const xScreen = (xMm * cosY - yMm * sinY) * zoom + 350;
    const yScreen = ((xMm * sinY + yMm * cosY) * sinX - zMm * cosX) * zoom + 250;

    return { x: xScreen, y: yScreen };
  };

  const outerProfile = mechanicalObjects.find((o) => o.type === 'Outer Profile');
  const boardZones = mechanicalObjects.filter((o) => o.type === 'Board Zone');

  // Interference check (components extending outside enclosure depth)
  const interferenceWarnings: string[] = [];
  const compMaxZ = 8; // Default component height
  if (compMaxZ > extrusionDepth) {
    interferenceWarnings.push(`Component height (${compMaxZ}mm) exceeds enclosure depth (${extrusionDepth}mm)`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
      {/* 3D Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #1e293b', background: '#1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
          <Box size={16} color="#38bdf8" /> Parametric 3D Product Preview
        </div>
        <div style={{ width: 1, height: 20, background: '#334155' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <span>Extrusion Depth:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={extrusionDepth}
            onChange={(e) => setExtrusionDepth(parseFloat(e.target.value) || 10)}
            style={{ width: 50, padding: '2px 4px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', borderRadius: 4, fontSize: 11 }}
          />
          <span>mm</span>
        </div>

        <button
          onClick={() => setExplodedView(!explodedView)}
          style={{
            padding: '4px 8px', background: explodedView ? '#0284c7' : '#334155', border: 'none', borderRadius: 4,
            fontSize: 11, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          <Layers size={12} /> {explodedView ? 'Exploded View ON' : 'Exploded View OFF'}
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setAngleY((a) => a - 15)} style={iconBtnStyle} title="Rotate Left"><RotateCw size={12} style={{ transform: 'scaleX(-1)' }} /></button>
          <button onClick={() => setAngleY((a) => a + 15)} style={iconBtnStyle} title="Rotate Right"><RotateCw size={12} /></button>
          <button onClick={() => setZoom((z) => Math.min(6, z * 1.2))} style={iconBtnStyle} title="Zoom In"><ZoomIn size={12} /></button>
          <button onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))} style={iconBtnStyle} title="Zoom Out"><ZoomOut size={12} /></button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="wallGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Render extruded mechanical objects */}
          {mechanicalObjects.filter((o) => o.visible).map((obj) => {
            const w = obj.widthMm || (obj.radiusMm ? obj.radiusMm * 2 : 20);
            const h = obj.heightMm || (obj.radiusMm ? obj.radiusMm * 2 : 20);
            const color = TYPE_3D_COLORS[obj.type] || '#64748b';
            const baseZ = explodedView ? (obj.type === 'Board Zone' ? 15 : obj.type === 'Battery Cavity' ? 30 : 0) : 0;
            const topZ = baseZ + (obj.type === 'Outer Profile' ? extrusionDepth : 2);

            const p1 = project3D(obj.xMm, obj.yMm, baseZ);
            const p2 = project3D(obj.xMm + w, obj.yMm, baseZ);
            const p3 = project3D(obj.xMm + w, obj.yMm + h, baseZ);
            const p4 = project3D(obj.xMm, obj.yMm + h, baseZ);

            const pt1 = project3D(obj.xMm, obj.yMm, topZ);
            const pt2 = project3D(obj.xMm + w, obj.yMm + h, topZ);

            return (
              <g key={obj.id}>
                {/* 3D Extruded Box representation */}
                <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`} fill={`${color}20`} stroke={color} strokeWidth={1} />
                <line x1={p1.x} y1={p1.y} x2={p1.x} y2={pt1.y} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
                <line x1={p3.x} y1={p3.y} x2={p3.x} y2={pt2.y} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
                <text x={p1.x + (p3.x - p1.x) / 2} y={p1.y + (p3.y - p1.y) / 2} fontSize={9} fill={color} textAnchor="middle">
                  {obj.name} ({obj.type})
                </text>
              </g>
            );
          })}

          {/* Render 3D PCB body */}
          {boardZones.map((bz) => {
            const z = explodedView ? 20 : 5;
            const w = bz.widthMm || 40;
            const h = bz.heightMm || 40;
            const p1 = project3D(bz.xMm, bz.yMm, z);
            const p3 = project3D(bz.xMm + w, bz.yMm + h, z);

            return (
              <g key={`pcb_3d_${bz.id}`}>
                <rect x={Math.min(p1.x, p3.x)} y={Math.min(p1.y, p3.y)} width={Math.abs(p3.x - p1.x)} height={Math.abs(p3.y - p1.y)} fill="#05966940" stroke="#10b981" strokeWidth={1.5} rx={3} />
                <text x={(p1.x + p3.x) / 2} y={(p1.y + p3.y) / 2} fontSize={10} fill="#6ee7b7" textAnchor="middle">
                  PCB Substrate (FR4 1.6mm)
                </text>
              </g>
            );
          })}
        </svg>

        {/* 3D Interference Warning overlay */}
        {interferenceWarnings.length > 0 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: '#7f1d1d', border: '1px solid #f87171', borderRadius: 6, padding: '8px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={14} color="#fca5a5" />
            <span>{interferenceWarnings.join(' | ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  padding: '4px 6px', background: '#334155', border: 'none', borderRadius: 4, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center'
};
