'use client';

import React from 'react';
import { Binary, Cpu, FileCode2, Link2, Plus, Settings2, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  useFirmwareWorkspaceUiStore,
  type FirmwareDrawerSection,
} from '../../store/firmwareWorkspaceUiStore';
import { evaluateFirmwareEvidence } from '../../lib/firmware/firmwareEvidence';

const sections: Array<{
  id: FirmwareDrawerSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'modules', label: 'Modules', icon: Cpu },
  { id: 'files', label: 'Files', icon: FileCode2 },
  { id: 'hardware-map', label: 'Map', icon: Link2 },
  { id: 'environment', label: 'Env', icon: Settings2 },
];

export const FirmwareProjectDrawer: React.FC = () => {
  const modules = useProjectStore((state) => state.firmwareModules ?? []);
  const sourceFiles = useProjectStore((state) => state.firmwareSourceFiles ?? []);
  const firmwareConfiguration = useProjectStore((state) => state.firmwareConfiguration);
  const addFirmwareModule = useProjectStore((state) => state.addFirmwareModule);
  const project = useProjectStore();

  const drawerSection = useFirmwareWorkspaceUiStore((state) => state.drawerSection);
  const selectedModuleId = useFirmwareWorkspaceUiStore((state) => state.selectedModuleId);
  const selectedFileId = useFirmwareWorkspaceUiStore((state) => state.selectedFileId);
  const setDrawerSection = useFirmwareWorkspaceUiStore((state) => state.setDrawerSection);
  const setSelectedModuleId = useFirmwareWorkspaceUiStore((state) => state.setSelectedModuleId);
  const setSelectedFileId = useFirmwareWorkspaceUiStore((state) => state.setSelectedFileId);
  const setRepresentation = useFirmwareWorkspaceUiStore((state) => state.setRepresentation);
  const setInspectorOpen = useFirmwareWorkspaceUiStore((state) => state.setInspectorOpen);

  const evidence = evaluateFirmwareEvidence(project);

  const selectModule = (moduleId: string, representation: 'modules' | 'hardware-map' = 'modules') => {
    setSelectedModuleId(moduleId);
    setRepresentation(representation);
    setInspectorOpen(true);
  };

  const addModule = () => {
    const id = `fw_module_${Date.now().toString(36)}`;
    addFirmwareModule({
      id,
      name: `Module_${modules.length + 1}`,
      type: 'Driver',
      description: '',
      linkedArchitectureNodeIds: [],
      linkedComponentIds: [],
      linkedPinIds: [],
      linkedNetIds: [],
      linkedTestIds: [],
      dependencies: [],
      sourceFiles: [],
      status: 'Draft',
    });
    setSelectedModuleId(id);
    setRepresentation('modules');
    setInspectorOpen(true);
  };

  return (
    <aside
      className="z-20 flex h-full w-[224px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label="Firmware project drawer"
      data-studio-shell="project-drawer"
      data-workbench="firmware"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Binary className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Firmware</div>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">Project structure</h2>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-4 border-b border-[#d8d1c5] bg-[#f1ece3]">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDrawerSection(id)}
            aria-pressed={drawerSection === id}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 border-r border-[#d8d1c5] text-[8px] font-semibold last:border-r-0 ${drawerSection === id ? 'bg-[#fbfaf6] text-slate-950' : 'text-slate-500 hover:bg-[#ece6dc]'}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {drawerSection === 'modules' && (
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={addModule}
              className="mb-1.5 flex h-8 w-full items-center justify-center gap-1.5 border border-dashed border-slate-300 bg-[#fbfaf6] text-[9px] font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-950"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add module
            </button>
            {modules.map((module) => {
              const active = selectedModuleId === module.id;
              const ready = evidence.verificationReadyModuleIds.includes(module.id);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => selectModule(module.id)}
                  aria-pressed={active}
                  className={`flex min-h-10 w-full items-center gap-2 px-2 text-left ${active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-[#ece6dc]'}`}
                >
                  <Cpu className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white/60' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9px] font-semibold">{module.name}</span>
                    <span className={`mt-0.5 block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{module.type} · {module.status || 'Draft'}</span>
                  </span>
                  {ready && <ShieldCheck className={`h-3.5 w-3.5 ${active ? 'text-emerald-300' : 'text-emerald-600'}`} aria-label="Verification evidence complete" />}
                </button>
              );
            })}
            {modules.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No firmware modules yet. Add responsibility explicitly; opening Firmware never creates one.</p>}
          </div>
        )}

        {drawerSection === 'files' && (
          <div className="space-y-0.5">
            {sourceFiles.map((file) => {
              const active = selectedFileId === file.id;
              const generated = Boolean(file.generated || file.isGenerated);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    setSelectedFileId(file.id);
                    setRepresentation('source');
                    setInspectorOpen(true);
                  }}
                  aria-pressed={active}
                  className={`flex min-h-9 w-full items-center gap-2 px-2 text-left ${active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-[#ece6dc]'}`}
                >
                  <FileCode2 className={`h-3.5 w-3.5 shrink-0 ${generated ? 'text-amber-500' : active ? 'text-white/60' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[9px]">{file.path}</span>
                    <span className={`mt-0.5 block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{generated ? 'generated · not verification' : file.dirty ? 'unsaved browser workspace edit' : 'project source record'}</span>
                  </span>
                </button>
              );
            })}
            {sourceFiles.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No source records. Create files explicitly in Source; #18 remains responsible for a real filesystem-backed tree.</p>}
          </div>
        )}

        {drawerSection === 'hardware-map' && (
          <div className="space-y-1">
            <p className="px-2 py-2 text-[9px] leading-4 text-slate-500">Choose the firmware responsibility whose canonical component/pin/net links you want to inspect.</p>
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => selectModule(module.id, 'hardware-map')}
                className="w-full border border-slate-200 bg-[#fbfaf6] px-2 py-2 text-left hover:border-slate-400"
              >
                <span className="block truncate text-[9px] font-semibold text-slate-800">{module.name}</span>
                <span className="mt-0.5 block text-[8px] text-slate-400">{module.linkedComponentIds.length} components · {module.linkedPinIds.length} pins · {module.linkedNetIds.length} nets</span>
              </button>
            ))}
          </div>
        )}

        {drawerSection === 'environment' && (
          <div className="p-2">
            <div className="border border-slate-200 bg-[#fbfaf6] p-2.5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Recorded environment</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-800">{firmwareConfiguration?.environmentName || 'Unresolved'}</p>
              <p className="mt-2 text-[9px] leading-4 text-slate-500">This is project metadata, not proof that PlatformIO is installed or that a build can run. Real environments/tasks come from #18.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
