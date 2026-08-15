'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Node,
  Edge,
  NodeChange,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  MarkerType,
  useStore,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { ProductArchitectureNode } from '../../types';
import {
  ArchitecturePort,
  VisualFamilyId,
  getVisualFamily,
  portHandleId,
  portKindFromHandleId,
  portKindStyles,
  resolveVisualFamilyId,
} from '../../lib/visual/representationRegistry';
import { ArchitectureGlyph } from '../visual/DeviceVisual';

const CONNECTION_TYPE_STYLES: Record<string, { color: string; dash?: string }> = {
  Data: { color: '#2563eb' },
  Power: { color: '#d97706' },
  Control: { color: '#7c3aed', dash: '7 4' },
  Mechanical: { color: '#64748b', dash: '3 3' },
  Wireless: { color: '#0891b2', dash: '8 5' },
  Firmware: { color: '#be185d', dash: '5 4' },
  Safety: { color: '#be123c', dash: '3 3' },
};

type ArchitectureElementData = {
  label: string;
  category: string;
  status: string;
  description: string;
  familyId: VisualFamilyId;
  linkedCount: number;
  ports: readonly ArchitecturePort[];
};

function splitPorts(ports: readonly ArchitecturePort[]) {
  const left: ArchitecturePort[] = [];
  const right: ArchitecturePort[] = [];
  ports.forEach((port, index) => {
    if (port.direction === 'input') left.push(port);
    else if (port.direction === 'output') right.push(port);
    else if (index % 2 === 0) left.push(port);
    else right.push(port);
  });
  return { left, right };
}

function portTop(index: number, count: number): string {
  if (count <= 1) return '58%';
  return `${38 + (44 * index) / (count - 1)}%`;
}

function ArchitectureElementNode({ data, selected }: NodeProps) {
  const d = data as ArchitectureElementData;
  const family = getVisualFamily(d.familyId);
  const zoom = useStore((state) => state.transform[2]);
  const compact = zoom < 0.62;
  const { left, right } = splitPorts(d.ports);

  const renderPorts = (ports: ArchitecturePort[], side: 'left' | 'right') => ports.map((port, index) => {
    const visual = portKindStyles[port.kind];
    const isLeft = side === 'left';
    const top = portTop(index, ports.length);
    return (
      <React.Fragment key={`${side}-${port.id}`}>
        <Handle
          type={isLeft ? 'target' : 'source'}
          id={portHandleId(port)}
          position={isLeft ? Position.Left : Position.Right}
          className="!h-3 !w-3 !border-2 !border-[#fbfaf6] shadow-sm"
          style={{ top, backgroundColor: visual.color }}
          title={`${port.label} · ${visual.label}`}
        />
        {!compact && (
          <span
            className={`pointer-events-none absolute z-10 max-w-[76px] truncate bg-[#fbfaf6] px-1 text-[7px] font-semibold text-slate-500 ${isLeft ? '-left-2 text-right' : '-right-2 text-left'}`}
            style={{ top, transform: isLeft ? 'translate(-100%, -50%)' : 'translate(100%, -50%)' }}
            aria-hidden="true"
          >
            {port.label}
          </span>
        )}
      </React.Fragment>
    );
  });

  if (compact) {
    return (
      <div
        className={`relative flex h-[78px] w-[128px] items-center gap-2 border bg-[#fbfaf6] px-2.5 shadow-sm ${selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-300'}`}
        title={`${d.label}: ${family.description}`}
      >
        {renderPorts(left, 'left')}
        {renderPorts(right, 'right')}
        <div className="grid h-10 w-10 shrink-0 place-items-center border border-slate-200 bg-white" style={{ color: family.color }}>
          <ArchitectureGlyph familyId={d.familyId} className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[7px] font-bold uppercase tracking-[0.1em]" style={{ color: family.color }}>{family.shortLabel}</div>
          <div className="mt-1 line-clamp-2 text-[9px] font-semibold leading-3 text-slate-900">{d.label}</div>
        </div>
      </div>
    );
  }

  return (
    <article
      className={`relative w-[236px] border bg-[#fbfaf6] shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-300 hover:border-slate-400'}`}
      aria-label={`${d.label}, ${family.label} architecture element`}
    >
      {renderPorts(left, 'left')}
      {renderPorts(right, 'right')}

      <div className="h-1" style={{ backgroundColor: family.color }} />
      <div className="flex items-start gap-3 p-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center border border-slate-200 bg-white" style={{ color: family.color }}>
          <ArchitectureGlyph familyId={d.familyId} className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[7px] font-extrabold uppercase tracking-[0.12em]" style={{ color: family.color }}>{family.shortLabel} · {d.category}</span>
            <span className="shrink-0 border border-slate-200 bg-white px-1.5 py-0.5 text-[7px] font-bold uppercase text-slate-500">{d.status}</span>
          </div>
          <h3 className="mt-1.5 line-clamp-2 text-[12px] font-bold leading-4 text-slate-950">{d.label}</h3>
          <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500">{d.description || family.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-[#f6f2e9] px-3 py-2">
        <div className="flex items-center gap-1.5">
          {family.ports.slice(0, 4).map((port) => (
            <span key={port.id} className="h-2 w-2 rounded-full border border-white shadow-sm" style={{ backgroundColor: portKindStyles[port.kind].color }} title={`${portKindStyles[port.kind].label}: ${port.label}`} />
          ))}
          {family.ports.length > 4 && <span className="text-[7px] font-semibold text-slate-400">+{family.ports.length - 4}</span>}
        </div>
        <span className="inline-flex items-center gap-1 text-[8px] font-medium text-slate-400"><Link2 className="h-3 w-3" aria-hidden="true" /> {d.linkedCount} linked</span>
      </div>
    </article>
  );
}

const nodeTypes = { architectureElement: ArchitectureElementNode };

function connectionTypeFromHandle(handleId: string | null | undefined): 'Data' | 'Power' | 'Control' | 'Mechanical' | 'Wireless' | 'Firmware' {
  const kind = portKindFromHandleId(handleId);
  if (kind === 'power' || kind === 'ground') return 'Power';
  if (kind === 'control') return 'Control';
  if (kind === 'mechanical' || kind === 'thermal') return 'Mechanical';
  if (kind === 'wireless') return 'Wireless';
  if (kind === 'dependency') return 'Firmware';
  return 'Data';
}

interface ProductArchitectureCanvasProps {
  onNodeSelect: (id: string | null) => void;
  onConnectionSelect: (id: string | null) => void;
  selectedNodeId: string | null;
}

export const ProductArchitectureCanvas: React.FC<ProductArchitectureCanvasProps> = ({
  onNodeSelect,
  onConnectionSelect,
  selectedNodeId,
}) => {
  const store = useProjectStore();
  const architectureNodes = store.architectureNodes || [];
  const architectureConnections = store.architectureConnections || [];

  const flowNodes: Node[] = useMemo(() => architectureNodes.map((node: ProductArchitectureNode) => {
    const familyId = resolveVisualFamilyId({
      name: node.name,
      category: node.category,
      description: node.description,
    });
    const family = getVisualFamily(familyId);
    const linkedCount = node.linkedRequirementIds.length
      + node.linkedCircuitIds.length
      + node.linkedComponentIds.length
      + node.linkedFirmwareModuleIds.length
      + node.linkedTestIds.length;

    return {
      id: node.id,
      type: 'architectureElement',
      position: { x: node.x, y: node.y },
      data: {
        label: node.name,
        category: node.category,
        status: node.status,
        description: node.description,
        familyId,
        linkedCount,
        ports: family.ports,
      } satisfies ArchitectureElementData,
      selected: node.id === selectedNodeId,
    };
  }), [architectureNodes, selectedNodeId]);

  const flowEdges: Edge[] = useMemo(() => architectureConnections.map((connection) => {
    const visual = CONNECTION_TYPE_STYLES[connection.type] || CONNECTION_TYPE_STYLES.Data;
    return {
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      label: connection.name || connection.protocol || connection.type,
      type: 'smoothstep',
      animated: connection.type === 'Wireless',
      style: {
        stroke: visual.color,
        strokeWidth: connection.type === 'Power' ? 2.5 : 1.7,
        strokeDasharray: visual.dash,
      },
      labelStyle: { fontSize: 9, fill: '#64748b', fontWeight: 600 },
      labelBgStyle: { fill: '#fbfaf6', fillOpacity: 0.96 },
      labelBgPadding: [4, 3] as [number, number],
      labelBgBorderRadius: 2,
      markerEnd: connection.direction === 'Forward'
        ? { type: MarkerType.ArrowClosed, color: visual.color, width: 14, height: 14 }
        : undefined,
    };
  }), [architectureConnections]);

  const onNodeDragStart = useCallback(() => {
    store.beginCommand('MOVE_ARCHITECTURE_NODE', 'Move architecture element');
  }, [store]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type !== 'position' || !change.position) continue;
      const updated = (store.architectureNodes || []).map((node) =>
        node.id === change.id ? { ...node, x: change.position!.x, y: change.position!.y } : node
      );
      store.updateTransientPreview({ architectureNodes: updated });
      if (!change.dragging) store.commitCommand();
    }
  }, [store]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    const type = connectionTypeFromHandle(connection.sourceHandle || connection.targetHandle);
    store.executeProjectCommand(
      'ADD_ARCHITECTURE_CONNECTION',
      `Connect architecture elements with ${type.toLowerCase()}`,
      () => store.addArchitectureConnection({
        sourceNodeId: connection.source!,
        targetNodeId: connection.target!,
        type,
        direction: type === 'Data' || type === 'Wireless' ? 'Bidirectional' : 'Forward',
      }),
    );
  }, [store]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeSelect(node.id);
    onConnectionSelect(null);
  }, [onNodeSelect, onConnectionSelect]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    onConnectionSelect(edge.id);
    onNodeSelect(null);
  }, [onNodeSelect, onConnectionSelect]);

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
    onConnectionSelect(null);
  }, [onNodeSelect, onConnectionSelect]);

  return (
    <div className="h-full w-full bg-[#f3f0e8]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        minZoom={0.25}
        maxZoom={1.8}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c9c3b8" />
        <Controls showInteractive={false} className="!border !border-slate-300 !bg-[#fbfaf6] !shadow-sm" />
        <MiniMap
          nodeColor={(node) => {
            const familyId = (node.data as ArchitectureElementData | undefined)?.familyId;
            return familyId ? getVisualFamily(familyId).color : '#64748b';
          }}
          maskColor="rgba(243,240,232,0.7)"
          className="!border !border-slate-300 !bg-[#fbfaf6]"
        />
      </ReactFlow>
    </div>
  );
};
