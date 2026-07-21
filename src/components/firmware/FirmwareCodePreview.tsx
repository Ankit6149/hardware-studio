'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { generateFirmwareWorkspace } from '../../lib/exportFirmware';
import { FirmwareSourceFile } from '../../types';
import { FileCode, Plus, Trash2, Save, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export const FirmwareCodePreview: React.FC = () => {
  const store = useProjectStore();
  const sourceFiles = store.firmwareSourceFiles || [];

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [isAddingFile, setIsAddingFile] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Initialize workspace if empty
  useEffect(() => {
    if (sourceFiles.length === 0) {
      const initialFiles = generateFirmwareWorkspace(store);
      store.updateProjectState({ firmwareSourceFiles: initialFiles });
      if (initialFiles.length > 0) {
        setSelectedFileId(initialFiles[0].id);
        setEditingContent(initialFiles[0].content);
      }
    } else if (!selectedFileId && sourceFiles.length > 0) {
      setSelectedFileId(sourceFiles[0].id);
      setEditingContent(sourceFiles[0].content);
    }
  }, [sourceFiles.length]);

  const activeFile = sourceFiles.find(f => f.id === selectedFileId);

  const handleSelectFile = (file: FirmwareSourceFile) => {
    setSelectedFileId(file.id);
    setEditingContent(file.content);
  };

  const handleContentChange = (val: string) => {
    setEditingContent(val);
    if (selectedFileId) {
      const updated = sourceFiles.map(f => f.id === selectedFileId ? { ...f, content: val, dirty: true } : f);
      store.updateProjectState({ firmwareSourceFiles: updated });
    }
  };

  const handleSaveFile = () => {
    if (!selectedFileId) return;
    const updated = sourceFiles.map(f => f.id === selectedFileId ? { ...f, content: editingContent, dirty: false } : f);
    store.updateProjectState({ firmwareSourceFiles: updated });
    setSaveNotification(`Saved ${activeFile?.name || 'file'}`);
    setTimeout(() => setSaveNotification(null), 2000);
  };

  const handleCreateFile = () => {
    if (!newFilePath.trim()) return;
    const name = newFilePath.split('/').pop() || newFilePath;
    const ext = name.split('.').pop() || '';
    const lang = ext === 'cpp' || ext === 'c' || ext === 'h' ? 'cpp' : ext === 'ini' ? 'ini' : 'text';
    const newFile: FirmwareSourceFile = {
      id: `fw_file_${Date.now()}`,
      path: newFilePath.trim(),
      name,
      content: `// Source file: ${newFilePath.trim()}\n\n`,
      isGenerated: false,
      dirty: false,
      language: lang as any
    };
    const updated = [...sourceFiles, newFile];
    store.updateProjectState({ firmwareSourceFiles: updated });
    setSelectedFileId(newFile.id);
    setEditingContent(newFile.content);
    setNewFilePath('');
    setIsAddingFile(false);
  };

  const handleDeleteFile = (id: string) => {
    const updated = sourceFiles.filter(f => f.id !== id);
    store.updateProjectState({ firmwareSourceFiles: updated });
    if (selectedFileId === id) {
      const first = updated[0];
      setSelectedFileId(first ? first.id : null);
      setEditingContent(first ? first.content : '');
    }
  };

  const handleRegenerate = () => {
    const fresh = generateFirmwareWorkspace(store);
    store.updateProjectState({ firmwareSourceFiles: fresh });
    if (fresh.length > 0) {
      setSelectedFileId(fresh[0].id);
      setEditingContent(fresh[0].content);
    }
    setSaveNotification('Regenerated workspace configuration');
    setTimeout(() => setSaveNotification(null), 2000);
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-indigo-400" /> Firmware Source Tree
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingFile(!isAddingFile)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              title="Create New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRegenerate}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              title="Regenerate PlatformIO Workspace"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isAddingFile && (
          <div className="p-2 border-b border-slate-800 bg-slate-850 flex flex-col gap-2">
            <input
              type="text"
              placeholder="e.g. include/drivers.h"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-1">
              <button
                onClick={() => setIsAddingFile(false)}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-2 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
              >
                Add File
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sourceFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleSelectFile(file)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                selectedFileId === file.id
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span className="truncate">{file.path}</span>
                {file.dirty && <span className="text-amber-400 font-bold text-xs">*</span>}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
                title="Delete File"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Main View */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {activeFile ? (
          <>
            <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-200">{activeFile.path}</span>
                {activeFile.dirty && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    Unsaved Edits
                  </span>
                )}
                {activeFile.isGenerated && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                    Generated Config
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {saveNotification && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {saveNotification}
                  </span>
                )}
                <button
                  onClick={handleSaveFile}
                  disabled={!activeFile.dirty}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeFile.dirty
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden p-2 bg-slate-950">
              <textarea
                value={editingContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full bg-slate-950 text-slate-200 font-mono text-xs p-3 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select or create a source file to edit.
          </div>
        )}
      </div>
    </div>
  );
};
