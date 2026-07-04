import React, { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
  Connection,
  NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../store/projectStore';
import { CustomNode, NodeData } from '../types';
import { BlockLibraryItem } from '../data/blockLibrary';

// Status colors styling helper
const getStatusClasses = (status: NodeData['status']) => {
  switch (status) {
    case 'MVP':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'Later':
      return {
        bg: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400'
      };
    case 'Future':
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500'
      };
    case 'External':
      return {
        bg: 'bg-slate-100 text-slate-500 border-slate-200',
        dot: 'bg-slate-400'
      };
    case 'Risk':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500 animate-pulse'
      };
    case 'Complete':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500'
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400'
      };
  }
};

// Category indicator helper
const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'Product': return 'bg-slate-800';
    case 'Interaction': return 'bg-pink-500';
    case 'Electronics': return 'bg-cyan-500';
    case 'Firmware': return 'bg-violet-500';
    case 'Mechanical': return 'bg-amber-500';
    case 'Power': return 'bg-yellow-500';
    case 'Software': return 'bg-indigo-500';
    case 'Testing': return 'bg-rose-500';
    default: return 'bg-slate-400';
  }
};

// --- CUSTOM BLOCK NODE ---
const BlockNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
  const statusStyles = getStatusClasses(data.status);
  const categoryBarColor = getCategoryColor(data.category);

  return (
    <div 
      className={`bg-white rounded-lg border text-slate-800 text-[11px] w-52 overflow-hidden transition-all duration-200 select-none shadow-[0_1px_3px_rgba(15,23,42,0.03),0_1px_2px_rgba(15,23,42,0.02)] ${
        selected 
          ? 'border-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] ring-[1.5px] ring-slate-900' 
          : 'border-slate-200 hover:border-slate-350 hover:shadow-[0_2px_6px_rgba(15,23,42,0.04)]'
      }`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 bg-slate-400 hover:bg-slate-600 transition-colors" />
      <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 bg-slate-400 hover:bg-slate-600 transition-colors" />

      {/* Top Accent Category Bar */}
      <div className={`h-1 w-full ${categoryBarColor}`} />

      <div className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            {data.category}
          </span>
          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-wider scale-95 shrink-0 ${statusStyles.bg}`}>
            {data.status}
          </span>
        </div>

        {/* Name */}
        <div className="font-bold text-xs text-slate-900 leading-snug truncate" title={data.name}>
          {data.name}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Specs / Components Footer */}
        {(data.candidateComponents || data.requirements) && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px]">
            {data.candidateComponents ? (
              <span className="truncate max-w-[120px] bg-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[8px] border border-slate-200/50" title={data.candidateComponents}>
                {data.candidateComponents}
              </span>
            ) : (
              <span className="text-slate-400 italic">No component</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- CUSTOM BOUNDARY NODE ---
const BoundaryNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
  const isMvp = data.status === 'MVP';
  const isLater = data.status === 'Later';
  const isFuture = data.status === 'Future';

  const boundaryColorClass = isMvp 
    ? 'border-emerald-400 bg-emerald-500/[0.02] text-emerald-800' 
    : isLater 
      ? 'border-slate-350 bg-slate-500/[0.01] text-slate-700' 
      : isFuture 
        ? 'border-purple-400 bg-purple-500/[0.02] text-purple-800'
        : 'border-slate-400 bg-slate-500/[0.02] text-slate-800';

  return (
    <div 
      className={`border-2 border-dashed rounded-xl h-full w-full p-4 pointer-events-none select-none relative transition-all ${boundaryColorClass} ${
        selected ? 'ring-2 ring-slate-900 border-slate-900 shadow-sm' : ''
      }`}
    >
      <div className="absolute -top-3 left-4 flex items-center space-x-1.5 select-none">
        <span className={`text-[9px] font-extrabold uppercase tracking-widest border px-2 py-0.5 rounded-md shadow-sm bg-white ${
          isMvp ? 'text-emerald-700 border-emerald-200' : 'text-slate-700 border-slate-200'
        }`}>
          {data.name} &bull; {data.status}
        </span>
        {data.notes && (
          <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-sm">
            {data.notes}
          </span>
        )}
      </div>
    </div>
  );
};

// Define node types memoized
const nodeTypes = {
  blockNode: BlockNode,
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
    addNode
  } = useProjectStore();

  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Filter nodes & edges for the current view
  const viewNodes = useMemo(() => {
    return nodes.filter(node => node.data.views && node.data.views.includes(activeView));
  }, [nodes, activeView]);

  const viewEdges = useMemo(() => {
    return edges.filter(edge => edge.views && edge.views.includes(activeView));
  }, [edges, activeView]);

  // Handle position changes on drag end or drag progress
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && change.id) {
        updateNodePosition(change.id, change.position);
      }
    });
  }, [updateNodePosition]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomNode) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  // Deselect node on clicking canvas background
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Handle edge connects
  const onConnect = useCallback((params: Connection) => {
    addEdge({
      id: `edge_${Date.now()}`,
      source: params.source,
      target: params.target,
      views: [activeView],
      label: ''
    });
  }, [addEdge, activeView]);

  // Drag over handler for HTML5 drag-and-drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler to place node on coordinates
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !reactFlowInstance) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const dataStr = event.dataTransfer.getData('application/reactflow-item');
    
    if (!dataStr) return;
    
    try {
      const item: BlockLibraryItem = JSON.parse(dataStr);
      
      // Calculate coordinates relative to flow viewport zoom & pan
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

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
          positions: {}
        }
      });
    } catch (err) {
      console.error("Failed to add node via drop:", err);
    }
  }, [reactFlowInstance, activeView, addNode]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      {activeView === 'system-alpha' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-50 text-amber-800 border border-amber-200 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider z-10 shadow-sm pointer-events-none">
          External Software Layer — Not inside physical wearable device
        </div>
      )}
      <ReactFlow
        nodes={viewNodes}
        edges={viewEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        fitView
      >
        <Background gap={14} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} className="bg-white border border-gray-200 rounded shadow-sm text-slate-700" />
        <MiniMap zoomable pannable nodeColor="#cbd5e1" className="border border-gray-200 rounded shadow-sm" />
      </ReactFlow>
    </div>
  );
};

export const BlueprintCanvas: React.FC = () => {
  return (
    <div className="flex-1 h-full min-h-0 bg-slate-50 flex flex-col relative overflow-hidden">
      <ReactFlowProvider>
        <BlueprintCanvasContent />
      </ReactFlowProvider>
    </div>
  );
};
