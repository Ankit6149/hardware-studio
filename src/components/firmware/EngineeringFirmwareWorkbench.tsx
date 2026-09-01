'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Code2,
  Cpu,
  FileCheck2,
  Link2,
  PanelRight,
  Plus,
  ShieldCheck,
  Trash2,
  Usb,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  useFirmwareWorkspaceUiStore,
  type FirmwareRepresentation,
} from '../../store/firmwareWorkspaceUiStore';
import type { FirmwareModule, FirmwareState, FirmwareTransition } from '../../types';
import { useFeedback } from '../feedback/FeedbackProvider';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringBottomDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';
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

interface EngineeringFirmwareWorkbenchProps {
  initialMode?: string;
}

const EMPTY_MODULES: FirmwareModule[] = [];
const EMPTY_STATES: FirmwareState[] = [];
const EMPTY_TRANSITIONS: FirmwareTransition[] = [];

function representationForInitialMode(initialMode?: string): FirmwareRepresentation {
  if (initialMode === 'state-machine') return 'behavior';
  if (initialMode === 'hardware-map') return 'hardware-map';
  if (initialMode === 'source') return 'source';
  return 'modules';
}

const representationTitle: Record<FirmwareRepresentation, string> = {
  modules: 'Modules',
  behavior: 'Behavior',
  'hardware-map': 'Hardware Map',
  source: 'Source',
};

function timestampIdentity(prefix: string): { id: string; createdAt: string } {
  const createdAt = new Date().toISOString();
  return { id: `${prefix}_${createdAt.replace(/[^0-9]/g, '')}`, createdAt };
}

export const EngineeringFirmwareWorkbench: React.FC<EngineeringFirmwareWorkbenchProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const feedback = useFeedback();

  const firmwareModules = store.firmwareModules ?? EMPTY_MODULES;
  const firmwareStates = store.firmwareStates ?? EMPTY_STATES;
  const firmwareTransitions = store.firmwareTransitions ?? EMPTY_TRANSITIONS;
  const sourceFiles = store.firmwareSourceFiles ?? [];
  const boardComponents = store.boardComponents ?? [];
  const nets = store.nets ?? [];

  const representation = useFirmwareWorkspaceUiStore((state) => state.representation);
  const selectedModuleId = useFirmwareWorkspaceUiStore((state) => state.selectedModuleId);
  const selectedFileId = useFirmwareWorkspaceUiStore((state) => state.selectedFileId);
  const inspectorOpen = useFirmwareWorkspaceUiStore((state) => state.inspectorOpen);
  const dockOpen = useFirmwareWorkspaceUiStore((state) => state.dockOpen);
  const dockTab = useFirmwareWorkspaceUiStore((state) => state.dockTab);
  const setRepresentation = useFirmwareWorkspaceUiStore((state) => state.setRepresentation);
  const setDrawerSection = useFirmwareWorkspaceUiStore((state) => state.setDrawerSection);
  const setInspectorOpen = useFirmwareWorkspaceUiStore((state) => state.setInspectorOpen);
  const setDockOpen = useFirmwareWorkspaceUiStore((state) => state.setDockOpen);
  const openDock = useFirmwareWorkspaceUiStore((state) => state.openDock);

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
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

  useEffect(() => {
    setRepresentation(representationForInitialMode(initialMode));
    if (initialMode === 'source') setDrawerSection('files');
    else if (initialMode === 'hardware-map') setDrawerSection('hardware-map');
    else setDrawerSection('modules');
    if (initialMode === 'evidence') openDock('build-evidence');
  }, [initialMode, openDock, setDrawerSection, setRepresentation]);

  const selectedModule = selectedModuleId
    ? firmwareModules.find((module) => module.id === selectedModuleId) || null
    : null;
  const selectedFile = selectedFileId
    ? sourceFiles.find((file) => file.id === selectedFileId) || null
    : null;
  const selectedState = selectedStateId ? firmwareStates.find((state) => state.id === selectedStateId) || null : null;
  const selectedTransition = selectedTransitionId ? firmwareTransitions.find((transition) => transition.id === selectedTransitionId) || null : null;

  const warnings = useMemo(
    () => validateStateMachine(firmwareStates, firmwareTransitions),
    [firmwareStates, firmwareTransitions],
  );
  const evidenceSnapshot = useMemo(() => evaluateFirmwareEvidence(store), [store]);
  const buildEvidence = useMemo(() => getFirmwareBuildEvidence(store), [store]);
  const verificationBlockers = selectedModule ? evidenceSnapshot.blockersByModuleId[selectedModule.id] || [] : [];
  const verificationReady = selectedModule ? evidenceSnapshot.verificationReadyModuleIds.includes(selectedModule.id) : false;
  const linkedRealSourceFiles = selectedModule
    ? sourceFiles.filter((file) => !file.generated && !file.isGenerated && file.content.trim() && file.linkedModuleIds?.includes(selectedModule.id))
    : [];
  const selectedModuleBuilds = selectedModule
    ? buildEvidence.filter((record) => record.moduleIds.includes(selectedModule.id))
    : [];
  const successfulModuleBuilds = selectedModuleBuilds.filter((record) => record.outcome === 'Succeeded');
  const problemCount = warnings.length + verificationBlockers.length;

  const evidenceTests = (store.validationTests ?? []).filter((test) => test.category === 'Firmware' && test.name.startsWith('Local device evidence · '));
  const evidenceTestById = new Map(evidenceTests.map((test) => [test.id, test]));
  const evidenceRuns = (store.validationRuns ?? []).filter((run) => evidenceTestById.has(run.testId));
  const selectedModuleDeviceRuns = selectedModule
    ? evidenceRuns.filter((run) => evidenceTestById.get(run.testId)?.linkedFirmwareModuleIds?.includes(selectedModule.id))
    : [];

  const toggleSourceFile = (fileId: string) => {
    if (!selectedModule) return;
    store.updateProjectState({
      firmwareSourceFiles: sourceFiles.map((file) => {
        if (file.id !== fileId) return file;
        const linked = file.linkedModuleIds ?? [];
        return {
          ...file,
          linkedModuleIds: linked.includes(selectedModule.id)
            ? linked.filter((id) => id !== selectedModule.id)
            : [...linked, selectedModule.id],
        };
      }),
    });
  };

  const toggleComponent = (componentId: string) => {
    if (!selectedModule) return;
    const linkedComponentIds = selectedModule.linkedComponentIds.includes(componentId)
      ? selectedModule.linkedComponentIds.filter((id) => id !== componentId)
      : [...selectedModule.linkedComponentIds, componentId];
    const remainingPins = new Set(
      boardComponents
        .filter((component) => linkedComponentIds.includes(component.id))
        .flatMap((component) => component.pins ?? [])
        .map((pin) => pin.id),
    );
    const remainingNetIds = new Set(
      boardComponents
        .filter((component) => linkedComponentIds.includes(component.id))
        .flatMap((component) => component.pins ?? [])
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
        .flatMap((component) => component.pins ?? [])
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
        linkedModuleIds: selectedModule ? [selectedModule.id] : [],
        linkedComponentIds: selectedModule?.linkedComponentIds ?? [],
      });
    });
  };

  const deleteBehaviorSelection = async () => {
    if (selectedState) {
      const confirmed = await feedback.confirm({
        title: `Delete ${selectedState.name}?`,
        description: 'Connected transitions may become invalid. Review Problems after deletion.',
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

  const deleteModule = async () => {
    if (!selectedModule) return;
    const confirmed = await feedback.confirm({
      title: `Delete ${selectedModule.name}?`,
      description: 'This removes the module and current project links. Historical validation/build records are separate evidence.',
      confirmLabel: 'Delete module',
      cancelLabel: 'Keep module',
      variant: 'destructive',
    });
    if (!confirmed) return;
    store.executeProjectCommand('DEL_MODULE', `Delete firmware module ${selectedModule.name}`, () => store.deleteFirmwareModule(selectedModule.id));
    useFirmwareWorkspaceUiStore.getState().setSelectedModuleId(null);
  };

  const markModuleVerified = () => {
    if (!selectedModule) return;
    const blockers = getModuleVerificationBlockers(useProjectStore.getState(), selectedModule);
    if (blockers.length > 0) {
      feedback.notify({ tone: 'warning', title: 'Verification evidence incomplete', detail: blockers[0] });
      return;
    }
    useProjectStore.getState().executeProjectCommand('VERIFY_FW_MODULE', `Verify firmware module ${selectedModule.name}`, () => {
      useProjectStore.getState().updateFirmwareModule(selectedModule.id, { status: 'Verified' });
    });
  };

  const recordBuildEvidence = () => {
    if (!selectedModule) return;
    if (!buildEnvironment.trim() || !buildLog.trim()) {
      feedback.notify({ tone: 'warning', title: 'Recorded environment and build result are required', detail: 'Record the real external environment and relevant build output. Hardware Studio did not execute this build.' });
      return;
    }
    if (linkedRealSourceFiles.length === 0) {
      feedback.notify({ tone: 'warning', title: 'Link real source first', detail: 'Generated scaffolding alone cannot support a firmware build record.' });
      return;
    }
    const identity = timestampIdentity('fw_build');
    const record = createBuildEvidenceRecord({
      id: identity.id,
      createdAt: identity.createdAt,
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
    store.updateProjectState({ firmwareBuildRecords: [...(store.firmwareBuildRecords ?? []), record as unknown as Record<string, unknown>] });
    setBuildLog('');
    setBuildArtifact('');
    setBuildHash('');
    feedback.notify({ tone: 'success', title: 'External build result recorded', detail: 'Evidence metadata was recorded. Hardware Studio did not run the compiler.' });
  };

  const recordDeviceEvidence = () => {
    if (!selectedModule) return;
    if (!deviceBuildId) {
      feedback.notify({ tone: 'warning', title: 'Choose a successful build explicitly', detail: 'No build is selected automatically for device evidence.' });
      return;
    }
    try {
      const current = useProjectStore.getState();
      const identity = timestampIdentity('fw_device');
      const { test, run } = createDeviceEvidenceRecords(current, {
        id: identity.id,
        createdAt: identity.createdAt,
        moduleId: selectedModule.id,
        buildRecordId: deviceBuildId,
        deviceLabel,
        result: deviceResult,
        connection: deviceConnection,
        observation: deviceObservation,
        evidenceReference: deviceEvidenceReference,
        operator: deviceOperator,
      });
      current.updateProjectState({
        validationTests: [...(current.validationTests ?? []), test],
        validationRuns: [...(current.validationRuns ?? []), run],
      });
      setDeviceObservation('');
      setDeviceEvidenceReference('');
      feedback.notify({ tone: 'success', title: 'External device observation recorded', detail: 'This records observed evidence only; Hardware Studio did not flash, query, or monitor the device.' });
    } catch (error) {
      feedback.notify({ tone: 'warning', title: 'Device evidence not recorded', detail: error instanceof Error ? error.message : 'Review module/build evidence.' });
    }
  };

  const openRepresentation = (next: FirmwareRepresentation) => {
    setRepresentation(next);
    if (next === 'source') setDrawerSection('files');
    else if (next === 'hardware-map') setDrawerSection('hardware-map');
    else setDrawerSection('modules');
  };

  const inspectorSubtitle = representation === 'source'
    ? selectedFile?.path || 'No source selected'
    : selectedModule?.name || (selectedState?.name ?? 'No module selected');

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-slate-900" aria-label="Firmware engineering workbench" data-workbench="firmware">
      <EngineeringEditorBar
        domain="Firmware"
        title={representationTitle[representation]}
        meta={`${firmwareModules.length} modules · ${sourceFiles.length} source records · ${warnings.length} behavior findings`}
        tools={representation === 'behavior' ? (
          <>
            <EditorToolButton label="Add state" onClick={addState}><Plus className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Delete" disabled={!selectedState && !selectedTransition} onClick={() => void deleteBehaviorSelection()}><Trash2 className="h-3.5 w-3.5" /></EditorToolButton>
          </>
        ) : undefined}
        docks={(
          <>
            <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen(!inspectorOpen)} />
            <EditorDockButton label="Problems" icon={AlertTriangle} active={dockOpen && dockTab === 'problems'} count={problemCount} onClick={() => openDock('problems')} />
            <EditorDockButton label="Build evidence" icon={FileCheck2} active={dockOpen && dockTab === 'build-evidence'} onClick={() => openDock('build-evidence')} />
            <EditorDockButton label="Device evidence" icon={Usb} active={dockOpen && dockTab === 'device-evidence'} onClick={() => openDock('device-evidence')} />
          </>
        )}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {representation === 'source' && <FirmwareCodePreview />}

        {representation === 'behavior' && (
          <div className="relative h-full min-h-0">
            <FirmwareStateMachineCanvas
              onStateSelect={(id) => { setSelectedStateId(id); setSelectedTransitionId(null); setInspectorOpen(Boolean(id)); }}
              onTransitionSelect={(id) => { setSelectedTransitionId(id); if (id) setSelectedStateId(null); }}
              selectedStateId={selectedStateId}
            />
          </div>
        )}

        {representation === 'modules' && (
          selectedModule ? (
            <div className="h-full overflow-y-auto p-5">
              <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">Selected firmware responsibility</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{selectedModule.name}</h2>
                    <p className="mt-1 text-xs text-slate-500">{selectedModule.type} · {selectedModule.status || 'Draft'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openRepresentation('source')} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700"><Code2 className="h-3.5 w-3.5" /> Source</button>
                    <button type="button" onClick={() => openRepresentation('hardware-map')} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700"><Link2 className="h-3.5 w-3.5" /> Hardware map</button>
                  </div>
                </div>

                <div className="grid gap-7 py-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
                  <section>
                    <div className="flex items-end justify-between gap-3"><div><h3 className="text-xs font-semibold text-slate-900">Implementation source linkage</h3><p className="mt-1 text-[10px] text-slate-500">Generated scaffolding is visible but never counts as implementation evidence.</p></div><button type="button" onClick={() => { setDrawerSection('files'); openRepresentation('source'); }} className="text-[10px] font-semibold text-slate-700 underline underline-offset-2">Choose file in drawer</button></div>
                    <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200 bg-white">
                      {sourceFiles.map((file) => (
                        <label key={file.id} className="flex min-h-10 cursor-pointer items-center gap-3 px-3 text-xs hover:bg-slate-50">
                          <input type="checkbox" checked={Boolean(file.linkedModuleIds?.includes(selectedModule.id))} onChange={() => toggleSourceFile(file.id)} />
                          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-700">{file.path}</span>
                          <span className={`text-[9px] font-semibold ${file.generated || file.isGenerated ? 'text-amber-600' : 'text-emerald-700'}`}>{file.generated || file.isGenerated ? 'generated' : 'real source record'}</span>
                        </label>
                      ))}
                      {sourceFiles.length === 0 && <p className="py-8 text-center text-[10px] text-slate-400">No source records yet. Source creation is explicit.</p>}
                    </div>
                  </section>

                  <section className="border-l border-slate-200 pl-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">Evidence gate</p>
                    <p className={`mt-2 text-sm font-semibold ${verificationReady ? 'text-emerald-700' : 'text-slate-900'}`}>{verificationReady ? 'Verification evidence complete' : `${verificationBlockers.length} blocker${verificationBlockers.length === 1 ? '' : 's'}`}</p>
                    <div className="mt-3 space-y-2">{verificationBlockers.map((blocker) => <div key={blocker} className="flex items-start gap-2 text-[10px] leading-4 text-slate-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span>{blocker}</span></div>)}</div>
                    <dl className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-[10px]"><div className="flex justify-between"><dt className="text-slate-500">Components</dt><dd className="font-mono">{selectedModule.linkedComponentIds.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Pins</dt><dd className="font-mono">{selectedModule.linkedPinIds.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Nets</dt><dd className="font-mono">{selectedModule.linkedNetIds.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Build records</dt><dd className="font-mono">{selectedModuleBuilds.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Device records</dt><dd className="font-mono">{selectedModuleDeviceRuns.length}</dd></div></dl>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center"><div className="max-w-sm"><Cpu className="mx-auto h-7 w-7 text-slate-300" /><h2 className="mt-3 text-sm font-semibold text-slate-800">Select a firmware module</h2><p className="mt-2 text-[11px] leading-5 text-slate-500">Opening Firmware does not silently choose the first module. Select a responsibility from the Project Drawer or add one explicitly.</p></div></div>
          )
        )}

        {representation === 'hardware-map' && (
          selectedModule ? (
            <div className="h-full overflow-y-auto p-5">
              <div className="mx-auto max-w-6xl">
                <div className="border-b border-slate-200 pb-4"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">Canonical hardware links</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{selectedModule.name}</h2><p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500">These checkboxes link to the same project component, pin and net IDs used by Electronics. They do not create a parallel firmware hardware model.</p></div>
                <div className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
                  <section><h3 className="text-xs font-semibold text-slate-900">Components & pins</h3><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200 bg-white">{boardComponents.map((component) => { const linked = selectedModule.linkedComponentIds.includes(component.id); return <div key={component.id} className="py-2.5"><label className="flex cursor-pointer items-center gap-3 px-2"><input type="checkbox" checked={linked} onChange={() => toggleComponent(component.id)} /><span className="font-mono text-[10px] font-bold text-slate-800">{component.referenceDesignator}</span><span className="min-w-0 flex-1 truncate text-xs text-slate-700">{component.componentName}</span></label>{linked && (component.pins ?? []).length > 0 && <div className="ml-8 mt-2 grid gap-1 sm:grid-cols-2">{(component.pins ?? []).map((pin) => <label key={pin.id} className="flex cursor-pointer items-center gap-2 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-600"><input type="checkbox" checked={selectedModule.linkedPinIds.includes(pin.id)} onChange={() => togglePin(component.id, pin.id, pin.netId)} /><span className="font-mono font-semibold text-slate-800">{pin.pinNumber}</span><span className="truncate">{pin.pinName}</span><span className="ml-auto truncate font-mono text-[9px] text-slate-400">{pin.netName || 'unconnected'}</span></label>)}</div>}</div>; })}{boardComponents.length === 0 && <p className="py-8 text-center text-[10px] text-slate-400">No canonical project components exist yet.</p>}</div></section>
                  <section><h3 className="text-xs font-semibold text-slate-900">Nets</h3><p className="mt-1 text-[10px] leading-4 text-slate-500">Pin selection links its known net; add other explicit bus or rail dependencies here.</p><div className="mt-2 space-y-1">{nets.map((net) => <label key={net.id} className="flex cursor-pointer items-center gap-2 border border-slate-200 bg-white px-2.5 py-2 text-[10px] hover:bg-slate-50"><input type="checkbox" checked={selectedModule.linkedNetIds.includes(net.id)} onChange={() => toggleNet(net.id)} /><span className="min-w-0 flex-1 truncate font-mono font-semibold text-slate-800">{net.netName}</span><span className="text-slate-400">{net.protocol || net.netType}</span></label>)}</div></section>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center"><div><Link2 className="mx-auto h-7 w-7 text-slate-300" /><h2 className="mt-3 text-sm font-semibold text-slate-800">Select a module to map hardware</h2><p className="mt-2 text-[11px] text-slate-500">Choose a module from Map in the Project Drawer.</p></div></div>
          )
        )}

        <EngineeringInspector open={inspectorOpen} subtitle={inspectorSubtitle} onClose={() => setInspectorOpen(false)}>
          <div className="p-3">
            {representation === 'source' ? (
              selectedFile ? (
                <div className="space-y-3 text-[10px]"><div><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Source record</p><p className="mt-1 break-all font-mono text-slate-800">{selectedFile.path}</p></div><dl className="space-y-2 border-t border-slate-200 pt-3"><div className="flex justify-between"><dt className="text-slate-500">Language</dt><dd>{selectedFile.language}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Generated</dt><dd>{selectedFile.generated || selectedFile.isGenerated ? 'Yes · not verification' : 'No'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Dirty</dt><dd>{selectedFile.dirty ? 'Yes' : 'No'}</dd></div></dl><p className="border-t border-slate-200 pt-3 leading-4 text-slate-500">This is a browser project source record. #18 remains responsible for real filesystem identity, conflict detection and durable file operations.</p></div>
              ) : <p className="text-[10px] leading-4 text-slate-500">Select a file explicitly from the Project Drawer.</p>
            ) : selectedModule ? (
              <div className="space-y-3">
                <label className="block text-[9px] font-semibold text-slate-500">Name<input value={selectedModule.name} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { name: event.target.value })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal text-slate-900" /></label>
                <label className="block text-[9px] font-semibold text-slate-500">Type<select value={selectedModule.type} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { type: event.target.value as FirmwareModule['type'] })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal text-slate-900">{['Driver', 'Service', 'Communication', 'Power', 'Safety', 'Application', 'Test'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                <label className="block text-[9px] font-semibold text-slate-500">Status<select value={selectedModule.status || 'Draft'} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { status: event.target.value as FirmwareModule['status'] })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal text-slate-900"><option value="Draft">Draft</option><option value="Implemented">Implemented</option><option value="Needs Review">Needs Review</option>{selectedModule.status === 'Verified' && <option value="Verified">Verified</option>}</select></label>
                <label className="block text-[9px] font-semibold text-slate-500">Responsibility<textarea value={selectedModule.description} onChange={(event) => store.updateFirmwareModule(selectedModule.id, { description: event.target.value })} className="mt-1 min-h-24 w-full resize-y border border-slate-300 bg-white p-2 text-[10px] font-normal leading-4 text-slate-900" /></label>
                <div className="border-t border-slate-200 pt-3"><p className={`text-[10px] font-semibold ${verificationReady ? 'text-emerald-700' : 'text-slate-700'}`}>{verificationReady ? 'Evidence chain complete' : `${verificationBlockers.length} evidence blocker${verificationBlockers.length === 1 ? '' : 's'}`}</p><button type="button" disabled={!verificationReady} onClick={markModuleVerified} className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 bg-slate-950 px-2 text-[9px] font-semibold text-white disabled:opacity-30"><ShieldCheck className="h-3.5 w-3.5" /> Mark Verified</button><button type="button" onClick={() => void deleteModule()} className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 border border-rose-200 px-2 text-[9px] font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" /> Delete module</button></div>
              </div>
            ) : selectedState ? (
              <div className="space-y-2 text-[10px]"><p className="font-semibold text-slate-900">{selectedState.name}</p><p className="text-slate-500">{selectedState.type} state · behavior selection</p><p className="leading-4 text-slate-500">State editing remains on the behavior canvas. Problems are shown in the bottom dock.</p></div>
            ) : <p className="text-[10px] leading-4 text-slate-500">Select a module, source record, or behavior object to inspect it.</p>}
          </div>
        </EngineeringInspector>

        <EngineeringBottomDock
          open={dockOpen}
          title={dockTab === 'problems' ? 'Firmware problems' : dockTab === 'build-evidence' ? 'Recorded build evidence' : 'Recorded device evidence'}
          subtitle={dockTab === 'problems' ? 'Behavior and evidence blockers' : 'External evidence metadata only · no build/upload/device command is executed here'}
          onClose={() => setDockOpen(false)}
          heightClassName="h-[340px]"
          actions={(
            <div className="flex items-center gap-1">
              {(['problems', 'build-evidence', 'device-evidence'] as const).map((tab) => <button key={tab} type="button" onClick={() => openDock(tab)} className={`h-7 px-2 text-[9px] font-semibold ${dockTab === tab ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab === 'problems' ? 'Problems' : tab === 'build-evidence' ? 'Build' : 'Device'}</button>)}
            </div>
          )}
        >
          {dockTab === 'problems' && (
            <div className="h-full overflow-y-auto p-3">
              <div className="grid gap-4 lg:grid-cols-2">
                <section><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Behavior</p><div className="mt-2 space-y-1">{warnings.map((warning, index) => <div key={`${warning.severity}-${warning.stateId || warning.transitionId || index}-${warning.message}`} className="flex gap-2 border-b border-slate-100 py-1.5 text-[10px] leading-4 text-slate-600"><AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${warning.severity === 'Error' ? 'text-rose-600' : warning.severity === 'Warning' ? 'text-amber-600' : 'text-slate-400'}`} /><span><strong className="mr-1 text-slate-700">{warning.severity}</strong>{warning.message}</span></div>)}{warnings.length === 0 && <p className="text-[10px] text-slate-400">No state-machine findings.</p>}</div></section>
                <section><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Selected module evidence</p><div className="mt-2 space-y-1">{verificationBlockers.map((blocker) => <div key={blocker} className="flex gap-2 border-b border-slate-100 py-1.5 text-[10px] leading-4 text-slate-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span>{blocker}</span></div>)}{!selectedModule && <p className="text-[10px] text-slate-400">Select a module for evidence blockers.</p>}{selectedModule && verificationBlockers.length === 0 && <p className="text-[10px] text-emerald-700">Current evidence chain has no blockers.</p>}</div></section>
              </div>
            </div>
          )}

          {dockTab === 'build-evidence' && (
            <div className="h-full overflow-y-auto p-3">
              {!selectedModule ? <p className="text-[10px] text-slate-500">Select a module explicitly before recording external build evidence.</p> : <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]"><section><div className="grid gap-2 sm:grid-cols-3"><label className="text-[9px] font-semibold text-slate-500">Environment *<input value={buildEnvironment} onChange={(event) => setBuildEnvironment(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">Outcome<select value={buildOutcome} onChange={(event) => setBuildOutcome(event.target.value as FirmwareBuildOutcome)} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal"><option value="Needs Review">Needs Review</option><option value="Succeeded">Succeeded</option><option value="Failed">Failed</option></select></label><label className="text-[9px] font-semibold text-slate-500">Toolchain<input value={buildToolchain} onChange={(event) => setBuildToolchain(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">Artifact<input value={buildArtifact} onChange={(event) => setBuildArtifact(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">SHA-256<input value={buildHash} onChange={(event) => setBuildHash(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[9px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">Operator<input value={buildOperator} onChange={(event) => setBuildOperator(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label></div><label className="mt-2 block text-[9px] font-semibold text-slate-500">External build log/result *<textarea value={buildLog} onChange={(event) => setBuildLog(event.target.value)} className="mt-1 min-h-20 w-full resize-y border border-slate-300 p-2 font-mono text-[9px] font-normal leading-4" /></label><button type="button" onClick={recordBuildEvidence} className="mt-2 inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[9px] font-semibold text-white"><FileCheck2 className="h-3.5 w-3.5" /> Record external build result</button><p className="mt-2 text-[9px] leading-4 text-slate-500">Hardware Studio did not run the compiler. Real PlatformIO execution remains #18.</p></section><section><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">History</p><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{selectedModuleBuilds.map((build) => <div key={build.id} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 py-2 text-[9px]"><span className={build.outcome === 'Succeeded' ? 'font-semibold text-emerald-700' : build.outcome === 'Failed' ? 'font-semibold text-rose-700' : 'font-semibold text-amber-700'}>{build.outcome}</span><span className="truncate text-slate-600">{build.environmentName} · {build.log}</span></div>)}{selectedModuleBuilds.length === 0 && <p className="py-4 text-[9px] text-slate-400">No recorded external build results.</p>}</div></section></div>}
            </div>
          )}

          {dockTab === 'device-evidence' && (
            <div className="h-full overflow-y-auto p-3">
              {!selectedModule ? <p className="text-[10px] text-slate-500">Select a module explicitly before recording external device evidence.</p> : <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]"><section><div className="grid gap-2 sm:grid-cols-3"><label className="text-[9px] font-semibold text-slate-500">Successful build *<select value={deviceBuildId} onChange={(event) => setDeviceBuildId(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal"><option value="">Select explicitly</option>{successfulModuleBuilds.map((build) => <option key={build.id} value={build.id}>{build.environmentName} · {new Date(build.createdAt).toLocaleString()}</option>)}</select></label><label className="text-[9px] font-semibold text-slate-500">Device label<input value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">Connection<select value={deviceConnection} onChange={(event) => setDeviceConnection(event.target.value as typeof deviceConnection)} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal">{['USB', 'Serial', 'Network', 'Manual'].map((connection) => <option key={connection}>{connection}</option>)}</select></label><label className="text-[9px] font-semibold text-slate-500">Result<select value={deviceResult} onChange={(event) => setDeviceResult(event.target.value as typeof deviceResult)} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px] font-normal"><option>Inconclusive</option><option>Pass</option><option>Fail</option></select></label><label className="text-[9px] font-semibold text-slate-500">Evidence reference<input value={deviceEvidenceReference} onChange={(event) => setDeviceEvidenceReference(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label><label className="text-[9px] font-semibold text-slate-500">Operator<input value={deviceOperator} onChange={(event) => setDeviceOperator(event.target.value)} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px] font-normal" /></label></div><label className="mt-2 block text-[9px] font-semibold text-slate-500">Observed real-device behavior *<textarea value={deviceObservation} onChange={(event) => setDeviceObservation(event.target.value)} className="mt-1 min-h-20 w-full resize-y border border-slate-300 p-2 text-[10px] font-normal leading-4" /></label><button type="button" disabled={successfulModuleBuilds.length === 0} onClick={recordDeviceEvidence} className="mt-2 inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[9px] font-semibold text-white disabled:opacity-30"><Usb className="h-3.5 w-3.5" /> Record external device observation</button><p className="mt-2 text-[9px] leading-4 text-slate-500">Hardware Studio did not flash, query or monitor the device. Real upload/serial operations remain #18.</p></section><section><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">History</p><div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{selectedModuleDeviceRuns.map((run) => <div key={run.id} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 py-2 text-[9px]"><span className="font-semibold text-slate-700">{run.status}</span><span className="truncate text-slate-600">{run.environment || 'Device'} · {run.logs.find((line) => line.startsWith('Observation:')) || 'Recorded observation'}</span></div>)}{selectedModuleDeviceRuns.length === 0 && <p className="py-4 text-[9px] text-slate-400">No recorded external device observations.</p>}</div></section></div>}
            </div>
          )}
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={`${representationTitle[representation]} · browser project records only`}
        center={selectedModule ? `Module: ${selectedModule.name}` : representation === 'source' && selectedFile ? `File: ${selectedFile.path}` : 'No canonical firmware item selected'}
        right={`${problemCount} problems`}
      />
    </section>
  );
};
