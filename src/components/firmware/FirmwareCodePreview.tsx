'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { generateFirmwareWorkspace } from '../../lib/exportFirmware';
import { FirmwareSourceFile } from '../../types';
import { CheckCircle2, FileCode, FileText, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';

export const FirmwareCodePreview: React.FC = () => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const sourceFiles = store.firmwareSourceFiles || [];

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const effectiveSelectedFileId = selectedFileId ?? sourceFiles[0]?.id ?? null;
  const activeFile = sourceFiles.find((file) => file.id === effectiveSelectedFileId);
  const editorContent = selectedFileId ? editingContent : (activeFile?.content ?? '');

  const handleSelectFile = (file: FirmwareSourceFile) => {
    setSelectedFileId(file.id);
    setEditingContent(file.content);
  };

  const handleContentChange = (value: string) => {
    setEditingContent(value);
    const fileId = effectiveSelectedFileId;
    if (!fileId) return;
    if (!selectedFileId) setSelectedFileId(fileId);
    store.updateProjectState({
      firmwareSourceFiles: sourceFiles.map((file) => file.id === fileId ? { ...file, content: value, dirty: true } : file),
    });
  };

  const handleSaveFile = () => {
    const fileId = effectiveSelectedFileId;
    if (!fileId) return;
    store.updateProjectState({
      firmwareSourceFiles: sourceFiles.map((file) => file.id === fileId ? { ...file, content: editorContent, dirty: false } : file),
    });
    setSaveNotification(`Saved ${activeFile?.name || 'file'}`);
    window.setTimeout(() => setSaveNotification(null), 1800);
  };

  const handleCreateFile = () => {
    const path = newFilePath.trim();
    if (!path) return;
    const name = path.split('/').pop() || path;
    const ext = name.split('.').pop() || '';
    const language: FirmwareSourceFile['language'] = ext === 'cpp' || ext === 'c' || ext === 'h' ? 'cpp' : ext === 'ini' ? 'ini' : 'text';
    const newFile: FirmwareSourceFile = {
      id: `fw_file_${Date.now()}`,
      path,
      name,
      content: `// Source file: ${path}\n\n`,
      isGenerated: false,
      dirty: false,
      language,
    };
    store.updateProjectState({ firmwareSourceFiles: [...sourceFiles, newFile] });
    setSelectedFileId(newFile.id);
    setEditingContent(newFile.content);
    setNewFilePath('');
    setIsAddingFile(false);
  };

  const handleDeleteFile = async (file: FirmwareSourceFile) => {
    const confirmed = await feedback.confirm({
      title: `Delete ${file.path}?`,
      description: 'This removes the source file from the current project workspace. Linked module records remain, but may lose implementation evidence.',
      confirmLabel: 'Delete file',
      cancelLabel: 'Keep file',
      variant: 'destructive',
    });
    if (!confirmed) return;
    const updated = sourceFiles.filter((candidate) => candidate.id !== file.id);
    store.updateProjectState({ firmwareSourceFiles: updated });
    if (effectiveSelectedFileId === file.id) {
      const first = updated[0];
      setSelectedFileId(first?.id || null);
      setEditingContent(first?.content || '');
    }
  };

  const handleRegenerate = async () => {
    if (sourceFiles.length > 0) {
      const confirmed = await feedback.confirm({
        title: 'Regenerate generated firmware workspace files?',
        description: 'This replaces the generated workspace set. Create/imported real source files should be reviewed before continuing; generation is not verification.',
        confirmLabel: 'Regenerate',
        cancelLabel: 'Cancel',
      });
      if (!confirmed) return;
    }
    const fresh = generateFirmwareWorkspace(store);
    store.updateProjectState({ firmwareSourceFiles: fresh });
    setSelectedFileId(fresh[0]?.id || null);
    setEditingContent(fresh[0]?.content || '');
    setSaveNotification('Generated workspace files');
    window.setTimeout(() => setSaveNotification(null), 1800);
  };

  return (
    <section className="flex h-full min-h-0 w-full overflow-hidden bg-white text-slate-900" aria-label="Firmware source editor">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-slate-300 bg-[#f5f1e8]" aria-label="Firmware source files">
        <div className="flex min-h-10 items-center justify-between border-b border-slate-300 px-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-700"><FileCode className="h-3.5 w-3.5" /> Source files</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setIsAddingFile((value) => !value)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900" title="Create source file" aria-label="Create source file"><Plus className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => void handleRegenerate()} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900" title="Generate workspace files" aria-label="Generate workspace files"><RefreshCw className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {isAddingFile && (
          <div className="border-b border-slate-300 bg-white p-2">
            <label className="block text-[9px] font-medium text-slate-500" htmlFor="firmware-new-path">New file path</label>
            <input id="firmware-new-path" value={newFilePath} onChange={(event) => setNewFilePath(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleCreateFile(); }} placeholder="include/drivers.h" className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-slate-500" />
            <div className="mt-2 flex justify-end gap-1.5"><button type="button" onClick={() => setIsAddingFile(false)} className="min-h-7 rounded-md px-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-100">Cancel</button><button type="button" onClick={handleCreateFile} className="min-h-7 rounded-md bg-slate-950 px-2 text-[9px] font-semibold text-white hover:bg-slate-800">Create</button></div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {sourceFiles.map((file) => {
            const selected = effectiveSelectedFileId === file.id;
            return (
              <div key={file.id} className={`group flex min-h-9 items-center gap-1 rounded-md px-1 ${selected ? 'bg-[#e5ded0]' : 'hover:bg-[#ece7dd]'}`}>
                <button type="button" onClick={() => handleSelectFile(file)} aria-pressed={selected} className="flex min-w-0 flex-1 items-center gap-2 px-1 text-left">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-slate-700">{file.path}</span>
                  {file.dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-label="Unsaved edits" />}
                </button>
                <button type="button" onClick={() => void handleDeleteFile(file)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 opacity-0 hover:bg-white hover:text-rose-700 focus:opacity-100 group-hover:opacity-100" aria-label={`Delete ${file.path}`}><Trash2 className="h-3 w-3" /></button>
              </div>
            );
          })}
          {sourceFiles.length === 0 && <div className="px-3 py-8 text-center"><p className="text-[10px] font-semibold text-slate-700">No source files</p><p className="mt-1 text-[9px] leading-4 text-slate-500">Opening Source does not generate files. Create a real file, or explicitly generate starter workspace files.</p><button type="button" onClick={() => setIsAddingFile(true)} className="mt-3 min-h-8 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white">Create file</button></div>}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#fbfaf6]">
        {activeFile ? (
          <>
            <header className="flex min-h-10 shrink-0 items-center gap-3 border-b border-slate-300 bg-white px-3">
              <div className="min-w-0 flex-1"><p className="truncate font-mono text-[10px] font-semibold text-slate-800">{activeFile.path}</p><p className="mt-0.5 text-[8px] text-slate-400">{activeFile.isGenerated ? 'Generated workspace file · not implementation evidence by itself' : 'Project source file'}</p></div>
              {saveNotification && <span className="hidden items-center gap-1 text-[9px] text-emerald-700 sm:inline-flex"><CheckCircle2 className="h-3.5 w-3.5" /> {saveNotification}</span>}
              <button type="button" onClick={handleSaveFile} disabled={!activeFile.dirty} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-3.5 w-3.5" /> Save</button>
            </header>
            <textarea value={editorContent} onChange={(event) => handleContentChange(event.target.value)} className="min-h-0 flex-1 resize-none bg-[#fbfaf6] p-4 font-mono text-[12px] leading-6 text-slate-900 outline-none" spellCheck={false} aria-label={`Edit ${activeFile.path}`} />
          </>
        ) : (
          <div className="grid min-h-0 flex-1 place-items-center p-8 text-center"><div className="max-w-sm"><FileCode className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-800">Source editor is ready</p><p className="mt-1 text-xs leading-5 text-slate-500">Create a source file or explicitly generate starter workspace files. Merely opening this editor does not change the project.</p></div></div>
        )}
      </main>
    </section>
  );
};