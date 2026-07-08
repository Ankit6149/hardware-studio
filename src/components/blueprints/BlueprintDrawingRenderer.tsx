import React from 'react';
import type { BlueprintDrawing } from '../../lib/blueprintSheetTypes';

interface BlueprintDrawingRendererProps {
  drawing: BlueprintDrawing;
  className?: string;
}

const objectColors: Record<string, { fill: string; stroke: string; text: string }> = {
  "block": { fill: "#f8fafc", stroke: "#334155", text: "#0f172a" },
  "zone": { fill: "#fefce8", stroke: "#a16207", text: "#713f12" },
  "board": { fill: "#eff6ff", stroke: "#1d4ed8", text: "#1e3a5f" },
  "component": { fill: "#f0fdf4", stroke: "#15803d", text: "#14532d" },
  "schematic-symbol": { fill: "#faf5ff", stroke: "#7e22ce", text: "#581c87" },
  "trace": { fill: "#fef2f2", stroke: "#dc2626", text: "#7f1d1d" },
  "via": { fill: "#fef2f2", stroke: "#b91c1c", text: "#7f1d1d" },
  "pin": { fill: "#ecfdf5", stroke: "#059669", text: "#064e3b" },
  "state": { fill: "#f0f9ff", stroke: "#0284c7", text: "#0c4a6e" },
  "test-card": { fill: "#fefce8", stroke: "#ca8a04", text: "#713f12" },
  "factory-file": { fill: "#f1f5f9", stroke: "#475569", text: "#1e293b" },
  "warning": { fill: "#fef2f2", stroke: "#ef4444", text: "#991b1b" },
  "annotation": { fill: "#f8fafc", stroke: "#94a3b8", text: "#475569" },
};

const connectionColors: Record<string, string> = {
  "signal": "#64748b",
  "power": "#dc2626",
  "ground": "#059669",
  "mechanical": "#a16207",
  "assembly": "#7e22ce",
  "firmware": "#0284c7",
  "test": "#ca8a04",
};

export const BlueprintDrawingRenderer: React.FC<BlueprintDrawingRendererProps> = ({ drawing, className }) => {
  const [vbX, vbY, vbW, vbH] = drawing.viewBox.split(' ').map(Number);

  // Build lookup for connection endpoints
  const objMap = new Map(drawing.objects.map(o => [o.id, o]));

  return (
    <svg
      viewBox={drawing.viewBox}
      className={className}
      style={{ width: '100%', height: 'auto', maxHeight: '400px', background: '#fcfcfd', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid */}
      {drawing.grid && (
        <g opacity={0.15}>
          {Array.from({ length: Math.ceil(vbW / 20) }, (_, i) => (
            <line key={`gv${i}`} x1={vbX + i * 20} y1={vbY} x2={vbX + i * 20} y2={vbY + vbH} stroke="#94a3b8" strokeWidth={0.5} />
          ))}
          {Array.from({ length: Math.ceil(vbH / 20) }, (_, i) => (
            <line key={`gh${i}`} x1={vbX} y1={vbY + i * 20} x2={vbX + vbW} y2={vbY + i * 20} stroke="#94a3b8" strokeWidth={0.5} />
          ))}
        </g>
      )}

      {/* Connections */}
      {drawing.connections.map(conn => {
        const src = objMap.get(conn.sourceId);
        const tgt = objMap.get(conn.targetId);
        if (!src || !tgt) return null;
        const sx = src.x + src.width / 2;
        const sy = src.y + src.height / 2;
        const tx = tgt.x + tgt.width / 2;
        const ty = tgt.y + tgt.height / 2;
        const color = connectionColors[conn.type || "signal"] || "#94a3b8";
        return (
          <g key={conn.id}>
            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={color} strokeWidth={1.2} strokeDasharray={conn.type === "ground" ? "4 2" : undefined} markerEnd="url(#arrowhead)" />
            {conn.label && (
              <text x={(sx + tx) / 2} y={(sy + ty) / 2 - 4} fontSize={7} fill={color} textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace">{conn.label}</text>
            )}
          </g>
        );
      })}

      {/* Drawing Objects */}
      {drawing.objects.map(obj => {
        const colors = objectColors[obj.type] || objectColors["block"];
        const isSmall = obj.width < 20 || obj.height < 20;
        return (
          <g key={obj.id} transform={obj.rotation ? `rotate(${obj.rotation} ${obj.x + obj.width / 2} ${obj.y + obj.height / 2})` : undefined}>
            <rect
              x={obj.x} y={obj.y} width={obj.width} height={obj.height}
              fill={colors.fill} stroke={colors.stroke} strokeWidth={1} rx={obj.type === "state" ? obj.height / 2 : 3}
            />
            {!isSmall && (
              <text x={obj.x + obj.width / 2} y={obj.y + obj.height / 2 + 3} fontSize={obj.width < 80 ? 7 : 8} fill={colors.text}
                textAnchor="middle" fontWeight={700} fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {obj.label.length > 25 ? obj.label.slice(0, 23) + "…" : obj.label}
              </text>
            )}
            {!isSmall && obj.metadata?.status && (
              <text x={obj.x + obj.width / 2} y={obj.y + obj.height / 2 + 14} fontSize={6} fill="#94a3b8"
                textAnchor="middle" fontFamily="ui-monospace, monospace"
              >
                {String(obj.metadata.status)}
              </text>
            )}
          </g>
        );
      })}

      {/* Dimensions */}
      {drawing.dimensions.map(dim => (
        <g key={dim.id}>
          <line x1={dim.from.x} y1={dim.from.y} x2={dim.to.x} y2={dim.to.y} stroke="#475569" strokeWidth={0.8} markerStart="url(#dimMark)" markerEnd="url(#dimMark)" />
          <text x={(dim.from.x + dim.to.x) / 2} y={dim.from.y - 5} fontSize={7} fill="#475569" textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace">
            {dim.label}
          </text>
        </g>
      ))}

      {/* Callouts */}
      {drawing.callouts.map(co => {
        const color = co.severity === "blocker" ? "#dc2626" : co.severity === "error" ? "#ef4444" : co.severity === "warning" ? "#f59e0b" : "#3b82f6";
        return (
          <g key={co.id}>
            {co.targetX != null && co.targetY != null && (
              <line x1={co.x} y1={co.y} x2={co.targetX} y2={co.targetY} stroke={color} strokeWidth={0.6} strokeDasharray="3 2" />
            )}
            <circle cx={co.x} cy={co.y} r={4} fill={color} opacity={0.8} />
            <text x={co.x + 7} y={co.y + 3} fontSize={7} fill={color} fontWeight={600} fontFamily="ui-sans-serif, system-ui, sans-serif">{co.label}</text>
          </g>
        );
      })}

      {/* Arrow marker defs */}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#64748b" />
        </marker>
        <marker id="dimMark" markerWidth="4" markerHeight="8" refX="2" refY="4" orient="auto">
          <line x1="2" y1="0" x2="2" y2="8" stroke="#475569" strokeWidth={1} />
        </marker>
      </defs>
    </svg>
  );
};
