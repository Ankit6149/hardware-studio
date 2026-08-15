'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { generateFirmwareWorkspace } from '../../lib/exportFirmware';
import type { FirmwareSourceFile } from '../../types';
import {
  Check,
  ChevronRight,
  FileCode2,
  FilePlus2,
  FileText,
  FolderOpen,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';

function languageLabel(file?: FirmwareSourceFile): string {
  if (!file) return 'Plain Text';
  if (file.language === 'cpp') return 'C / C++';
  if (file.language === 'ini') return 'INI';
  return 'Plain Text';
}

function lineAndColumn(content: string, offset: number): { line: number; column: number } {
  const safeOffset = Math.max(0, Math.min(offset, content.length));
  const before = content.slice(0, safeOffset);
  const lines = before.split('\n');
  return { line: lines.length, column: (lines[lines.length - 1]?.length || 0) + 1 };
}

export const FirmwareCodePreview: React.FC = () => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const sourceFiles = store.firmwareSourceFiles || [];
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cursorOffset, setCursorOffset] = useState(0);

  const effectiveSelectedFileId = selectedFileId ?? sourceFiles[0]?.id ?? null;
  const activeFile = sourceFiles.find((file) => file.id === effectiveSelectedFileId);
  const editorContent = selectedFileId ? editingContent : (activeFile?.content ?? '');

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sourceFiles;
    return sourceFiles.filter((file) => file.path.toLowerCase().includes(query) || file.name.toLowerCase().includes(query));
  }, [search, sourceFiles]);

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, editorContent.split('\n').length);
    return Array.from({ length: count }, (_, index) => String(index + 1)).join('\n');
  }, [editorContent]);

  const cursor = useMemo(() => lineAndColumn(editorContent, cursorOffset), [cursorOffset, editorContent]);

  const handleSelectFile = (file: FirmwareSourceFile) => {
    setSelectedFileId(file.id);
    setEditingContent(file.content);
    setCursorOffset(0);
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
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const language: FirmwareSourceFile['language'] = ['cpp', 'c', 'cc', 'h', 'hpp'].includes(ext) ? 'cpp' : ext === 'ini' ? 'ini' : 'text';
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
    setCursorOffset(0);
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
      setCursorOffset(0);
    }
  };

  const handleRegenerate = async () => {
    if (sourceFiles.length > 0) {
      const confirmed = await feedback.confirm({
        title: 'Regenerate generated firmware workspace files?',
        description: 'This replaces the generated workspace set. Created or imported real source files should be reviewed before continuing; generation is not verification.',
        confirmLabel: 'Regenerate',
        cancelLabel: 'Cancel',
      });
      if (!confirmed) return;
    }
    const fresh = generateFirmwareWorkspace(store);
    store.updateProjectState({ firmwareSourceFiles: fresh });
    setSelectedFileId(fresh[0]?.id || null);
    setEditingContent(fresh[0]?.content || '');
    setCursorOffset(0);
    setSaveNotification('Generated starter workspace');
    window.setTimeout(() => setSaveNotification(null), 1800);
  };

  const updateCursor = () => {
    setCursorOffset(editorRef.current?.selectionStart || 0);
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSaveFile();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${editorContent.slice(0, start)}  ${editorContent.slice(end)}`;
      handleContentChange(next);
      window.requestAnimationFrame(() => {
        if (!editorRef.current) return;
        editorRef.current.selectionStart = start + 2;
        editorRef.current.selectionEnd = start + 2;
        setCursorOffset(start + 2);
      });
    }
  };

  const crumbs = activeFile?.path.split('/').filter(Boolean) || [];

  return (
    <section className="flex h-full min-h-0 w-full overflow-hidden bg-[#161513] text-[#e9e5dc]" aria-label="Firmware source editor">
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-[#34312c] bg-[#211f1c]" aria-label="Firmware source files">
        <div className="flex min-h-11 items-center gap-2 border-b border-[#34312c] px-3">
          <FolderOpen className="h-4 w-4 text-[#aaa49a]" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d7d2c8]">Explorer</span>
          <span className="ml-auto font-mono text-[9px] tabular-nums text-[#777168]">{sourceFiles.length}</span>
        </div>

        <div className="border-b border-[#34312c] p-2">
          <div className="flex h-8 items-center gap-2 border border-[#403c36] bg-[#191816] px-2 focus-within:border-[#777168]">
            <Search className="h-3.5 w-3.5 text-[#777168]" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter source files" className="min-w-0 flex-1 bg-transparent text-[10px] text-[#ddd8cf] outline-none placeholder:text-[#6d675f]" />
          </div>
        </div>

        <div className="flex min-h-8 items-center border-b border-[#34312c] px-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-[#969087]">Project source</span>
          <div className="ml-auto flex items-center gap-0.5">
            <button type="button" onClick={() => setIsAddingFile((value) => !value)} className="grid h-7 w-7 place-items-center text-[#969087] hover:bg-[#302d28] hover:text-white" title="Create source file" aria-label="Create source file"><FilePlus2 className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => void handleRegenerate()} className="grid h-7 w-7 place-items-center text-[#969087] hover:bg-[#302d28] hover:text-white" title="Generate starter workspace files" aria-label="Generate workspace files"><RefreshCw className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {isAddingFile && (
          <div className="border-b border-[#34312c] bg-[#191816] p-2.5">
            <label className="block text-[9px] font-medium text-[#aaa49a]" htmlFor="firmware-new-path">New file path</label>
            <input id="firmware-new-path" autoFocus value={newFilePath} onChange={(event) => setNewFilePath(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleCreateFile(); if (event.key === 'Escape') setIsAddingFile(false); }} placeholder="src/drivers/sensor.cpp" className="mt-1.5 h-8 w-full border border-[#403c36] bg-[#24221f] px-2 font-mono text-[10px] text-[#ece8df] outline-none focus:border-[#777168]" />
            <div className="mt-2 flex justify-end gap-1.5"><button type="button" onClick={() => setIsAddingFile(false)} className="h-7 px-2 text-[9px] font-semibold text-[#969087] hover:bg-[#302d28]">Cancel</button><button type="button" onClick={handleCreateFile} className="h-7 bg-[#ece8df] px-2.5 text-[9px] font-semibold text-[#171614]">Create file</button></div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {filteredFiles.map((file) => {
            const selected = effectiveSelectedFileId === file.id;
            return (
              <div key={file.id} className={`group flex min-h-8 items-center border-l-2 pr-1 ${selected ? 'border-[#e8e4da] bg-[#302d28]' : 'border-transparent hover:bg-[#292722]'}`}>
                <button type="button" onClick={() => handleSelectFile(file)} aria-pressed={selected} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 text-left">
                  <FileText className={`h-3.5 w-3.5 shrink-0 ${file.language === 'cpp' ? 'text-[#cbb895]' : 'text-[#8e887f]'}`} aria-hidden="true" />
                  <span className={`min-w-0 flex-1 truncate font-mono text-[10px] ${selected ? 'text-white' : 'text-[#c6c0b6]'}`}>{file.path}</span>
                  {file.dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8a85d]" aria-label="Unsaved edits" />}
                </button>
                <button type="button" onClick={() => void handleDeleteFile(file)} className="grid h-7 w-7 shrink-0 place-items-center text-[#777168] opacity-0 hover:bg-[#3a3530] hover:text-[#f0a49c] focus:opacity-100 group-hover:opacity-100" aria-label={`Delete ${file.path}`}><Trash2 className="h-3 w-3" /></button>
              </div>
            );
          })}
          {sourceFiles.length === 0 && (
            <div className="px-4 py-8">
              <FileCode2 className="h-5 w-5 text-[#68635c]" aria-hidden="true" />
              <p className="mt-3 text-[11px] font-semibold text-[#e2ddd4]">No source files yet</p>
              <p className="mt-1 text-[10px] leading-4 text-[#888178]">Opening Source does not generate files. Create a real source file, or explicitly generate starter workspace files.</p>
              <button type="button" onClick={() => setIsAddingFile(true)} className="mt-3 h-8 bg-[#ece8df] px-3 text-[10px] font-semibold text-[#171614]">Create first file</button>
            </div>
          )}
          {sourceFiles.length > 0 && filteredFiles.length === 0 && <p className="px-4 py-5 text-[10px] text-[#777168]">No source files match “{search}”.</p>}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#171614]">
        {activeFile ? (
          <>
            <div className="flex min-h-9 shrink-0 items-end border-b border-[#34312c] bg-[#211f1c]">
              <div className="flex h-9 max-w-[320px] items-center gap-2 border-r border-[#34312c] border-t-2 border-t-[#e8e4da] bg-[#171614] px-3">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#cbb895]" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[#e8e4da]">{activeFile.name}</span>
                {activeFile.dirty && <span className="h-1.5 w-1.5 rounded-full bg-[#d8a85d]" aria-label="Unsaved edits" />}
              </div>
            </div>

            <header className="flex min-h-9 shrink-0 items-center gap-1 border-b border-[#2d2a26] bg-[#191816] px-3">
              <div className="flex min-w-0 flex-1 items-center gap-1 text-[9px] text-[#89837a]">
                {crumbs.map((crumb, index) => <React.Fragment key={`${crumb}-${index}`}><span className={index === crumbs.length - 1 ? 'font-mono text-[#c8c2b8]' : ''}>{crumb}</span>{index < crumbs.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-[#59544e]" />}</React.Fragment>)}
              </div>
              {activeFile.isGenerated && <span className="mr-2 border border-[#6e5b3c] bg-[#2b241a] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#d8b77c]">Generated · not verification</span>}
              {saveNotification && <span className="hidden items-center gap-1 text-[9px] text-[#a9c7a7] md:inline-flex"><Check className="h-3.5 w-3.5" /> {saveNotification}</span>}
              <button type="button" onClick={handleSaveFile} disabled={!activeFile.dirty} className="inline-flex h-7 items-center gap-1.5 border border-[#4a453e] bg-[#282521] px-2.5 text-[9px] font-semibold text-[#e8e4da] hover:bg-[#34302b] disabled:cursor-not-allowed disabled:opacity-35" title="Save active file (Ctrl/Cmd+S)"><Save className="h-3.5 w-3.5" /> Save</button>
            </header>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#171614]">
              <div className="absolute inset-0 flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1">
                  <pre ref={gutterRef} aria-hidden="true" className="w-14 shrink-0 overflow-hidden border-r border-[#292622] bg-[#191816] px-3 py-3 text-right font-mono text-[11px] leading-[1.65rem] tabular-nums text-[#5f5a53] select-none">{lineNumbers}</pre>
                  <textarea
                    ref={editorRef}
                    value={editorContent}
                    onChange={(event) => handleContentChange(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onClick={updateCursor}
                    onKeyUp={updateCursor}
                    onSelect={updateCursor}
                    onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop; }}
                    className="min-h-0 min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-[#171614] px-4 py-3 font-mono text-[12px] leading-[1.65rem] text-[#e5e0d7] caret-[#f3f0e8] outline-none selection:bg-[#5a5041] selection:text-white"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-label={`Edit ${activeFile.path}`}
                  />
                </div>
              </div>
            </div>

            <footer className="flex min-h-7 shrink-0 items-center gap-4 border-t border-[#302d29] bg-[#24211e] px-3 font-mono text-[9px] text-[#aaa49a]">
              <span>{activeFile.isGenerated ? 'generated starter' : 'project source'}</span>
              <span className="ml-auto">Ln {cursor.line}, Col {cursor.column}</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>LF</span>
              <span>{languageLabel(activeFile)}</span>
            </footer>
          </>
        ) : (
          <div className="grid min-h-0 flex-1 place-items-center bg-[#171614] p-8 text-center">
            <div className="max-w-sm">
              <FileCode2 className="mx-auto h-8 w-8 text-[#5f5a53]" aria-hidden="true" />
              <p className="mt-4 text-[14px] font-semibold text-[#e6e1d8]">Firmware source workspace</p>
              <p className="mt-2 text-[11px] leading-5 text-[#8f8980]">Create or import a source file to begin implementation. Starter generation is always explicit and generated files are not treated as verification evidence.</p>
              <div className="mt-4 flex justify-center gap-2"><button type="button" onClick={() => setIsAddingFile(true)} className="inline-flex h-8 items-center gap-1.5 bg-[#ece8df] px-3 text-[10px] font-semibold text-[#171614]"><FilePlus2 className="h-3.5 w-3.5" /> Create file</button><button type="button" onClick={() => void handleRegenerate()} className="inline-flex h-8 items-center gap-1.5 border border-[#4a453e] bg-[#24211e] px-3 text-[10px] font-semibold text-[#d8d2c8]"><RefreshCw className="h-3.5 w-3.5" /> Generate starter</button></div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};
