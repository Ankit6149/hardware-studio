import React, { useState, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/FormControls';
import { 
  Save, 
  Copy, 
  Trash2, 
  Upload, 
  Download, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose }) => {
  const {
    id: activeId,
    projectName,
    description,
    projectsList,
    setProjectName,
    setProjectDescription,
    saveActiveProject,
    saveProjectAsCopy,
    loadProject,
    deleteProject,
    resetProject,
    importProjectJSON
  } = useProjectStore();

  const [newName, setNewName] = useState(projectName);
  const [newDesc, setNewDesc] = useState(description);
  const [copyName, setCopyName] = useState('');
  const [showCopyInput, setShowCopyInput] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setProjectName(newName);
    setProjectDescription(newDesc);
    saveActiveProject();
    showToast("Project details updated locally.", "success");
  };

  const handleCopy = () => {
    if (!copyName.trim()) {
      showToast("Please enter a name for the copy.", "error");
      return;
    }
    saveProjectAsCopy(copyName);
    setShowCopyInput(false);
    setCopyName('');
    showToast(`Created new project copy: "${copyName}"`, "success");
    // Reload state bindings
    setNewName(copyName);
    setNewDesc(description);
  };

  const handleLoad = (id: string) => {
    loadProject(id);
    const loaded = useProjectStore.getState();
    setNewName(loaded.projectName);
    setNewDesc(loaded.description);
    showToast(`Switched active project to "${loaded.projectName}"`, "success");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteProject(id);
      showToast(`Deleted project: "${name}"`, "success");
      const loaded = useProjectStore.getState();
      setNewName(loaded.projectName);
      setNewDesc(loaded.description);
    }
  };

  const handleReset = () => {
    if (confirm("Reset current project to its default template configuration? All modifications will be lost.")) {
      resetProject();
      const loaded = useProjectStore.getState();
      setNewName(loaded.projectName);
      setNewDesc(loaded.description);
      showToast("Workspace template reset.", "success");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = importProjectJSON(json);
        if (res.success) {
          showToast(`Successfully imported project "${json.projectName}"`, "success");
          const loaded = useProjectStore.getState();
          setNewName(loaded.projectName);
          setNewDesc(loaded.description);
        } else {
          showToast(`Import failed: ${res.issues ? res.issues.map(i => (i as any).message || String(i)).join(', ') : 'Validation errors'}`, "error");
        }
      } catch {
        showToast("Invalid JSON file formatting.", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportJSON = () => {
    const state = useProjectStore.getState();
    exportProjectJson(state);
    showToast("Exported project JSON backup.", "success");
  };

  const handleExportMD = () => {
    const state = useProjectStore.getState();
    exportProjectMarkdown(state);
    showToast("Exported project Markdown report.", "success");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Workspace Manager"
      size="lg"
      footer={
        <Button onClick={onClose} variant="secondary" size="sm">
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Toast Alert Banner */}
        {toast && (
          <div className={`p-3 rounded border text-xs font-mono flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Column 1: Edit active project details */}
          <div className="md:col-span-3 space-y-4 border-r border-slate-100 pr-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5">
              Active Project Settings
            </h3>
            
            <div className="space-y-3">
              <Input
                label="Project Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                id="pm-name"
              />
              <Textarea
                label="Project Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                id="pm-desc"
              />
              
              <div className="flex items-center space-x-2 pt-1">
                <Button 
                  onClick={handleSave} 
                  variant="primary" 
                  size="xs" 
                  icon={<Save className="w-3 h-3" />}
                >
                  Save Details
                </Button>

                <Button 
                  onClick={() => setShowCopyInput(!showCopyInput)} 
                  variant="secondary" 
                  size="xs" 
                  icon={<Copy className="w-3 h-3" />}
                >
                  Save as Copy
                </Button>
              </div>
            </div>

            {showCopyInput && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                <Input
                  label="Name of Copy"
                  placeholder="e.g. The Ring RevB"
                  value={copyName}
                  onChange={(e) => setCopyName(e.target.value)}
                  id="pm-copy-name"
                />
                <div className="flex justify-end space-x-1.5">
                  <Button onClick={() => setShowCopyInput(false)} variant="ghost" size="xs">
                    Cancel
                  </Button>
                  <Button onClick={handleCopy} variant="primary" size="xs">
                    Confirm Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 pt-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5">
                Export / Sync Operations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleExportJSON}
                  variant="outline" 
                  size="xs" 
                  className="w-full text-left justify-start"
                  icon={<Download className="w-3.5 h-3.5 text-blue-500" />}
                >
                  Export JSON Backup
                </Button>
                
                <Button 
                  onClick={handleExportMD}
                  variant="outline" 
                  size="xs" 
                  className="w-full text-left justify-start"
                  icon={<FileText className="w-3.5 h-3.5 text-purple-500" />}
                >
                  Export MD Report
                </Button>
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  size="xs" 
                  className="w-full text-left justify-start"
                  icon={<Upload className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Import JSON File
                </Button>
                
                <Button 
                  onClick={handleReset}
                  variant="outline" 
                  size="xs" 
                  className="w-full text-left justify-start border-rose-250 hover:bg-rose-50 text-rose-700"
                  icon={<RefreshCw className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Reset Casing Template
                </Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Column 2: Loaded projects list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5">
              Saved Local Projects
            </h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {projectsList.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <div 
                    key={p.id}
                    className={`p-2.5 rounded border text-xs flex flex-col space-y-1 transition-all duration-150 ${
                      isActive 
                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20' 
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span 
                        className={`font-mono font-bold truncate pr-2 cursor-pointer hover:underline ${
                          isActive ? 'text-slate-800' : 'text-slate-700'
                        }`}
                        onClick={() => !isActive && handleLoad(p.id)}
                        title={isActive ? "Currently Active Workspace" : "Load this project"}
                      >
                        {p.projectName}
                      </span>
                      
                      {!isActive && projectsList.length > 1 && (
                        <button 
                          onClick={() => handleDelete(p.id, p.projectName)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    {p.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {p.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span>{p.templateName || 'Custom'}</span>
                      <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </Modal>
  );
};
