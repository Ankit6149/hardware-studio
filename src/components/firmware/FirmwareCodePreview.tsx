'use client';

import React, { useMemo } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { generateFirmwareSource } from '../../lib/firmware/firmwareCodegen';
import { Download } from 'lucide-react';

export const FirmwareCodePreview: React.FC = () => {
  const store = useProjectStore();
  const modules = store.firmwareModules || [];
  const states = store.firmwareStates || [];
  const transitions = store.firmwareTransitions || [];

  const source = useMemo(() =>
    generateFirmwareSource(modules, states, transitions),
    [modules, states, transitions]
  );

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
        <button onClick={() => downloadFile(source.headerContent, 'firmware_generated.h')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
          <Download size={12} /> firmware_generated.h
        </button>
        <button onClick={() => downloadFile(source.sourceContent, 'firmware_generated.c')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
          <Download size={12} /> firmware_generated.c
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: '#94a3b8', alignSelf: 'center' }}>
          {modules.length} modules, {states.length} states, {transitions.length} transitions
        </span>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: 12, borderRight: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>firmware_generated.h</div>
          <pre style={{ fontSize: 11, fontFamily: 'monospace', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>
            {source.headerContent}
          </pre>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>firmware_generated.c</div>
          <pre style={{ fontSize: 11, fontFamily: 'monospace', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>
            {source.sourceContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
