'use client';

import React, { useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ProductArchitectureCanvas } from './ProductArchitectureCanvas';
import { ProductInspector } from './ProductInspector';
import { ProductRequirementsPanel } from './ProductRequirementsPanel';
import { validateArchitectureGraph } from '../../lib/product/productGraph';
import { Plus, Undo2, Redo2, ZoomIn, ShieldAlert, Trash2 } from 'lucide-react';

interface ProductStudioProps {
  initialMode?: string;
}

export const ProductStudio: React.FC<ProductStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  const architectureNodes = store.architectureNodes || [];
  const architectureConnections = store.architectureConnections || [];
  const requirements = store.requirements || [];

  const warnings = validateArchitectureGraph(architectureNodes, architectureConnections, requirements);

  const handleAddBlock = useCallback(() => {
    store.executeProjectCommand('ADD_ARCHITECTURE_NODE', 'Add architecture block', () =>
      store.addArchitectureNode({
        name: `Block ${architectureNodes.length + 1}`,
        category: 'Processing',
        description: '',
        status: 'MVP',
        x: 150 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        width: 120,
        height: 60,
        linkedRequirementIds: [],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
      })
    );
  }, [store, architectureNodes.length]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      store.executeProjectCommand('DELETE_NODE', 'Delete architecture block', () => {
        // Remove connections referencing this node
        const conns = store.architectureConnections || [];
        conns.filter(c => c.sourceNodeId === selectedNodeId || c.targetNodeId === selectedNodeId)
          .forEach(c => store.deleteArchitectureConnection(c.id));
        store.deleteArchitectureNode(selectedNodeId);
      });
      setSelectedNodeId(null);
    } else if (selectedConnectionId) {
      store.executeProjectCommand('DELETE_CONN', 'Delete connection', () =>
        store.deleteArchitectureConnection(selectedConnectionId)
      );
      setSelectedConnectionId(null);
    }
  }, [selectedNodeId, selectedConnectionId, store]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        borderBottom: '1px solid #e2e8f0', background: 'white', flexShrink: 0
      }}>
        <button onClick={handleAddBlock} style={toolBtnStyle} title="Add Block">
          <Plus size={14} /> <span style={{ fontSize: 11 }}>Add Block</span>
        </button>
        <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
        <button onClick={handleDeleteSelected} style={toolBtnStyle} title="Delete Selected"
          disabled={!selectedNodeId && !selectedConnectionId}>
          <Trash2 size={14} />
        </button>
        <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
        <button onClick={() => store.undoProjectCommand()} style={toolBtnStyle} title="Undo">
          <Undo2 size={14} />
        </button>
        <button onClick={() => store.redoProjectCommand()} style={toolBtnStyle} title="Redo">
          <Redo2 size={14} />
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowWarnings(!showWarnings)} style={{
          ...toolBtnStyle,
          color: warnings.length > 0 ? '#f59e0b' : '#94a3b8',
        }}>
          <ShieldAlert size={14} />
          <span style={{ fontSize: 11 }}>{warnings.length}</span>
        </button>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Requirements */}
        <div style={{ width: 240, borderRight: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc' }}>
          <ProductRequirementsPanel />
        </div>

        {/* Center: Canvas */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <ProductArchitectureCanvas
            onNodeSelect={setSelectedNodeId}
            onConnectionSelect={setSelectedConnectionId}
            selectedNodeId={selectedNodeId}
          />

          {/* Warnings overlay */}
          {showWarnings && warnings.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              maxHeight: 200, overflow: 'auto', background: 'white',
              border: '1px solid #fbbf24', borderRadius: 8, padding: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#92400e', marginBottom: 6 }}>
                Architecture Warnings ({warnings.length})
              </div>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: w.severity === 'Error' ? '#dc2626' : '#d97706', padding: '3px 0', borderBottom: '1px solid #fef3c7' }}>
                  [{w.severity}] {w.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Inspector */}
        <div style={{ width: 260, borderLeft: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc' }}>
          <ProductInspector
            selectedNodeId={selectedNodeId}
            selectedConnectionId={selectedConnectionId}
          />
        </div>
      </div>
    </div>
  );
};

const toolBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
  background: 'none', border: '1px solid #e2e8f0', borderRadius: 4,
  cursor: 'pointer', color: '#475569', fontSize: 12
};
