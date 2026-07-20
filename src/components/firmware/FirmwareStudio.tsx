'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { FirmwareStateMachineCanvas } from './FirmwareStateMachineCanvas';
import { FirmwareCodePreview } from './FirmwareCodePreview';
import { validateStateMachine } from '../../lib/firmware/firmwareValidation';
import { FirmwareState, FirmwareTransition, FirmwareModule } from '../../types';
import { Plus, Trash2, Undo2, Redo2, ShieldAlert } from 'lucide-react';

interface FirmwareStudioProps {
  initialMode?: string;
}

export const FirmwareStudio: React.FC<FirmwareStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const [mode, setMode] = useState<'modules' | 'state-machine' | 'hardware-map' | 'source'>(
    (initialMode === 'state-machine' || initialMode === 'hardware-map' || initialMode === 'source') ? initialMode : 'state-machine'
  );
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  const firmwareModules = store.firmwareModules || [];
  const firmwareStates = store.firmwareStates || [];
  const firmwareTransitions = store.firmwareTransitions || [];
  const boardComponents = store.boardComponents || [];
  const warnings = validateStateMachine(firmwareStates, firmwareTransitions);

  const selectedState = selectedStateId ? firmwareStates.find(s => s.id === selectedStateId) : null;
  const selectedTransition = selectedTransitionId ? firmwareTransitions.find(t => t.id === selectedTransitionId) : null;

  const handleAddState = () => {
    store.executeProjectCommand('ADD_STATE', 'Add state', () =>
      store.addFirmwareState({
        name: `State_${firmwareStates.length + 1}`,
        type: firmwareStates.length === 0 ? 'Initial' : 'Normal',
        x: 200 + Math.random() * 200, y: 100 + Math.random() * 200,
        entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [],
      })
    );
  };

  const tabs = [
    { id: 'modules' as const, label: 'Modules' },
    { id: 'state-machine' as const, label: 'State Machine' },
    { id: 'hardware-map' as const, label: 'Hardware Map' },
    { id: 'source' as const, label: 'Source Files' },
  ];

  if (mode === 'source') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)}
              style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        <FirmwareCodePreview />
      </div>
    );
  }

  if (mode === 'modules' || mode === 'hardware-map') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)}
              style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
              {mode === 'modules' ? 'Firmware Modules' : 'Hardware Mappings'}
            </div>
            <button onClick={() => store.executeProjectCommand('ADD_MODULE', 'Add module', () =>
              store.addFirmwareModule({
                name: `Module_${firmwareModules.length + 1}`, type: 'Driver', description: '',
                linkedArchitectureNodeIds: [], linkedComponentIds: [], linkedPinIds: [],
                linkedNetIds: [], linkedTestIds: [], dependencies: [], sourceFiles: [], status: 'Draft',
              })
            )} style={btnStyle}>
              <Plus size={12} /> Add Module
            </button>
          </div>
          {firmwareModules.map(mod => (
            <div key={mod.id} style={{ padding: 12, marginBottom: 8, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <input value={mod.name} onChange={e => store.updateFirmwareModule(mod.id, { name: e.target.value })}
                  style={{ fontWeight: 600, fontSize: 13, border: 'none', outline: 'none', flex: 1, color: '#1e293b' }} />
                <button onClick={() => store.executeProjectCommand('DEL_MODULE', 'Delete module', () => store.deleteFirmwareModule(mod.id))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <select value={mod.type} onChange={e => store.updateFirmwareModule(mod.id, { type: e.target.value as FirmwareModule['type'] })}
                  style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
                  {['Driver', 'Service', 'Communication', 'Power', 'Safety', 'Application', 'Test'].map(t =>
                    <option key={t} value={t}>{t}</option>
                  )}
                </select>
                <select value={mod.status} onChange={e => store.updateFirmwareModule(mod.id, { status: e.target.value as FirmwareModule['status'] })}
                  style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
                  {['Draft', 'Implemented', 'Needs Review', 'Verified'].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>
              {mode === 'hardware-map' && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>Linked Components</div>
                  <select value="" onChange={e => {
                    if (e.target.value) {
                      const ids = [...mod.linkedComponentIds, e.target.value];
                      store.updateFirmwareModule(mod.id, { linkedComponentIds: ids });
                    }
                  }} style={{ width: '100%', padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, marginTop: 2 }}>
                    <option value="">+ Link component...</option>
                    {boardComponents.filter(c => !mod.linkedComponentIds.includes(c.id)).map(c =>
                      <option key={c.id} value={c.id}>{c.referenceDesignator} — {c.componentName}</option>
                    )}
                  </select>
                  {mod.linkedComponentIds.map(cid => {
                    const comp = boardComponents.find(c => c.id === cid);
                    return comp ? (
                      <div key={cid} style={{ fontSize: 10, color: '#475569', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {comp.referenceDesignator} — {comp.componentName}</span>
                        <button onClick={() => store.updateFirmwareModule(mod.id, { linkedComponentIds: mod.linkedComponentIds.filter(id => id !== cid) })}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10 }}>×</button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <textarea placeholder="Description" value={mod.description}
                onChange={e => store.updateFirmwareModule(mod.id, { description: e.target.value })}
                style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, marginTop: 4, minHeight: 32, resize: 'vertical' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // State Machine mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setMode(t.id)}
            style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
            {t.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 8px' }} />
        <button onClick={handleAddState} style={btnStyle}><Plus size={12} /> Add State</button>
        <button onClick={() => {
          if (selectedStateId) store.executeProjectCommand('DEL_STATE', 'Delete state', () => { store.deleteFirmwareState(selectedStateId); setSelectedStateId(null); });
          if (selectedTransitionId) store.executeProjectCommand('DEL_TRANS', 'Delete transition', () => { store.deleteFirmwareTransition(selectedTransitionId); setSelectedTransitionId(null); });
        }} style={btnStyle} disabled={!selectedStateId && !selectedTransitionId}><Trash2 size={12} /></button>
        <button onClick={() => store.undoProjectCommand()} style={btnStyle}><Undo2 size={12} /></button>
        <button onClick={() => store.redoProjectCommand()} style={btnStyle}><Redo2 size={12} /></button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowWarnings(!showWarnings)} style={{ ...btnStyle, color: warnings.length > 0 ? '#f59e0b' : '#94a3b8' }}>
          <ShieldAlert size={12} /> {warnings.length}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Canvas */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <FirmwareStateMachineCanvas
            onStateSelect={setSelectedStateId}
            onTransitionSelect={setSelectedTransitionId}
            selectedStateId={selectedStateId}
          />
          {showWarnings && warnings.length > 0 && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, maxHeight: 160, overflow: 'auto', background: 'white', border: '1px solid #fbbf24', borderRadius: 8, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: w.severity === 'Error' ? '#dc2626' : '#d97706', padding: '2px 0' }}>
                  [{w.severity}] {w.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspector */}
        <div style={{ width: 260, borderLeft: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc', padding: 12 }}>
          {selectedState && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1e293b' }}>State Inspector</div>
              <label style={lbl}>Name</label>
              <input style={inp} value={selectedState.name} onChange={e => store.updateFirmwareState(selectedState.id, { name: e.target.value })} />
              <label style={lbl}>Type</label>
              <select style={inp} value={selectedState.type} onChange={e =>
                store.executeProjectCommand('UPDATE_STATE', 'Change state type', () =>
                  store.updateFirmwareState(selectedState.id, { type: e.target.value as FirmwareState['type'] })
                )
              }>
                {['Initial', 'Normal', 'Power', 'Charging', 'Fault', 'Debug', 'Final'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
              <label style={lbl}>Description</label>
              <textarea style={{ ...inp, minHeight: 36, resize: 'vertical' }} value={selectedState.description || ''}
                onChange={e => store.updateFirmwareState(selectedState.id, { description: e.target.value })} />
              <label style={lbl}>Entry Actions</label>
              <textarea style={{ ...inp, minHeight: 36 }} value={selectedState.entryActions.join('\n')}
                onChange={e => store.updateFirmwareState(selectedState.id, { entryActions: e.target.value.split('\n').filter(a => a.trim()) })}
                placeholder="One per line" />
              <label style={lbl}>Exit Actions</label>
              <textarea style={{ ...inp, minHeight: 36 }} value={selectedState.exitActions.join('\n')}
                onChange={e => store.updateFirmwareState(selectedState.id, { exitActions: e.target.value.split('\n').filter(a => a.trim()) })}
                placeholder="One per line" />
            </>
          )}
          {selectedTransition && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1e293b' }}>Transition Inspector</div>
              <label style={lbl}>Event</label>
              <input style={inp} value={selectedTransition.event}
                onChange={e => store.updateFirmwareTransition(selectedTransition.id, { event: e.target.value })} />
              <label style={lbl}>Condition</label>
              <input style={inp} value={selectedTransition.condition || ''} placeholder="Optional guard"
                onChange={e => store.updateFirmwareTransition(selectedTransition.id, { condition: e.target.value || undefined })} />
              <label style={lbl}>Action</label>
              <input style={inp} value={selectedTransition.action || ''} placeholder="Optional action"
                onChange={e => store.updateFirmwareTransition(selectedTransition.id, { action: e.target.value || undefined })} />
              <label style={lbl}>Priority</label>
              <input style={inp} type="number" value={selectedTransition.priority ?? ''}
                onChange={e => store.updateFirmwareTransition(selectedTransition.id, { priority: e.target.value ? parseInt(e.target.value) : undefined })} />
              <button onClick={() => store.executeProjectCommand('DEL_TRANS', 'Delete transition', () => {
                store.deleteFirmwareTransition(selectedTransition.id); setSelectedTransitionId(null);
              })} style={{ marginTop: 12, padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer', width: '100%' }}>
                Delete Transition
              </button>
            </>
          )}
          {!selectedState && !selectedTransition && (
            <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: 20 }}>Select a state or transition to inspect</div>
          )}
        </div>
      </div>
    </div>
  );
};

const tabStyle: React.CSSProperties = { background: 'none', border: 'none', padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: '#475569' };
const btnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', color: '#475569', fontSize: 11 };
const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 8, marginBottom: 2 };
const inp: React.CSSProperties = { width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12, background: 'white' };
