'use client';

import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { MechanicalObject } from '../../types';

interface Props {
  selectedObjectId: string | null;
}

export const MechanicalInspector: React.FC<Props> = ({ selectedObjectId }) => {
  const store = useProjectStore();
  const mechanicalObjects = store.mechanicalObjects || [];
  const boards = store.boards || [];
  const obj = selectedObjectId ? mechanicalObjects.find(o => o.id === selectedObjectId) : null;

  if (!obj) {
    return <div style={{ padding: 16, color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>Select an object to inspect</div>;
  }

  const allTypes: MechanicalObject['type'][] = [
    'Outer Profile', 'Inner Profile', 'Board Zone', 'Battery Cavity', 'Connector Opening',
    'Button Opening', 'Sensor Window', 'Mounting Point', 'Antenna Keepout', 'Thermal Zone',
    'Seal Zone', 'Flex Bend Zone', 'Mechanical Keepout', 'Annotation'
  ];

  return (
    <div style={{ padding: 12, fontSize: 12, overflow: 'auto', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1e293b' }}>Object Inspector</div>

      <label style={labelStyle}>Name</label>
      <input style={inputStyle} value={obj.name}
        onChange={e => store.updateMechanicalObject(obj.id, { name: e.target.value })} />

      <label style={labelStyle}>Type</label>
      <select style={inputStyle} value={obj.type}
        onChange={e => store.executeProjectCommand('UPDATE_MECH', 'Change type', () =>
          store.updateMechanicalObject(obj.id, { type: e.target.value as MechanicalObject['type'] })
        )}>
        {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label style={labelStyle}>Shape</label>
      <select style={inputStyle} value={obj.shape}
        onChange={e => store.updateMechanicalObject(obj.id, { shape: e.target.value as MechanicalObject['shape'] })}>
        {['rect', 'circle', 'ellipse', 'polygon'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
        <div>
          <label style={labelStyle}>X (mm)</label>
          <input style={inputStyle} type="number" value={obj.xMm}
            onChange={e => store.executeProjectCommand('MOVE_MECH', 'Move', () =>
              store.updateMechanicalObject(obj.id, { xMm: parseFloat(e.target.value) || 0 })
            )} />
        </div>
        <div>
          <label style={labelStyle}>Y (mm)</label>
          <input style={inputStyle} type="number" value={obj.yMm}
            onChange={e => store.executeProjectCommand('MOVE_MECH', 'Move', () =>
              store.updateMechanicalObject(obj.id, { yMm: parseFloat(e.target.value) || 0 })
            )} />
        </div>
        {obj.shape !== 'circle' && (
          <>
            <div>
              <label style={labelStyle}>Width (mm)</label>
              <input style={inputStyle} type="number" value={obj.widthMm ?? ''}
                onChange={e => store.updateMechanicalObject(obj.id, { widthMm: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={labelStyle}>Height (mm)</label>
              <input style={inputStyle} type="number" value={obj.heightMm ?? ''}
                onChange={e => store.updateMechanicalObject(obj.id, { heightMm: parseFloat(e.target.value) || 0 })} />
            </div>
          </>
        )}
        {obj.shape === 'circle' && (
          <div>
            <label style={labelStyle}>Radius (mm)</label>
            <input style={inputStyle} type="number" value={obj.radiusMm ?? ''}
              onChange={e => store.updateMechanicalObject(obj.id, { radiusMm: parseFloat(e.target.value) || 0 })} />
          </div>
        )}
        <div>
          <label style={labelStyle}>Rotation (°)</label>
          <input style={inputStyle} type="number" value={obj.rotationDeg}
            onChange={e => store.updateMechanicalObject(obj.id, { rotationDeg: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>

      <label style={labelStyle}>Material</label>
      <input style={inputStyle} value={obj.material || ''} placeholder="e.g., Aluminum, ABS"
        onChange={e => store.updateMechanicalObject(obj.id, { material: e.target.value })} />

      <label style={labelStyle}>Linked Board</label>
      <select style={inputStyle} value={obj.linkedBoardId || ''}
        onChange={e => store.executeProjectCommand('LINK_BOARD', 'Link board', () =>
          store.updateMechanicalObject(obj.id, { linkedBoardId: e.target.value || undefined })
        )}>
        <option value="">None</option>
        {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <label style={labelStyle}>Notes</label>
      <textarea style={{ ...inputStyle, minHeight: 48, resize: 'vertical' }} value={obj.notes || ''}
        onChange={e => store.updateMechanicalObject(obj.id, { notes: e.target.value })} />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={obj.locked}
            onChange={e => store.updateMechanicalObject(obj.id, { locked: e.target.checked })} />
          Locked
        </label>
        <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={obj.visible}
            onChange={e => store.updateMechanicalObject(obj.id, { visible: e.target.checked })} />
          Visible
        </label>
      </div>

      <button onClick={() => store.executeProjectCommand('DELETE_MECH', 'Delete object', () => store.deleteMechanicalObject(obj.id))}
        style={{ marginTop: 12, padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer', width: '100%' }}>
        Delete Object
      </button>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 6, marginBottom: 2 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12, background: 'white' };
