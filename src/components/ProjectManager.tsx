import React, { useState, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { allowStorageRecoveryOverwrite } from '../store/storageHealthStore';
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
  FileText 
} from 'lucide-react';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { useFeedback } from './feedback/FeedbackProvider';

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
  const { confirm: requestConfirmation, notify } = useFeedback();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setProjectName(newName);
    setProjectDescription(newDesc);
    saveActiveProject();
    notify({ tone: 'success', title: 'Project details saved', detail: 'The active project metadata was updated locally.' });
  };

  const handleCopy = () => {
    if (!copyName.trim()) {
      notify({ tone: 'error', title: 'Copy name required', detail: 'Enter a name before creating a project copy.' });
      return;
    }
    saveProjectAsCopy(copyName);
    setShowCopyInput(false);
    setCopyName('');
    notify({ tone: 'success', title: 'Project copy created', detail: `Created “${copyName}”.` });
    // Reload state bindings
    setNewName(copyName);
    setNewDesc(description);
  };

  const handleLoad = (id: string) => {
    loadProject(id);
    const loaded = useProjectStore.getState();
    setNewName(loaded.projectName);
    setNewDesc(loaded.description);
    notify({ tone: 'success', title: 'Project switched', detail: `Now editing “${loaded.projectName}”.` });
  };

  const handleDelete = async (id: string, name: string) => {
    const approved = await requestConfirmation({
      title: `Delete “${name}”?`,
      description: 'This project will be removed from this browser. Hardware Studio does not yet provide recoverable project trash.',
      confirmLabel: 'Delete project',
      variant: 'destructive',
    });
    if (!approved) return;

    deleteProject(id);
    notify({ tone: 'success', title: 'Project deleted', detail: `Removed “${name}”.` });
    const loaded = useProjectStore.getState();
    setNewName(loaded.projectName);
    setNewDesc(loaded.description);
  };

  const handleReset = async () => {
    const approved = await requestConfirmation({
      title: 'Reset the active project?',
      description: 'All current modifications will be replaced with the default template configuration. This reset is not currently recoverable.',
      confirmLabel: 'Reset project',
      variant: 'destructive',
    });
    if (!approved) return;

    resetProject();
    const loaded = useProjectStore.getState();
    setNewName(loaded.projectName);
    setNewDesc(loaded.description);
    notify({ tone: 'success', title: 'Workspace template reset' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        allowStorageRecoveryOverwrite();
        const res = importProjectJSON(json);
        if (res.success) {
          notify({ tone: 'success', title: 'Project imported', detail: `Imported “${json.projectName || 'project'}”.` });
          const loaded = useProjectStore.getState();
          setNewName(loaded.projectName);
          setNewDesc(loaded.description);
        } else {
          notify({ tone: 'error', title: 'Project import failed', detail: res.issues ? res.issues.map(issue => typeof issue === 'object' && issue !== null && 'message' in issue ? String(issue.message) : String(issue)).join(', ') : 'Validation errors' });
        }
      } catch {
        notify({ tone: 'error', title: 'Invalid project file', detail: 'The selected file is not valid JSON.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const handleExportJSON = () => {
    const state = useProjectStore.getState();
    exportProjectJson(state);
    notify({ tone: 'success', title: 'JSON backup exported' });
  };

  const handleExportMD = () => {
    const state = useProjectStore.getState();
    exportProjectMarkdown(state);
    notify({ tone: 'success', title: 'Markdown report exported' });
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
                  onClick={() => void handleReset()}
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
                          onClick={() => void handleDelete(p.id, p.projectName)}
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
