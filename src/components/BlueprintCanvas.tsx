'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  useStore,
  Handle,
  Position,
  NodeProps,
  Connection,
  NodeChange,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Eye, Info, Network, ShieldAlert } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { CustomNode, NodeData } from '../types';
import { BlockLibraryItem } from '../data/blockLibrary';
import {
  ArchitecturePort,
  portHandleId,
  portKindFromHandleId,
  portKindStyles,
  resolveVisualFamily,
  resolveVisualFamilyId,
} from '../lib/visual/representationRegistry';
import { ArchitectureGlyph } from './visual/DeviceVisual';
import { RepresentationInspector } from './visual/RepresentationInspector';

const getStatusClasses = (status: NodeData['status']) => {
  switch (status) {
    case 'MVP': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'Later': return 'border-slate-200 bg-slate-50 text-slate-600';
    case 'Future': return 'border-purple-200 bg-purple-50 text-purple-800';
    case 'External': return 'border-slate-200 bg-slate-100 text-slate-500';
    case 'Risk': return 'border-rose-200 bg-rose-50 text-rose-800';
    case 'Complete': return 'border-blue-200 bg-blue-50 text-blue-800';
    default: return 'border-slate-200 bg-slate-50 text-slate-700';
  }
};

interface RepresentationInspectorContextValue {
  inspect: (data: NodeData) => void;
}

const RepresentationInspectorContext = createContext<RepresentationInspectorContextValue | null>(null);

function useRepresentationInspector() {
  const value = useContext(RepresentationInspectorContext);
  if (!value) throw new Error('Architecture nodes require RepresentationInspectorContext');
  return value;
}

function portPosition(index: number, count: number): string {
  if (count <= 1) return '50%';
  return `${24 + (52 * index) / (count - 1)}%`;
}

function splitPorts(ports: readonly ArchitecturePort[]) {
  const inputs: ArchitecturePort[] = [];
  const outputs: ArchitecturePort[] = [];
  ports.forEach((port, index) => {
    if (port.direction === 'input') inputs.push(port);
    else if (port.direction === 'output') outputs.push(port);
    else if (index % 2 === 0) inputs.push(port);
    else outputs.push(port);
  });
  return { inputs, outputs };
}

const ArchitectureNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
  const family = resolveVisualFamily(data);
  const familyId = resolveVisualFamilyId(data);
  const zoom = useStore((state) => state.transform[2]);
  const { inspect } = useRepresentationInspector();
  const compact = zoom < 0.58;
  const medium = zoom >= 0.58 && zoom < 0.88;
  const { inputs, outputs } = splitPorts(family.ports);

  const renderPorts = (ports: ArchitecturePort[], side: 'left' | 'right') => ports.map((port, index) => {
    const styles = portKindStyles[port.kind];
    const top = portPosition(index, ports.length);
    const isLeft = side === 'left';
    return (
      <React.Fragment key={`${side}-${port.id}`}>
        <Handle
          type={isLeft ? 'target' : 'source'}
          id={portHandleId(port)}
          position={isLeft ? Position.Left : Position.Right}
          title={`${port.label}: ${port.description}`}
          className="!h-3 !w-3 !border-2 !border-white shadow-sm transition-transform hover:!scale-125"
          style={{ top, backgroundColor: styles.color }}
        />
        {!compact && (
          <span
            className={`pointer-events-none absolute z-10 max-w-[82px] truncate rounded border border-slate-200 bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-slate-600 shadow-sm ${isLeft ? '-left-2 -translate-x-full text-right' : '-right-2 translate-x-full text-left'}`}
            style={{ top, transform: `${isLeft ? 'translate(-100%, -50%)' : 'translate(100%, -50%)'}` }}
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
        className={`relative grid h-[92px] w-[118px] place-items-center rounded-[24px] border bg-white shadow-sm transition ${selected ? 'border-slate-950 ring-2 ring-slate-950/15' : 'border-slate-200'}`}
        title={`${data.name}: ${family.description}`}
      >
        {renderPorts(inputs, 'left')}
        {renderPorts(outputs, 'right')}
        <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: family.accent, color: family.color }}>
          <ArchitectureGlyph familyId={familyId} className="h-8 w-8" />
        </div>
        <span className="absolute bottom-2 max-w-[100px] truncate text-[9px] font-bold text-slate-800">{data.name}</span>
      </div>
    );
  }

  return (
    <article
      className={`relative w-[244px] overflow-visible rounded-[22px] border bg-white text-slate-800 shadow-[0_8px_28px_rgba(15,23,42,0.08)] transition-all duration-150 ${selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200 hover:border-slate-300'}`}
      aria-label={`${data.name}, ${family.label} architecture node`}
    >
      {renderPorts(inputs, 'left')}
      {renderPorts(outputs, 'right')}

      <div className="overflow-hidden rounded-[21px]">
        <div className="flex items-start gap-3 border-b border-slate-100 p-3.5" style={{ background: `linear-gradient(135deg, ${family.accent}, #ffffff)` }}>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/80 bg-white/80 shadow-sm" style={{ color: family.color }}>
            <ArchitectureGlyph familyId={familyId} className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.13em]" style={{ color: family.color }}>{family.shortLabel} · {data.category}</span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide ${getStatusClasses(data.status)}`}>{data.status}</span>
            </div>
            <h3 className="mt-1.5 line-clamp-2 text-[13px] font-extrabold leading-4 text-slate-950">{data.name}</h3>
            {!medium && <p className="mt-1 line-clamp-2 text-[10px] leading-[16px] text-slate-600">{data.description || family.description}</p>}
          </div>
        </div>

        {!medium && (
          <div className="space-y-2.5 p-3.5">
            <div className="flex flex-wrap gap-1.5">
              {family.ports.slice(0, 4).map((port) => (
                <span key={port.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: portKindStyles[port.kind].color }} />
                  {portKindStyles[port.kind].label}
                </span>
              ))}
              {family.ports.length > 4 && <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-bold text-slate-500">+{family.ports.length - 4}</span>}
            </div>

            {data.candidateComponents && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Candidate / linked hardware</p>
                <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-600">{data.candidateComponents}</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="nodrag flex w-full items-center justify-between border-t border-slate-100 bg-white px-3.5 py-2 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            inspect(data);
          }}
        >
          <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Inspect all representations</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
};

const BoundaryNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
  const family = resolveVisualFamily(data);
  return (
    <div
      className={`relative h-full w-full rounded-[28px] border-2 border-dashed p-4 text-slate-700 transition ${selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-300'} bg-white/35`}
      style={{ borderColor: selected ? '#0f172a' : family.color }}
    >
      <div className="absolute -top-4 left-5 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
        <ArchitectureGlyph familyId={resolveVisualFamilyId(data)} className="h-4 w-4" />
        <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-800">{data.name}</span>
        <span className={`rounded-full border px-1.5 py-0.5 text-[7px] font-extrabold uppercase ${getStatusClasses(data.status)}`}>{data.status}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  blockNode: ArchitectureNode,
  boundaryNode: BoundaryNode,
};

const BlueprintCanvasContent: React.FC = () => {
  const {
    activeView,
    nodes,
    edges,
    setSelectedNodeId,
    updateNodePosition,
    addEdge,
    addNode,
  } = useProjectStore();
  const [inspectedNode, setInspectedNode] = useState<NodeData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const viewNodes = useMemo(
    () => nodes.filter((node) => node.data.views && node.data.views.includes(activeView)),
    [nodes, activeView],
  );

  const viewEdges = useMemo(
    () => edges
      .filter((edge) => edge.views && edge.views.includes(activeView))
      .map((edge) => {
        const kind = portKindFromHandleId(edge.sourceHandle) ?? portKindFromHandleId(edge.targetHandle);
        const visual = kind ? portKindStyles[kind] : portKindStyles.dependency;
        return {
          ...edge,
          type: 'smoothstep',
          animated: kind === 'wireless',
          style: { stroke: visual.color, strokeWidth: 2, strokeDasharray: visual.dash },
          markerEnd: { type: MarkerType.ArrowClosed, color: visual.color, width: 16, height: 16 },
          labelStyle: { fill: '#475569', fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
          labelBgPadding: [4, 3] as [number, number],
          labelBgBorderRadius: 5,
        };
      }),
    [edges, activeView],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && change.id) updateNodePosition(change.id, change.position);
    });
  }, [updateNodePosition]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomNode) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  const onConnect = useCallback((params: Connection) => {
    const kind = portKindFromHandleId(params.sourceHandle) ?? portKindFromHandleId(params.targetHandle);
    addEdge({
      id: `edge_${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      views: [activeView],
      label: kind ? portKindStyles[kind].label : '',
    });
  }, [addEdge, activeView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    const dataStr = event.dataTransfer.getData('application/reactflow-item');
    if (!dataStr) return;

    try {
      const item: BlockLibraryItem = JSON.parse(dataStr);
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode({
        type: item.type,
        position,
        width: item.width,
        height: item.height,
        data: {
          name: item.name,
          category: item.category,
          status: item.status,
          description: item.description,
          purpose: item.purpose,
          requirements: item.requirements,
          candidateComponents: item.candidateComponents,
          risks: item.risks,
          notes: item.notes,
          testingNotes: item.testingNotes,
          views: [activeView],
          positions: {},
        },
      });
    } catch (error) {
      console.error('Failed to add architecture node from library', error);
    }
  }, [reactFlowInstance, activeView, addNode]);

  const inspectorValue = useMemo<RepresentationInspectorContextValue>(() => ({
    inspect: (data) => {
      setInspectedNode(data);
      setIsInspectorOpen(true);
    },
  }), []);

  return (
    <RepresentationInspectorContext.Provider value={inspectorValue}>
      <div ref={reactFlowWrapper} className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-sm rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-800"><Network className="h-4 w-4 text-indigo-600" aria-hidden="true" />System architecture</div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">Semantic device and function visuals with typed ports. Use Schematic and PCB workbenches for exact electrical and footprint geometry.</p>
        </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden max-w-md items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-[10px] leading-4 text-amber-900 shadow-sm backdrop-blur-sm md:flex">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          Images and 3D previews improve recognition only; unresolved package, footprint, or CAD data remains unresolved.
        </div>

        <ReactFlow
          nodes={viewNodes}
          edges={viewEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          proOptions={{ hideAttribution: false }}
        >
          <Background gap={18} size={1} color="#dbe3ed" />
          <Controls showInteractive={false} className="rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm" />
          <MiniMap
            zoomable
            pannable
            nodeColor={(node) => resolveVisualFamily(node.data as NodeData).color}
            maskColor="rgba(241,245,249,0.72)"
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
          />
        </ReactFlow>

        <RepresentationInspector
          key={`${inspectedNode?.name ?? 'none'}:${isInspectorOpen ? 'open' : 'closed'}`}
          nodeData={inspectedNode}
          open={isInspectorOpen}
          onOpenChange={setIsInspectorOpen}
        />
      </div>
    </RepresentationInspectorContext.Provider>
  );
};

export const BlueprintCanvas: React.FC = () => (
  <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50">
    <ReactFlowProvider>
      <BlueprintCanvasContent />
    </ReactFlowProvider>
  </div>
);
