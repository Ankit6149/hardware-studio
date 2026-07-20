'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  Connection, Node, Edge, NodeChange, BackgroundVariant,
  Handle, Position, NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../../store/projectStore';

const STATE_TYPE_COLORS: Record<string, string> = {
  Initial: '#22c55e',
  Normal: '#3b82f6',
  Power: '#f59e0b',
  Charging: '#06b6d4',
  Fault: '#ef4444',
  Debug: '#8b5cf6',
  Final: '#6b7280',
};

function FirmwareStateNode({ data, selected }: NodeProps) {
  const d = data as { label: string; stateType: string; description: string };
  const color = STATE_TYPE_COLORS[d.stateType] || '#6b7280';
  const isInitial = d.stateType === 'Initial';
  const isFinal = d.stateType === 'Final';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}20, ${color}08)`,
      border: selected ? `2px solid ${color}` : `2px solid ${color}60`,
      borderRadius: isFinal ? '50%' : isInitial ? 12 : 8,
      padding: isInitial ? '10px 16px' : '8px 14px',
      minWidth: isFinal ? 60 : 80,
      textAlign: 'center',
      boxShadow: selected ? `0 0 0 2px ${color}30` : '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color, width: 6, height: 6 }} />
      <div style={{ fontSize: 9, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {d.stateType}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{d.label}</div>
      {d.description && <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{d.description}</div>}
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = { firmwareState: FirmwareStateNode };

interface Props {
  onStateSelect: (id: string | null) => void;
  onTransitionSelect: (id: string | null) => void;
  selectedStateId: string | null;
}

export const FirmwareStateMachineCanvas: React.FC<Props> = ({ onStateSelect, onTransitionSelect, selectedStateId }) => {
  const store = useProjectStore();
  const firmwareStates = store.firmwareStates || [];
  const firmwareTransitions = store.firmwareTransitions || [];

  const flowNodes: Node[] = useMemo(() => firmwareStates.map(s => ({
    id: s.id,
    type: 'firmwareState',
    position: { x: s.x, y: s.y },
    data: { label: s.name, stateType: s.type, description: s.description || '' },
    selected: s.id === selectedStateId,
  })), [firmwareStates, selectedStateId]);

  const flowEdges: Edge[] = useMemo(() => firmwareTransitions.map(t => {
    const color = STATE_TYPE_COLORS[firmwareStates.find(s => s.id === t.targetStateId)?.type || ''] || '#94a3b8';
    return {
      id: t.id,
      source: t.sourceStateId,
      target: t.targetStateId,
      label: `${t.event}${t.condition ? ` [${t.condition}]` : ''}${t.action ? ` / ${t.action}` : ''}`,
      animated: true,
      style: { stroke: color, strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: '#475569' },
      markerEnd: { type: 'arrowclosed' as const, color },
    };
  }), [firmwareTransitions, firmwareStates]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type === 'position' && change.position && !change.dragging) {
        store.executeProjectCommand('MOVE_STATE', 'Move state', () =>
          store.updateFirmwareState(change.id, { x: change.position!.x, y: change.position!.y })
        );
      }
    }
  }, [store]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      store.executeProjectCommand('ADD_TRANSITION', 'Add transition', () =>
        store.addFirmwareTransition({
          sourceStateId: connection.source!,
          targetStateId: connection.target!,
          event: 'event',
        })
      );
    }
  }, [store]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={flowNodes} edges={flowEdges}
        onNodesChange={onNodesChange} onConnect={onConnect}
        onNodeClick={(_, n) => { onStateSelect(n.id); onTransitionSelect(null); }}
        onEdgeClick={(_, e) => { onTransitionSelect(e.id); onStateSelect(null); }}
        onPaneClick={() => { onStateSelect(null); onTransitionSelect(null); }}
        nodeTypes={nodeTypes} fitView snapToGrid snapGrid={[10, 10]}
        style={{ background: '#fafbfc' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={n => STATE_TYPE_COLORS[(n.data as { stateType?: string })?.stateType || ''] || '#6b7280'} />
      </ReactFlow>
    </div>
  );
};
