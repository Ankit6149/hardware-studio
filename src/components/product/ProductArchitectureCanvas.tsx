'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeChange,
  applyNodeChanges,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../../store/projectStore';
import { ProductArchitectureNode } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  Input: '#3b82f6',
  Processing: '#8b5cf6',
  Power: '#f59e0b',
  Communication: '#06b6d4',
  Feedback: '#10b981',
  Mechanical: '#6b7280',
  Firmware: '#ec4899',
  Safety: '#ef4444',
  Manufacturing: '#84cc16',
};

const STATUS_BORDER: Record<string, string> = {
  MVP: '2px solid #22c55e',
  Later: '2px dashed #f59e0b',
  Future: '2px dotted #94a3b8',
};

/** Custom node for architecture blocks */
function ArchitectureBlockNode({ data, selected }: NodeProps) {
  const d = data as { label: string; category: string; status: string; description: string };
  const color = CATEGORY_COLORS[d.category] || '#6b7280';

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: selected ? `2px solid ${color}` : (STATUS_BORDER[d.status] || '1px solid #d1d5db'),
        borderRadius: 8,
        padding: '8px 12px',
        minWidth: 120,
        boxShadow: selected ? `0 0 0 2px ${color}40` : '0 1px 3px rgba(0,0,0,0.08)',
        cursor: 'grab',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, width: 8, height: 8 }} />
      <div style={{ fontSize: 10, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {d.category}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{d.label}</div>
      {d.description && (
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.description}
        </div>
      )}
      <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>
        {d.status}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { architectureBlock: ArchitectureBlockNode };

const CONNECTION_TYPE_COLORS: Record<string, string> = {
  Data: '#3b82f6',
  Power: '#f59e0b',
  Control: '#8b5cf6',
  Mechanical: '#6b7280',
  Wireless: '#06b6d4',
  Firmware: '#ec4899',
  Safety: '#ef4444',
};

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

  // Convert architecture nodes to ReactFlow nodes
  const flowNodes: Node[] = useMemo(() => {
    return architectureNodes.map((node: ProductArchitectureNode) => ({
      id: node.id,
      type: 'architectureBlock',
      position: { x: node.x, y: node.y },
      data: {
        label: node.name,
        category: node.category,
        status: node.status,
        description: node.description,
      },
      selected: node.id === selectedNodeId,
    }));
  }, [architectureNodes, selectedNodeId]);

  // Convert architecture connections to ReactFlow edges
  const flowEdges: Edge[] = useMemo(() => {
    return architectureConnections.map(conn => ({
      id: conn.id,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      label: conn.name || conn.type,
      type: 'default',
      animated: conn.type === 'Data' || conn.type === 'Wireless',
      style: {
        stroke: CONNECTION_TYPE_COLORS[conn.type] || '#94a3b8',
        strokeWidth: conn.type === 'Power' ? 2.5 : 1.5,
      },
      labelStyle: { fontSize: 10, fill: '#64748b' },
      markerEnd: conn.direction === 'Forward' ? { type: 'arrowclosed' as const, color: CONNECTION_TYPE_COLORS[conn.type] || '#94a3b8' } : undefined,
    }));
  }, [architectureConnections]);

  const onNodeDragStart = useCallback((_event: any, _node: any) => {
    store.beginCommand('MOVE_ARCHITECTURE_NODE', 'Move architecture block');
  }, [store]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Handle drag end to persist positions via commitCommand
    for (const change of changes) {
      if (change.type === 'position' && change.position && !change.dragging) {
        // Update the architecture node position as a transient preview, then commit
        const updated = (store.architectureNodes || []).map(n =>
          n.id === change.id ? { ...n, x: change.position!.x, y: change.position!.y } : n
        );
        store.updateTransientPreview({ architectureNodes: updated });
        store.commitCommand();
      }
    }
  }, [store]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.source !== connection.target) {
      store.executeProjectCommand(
        'ADD_ARCHITECTURE_CONNECTION',
        'Connect architecture blocks',
        () => store.addArchitectureConnection({
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          type: 'Data',
          direction: 'Forward',
        })
      );
    }
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
    <div style={{ width: '100%', height: '100%', background: '#fafbfc' }}>
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
        defaultEdgeOptions={{ type: 'default' }}
        style={{ background: '#fafbfc' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const cat = (n.data as { category?: string })?.category;
            return CATEGORY_COLORS[cat || ''] || '#6b7280';
          }}
          style={{ border: '1px solid #e2e8f0' }}
        />
      </ReactFlow>
    </div>
  );
};
