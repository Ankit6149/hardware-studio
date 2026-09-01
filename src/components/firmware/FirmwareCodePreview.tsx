'use client';

import React, { useRef, useState } from 'react';
import { Check, ChevronRight, FileCode2, FilePlus2, FileText, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useFirmwareWorkspaceUiStore } from '../../store/firmwareWorkspaceUiStore';
import { generateFirmwareWorkspace } from '../../lib/exportFirmware';
import type { FirmwareSourceFile } from '../../types';
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
  const sourceFiles = store.firmwareSourceFiles ?? [];
  const selectedFileId = useFirmwareWorkspaceUiStore((state) => state.selectedFileId);
  const setSelectedFileId = useFirmwareWorkspaceUiStore((state) => state.setSelectedFileId);
  const setDrawerSection = useFirmwareWorkspaceUiStore((state) => state.setDrawerSection);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);
  const [newFilePath, setNewFilePath] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [cursorOffset, setCursorOffset] = useState(0);

  const activeFile = selectedFileId ? sourceFiles.find((file) => file.id === selectedFileId) || null : null;
  const editorContent = activeFile?.content ?? '';
  const lineCount = Math.max(1, editorContent.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => String(index + 1)).join('\n');
  const cursor = lineAndColumn(editorContent, cursorOffset);
  const crumbs = activeFile?.path.split('/').filter(Boolean) || [];

  const updateFiles = (files: FirmwareSourceFile[]) => store.updateProjectState({ firmwareSourceFiles: files });

  const handleContentChange = (value: string) => {
    if (!activeFile) return;
    updateFiles(sourceFiles.map((file) => file.id === activeFile.id ? { ...file, content: value, dirty: true } : file));
  };

  const handleSaveFile = () => {
    if (!activeFile) return;
    updateFiles(sourceFiles.map((file) => file.id === activeFile.id ? { ...file, dirty: false } : file));
    setSaveNotification(`Saved ${activeFile.name || activeFile.path} in the browser project record`);
    window.setTimeout(() => setSaveNotification(null), 1800);
  };

  const handleCreateFile = () => {
    const path = newFilePath.trim();
    if (!path) return;
    const name = path.split('/').pop() || path;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const language: FirmwareSourceFile['language'] = ['cpp', 'c', 'cc', 'h', 'hpp'].includes(ext) ? 'cpp' : ext === 'ini' ? 'ini' : 'text';
    const newFile: FirmwareSourceFile = {
      id: `fw_file_${Date.now().toString(36)}`,
      path,
      name,
      content: `// Source file: ${path}\n\n`,
      isGenerated: false,
      dirty: false,
      language,
    };
    updateFiles([...sourceFiles, newFile]);
    setSelectedFileId(newFile.id);
    setDrawerSection('files');
    setNewFilePath('');
    setIsAddingFile(false);
    setCursorOffset(0);
  };

  const handleDeleteFile = async () => {
    if (!activeFile) return;
    const confirmed = await feedback.confirm({
      title: `Delete ${activeFile.path}?`,
      description: 'This removes the source record from the current browser project. #18 still governs real filesystem deletion and recovery.',
      confirmLabel: 'Delete file',
      cancelLabel: 'Keep file',
      variant: 'destructive',
    });
    if (!confirmed) return;
    updateFiles(sourceFiles.filter((candidate) => candidate.id !== activeFile.id));
    setSelectedFileId(null);
    setCursorOffset(0);
  };

  const handleRegenerate = async () => {
    if (sourceFiles.length > 0) {
      const confirmed = await feedback.confirm({
        title: 'Regenerate generated firmware workspace files?',
        description: 'This replaces the generated workspace set. Generated scaffolding is not implementation or build evidence.',
        confirmLabel: 'Regenerate',
        cancelLabel: 'Cancel',
      });
      if (!confirmed) return;
    }
    const fresh = generateFirmwareWorkspace(store);
    updateFiles(fresh);
    setSelectedFileId(null);
    setDrawerSection('files');
    setCursorOffset(0);
    setSaveNotification('Generated starter workspace · choose a file explicitly');
    window.setTimeout(() => setSaveNotification(null), 2200);
  };

  const updateCursor = () => setCursorOffset(editorRef.current?.selectionStart || 0);

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSaveFile();
      return;
    }
    if (event.key !== 'Tab' || !activeFile) return;
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
  };

  if (!activeFile) {
    return (
      <section className="grid h-full min-h-0 place-items-center bg-[#171614] p-8 text-[#e9e5dc]" aria-label="Firmware source editor">
        <div className="max-w-md text-center">
          <FileCode2 className="mx-auto h-7 w-7 text-[#68635c]" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold">Select a source file</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#928b82]">Opening Source does not generate files or silently select the first record. Choose a file from the Firmware Project Drawer, create one explicitly, or generate starter scaffolding.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setIsAddingFile(true)} className="inline-flex h-8 items-center gap-1.5 bg-[#ece8df] px-3 text-[10px] font-semibold text-[#171614]"><FilePlus2 className="h-3.5 w-3.5" /> Create file</button>
            <button type="button" onClick={() => void handleRegenerate()} className="inline-flex h-8 items-center gap-1.5 border border-[#4b4740] px-3 text-[10px] font-semibold text-[#d4cec4]"><RefreshCw className="h-3.5 w-3.5" /> Generate scaffolding</button>
          </div>
          {isAddingFile && (
            <div className="mt-4 border border-[#403c36] bg-[#211f1c] p-3 text-left">
              <label className="text-[9px] text-[#aaa49a]" htmlFor="firmware-new-path">New project source path</label>
              <input id="firmware-new-path" autoFocus value={newFilePath} onChange={(event) => setNewFilePath(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleCreateFile(); if (event.key === 'Escape') setIsAddingFile(false); }} placeholder="src/drivers/sensor.cpp" className="mt-1.5 h-8 w-full border border-[#403c36] bg-[#171614] px-2 font-mono text-[10px] text-[#ece8df] outline-none" />
              <div className="mt-2 flex justify-end gap-1.5"><button type="button" onClick={() => setIsAddingFile(false)} className="h-7 px-2 text-[9px] text-[#969087]">Cancel</button><button type="button" onClick={handleCreateFile} className="h-7 bg-[#ece8df] px-2.5 text-[9px] font-semibold text-[#171614]">Create</button></div>
            </div>
          )}
          {saveNotification && <p className="mt-3 text-[9px] text-[#a9c7a3]">{saveNotification}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#171614] text-[#e9e5dc]" aria-label="Firmware source editor">
      <header className="flex min-h-10 shrink-0 items-center gap-2 border-b border-[#34312c] bg-[#211f1c] px-3">
        <FileText className="h-3.5 w-3.5 shrink-0 text-[#cbb895]" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 items-center gap-1 text-[9px] text-[#89837a]">
          {crumbs.map((crumb, index) => <React.Fragment key={`${crumb}-${index}`}><span className={index === crumbs.length - 1 ? 'truncate font-mono text-[#d8d2c8]' : ''}>{crumb}</span>{index < crumbs.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-[#59544e]" />}</React.Fragment>)}
        </div>
        {activeFile.dirty && <span className="text-[8px] font-semibold text-[#d8a85d]">Unsaved browser record</span>}
        {(activeFile.generated || activeFile.isGenerated) && <span className="border border-[#6e5b3c] bg-[#2b241a] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#d8b77c]">Generated · not verification</span>}
        <button type="button" onClick={() => setIsAddingFile((value) => !value)} className="grid h-7 w-7 place-items-center text-[#969087] hover:bg-[#302d28] hover:text-white" title="Create source record"><FilePlus2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => void handleRegenerate()} className="grid h-7 w-7 place-items-center text-[#969087] hover:bg-[#302d28] hover:text-white" title="Generate starter scaffolding"><RefreshCw className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => void handleDeleteFile()} className="grid h-7 w-7 place-items-center text-[#969087] hover:bg-[#3a2523] hover:text-[#f0a49c]" title="Delete source record"><Trash2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={handleSaveFile} className="inline-flex h-7 items-center gap-1.5 bg-[#ece8df] px-2.5 text-[9px] font-semibold text-[#171614]"><Save className="h-3.5 w-3.5" /> Save record</button>
      </header>

      {isAddingFile && (
        <div className="flex shrink-0 items-center gap-2 border-b border-[#34312c] bg-[#191816] px-3 py-2">
          <label className="text-[9px] text-[#aaa49a]" htmlFor="firmware-new-path-inline">New path</label>
          <input id="firmware-new-path-inline" autoFocus value={newFilePath} onChange={(event) => setNewFilePath(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleCreateFile(); if (event.key === 'Escape') setIsAddingFile(false); }} placeholder="src/module.cpp" className="h-7 min-w-0 flex-1 border border-[#403c36] bg-[#24221f] px-2 font-mono text-[10px] text-[#ece8df] outline-none" />
          <button type="button" onClick={handleCreateFile} className="h-7 bg-[#ece8df] px-2.5 text-[9px] font-semibold text-[#171614]">Create</button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <pre ref={gutterRef} aria-hidden="true" className="min-h-0 w-12 shrink-0 overflow-hidden border-r border-[#2d2a26] bg-[#191816] px-2 py-3 text-right font-mono text-[11px] leading-5 text-[#59544e]">{lineNumbers}</pre>
        <textarea
          ref={editorRef}
          value={editorContent}
          onChange={(event) => handleContentChange(event.target.value)}
          onSelect={updateCursor}
          onClick={updateCursor}
          onKeyUp={updateCursor}
          onKeyDown={handleEditorKeyDown}
          onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop; }}
          spellCheck={false}
          aria-label={`Edit ${activeFile.path}`}
          className="min-h-0 min-w-0 flex-1 resize-none overflow-auto bg-[#171614] px-3 py-3 font-mono text-[12px] leading-5 text-[#e4ded5] outline-none selection:bg-[#4c463d]"
        />
      </div>

      <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-[#34312c] bg-[#211f1c] px-3 text-[9px] text-[#777168]">
        <span>{languageLabel(activeFile)}</span>
        <span>Ln {cursor.line}, Col {cursor.column}</span>
        <span>{activeFile.dirty ? 'browser project record changed' : 'project record saved'}</span>
        <span className="ml-auto">Real filesystem sync/build remains #18</span>
        {saveNotification && <span className="inline-flex items-center gap-1 text-[#a9c7a3]"><Check className="h-3 w-3" /> {saveNotification}</span>}
      </footer>
    </section>
  );
};
