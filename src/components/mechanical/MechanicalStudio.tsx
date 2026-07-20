'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { MechanicalCanvas } from './MechanicalCanvas';
import { MechanicalInspector } from './MechanicalInspector';
import { Mechanical3DView } from './Mechanical3DView';
import { validateMechanicalLayout } from '../../lib/mechanical/mechanicalValidation';
import { Square, Circle, MousePointer, Move, Undo2, Redo2, Trash2, ShieldAlert, Lock, EyeOff } from 'lucide-react';

type ToolMode = 'select' | 'pan' | 'rect' | 'circle' | 'polygon';

interface MechanicalStudioProps {
  initialMode?: string;
}

export const MechanicalStudio: React.FC<MechanicalStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolMode>('select');
  const [showWarnings, setShowWarnings] = useState(false);
  const [studioMode, setStudioMode] = useState<'canvas' | 'assembly' | '3d-preview'>(
    initialMode === 'assembly' ? 'assembly' : initialMode === '3d-preview' ? '3d-preview' : 'canvas'
  );

  const mechanicalObjects = store.mechanicalObjects || [];
  const assemblyLayers = store.assemblyLayers || [];
  const warnings = validateMechanicalLayout(mechanicalObjects);

  const tools: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'select', icon: <MousePointer size={14} />, label: 'Select' },
    { mode: 'pan', icon: <Move size={14} />, label: 'Pan' },
    { mode: 'rect', icon: <Square size={14} />, label: 'Rectangle' },
    { mode: 'circle', icon: <Circle size={14} />, label: 'Circle' },
  ];

  const totalThickness = assemblyLayers.reduce((sum, l) => {
    const match = l.notes?.match(/Thickness\s*([\d.]+)/i);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  if (studioMode === '3d-preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <button onClick={() => setStudioMode('canvas')} style={{ ...tabStyle, fontWeight: 400 }}>Canvas</button>
          <button onClick={() => setStudioMode('assembly')} style={{ ...tabStyle, fontWeight: 400 }}>Assembly Stack</button>
          <button onClick={() => setStudioMode('3d-preview')} style={{ ...tabStyle, fontWeight: 700, borderBottom: '2px solid #3b82f6' }}>3D Preview</button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Mechanical3DView />
        </div>
      </div>
    );
  }

  if (studioMode === 'assembly') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <button onClick={() => setStudioMode('canvas')} style={{ ...tabStyle, fontWeight: 400 }}>Canvas</button>
          <button onClick={() => setStudioMode('assembly')} style={{ ...tabStyle, fontWeight: 700, borderBottom: '2px solid #3b82f6' }}>Assembly Stack</button>
          <button onClick={() => setStudioMode('3d-preview')} style={{ ...tabStyle, fontWeight: 400 }}>3D Preview</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Total: {totalThickness.toFixed(1)}mm</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Assembly Layers</div>
            <button onClick={() => store.executeProjectCommand('ADD_LAYER', 'Add layer', () =>
              store.addAssemblyLayer({
                name: `Layer ${assemblyLayers.length + 1}`, order: assemblyLayers.length + 1,
                layerType: 'Casing', material: 'Aluminum', fasteningMethod: 'Screw Thread',
                inspectionNote: '', notes: 'Thickness 1mm'
              })
            )} style={toolBtnStyle}>
              + Add Layer
            </button>
          </div>
          {assemblyLayers.sort((a, b) => a.order - b.order).map((layer, i) => (
            <div key={layer.id} style={{
              padding: 12, marginBottom: 8, background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start'
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#94a3b8', minWidth: 24 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <input value={layer.name} onChange={e => store.updateAssemblyLayer(layer.id, { name: e.target.value })}
                  style={{ fontWeight: 600, fontSize: 13, border: 'none', outline: 'none', width: '100%', color: '#1e293b' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
                  <input placeholder="Material" value={layer.material} onChange={e => store.updateAssemblyLayer(layer.id, { material: e.target.value })}
                    style={{ padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  <select value={layer.fasteningMethod} onChange={e => store.updateAssemblyLayer(layer.id, { fasteningMethod: e.target.value })}
                    style={{ padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
                    {['Screw Thread', 'Snap Fit', 'Adhesive', 'Press Fit', 'Gasket', 'Welded', 'Soldered'].map(f =>
                      <option key={f} value={f}>{f}</option>
                    )}
                  </select>
                </div>
                <input placeholder="Inspection note" value={layer.inspectionNote} onChange={e => store.updateAssemblyLayer(layer.id, { inspectionNote: e.target.value })}
                  style={{ width: '100%', padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {i > 0 && <button onClick={() => {
                  const prev = assemblyLayers.sort((a, b) => a.order - b.order)[i - 1];
                  store.updateAssemblyLayer(layer.id, { order: prev.order });
                  store.updateAssemblyLayer(prev.id, { order: layer.order });
                }} style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>↑</button>}
                {i < assemblyLayers.length - 1 && <button onClick={() => {
                  const next = assemblyLayers.sort((a, b) => a.order - b.order)[i + 1];
                  store.updateAssemblyLayer(layer.id, { order: next.order });
                  store.updateAssemblyLayer(next.id, { order: layer.order });
                }} style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>↓</button>}
                <button onClick={() => store.executeProjectCommand('DEL_LAYER', 'Delete layer', () => store.deleteAssemblyLayer(layer.id))}
                  style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white', flexShrink: 0 }}>
        <button onClick={() => setStudioMode('canvas')} style={{ ...tabStyle, fontWeight: 700, borderBottom: '2px solid #3b82f6' }}>Canvas</button>
        <button onClick={() => setStudioMode('assembly')} style={{ ...tabStyle, fontWeight: 400 }}>Assembly</button>
        <button onClick={() => setStudioMode('3d-preview')} style={{ ...tabStyle, fontWeight: 400 }}>3D Preview</button>
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
        {tools.map(t => (
          <button key={t.mode} onClick={() => setTool(t.mode)}
            style={{ ...toolBtnStyle, background: tool === t.mode ? '#e0e7ff' : 'transparent', color: tool === t.mode ? '#3b82f6' : '#475569' }}
            title={t.label}>
            {t.icon}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
        <button onClick={() => {
          if (selectedObjectId) store.executeProjectCommand('DEL_OBJ', 'Delete object', () => {
            store.deleteMechanicalObject(selectedObjectId);
            setSelectedObjectId(null);
          });
        }} style={toolBtnStyle} disabled={!selectedObjectId} title="Delete">
          <Trash2 size={14} />
        </button>
        <button onClick={() => store.undoProjectCommand()} style={toolBtnStyle} title="Undo"><Undo2 size={14} /></button>
        <button onClick={() => store.redoProjectCommand()} style={toolBtnStyle} title="Redo"><Redo2 size={14} /></button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{mechanicalObjects.length} objects</span>
        <button onClick={() => setShowWarnings(!showWarnings)} style={{ ...toolBtnStyle, color: warnings.length > 0 ? '#f59e0b' : '#94a3b8' }}>
          <ShieldAlert size={14} /> <span style={{ fontSize: 11 }}>{warnings.length}</span>
        </button>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Object tree */}
        <div style={{ width: 200, borderRight: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc', padding: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b', marginBottom: 6 }}>Objects</div>
          {mechanicalObjects.map(obj => (
            <div key={obj.id} onClick={() => setSelectedObjectId(obj.id)}
              style={{
                padding: '4px 6px', fontSize: 11, borderRadius: 4, cursor: 'pointer', marginBottom: 2,
                background: obj.id === selectedObjectId ? '#e0e7ff' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</span>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>{obj.shape}</span>
              {obj.locked ? <Lock size={10} color="#94a3b8" /> : null}
              {!obj.visible ? <EyeOff size={10} color="#94a3b8" /> : null}
            </div>
          ))}
        </div>

        {/* Center: Canvas */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MechanicalCanvas selectedObjectId={selectedObjectId} onSelectObject={setSelectedObjectId} tool={tool} />
          {showWarnings && warnings.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12, maxHeight: 180, overflow: 'auto',
              background: 'white', border: '1px solid #fbbf24', borderRadius: 8, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10
            }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: w.severity === 'Error' ? '#dc2626' : '#d97706', padding: '2px 0' }}>
                  [{w.severity}] {w.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Inspector */}
        <div style={{ width: 250, borderLeft: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc' }}>
          <MechanicalInspector selectedObjectId={selectedObjectId} />
        </div>
      </div>
    </div>
  );
};

const toolBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 2, padding: '4px 6px',
  background: 'none', border: '1px solid transparent', borderRadius: 4, cursor: 'pointer', color: '#475569'
};
const tabStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: '#475569'
};
