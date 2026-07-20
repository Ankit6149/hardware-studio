'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ProductRequirement } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export const ProductRequirementsPanel: React.FC = () => {
  const store = useProjectStore();
  const requirements = store.requirements || [];
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<ProductRequirement['type']>('Functional');
  const [priority, setPriority] = useState<ProductRequirement['priority']>('Medium');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.executeProjectCommand('ADD_REQUIREMENT', `Add requirement: ${title}`, () =>
      store.addRequirement({
        title, description: desc, type, priority, status: 'Draft',
        acceptanceCriteria: [], linkedArchitectureNodeIds: [],
        linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], risks: []
      })
    );
    setTitle(''); setDesc(''); setShowForm(false);
  };

  const priorityColor: Record<string, string> = {
    Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#94a3b8'
  };

  return (
    <div style={{ padding: 8, fontSize: 12, overflow: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Requirements</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: 8, padding: 8, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12, marginBottom: 4 }} />
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)}
            style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, minHeight: 36, marginBottom: 4, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <select value={type} onChange={e => setType(e.target.value as ProductRequirement['type'])}
              style={{ flex: 1, padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
              {['Functional', 'Electrical', 'Mechanical', 'Firmware', 'Safety', 'Manufacturing', 'Validation'].map(t =>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value as ProductRequirement['priority'])}
              style={{ flex: 1, padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
              {['Critical', 'High', 'Medium', 'Low'].map(p =>
                <option key={p} value={p}>{p}</option>
              )}
            </select>
          </div>
          <button type="submit" style={{ padding: '4px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
            Add Requirement
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {requirements.map(req => (
          <div key={req.id} style={{ padding: '6px 8px', background: 'white', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{req.title}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 9, padding: '1px 4px', background: '#f1f5f9', borderRadius: 3, color: '#64748b' }}>{req.type}</span>
                  <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, color: 'white', background: priorityColor[req.priority] || '#94a3b8' }}>{req.priority}</span>
                  <span style={{ fontSize: 9, padding: '1px 4px', background: '#f1f5f9', borderRadius: 3, color: '#64748b' }}>{req.status}</span>
                </div>
              </div>
              <button onClick={() => store.executeProjectCommand('DELETE_REQ', `Delete req`, () => store.deleteRequirement(req.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {requirements.length === 0 && (
          <div style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center', padding: 16 }}>No requirements yet</div>
        )}
      </div>
    </div>
  );
};
