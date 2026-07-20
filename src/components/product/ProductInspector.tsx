'use client';

import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ProductArchitectureNode, ProductArchitectureConnection } from '../../types';

interface Props {
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
}

export const ProductInspector: React.FC<Props> = ({ selectedNodeId, selectedConnectionId }) => {
  const store = useProjectStore();
  const architectureNodes = store.architectureNodes || [];
  const architectureConnections = store.architectureConnections || [];
  const requirements = store.requirements || [];
  const boardComponents = store.boardComponents || [];
  const firmwareModules = store.firmwareModules || [];
  const validationTests = store.validationTests || [];

  const selectedNode = selectedNodeId ? architectureNodes.find(n => n.id === selectedNodeId) : null;
  const selectedConn = selectedConnectionId ? architectureConnections.find(c => c.id === selectedConnectionId) : null;

  if (!selectedNode && !selectedConn) {
    return (
      <div style={{ padding: 16, color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
        Select a block or connection to inspect
      </div>
    );
  }

  if (selectedNode) {
    const linkedReqs = requirements.filter(r => selectedNode.linkedRequirementIds.includes(r.id));
    const linkedComps = boardComponents.filter(c => selectedNode.linkedComponentIds.includes(c.id));
    const linkedFw = firmwareModules.filter(m => selectedNode.linkedFirmwareModuleIds.includes(m.id));
    const linkedTests = validationTests.filter(t => selectedNode.linkedTestIds.includes(t.id));

    return (
      <div style={{ padding: 12, fontSize: 12, overflow: 'auto', height: '100%' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1e293b' }}>Block Inspector</div>

        <label style={labelStyle}>Name</label>
        <input
          style={inputStyle}
          value={selectedNode.name}
          onChange={e => store.executeProjectCommand('UPDATE_NODE', `Rename block`, () =>
            store.updateArchitectureNode(selectedNode.id, { name: e.target.value })
          )}
        />

        <label style={labelStyle}>Category</label>
        <select
          style={inputStyle}
          value={selectedNode.category}
          onChange={e => store.executeProjectCommand('UPDATE_NODE', `Change category`, () =>
            store.updateArchitectureNode(selectedNode.id, { category: e.target.value as ProductArchitectureNode['category'] })
          )}
        >
          {['Input', 'Processing', 'Power', 'Communication', 'Feedback', 'Mechanical', 'Firmware', 'Safety', 'Manufacturing'].map(c =>
            <option key={c} value={c}>{c}</option>
          )}
        </select>

        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 48, resize: 'vertical' }}
          value={selectedNode.description}
          onChange={e => store.updateArchitectureNode(selectedNode.id, { description: e.target.value })}
        />

        <label style={labelStyle}>Status</label>
        <select
          style={inputStyle}
          value={selectedNode.status}
          onChange={e => store.executeProjectCommand('UPDATE_NODE', `Change status`, () =>
            store.updateArchitectureNode(selectedNode.id, { status: e.target.value as ProductArchitectureNode['status'] })
          )}
        >
          {['MVP', 'Later', 'Future'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={labelStyle}>Position</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>X: {Math.round(selectedNode.x)}</span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Y: {Math.round(selectedNode.y)}</span>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b', marginBottom: 4 }}>
            Linked Requirements ({linkedReqs.length})
          </div>
          {linkedReqs.map(r => (
            <div key={r.id} style={{ fontSize: 10, color: '#475569', padding: '2px 0' }}>• {r.title}</div>
          ))}
          <select
            style={{ ...inputStyle, marginTop: 4 }}
            value=""
            onChange={e => {
              if (e.target.value) {
                store.executeProjectCommand('LINK_REQ', 'Link requirement', () => {
                  const ids = [...selectedNode.linkedRequirementIds, e.target.value];
                  store.updateArchitectureNode(selectedNode.id, { linkedRequirementIds: ids });
                });
              }
            }}
          >
            <option value="">+ Link requirement...</option>
            {requirements.filter(r => !selectedNode.linkedRequirementIds.includes(r.id)).map(r =>
              <option key={r.id} value={r.id}>{r.title}</option>
            )}
          </select>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b' }}>Components ({linkedComps.length})</div>
          {linkedComps.map(c => <div key={c.id} style={{ fontSize: 10, color: '#475569', padding: '2px 0' }}>• {c.componentName}</div>)}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b' }}>Firmware ({linkedFw.length})</div>
          {linkedFw.map(m => <div key={m.id} style={{ fontSize: 10, color: '#475569', padding: '2px 0' }}>• {m.name}</div>)}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b' }}>Tests ({linkedTests.length})</div>
          {linkedTests.map(t => <div key={t.id} style={{ fontSize: 10, color: '#475569', padding: '2px 0' }}>• {t.name} [{t.status}]</div>)}
        </div>
      </div>
    );
  }

  if (selectedConn) {
    return (
      <div style={{ padding: 12, fontSize: 12, overflow: 'auto', height: '100%' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1e293b' }}>Connection Inspector</div>

        <label style={labelStyle}>Name</label>
        <input style={inputStyle} value={selectedConn.name || ''} onChange={e =>
          store.updateArchitectureConnection(selectedConn.id, { name: e.target.value })
        } />

        <label style={labelStyle}>Type</label>
        <select style={inputStyle} value={selectedConn.type} onChange={e =>
          store.executeProjectCommand('UPDATE_CONN', 'Change connection type', () =>
            store.updateArchitectureConnection(selectedConn.id, { type: e.target.value as ProductArchitectureConnection['type'] })
          )
        }>
          {['Data', 'Power', 'Control', 'Mechanical', 'Wireless', 'Firmware', 'Safety'].map(t =>
            <option key={t} value={t}>{t}</option>
          )}
        </select>

        <label style={labelStyle}>Direction</label>
        <select style={inputStyle} value={selectedConn.direction} onChange={e =>
          store.updateArchitectureConnection(selectedConn.id, { direction: e.target.value as 'Forward' | 'Bidirectional' })
        }>
          <option value="Forward">Forward</option>
          <option value="Bidirectional">Bidirectional</option>
        </select>

        <label style={labelStyle}>Protocol</label>
        <input style={inputStyle} value={selectedConn.protocol || ''} onChange={e =>
          store.updateArchitectureConnection(selectedConn.id, { protocol: e.target.value })
        } />

        <label style={labelStyle}>Voltage</label>
        <input style={inputStyle} type="number" value={selectedConn.voltage ?? ''} onChange={e =>
          store.updateArchitectureConnection(selectedConn.id, { voltage: e.target.value ? parseFloat(e.target.value) : undefined })
        } />

        <label style={labelStyle}>Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 48 }} value={selectedConn.notes || ''} onChange={e =>
          store.updateArchitectureConnection(selectedConn.id, { notes: e.target.value })
        } />

        <button
          style={{ marginTop: 12, padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
          onClick={() => store.executeProjectCommand('DELETE_CONN', 'Delete connection', () =>
            store.deleteArchitectureConnection(selectedConn.id)
          )}
        >
          Delete Connection
        </button>
      </div>
    );
  }

  return null;
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 8, marginBottom: 2
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12, background: 'white', outline: 'none'
};
