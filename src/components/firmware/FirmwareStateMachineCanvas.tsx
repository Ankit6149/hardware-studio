'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  Connection, Node, Edge, NodeChange, BackgroundVariant,
  Handle, Position, NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../../store/projectStore';
import type { FirmwareState, FirmwareTransition } from '../../types';

const EMPTY_FIRMWARE_STATES: FirmwareState[] = [];
const EMPTY_FIRMWARE_TRANSITIONS: FirmwareTransition[] = [];

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
  const color = STATE_TYPE_COLORS[d.stateType] || '#475569';
  const isInitial = d.stateType === 'Initial';
  const isFinal = d.stateType === 'Final';

  return (
    <div style={{
      background: '#ffffff',
      border: selected ? `2.5px solid ${color}` : `1.5px solid ${color}`,
      borderRadius: isFinal ? 20 : isInitial ? 12 : 8,
      padding: '10px 14px',
      minWidth: isFinal ? 70 : 130,
      textAlign: 'center',
      boxShadow: selected ? `0 0 0 3px ${color}30, 0 4px 12px rgba(0,0,0,0.08)` : '0 2px 6px rgba(0,0,0,0.05)',
      cursor: 'grab',
      transition: 'all 0.15s ease-in-out',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: color, width: 9, height: 9, border: '2px solid white' }} />
      <Handle type="target" position={Position.Top} id="f-top" style={{ background: color, width: 9, height: 9, border: '2px solid white' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 9, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${color}15`, padding: '2px 6px', borderRadius: 4 }}>
          {d.stateType}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4, fontFamily: 'sans-serif' }}>{d.label}</div>
      {d.description && <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{d.description}</div>}
      <Handle type="source" position={Position.Right} style={{ background: color, width: 9, height: 9, border: '2px solid white' }} />
      <Handle type="source" position={Position.Bottom} id="f-bottom" style={{ background: color, width: 9, height: 9, border: '2px solid white' }} />
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
  const firmwareStates = useProjectStore((state) => state.firmwareStates ?? EMPTY_FIRMWARE_STATES);
  const firmwareTransitions = useProjectStore((state) => state.firmwareTransitions ?? EMPTY_FIRMWARE_TRANSITIONS);
  const beginCommand = useProjectStore((state) => state.beginCommand);
  const updateTransientPreview = useProjectStore((state) => state.updateTransientPreview);
  const commitCommand = useProjectStore((state) => state.commitCommand);
  const cancelCommand = useProjectStore((state) => state.cancelCommand);
  const executeProjectCommand = useProjectStore((state) => state.executeProjectCommand);
  const addFirmwareTransition = useProjectStore((state) => state.addFirmwareTransition);
  const draggingRef = useRef(false);
  const dragChangedRef = useRef(false);

  const flowNodes: Node[] = useMemo(() => firmwareStates.map((state) => ({
    id: state.id,
    type: 'firmwareState',
    position: { x: state.x, y: state.y },
    data: { label: state.name, stateType: state.type, description: state.description || '' },
    selected: state.id === selectedStateId,
  })), [firmwareStates, selectedStateId]);

  const flowEdges: Edge[] = useMemo(() => firmwareTransitions.map((transition) => {
    const color = STATE_TYPE_COLORS[firmwareStates.find((state) => state.id === transition.targetStateId)?.type || ''] || '#94a3b8';
    return {
      id: transition.id,
      source: transition.sourceStateId,
      target: transition.targetStateId,
      label: `${transition.event}${transition.condition ? ` [${transition.condition}]` : ''}${transition.action ? ` / ${transition.action}` : ''}`,
      animated: true,
      style: { stroke: color, strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: '#475569' },
      markerEnd: { type: 'arrowclosed' as const, color },
    };
  }), [firmwareTransitions, firmwareStates]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !draggingRef.current) return;
      cancelCommand();
      draggingRef.current = false;
      dragChangedRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelCommand]);

  const onNodeDragStart = useCallback(() => {
    draggingRef.current = true;
    dragChangedRef.current = false;
    beginCommand('MOVE_STATE', 'Move firmware state');
  }, [beginCommand]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (!draggingRef.current) return;

    let updatedStates = useProjectStore.getState().firmwareStates ?? EMPTY_FIRMWARE_STATES;
    let changed = false;

    for (const change of changes) {
      if (change.type !== 'position' || !change.position) continue;
      changed = true;
      updatedStates = updatedStates.map((state) =>
        state.id === change.id ? { ...state, x: change.position!.x, y: change.position!.y } : state
      );
    }

    if (!changed) return;
    dragChangedRef.current = true;
    updateTransientPreview({ firmwareStates: updatedStates });
  }, [updateTransientPreview]);

  const onNodeDragStop = useCallback(() => {
    if (!draggingRef.current) return;
    if (dragChangedRef.current) commitCommand();
    else cancelCommand();
    draggingRef.current = false;
    dragChangedRef.current = false;
  }, [cancelCommand, commitCommand]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      executeProjectCommand('ADD_TRANSITION', 'Add transition', () =>
        addFirmwareTransition({
          sourceStateId: connection.source!,
          targetStateId: connection.target!,
          event: 'event',
        })
      );
    }
  }, [addFirmwareTransition, executeProjectCommand]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={flowNodes} edges={flowEdges}
        onNodesChange={onNodesChange} onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => { onStateSelect(node.id); onTransitionSelect(null); }}
        onEdgeClick={(_, edge) => { onTransitionSelect(edge.id); onStateSelect(null); }}
        onPaneClick={() => { onStateSelect(null); onTransitionSelect(null); }}
        nodeTypes={nodeTypes} fitView snapToGrid snapGrid={[10, 10]}
        style={{ background: '#fafbfc' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={node => STATE_TYPE_COLORS[(node.data as { stateType?: string })?.stateType || ''] || '#6b7280'} />
      </ReactFlow>
    </div>
  );
};
