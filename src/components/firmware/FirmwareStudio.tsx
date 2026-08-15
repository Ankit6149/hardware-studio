'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileCheck2,
  GitBranch,
  Link2,
  Plus,
  ShieldCheck,
  Trash2,
  Usb,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { FirmwareStateMachineCanvas } from './FirmwareStateMachineCanvas';
import { FirmwareCodePreview } from './FirmwareCodePreview';
import { validateStateMachine } from '../../lib/firmware/firmwareValidation';
import {
  createBuildEvidenceRecord,
  createDeviceEvidenceRecords,
  evaluateFirmwareEvidence,
  getFirmwareBuildEvidence,
  getModuleVerificationBlockers,
  type FirmwareBuildOutcome,
} from '../../lib/firmware/firmwareEvidence';
import type { FirmwareModule, FirmwareState } from '../../types';

type FirmwareMode = 'modules' | 'state-machine' | 'hardware-map' | 'source' | 'evidence';

interface FirmwareStudioProps {
  initialMode?: string;
}

const modeLabels: { id: FirmwareMode; label: string; icon: React.ReactNode }[] = [
  { id: 'modules', label: 'Modules', icon: <Cpu className="h-3.5 w-3.5" /> },
  { id: 'state-machine', label: 'Behavior', icon: <GitBranch className="h-3.5 w-3.5" /> },
  { id: 'hardware-map', label: 'Hardware map', icon: <Link2 className="h-3.5 w-3.5" /> },
  { id: 'source', label: 'Source', icon: <Code2 className="h-3.5 w-3.5" /> },
  { id: 'evidence', label: 'Evidence', icon: <FileCheck2 className="h-3.5 w-3.5" /> },
];

function normalizeInitialMode(initialMode?: string): FirmwareMode {
  if (initialMode === 'modules' || initialMode === 'state-machine' || initialMode === 'hardware-map' || initialMode === 'source' || initialMode === 'evidence') return initialMode;
  return 'modules';
}

export const FirmwareStudio: React.FC<FirmwareStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const feedback = useFeedback();
  const [mode, setMode] = useState<FirmwareMode>(normalizeInitialMode(initialMode));
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  const [buildEnvironment, setBuildEnvironment] = useState(store.firmwareConfiguration?.environmentName || '');
  const [buildOutcome, setBuildOutcome] = useState<FirmwareBuildOutcome>('Needs Review');
  const [buildToolchain, setBuildToolchain] = useState('');
  const [buildArtifact, setBuildArtifact] = useState('');
  const [buildHash, setBuildHash] = useState('');
  const [buildLog, setBuildLog] = useState('');
  const [buildOperator, setBuildOperator] = useState('');

  const [deviceBuildId, setDeviceBuildId] = useState('');
  const [deviceLabel, setDeviceLabel] = useState('');
  const [deviceConnection, setDeviceConnection] = useState<'Serial' | 'USB' | 'Network' | 'Manual'>('USB');
  const [deviceResult, setDeviceResult] = useState<'Pass' | 'Fail' | 'Inconclusive'>('Inconclusive');
  const [deviceObservation, setDeviceObservation] = useState('');
  const [deviceEvidenceReference, setDeviceEvidenceReference] = useState('');
  const [deviceOperator, setDeviceOperator] = useState('');

  const firmwareModules = store.firmwareModules || [];
  const firmwareStates = store.firmwareStates || [];
  const firmwareTransitions = store.firmwareTransitions || [];
  const sourceFiles = store.firmwareSourceFiles || [];
  const boardComponents = store.boardComponents || [];
  const nets = store.nets || [];
  const warnings = useMemo(
    () => validateStateMachine(firmwareStates, firmwareTransitions),
    [firmwareStates, firmwareTransitions],
  );
  const evidenceSnapshot = useMemo(() => evaluateFirmwareEvidence(store), [store]);
  const buildEvidence = useMemo(() => getFirmwareBuildEvidence(store), [store]);

  const selectedModule = firmwareModules.find((module) => module.id === selectedModuleId) || firmwareModules[0] || null;
  const effectiveModuleId = selectedModule?.id || null;
  const selectedState = selectedStateId ? firmwareStates.find((state) => state.id === selectedStateId) : null;
  const selectedTransition = selectedTransitionId ? firmwareTransitions.find((transition) => transition.id === selectedTransitionId) : null;
  const verificationBlockers = selectedModule ? (evidenceSnapshot.blockersByModuleId[selectedModule.id] || []) : [];
  const verificationReady = selectedModule ? evidenceSnapshot.verificationReadyModuleIds.includes(selectedModule.id) : false;
  const linkedRealSourceFiles = selectedModule
    ? sourceFiles.filter((file) => !file.generated && !file.isGenerated && file.content.trim() && file.linkedModuleIds?.includes(selectedModule.id))
    : [];
  const selectedModuleBuilds = selectedModule
    ? buildEvidence.filter((record) => record.moduleIds.includes(selectedModule.id))
    : [];
  const successfulModuleBuilds = selectedModuleBuilds.filter((record) => record.outcome === 'Succeeded');
  const effectiveDeviceBuildId = deviceBuildId || successfulModuleBuilds[0]?.id || '';

  const selectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setDeviceBuildId('');
  };

  const addModule = () => {
    store.executeProjectCommand('ADD_MODULE', 'Add firmware module', () => {
      store.addFirmwareModule({
        name: `Module_${firmwareModules.length + 1}`,
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
    });
  };

  const deleteModule = async (module: FirmwareModule) => {
    const confirmed = await feedback.confirm({
      title: `Delete ${module.name}?`,
      description: 'This removes the firmware module and its current project links. Build and validation evidence remain historical records unless separately removed.',
      confirmLabel: 'Delete module',
      cancelLabel: 'Keep module',
      variant: 'destructive',
    });
    if (!confirmed) return;
    store.executeProjectCommand('DEL_MODULE', `Delete firmware module ${module.name}`, () => store.deleteFirmwareModule(module.id));
    if (selectedModuleId === module.id) setSelectedModuleId(null);
  };

  const updateModuleStatus = (status: 'Draft' | 'Implemented' | 'Needs Review') => {
    if (!selectedModule) return;
    store.updateFirmwareModule(selectedModule.id, { status });
  };

  const markModuleVerified = () => {
    if (!selectedModule) return;
    const currentProject = useProjectStore.getState();
    const blockers = getModuleVerificationBlockers(currentProject, selectedModule);
    if (blockers.length > 0) {
      feedback.notify({ tone: 'warning', title: 'Verification evidence incomplete', detail: blockers[0] });
      return;
    }
    currentProject.executeProjectCommand('VERIFY_FW_MODULE', `Verify firmware module ${selectedModule.name}`, () => {
      useProjectStore.getState().updateFirmwareModule(selectedModule.id, { status: 'Verified' });
    });
    feedback.notify({ tone: 'success', title: 'Firmware module verified', detail: 'The current source, hardware mapping, build record, and passing device observation support this state.' });
  };

  const toggleSourceFile = (fileId: string) => {
    if (!selectedModule) return;
    store.updateProjectState({
      firmwareSourceFiles: sourceFiles.map((file) => {
        if (file.id !== fileId) return file;
        const current = file.linkedModuleIds || [];
        const linkedModuleIds = current.includes(selectedModule.id)
          ? current.filter((id) => id !== selectedModule.id)
          : [...current, selectedModule.id];
        return { ...file, linkedModuleIds };
      }),
    });
  };

  const toggleComponent = (componentId: string) => {
    if (!selectedModule) return;
    const isLinked = selectedModule.linkedComponentIds.includes(componentId);
    const linkedComponentIds = isLinked
      ? selectedModule.linkedComponentIds.filter((id) => id !== componentId)
      : [...selectedModule.linkedComponentIds, componentId];
    const remainingPins = new Set(
      boardComponents
        .filter((component) => linkedComponentIds.includes(component.id))
        .flatMap((component) => component.pins || [])
        .map((pin) => pin.id),
    );
    const remainingNetIds = new Set(
      boardComponents
        .filter((component) => linkedComponentIds.includes(component.id))
        .flatMap((component) => component.pins || [])
        .map((pin) => pin.netId)
        .filter((netId): netId is string => Boolean(netId)),
    );
    store.updateFirmwareModule(selectedModule.id, {
      linkedComponentIds,
      linkedPinIds: selectedModule.linkedPinIds.filter((pinId) => remainingPins.has(pinId)),
      linkedNetIds: selectedModule.linkedNetIds.filter((netId) => remainingNetIds.has(netId)),
    });
  };

  const togglePin = (componentId: string, pinId: string, netId?: string) => {
    if (!selectedModule || !selectedModule.linkedComponentIds.includes(componentId)) return;
    const currentlyLinked = selectedModule.linkedPinIds.includes(pinId);
    const linkedPinIds = currentlyLinked
      ? selectedModule.linkedPinIds.filter((id) => id !== pinId)
      : [...selectedModule.linkedPinIds, pinId];
    let linkedNetIds = [...selectedModule.linkedNetIds];
    if (netId && !currentlyLinked && !linkedNetIds.includes(netId)) linkedNetIds.push(netId);
    if (netId && currentlyLinked) {
      const anotherMappedPinUsesNet = boardComponents
        .flatMap((component) => component.pins || [])
        .some((pin) => pin.id !== pinId && linkedPinIds.includes(pin.id) && pin.netId === netId);
      if (!anotherMappedPinUsesNet) linkedNetIds = linkedNetIds.filter((id) => id !== netId);
    }
    store.updateFirmwareModule(selectedModule.id, { linkedPinIds, linkedNetIds });
  };

  const toggleNet = (netId: string) => {
    if (!selectedModule) return;
    store.updateFirmwareModule(selectedModule.id, {
      linkedNetIds: selectedModule.linkedNetIds.includes(netId)
        ? selectedModule.linkedNetIds.filter((id) => id !== netId)
        : [...selectedModule.linkedNetIds, netId],
    });
  };

  const addState = () => {
    const index = firmwareStates.length;
    const column = index % 4;
    const row = Math.floor(index / 4);
    store.executeProjectCommand('ADD_STATE', 'Add firmware state', () => {
      store.addFirmwareState({
        name: `State_${index + 1}`,
        type: index === 0 ? 'Initial' : 'Normal',
        x: 180 + column * 180,
        y: 120 + row * 140,
        entryActions: [],
        exitActions: [],
        linkedModuleIds: effectiveModuleId ? [effectiveModuleId] : [],
        linkedComponentIds: selectedModule?.linkedComponentIds || [],
      });
    });
  };

  const deleteStateOrTransition = async () => {
    if (selectedState) {
      const confirmed = await feedback.confirm({
        title: `Delete ${selectedState.name}?`,
        description: 'Transitions connected to this state may also become invalid. Review the behavior graph after deletion.',
        confirmLabel: 'Delete state',
        cancelLabel: 'Keep state',
        variant: 'destructive',
      });
      if (!confirmed) return;
      store.executeProjectCommand('DEL_STATE', `Delete firmware state ${selectedState.name}`, () => store.deleteFirmwareState(selectedState.id));
      setSelectedStateId(null);
      return;
    }
    if (selectedTransition) {
      store.executeProjectCommand('DEL_TRANS', 'Delete firmware transition', () => store.deleteFirmwareTransition(selectedTransition.id));
      setSelectedTransitionId(null);
    }
  };

  const recordBuildEvidence = () => {
    if (!selectedModule) return;
    if (!buildEnvironment.trim()) {
      feedback.notify({ tone: 'warning', title: 'Build environment required', detail: 'Record the real environment or target used for this build result.' });
      return;
    }
    if (!buildLog.trim()) {
      feedback.notify({ tone: 'warning', title: 'Build log required', detail: 'Paste or summarize the real compiler/build result before recording evidence.' });
      return;
    }
    if (linkedRealSourceFiles.length === 0) {
      feedback.notify({ tone: 'warning', title: 'Link real source first', detail: 'Generated workspace files alone cannot support a firmware build record.' });
      return;
    }

    const record = createBuildEvidenceRecord({
      id: `fw_build_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      environmentName: buildEnvironment.trim(),
      outcome: buildOutcome,
      moduleIds: [selectedModule.id],
      sourceFileIds: linkedRealSourceFiles.map((file) => file.id),
      artifactName: buildArtifact.trim() || undefined,
      artifactSha256: buildHash.trim() || undefined,
      toolchain: buildToolchain.trim() || undefined,
      log: buildLog.trim(),
      recordedBy: buildOperator.trim() || undefined,
    });
    store.updateProjectState({
      firmwareBuildRecords: [...(store.firmwareBuildRecords || []), record as unknown as Record<string, unknown>],
    });
    setBuildLog('');
    setBuildArtifact('');
    setBuildHash('');
    feedback.notify({ tone: 'success', title: 'Build result recorded', detail: 'This is evidence metadata only; Hardware Studio did not run the compiler automatically.' });
  };

  const recordDeviceEvidence = () => {
    if (!selectedModule) return;
    if (!effectiveDeviceBuildId) {
      feedback.notify({ tone: 'warning', title: 'Successful build required', detail: 'Record or select a successful build for this module before device evidence.' });
      return;
    }
    try {
      const current = useProjectStore.getState();
      const id = Date.now().toString(36);
      const { test, run } = createDeviceEvidenceRecords(current, {
        id,
        createdAt: new Date().toISOString(),
        moduleId: selectedModule.id,
        buildRecordId: effectiveDeviceBuildId,
        deviceLabel,
        result: deviceResult,
        connection: deviceConnection,
        observation: deviceObservation,
        evidenceReference: deviceEvidenceReference,
        operator: deviceOperator,
      });
      current.updateProjectState({
        validationTests: [...(current.validationTests || []), test],
        validationRuns: [...(current.validationRuns || []), run],
      });
      setDeviceObservation('');
      setDeviceEvidenceReference('');
      feedback.notify({ tone: 'success', title: 'Local-device evidence recorded', detail: 'The observation is linked into Validation and to this firmware module’s canonical hardware references.' });
    } catch (error) {
      feedback.notify({ tone: 'warning', title: 'Device evidence not recorded', detail: error instanceof Error ? error.message : 'Review the selected module and build evidence.' });
    }
  };

  const evidenceTests = (store.validationTests || []).filter((test) => test.category === 'Firmware' && test.name.startsWith('Local device evidence · '));
  const evidenceTestById = new Map(evidenceTests.map((test) => [test.id, test]));
  const evidenceRuns = (store.validationRuns || []).filter((run) => evidenceTestById.has(run.testId));

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Firmware engineering workspace">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Firmware workspace</p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-500">evidence-gated verification</span>
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
              {firmwareModules.length} modules · {evidenceSnapshot.mappedModuleCount} hardware-mapped · {evidenceSnapshot.sourceFileCount} real source files · {evidenceSnapshot.successfulBuildCount} successful build records · {evidenceSnapshot.deviceEvidenceCount} device observations
            </p>
          </div>
          <button type="button" onClick={addModule} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white hover:bg-slate-800"><Plus className="h-3.5 w-3.5" /> Add module</button>
        </div>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1.5" aria-label="Firmware workspace sections">
          {modeLabels.map((item) => (
            <button key={item.id} type="button" onClick={() => setMode(item.id)} aria-current={mode === item.id ? 'page' : undefined} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold transition ${mode === item.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
      </header>

      {mode === 'source' ? (
        <div className="min-h-0 flex-1"><FirmwareCodePreview /></div>
      ) : mode === 'state-machine' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-1.5">
            <button type="button" onClick={addState} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /> Add state</button>
            <button type="button" onClick={deleteStateOrTransition} disabled={!selectedState && !selectedTransition} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /> Delete selected</button>
            <button type="button" onClick={() => setShowWarnings((current) => !current)} className={`ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold ${warnings.length ? 'text-amber-700 hover:bg-amber-50' : 'text-slate-500 hover:bg-slate-100'}`}><AlertTriangle className="h-3.5 w-3.5" /> {warnings.length} findings</button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_18rem] overflow-hidden">
            <div className="relative min-h-0 min-w-0">
              <FirmwareStateMachineCanvas onStateSelect={setSelectedStateId} onTransitionSelect={setSelectedTransitionId} selectedStateId={selectedStateId} />
              {showWarnings && warnings.length > 0 && <div className="absolute bottom-3 left-3 right-3 z-10 max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-white p-3 shadow-xl">{warnings.map((warning, index) => <p key={`${warning.message}-${index}`} className={`text-[10px] leading-4 ${warning.severity === 'Error' ? 'text-rose-700' : 'text-amber-700'}`}>[{warning.severity}] {warning.message}</p>)}</div>}
            </div>
            <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-4">
              {selectedState ? (
                <div className="space-y-3">
                  <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">State</p><input value={selectedState.name} onChange={(event) => store.updateFirmwareState(selectedState.id, { name: event.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-semibold focus:border-indigo-400 focus:outline-none" /></div>
                  <label className="block text-[10px] font-semibold text-slate-600">Type<select value={selectedState.type} onChange={(event) => store.updateFirmwareState(selectedState.id, { type: event.target.value as FirmwareState['type'] })} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-slate-800 focus:border-indigo-400 focus:outline-none">{['Initial', 'Normal', 'Power', 'Charging', 'Fault', 'Debug', 'Final'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label className="block text-[10px] font-semibold text-slate-600">Description<textarea value={selectedState.description || ''} onChange={(event) => store.updateFirmwareState(selectedState.id, { description: event.target.value })} className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-200 p-2.5 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label>
                  <label className="block text-[10px] font-semibold text-slate-600">Entry actions<textarea value={selectedState.entryActions.join('\n')} onChange={(event) => store.updateFirmwareState(selectedState.id, { entryActions: event.target.value.split('\n').filter((line) => line.trim()) })} className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-200 p-2.5 font-mono text-[10px] font-normal focus:border-indigo-400 focus:outline-none" /></label>
                </div>
              ) : selectedTransition ? (
                <div className="space-y-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Transition</p>
                  <label className="block text-[10px] font-semibold text-slate-600">Event<input value={selectedTransition.event} onChange={(event) => store.updateFirmwareTransition(selectedTransition.id, { event: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label>
                  <label className="block text-[10px] font-semibold text-slate-600">Condition<input value={selectedTransition.condition || ''} onChange={(event) => store.updateFirmwareTransition(selectedTransition.id, { condition: event.target.value || undefined })} className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label>
                  <label className="block text-[10px] font-semibold text-slate-600">Action<input value={selectedTransition.action || ''} onChange={(event) => store.updateFirmwareTransition(selectedTransition.id, { action: event.target.value || undefined })} className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label>
                </div>
              ) : <div className="grid h-full place-items-center text-center text-[10px] leading-5 text-slate-400">Select a state or transition to inspect its real behavior data.</div>}
            </aside>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[13rem_minmax(0,1fr)] overflow-hidden xl:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-2">
            <div className="flex items-center justify-between px-1 py-1.5"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Modules</p><Cpu className="h-3.5 w-3.5 text-slate-400" /></div>
            <div className="space-y-1">
              {firmwareModules.map((module) => {
                const active = module.id === selectedModule?.id;
                const ready = evidenceSnapshot.verificationReadyModuleIds.includes(module.id);
                return <button key={module.id} type="button" onClick={() => selectModule(module.id)} className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left ${active ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-slate-800">{module.name}</span><span className="mt-0.5 block truncate text-[9px] text-slate-400">{module.type} · {module.status || 'Draft'}</span></span>{ready ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}</button>;
              })}
              {firmwareModules.length === 0 && <div className="px-2 py-8 text-center"><Cpu className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-[10px] leading-4 text-slate-400">Add a module to define firmware responsibility before mapping or evidence.</p></div>}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto">
            {!selectedModule ? (
              <div className="grid min-h-full place-items-center p-8 text-center"><div className="max-w-sm"><Cpu className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-semibold text-slate-800">No firmware module yet</h2><p className="mt-1 text-xs leading-5 text-slate-500">Create a module, then attach real source, canonical hardware mappings, build results, and local-device evidence.</p></div></div>
            ) : mode === 'modules' ? (
              <div className="mx-auto max-w-5xl p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Firmware responsibility</p><input value={selectedModule.name} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { name: event.target.value })} className="mt-1 min-w-[16rem] border-0 bg-transparent p-0 text-xl font-semibold tracking-tight text-slate-950 outline-none" /></div>
                  <div className="flex items-center gap-2"><select value={selectedModule.status || 'Draft'} onChange={(event) => updateModuleStatus(event.target.value as 'Draft' | 'Implemented' | 'Needs Review')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700"><option value="Draft">Draft</option><option value="Implemented">Implemented</option><option value="Needs Review">Needs Review</option>{selectedModule.status === 'Verified' && <option value="Verified" disabled>Verified</option>}</select><button type="button" onClick={() => void deleteModule(selectedModule)} className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50" title="Delete module"><Trash2 className="h-4 w-4" /></button></div>
                </div>

                <div className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
                  <div className="space-y-5">
                    <label className="block"><span className="text-[10px] font-semibold text-slate-600">Module type</span><select value={selectedModule.type} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { type: event.target.value as FirmwareModule['type'] })} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none">{['Driver', 'Service', 'Communication', 'Power', 'Safety', 'Application', 'Test'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                    <label className="block"><span className="text-[10px] font-semibold text-slate-600">Responsibility</span><textarea value={selectedModule.description} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { description: event.target.value })} className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-200 p-3 text-xs leading-5 focus:border-indigo-400 focus:outline-none" placeholder="What this module owns, and what it explicitly does not own." /></label>
                    <section><div className="flex items-center justify-between"><div><h3 className="text-xs font-semibold text-slate-900">Source linkage</h3><p className="mt-0.5 text-[10px] text-slate-500">Generated workspace files do not count as implementation evidence.</p></div><button type="button" onClick={() => setMode('source')} className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900">Open source editor</button></div><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{sourceFiles.map((file) => <label key={file.id} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-xs hover:bg-slate-50"><input type="checkbox" checked={Boolean(file.linkedModuleIds?.includes(selectedModule.id))} onChange={() => toggleSourceFile(file.id)} /><span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-700">{file.path}</span><span className={`text-[9px] font-semibold ${file.generated || file.isGenerated ? 'text-amber-600' : 'text-emerald-700'}`}>{file.generated || file.isGenerated ? 'generated' : 'real source'}</span></label>)}{sourceFiles.length === 0 && <p className="py-5 text-center text-[10px] text-slate-400">Open Source to create or import a real implementation file.</p>}</div></section>
                  </div>

                  <aside className="space-y-4 border-l border-slate-200 pl-5">
                    <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Verification gate</p><p className={`mt-2 text-sm font-semibold ${verificationReady ? 'text-emerald-700' : 'text-slate-900'}`}>{verificationReady ? 'Evidence complete' : `${verificationBlockers.length} blocker${verificationBlockers.length === 1 ? '' : 's'}`}</p></div>
                    {verificationBlockers.length > 0 && <div className="space-y-2">{verificationBlockers.map((blocker) => <div key={blocker} className="flex items-start gap-2 text-[10px] leading-4 text-slate-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span>{blocker}</span></div>)}</div>}
                    {selectedModule.status === 'Verified' && !verificationReady && <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-[10px] leading-4 text-rose-700">The existing Verified label is no longer supported by current evidence. Restore the evidence chain or downgrade the module status.</div>}
                    <button type="button" disabled={!verificationReady} onClick={markModuleVerified} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"><ShieldCheck className="h-4 w-4" /> Mark Verified</button>
                  </aside>
                </div>
              </div>
            ) : mode === 'hardware-map' ? (
              <div className="mx-auto max-w-6xl p-4 sm:p-5">
                <div className="border-b border-slate-200 pb-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Canonical hardware mapping</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{selectedModule.name}</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Map firmware to the same project component IDs, pin IDs, and net IDs used by Schematic and PCB. Nothing here creates a parallel hardware model.</p></div>

                <div className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
                  <section><h3 className="text-xs font-semibold text-slate-900">Components & pins</h3><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{boardComponents.map((component) => { const linked = selectedModule.linkedComponentIds.includes(component.id); return <div key={component.id} className="py-2.5"><label className="flex cursor-pointer items-center gap-3 px-2"><input type="checkbox" checked={linked} onChange={() => toggleComponent(component.id)} /><span className="font-mono text-[10px] font-bold text-slate-800">{component.referenceDesignator}</span><span className="min-w-0 flex-1 truncate text-xs text-slate-700">{component.componentName}</span><span className="font-mono text-[9px] text-slate-400">{component.id}</span></label>{linked && (component.pins || []).length > 0 && <div className="ml-8 mt-2 grid gap-1 sm:grid-cols-2">{(component.pins || []).map((pin) => <label key={pin.id} className="flex cursor-pointer items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-600"><input type="checkbox" checked={selectedModule.linkedPinIds.includes(pin.id)} onChange={() => togglePin(component.id, pin.id, pin.netId)} /><span className="font-mono font-semibold text-slate-800">{pin.pinNumber}</span><span className="truncate">{pin.pinName}</span><span className="ml-auto truncate font-mono text-[9px] text-slate-400">{pin.netName || 'unconnected'}</span></label>)}</div>}</div>; })}{boardComponents.length === 0 && <p className="py-8 text-center text-[10px] text-slate-400">No canonical project components exist yet. Add them in Electronics first.</p>}</div></section>
                  <section><h3 className="text-xs font-semibold text-slate-900">Nets</h3><p className="mt-1 text-[10px] leading-4 text-slate-500">Pin selection links its known net automatically; add other explicit bus or rail dependencies here.</p><div className="mt-2 space-y-1">{nets.map((net) => <label key={net.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[10px] hover:bg-slate-50"><input type="checkbox" checked={selectedModule.linkedNetIds.includes(net.id)} onChange={() => toggleNet(net.id)} /><span className="min-w-0 flex-1 truncate font-mono font-semibold text-slate-800">{net.netName}</span><span className="text-slate-400">{net.protocol || net.netType}</span></label>)}</div><div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-600"><strong className="text-slate-800">Current mapping:</strong> {selectedModule.linkedComponentIds.length} components · {selectedModule.linkedPinIds.length} pins · {selectedModule.linkedNetIds.length} nets</div></section>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-6xl p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Firmware evidence</p><h2 className="mt-1 text-lg font-semibold text-slate-950">Build & local-device records</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">These forms record results produced by real external tools or a real device. Hardware Studio does not claim to compile, flash, or query your device from this browser.</p></div><div className="flex gap-3 text-center text-[10px]"><div><strong className="block text-lg text-slate-950">{selectedModuleBuilds.length}</strong>build records</div><div><strong className="block text-lg text-slate-950">{evidenceRuns.filter((run) => evidenceTestById.get(run.testId)?.linkedFirmwareModuleIds?.includes(selectedModule.id)).length}</strong>device runs</div></div></div>

                <div className="grid gap-6 py-5 xl:grid-cols-2">
                  <section className="min-w-0"><div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-indigo-600" /><h3 className="text-xs font-semibold text-slate-900">Record build result</h3></div><p className="mt-1 text-[10px] leading-4 text-slate-500">Uses the {linkedRealSourceFiles.length} non-generated source file{linkedRealSourceFiles.length === 1 ? '' : 's'} linked to {selectedModule.name}.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Environment *<input value={buildEnvironment} onChange={(event) => setBuildEnvironment(event.target.value)} placeholder="e.g. PlatformIO env name" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Outcome<select value={buildOutcome} onChange={(event) => setBuildOutcome(event.target.value as FirmwareBuildOutcome)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none"><option value="Needs Review">Needs Review</option><option value="Succeeded">Succeeded</option><option value="Failed">Failed</option></select></label><label className="text-[10px] font-semibold text-slate-600">Toolchain<input value={buildToolchain} onChange={(event) => setBuildToolchain(event.target.value)} placeholder="Compiler / build tool" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Operator<input value={buildOperator} onChange={(event) => setBuildOperator(event.target.value)} placeholder="Optional" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Artifact name<input value={buildArtifact} onChange={(event) => setBuildArtifact(event.target.value)} placeholder="Optional .bin/.hex name" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Artifact SHA-256<input value={buildHash} onChange={(event) => setBuildHash(event.target.value)} placeholder="Only if actually calculated" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 font-mono text-[10px] font-normal focus:border-indigo-400 focus:outline-none" /></label></div><label className="mt-3 block text-[10px] font-semibold text-slate-600">Build log / result *<textarea value={buildLog} onChange={(event) => setBuildLog(event.target.value)} placeholder="Paste the relevant real build output or a precise result summary." className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-200 p-2.5 font-mono text-[10px] font-normal leading-4 focus:border-indigo-400 focus:outline-none" /></label><button type="button" onClick={recordBuildEvidence} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"><FileCheck2 className="h-4 w-4" /> Record build result</button></section>

                  <section className="min-w-0 border-t border-slate-200 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><div className="flex items-center gap-2"><Usb className="h-4 w-4 text-indigo-600" /><h3 className="text-xs font-semibold text-slate-900">Record local-device observation</h3></div><p className="mt-1 text-[10px] leading-4 text-slate-500">A passing observation can support verification only when it references a successful build for this module.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Successful build *<select value={effectiveDeviceBuildId} onChange={(event) => setDeviceBuildId(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none"><option value="">Select build</option>{successfulModuleBuilds.map((build) => <option key={build.id} value={build.id}>{build.environmentName} · {new Date(build.createdAt).toLocaleString()}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Device label *<input value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} placeholder="e.g. EVT board #2" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Connection<select value={deviceConnection} onChange={(event) => setDeviceConnection(event.target.value as typeof deviceConnection)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none">{['USB', 'Serial', 'Network', 'Manual'].map((connection) => <option key={connection} value={connection}>{connection}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Result<select value={deviceResult} onChange={(event) => setDeviceResult(event.target.value as typeof deviceResult)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none"><option value="Inconclusive">Inconclusive</option><option value="Pass">Pass</option><option value="Fail">Fail</option></select></label><label className="text-[10px] font-semibold text-slate-600">Evidence reference<input value={deviceEvidenceReference} onChange={(event) => setDeviceEvidenceReference(event.target.value)} placeholder="Photo/log/file reference" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label><label className="text-[10px] font-semibold text-slate-600">Operator<input value={deviceOperator} onChange={(event) => setDeviceOperator(event.target.value)} placeholder="Optional" className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs font-normal focus:border-indigo-400 focus:outline-none" /></label></div><label className="mt-3 block text-[10px] font-semibold text-slate-600">Observed behavior *<textarea value={deviceObservation} onChange={(event) => setDeviceObservation(event.target.value)} placeholder="What did the real device do? Record the observation, not an expected result." className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-200 p-2.5 text-xs font-normal leading-5 focus:border-indigo-400 focus:outline-none" /></label><button type="button" onClick={recordDeviceEvidence} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-35" disabled={successfulModuleBuilds.length === 0}><Usb className="h-4 w-4" /> Record device evidence</button></section>
                </div>

                <section className="border-t border-slate-200 pt-5"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-900">Evidence history</h3><span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${verificationReady ? 'text-emerald-700' : 'text-slate-500'}`}>{verificationReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}{verificationReady ? 'Verification chain complete' : `${verificationBlockers.length} blockers remain`}</span></div><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{selectedModuleBuilds.map((build) => <div key={build.id} className="grid gap-2 px-2 py-2.5 text-[10px] sm:grid-cols-[8rem_8rem_minmax(0,1fr)]"><span className={`font-semibold ${build.outcome === 'Succeeded' ? 'text-emerald-700' : build.outcome === 'Failed' ? 'text-rose-700' : 'text-amber-700'}`}>{build.outcome}</span><span className="font-mono text-slate-500">{build.environmentName}</span><span className="truncate text-slate-600">{build.log}</span></div>)}{evidenceRuns.filter((run) => evidenceTestById.get(run.testId)?.linkedFirmwareModuleIds?.includes(selectedModule.id)).map((run) => <div key={run.id} className="grid gap-2 px-2 py-2.5 text-[10px] sm:grid-cols-[8rem_8rem_minmax(0,1fr)]"><span className={`font-semibold ${run.status === 'Pass' || run.status === 'Passed' ? 'text-emerald-700' : run.status === 'Fail' || run.status === 'Failed' ? 'text-rose-700' : 'text-amber-700'}`}>Device {run.status}</span><span className="truncate text-slate-500">{run.environment || 'Device'}</span><span className="truncate text-slate-600">{run.logs.find((line) => line.startsWith('Observation:')) || 'Observation recorded in validation run'}</span></div>)}{selectedModuleBuilds.length === 0 && evidenceRuns.filter((run) => evidenceTestById.get(run.testId)?.linkedFirmwareModuleIds?.includes(selectedModule.id)).length === 0 && <p className="py-6 text-center text-[10px] text-slate-400">No recorded build or local-device evidence for this module yet.</p>}</div></section>
              </div>
            )}
          </main>
        </div>
      )}
    </section>
  );
};
