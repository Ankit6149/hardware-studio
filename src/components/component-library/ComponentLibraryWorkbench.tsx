'use client';

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  BookOpen,
  Boxes,
  Check,
  Copy,
  Cpu,
  Edit3,
  Info,
  PackagePlus,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import {
  ComponentPinDefinition,
  defaultComponents,
  ElectronicComponentDefinition,
} from '../../lib/components/componentLibrary';
import { getFootprint } from '../../lib/footprints';
import { resolveKnowledgeIdForComponent } from '../../lib/knowledge/deviceKnowledge';
import { useFeedback } from '../feedback/FeedbackProvider';
import { useKnowledge } from '../knowledge/KnowledgeProvider';

const COMPONENT_CATEGORIES: ElectronicComponentDefinition['category'][] = [
  'MCU', 'Processor', 'Power', 'Regulator', 'Charger', 'Protection', 'Resistor', 'Capacitor',
  'Inductor', 'Diode', 'LED', 'Transistor', 'MOSFET', 'Sensor', 'RF', 'Antenna', 'Connector',
  'Button', 'Touch', 'Motor', 'Haptic', 'Memory', 'Debug', 'Test Point', 'Battery', 'Custom',
];

const PIN_TYPES: ComponentPinDefinition['electricalType'][] = [
  'Power Input', 'Power Output', 'Ground', 'Input', 'Output', 'Bidirectional', 'Passive',
  'Open Drain', 'Analog', 'Clock', 'RF', 'No Connect',
];

interface ComponentDraft {
  libraryId: string;
  name: string;
  category: ElectronicComponentDefinition['category'];
  description: string;
  manufacturer: string;
  partNumber: string;
  value: string;
  packageName: string;
  footprintName: string;
  symbolName: string;
  typicalVoltage: string;
  tags: string;
  pinsText: string;
}

function emptyDraft(): ComponentDraft {
  return {
    libraryId: `custom-${Date.now()}`,
    name: '',
    category: 'Custom',
    description: '',
    manufacturer: '',
    partNumber: '',
    value: '',
    packageName: 'SOIC_8',
    footprintName: 'SOIC_8',
    symbolName: 'Custom',
    typicalVoltage: '',
    tags: 'custom',
    pinsText: '1,VDD,Power Input,true\n2,GND,Ground,true\n3,IO1,Bidirectional,false\n4,IO2,Bidirectional,false',
  };
}

function draftFromComponent(component: ElectronicComponentDefinition): ComponentDraft {
  return {
    libraryId: component.libraryId,
    name: component.name,
    category: component.category,
    description: component.description,
    manufacturer: component.manufacturer ?? '',
    partNumber: component.partNumber ?? '',
    value: component.value ?? '',
    packageName: component.packageName,
    footprintName: component.footprintName,
    symbolName: component.symbolName,
    typicalVoltage: component.electrical.typicalVoltage?.toString() ?? '',
    tags: component.tags.join(', '),
    pinsText: component.pins
      .map((pin) => [pin.number, pin.name, pin.electricalType, String(pin.required)].join(','))
      .join('\n'),
  };
}

function parsePins(value: string): ComponentPinDefinition[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [number, name, requestedType, required] = line.split(',').map((part) => part.trim());
      const electricalType = PIN_TYPES.includes(requestedType as ComponentPinDefinition['electricalType'])
        ? requestedType as ComponentPinDefinition['electricalType']
        : 'Passive';
      return {
        number: number || String(index + 1),
        name: name || `PIN${index + 1}`,
        electricalType,
        required: required?.toLowerCase() === 'true',
      };
    });
}

const Field: React.FC<React.PropsWithChildren<{ label: string; htmlFor: string }>> = ({ label, htmlFor, children }) => (
  <label className="block" htmlFor={htmlFor}>
    <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
    {children}
  </label>
);

const inputClass = 'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

function FootprintPreview({ component }: { component: ElectronicComponentDefinition }) {
  const footprint = getFootprint(component.footprintName);
  if (!footprint?.pads?.length) {
    return (
      <div className="grid h-40 place-items-center border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-xs text-slate-500">
        No verified footprint geometry is available for this definition.
      </div>
    );
  }

  const bodyWidth = footprint.bodyWidthMm || 5;
  const bodyHeight = footprint.bodyHeightMm || 5;
  const scale = 130 / (Math.max(bodyWidth, bodyHeight) + 4);
  const center = 80;

  return (
    <svg viewBox="0 0 160 160" className="h-40 w-full border border-slate-200 bg-slate-950" role="img" aria-label={`${component.name} footprint preview`}>
      <rect
        x={center - (bodyWidth * scale) / 2}
        y={center - (bodyHeight * scale) / 2}
        width={bodyWidth * scale}
        height={bodyHeight * scale}
        fill="none"
        stroke="#facc15"
        strokeWidth="1.2"
      />
      <rect
        x={center - ((bodyWidth + 1) * scale) / 2}
        y={center - ((bodyHeight + 1) * scale) / 2}
        width={(bodyWidth + 1) * scale}
        height={(bodyHeight + 1) * scale}
        fill="none"
        stroke="#64748b"
        strokeDasharray="3 3"
      />
      {footprint.pads.map((pad) => {
        const x = center + pad.xMm * scale;
        const y = center + pad.yMm * scale;
        const width = Math.max((pad.widthMm || 0.6) * scale, 5);
        const height = Math.max((pad.heightMm || 1.2) * scale, 5);
        return (
          <g key={`${pad.name}-${pad.xMm}-${pad.yMm}`}>
            <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx="1" fill="#cbd5e1" stroke="#f8fafc" />
            <text x={x} y={y + 2.5} textAnchor="middle" fontSize="6" fontWeight="700" fill="#0f172a">{pad.name}</text>
          </g>
        );
      })}
      <circle cx={center - (bodyWidth * scale) / 2 - 5} cy={center - (bodyHeight * scale) / 2 + 5} r="2.5" fill="#facc15" />
    </svg>
  );
}

export const ComponentLibraryWorkbench: React.FC = () => {
  const {
    boardComponents = [],
    boards = [],
    circuitBlocks = [],
    customComponentLibrary = [],
    addProjectComponentFromLibrary,
    updateBOMItem,
    addCustomComponentDefinition,
    updateCustomComponentDefinition,
    duplicateComponentDefinition,
    setActiveBoard: setProjectActiveBoard,
    setActiveView,
  } = useProjectStore();
  const {
    activeBoardId: contextBoardId,
    activeComponentId,
    setActiveBoard: setContextBoard,
    setActiveComponentDefinition,
    setActiveComponent,
  } = useStudioContextStore();
  const { notify } = useFeedback();
  const { openKnowledgeForComponent } = useKnowledge();

  const customComponents = customComponentLibrary as ElectronicComponentDefinition[];
  const fullLibrary = useMemo(() => [...customComponents, ...defaultComponents], [customComponents]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ElectronicComponentDefinition['category'] | 'All'>('All');
  const [selectedId, setSelectedId] = useState(defaultComponents[0]?.libraryId ?? '');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComponentDraft>(emptyDraft);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedCircuitBlockId, setSelectedCircuitBlockId] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return fullLibrary.filter((component) => {
      if (category !== 'All' && component.category !== category) return false;
      if (!normalizedQuery) return true;
      return [
        component.name,
        component.description,
        component.manufacturer,
        component.partNumber,
        component.packageName,
        component.footprintName,
        ...component.tags,
        ...component.pins.flatMap((pin) => [pin.name, pin.electricalType, pin.protocol]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, fullLibrary, query]);

  const selectedComponent = fullLibrary.find((component) => component.libraryId === selectedId)
    ?? filtered[0]
    ?? fullLibrary[0];
  const selectedIsCustom = Boolean(selectedComponent && customComponents.some((component) => component.libraryId === selectedComponent.libraryId));
  const selectedKnowledgeId = selectedComponent ? resolveKnowledgeIdForComponent(selectedComponent) : undefined;
  const projectInstances = useMemo(
    () => selectedComponent
      ? boardComponents.filter((component) => component.libraryId === selectedComponent.libraryId)
      : [],
    [boardComponents, selectedComponent],
  );

  const effectiveBoard = boards.find((board) => board.id === selectedBoardId);
  const blocksForBoard = effectiveBoard
    ? circuitBlocks.filter((block) => block.boardId === effectiveBoard.id)
    : [];
  const effectiveCircuitBlock = blocksForBoard.find((block) => block.id === selectedCircuitBlockId);

  const selectDefinition = (libraryId: string) => {
    setSelectedId(libraryId);
    setActiveComponentDefinition(libraryId);
  };

  const focusProjectInstance = (componentId: string, targetView?: string) => {
    const component = boardComponents.find((candidate) => candidate.id === componentId);
    if (!component) return;
    setProjectActiveBoard(component.boardId);
    setContextBoard(component.boardId);
    setActiveComponentDefinition(component.libraryId || null);
    setActiveComponent(component.id);
    if (targetView) setActiveView(targetView);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setIsEditorOpen(true);
  };

  const openEdit = () => {
    if (!selectedComponent || !selectedIsCustom) return;
    setEditingId(selectedComponent.libraryId);
    setDraft(draftFromComponent(selectedComponent));
    setIsEditorOpen(true);
  };

  const openAdd = () => {
    const explicitBoardId = contextBoardId && boards.some((board) => board.id === contextBoardId)
      ? contextBoardId
      : '';
    setSelectedBoardId(explicitBoardId);
    setSelectedCircuitBlockId('');
    setIsAddOpen(true);
  };

  const saveDefinition = (event: React.FormEvent) => {
    event.preventDefault();
    const pins = parsePins(draft.pinsText);
    if (!draft.name.trim() || !draft.libraryId.trim() || pins.length === 0) {
      notify({ tone: 'error', title: 'Component definition is incomplete', detail: 'Name, library ID, and at least one valid pin row are required.' });
      return;
    }

    const typicalVoltage = Number(draft.typicalVoltage);
    const definition: ElectronicComponentDefinition = {
      libraryId: draft.libraryId.trim(),
      name: draft.name.trim(),
      category: draft.category,
      description: draft.description.trim(),
      manufacturer: draft.manufacturer.trim() || 'Custom',
      partNumber: draft.partNumber.trim() || undefined,
      value: draft.value.trim() || undefined,
      packageName: draft.packageName.trim() || 'Custom',
      footprintName: draft.footprintName.trim() || draft.packageName.trim() || 'Custom',
      symbolName: draft.symbolName.trim() || draft.category,
      electrical: Number.isFinite(typicalVoltage) && typicalVoltage > 0 ? { typicalVoltage } : {},
      pins,
      tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      defaultQuantity: 1,
    };

    if (editingId) {
      updateCustomComponentDefinition(editingId, definition);
      notify({ tone: 'success', title: 'Custom component updated', detail: `${definition.name} now uses the revised metadata and pin definition.` });
    } else {
      addCustomComponentDefinition(definition);
      notify({ tone: 'success', title: 'Custom component created', detail: `${definition.name} is available in this project library.` });
    }
    selectDefinition(definition.libraryId);
    setIsEditorOpen(false);
  };

  const duplicateSelected = () => {
    if (!selectedComponent) return;
    if (selectedIsCustom) {
      duplicateComponentDefinition(selectedComponent.libraryId);
      notify({ tone: 'success', title: 'Component definition duplicated', detail: 'The duplicate is available as a project-owned custom definition.' });
      return;
    }

    const copy: ElectronicComponentDefinition = {
      ...selectedComponent,
      libraryId: `${selectedComponent.libraryId}-copy-${Date.now()}`,
      name: `${selectedComponent.name} Copy`,
      pins: selectedComponent.pins.map((pin) => ({ ...pin })),
      tags: [...selectedComponent.tags, 'custom-copy'],
    };
    addCustomComponentDefinition(copy);
    selectDefinition(copy.libraryId);
    notify({ tone: 'success', title: 'Built-in definition copied', detail: 'The copy is now project-owned and can be edited without changing the built-in library.' });
  };

  const addSelectedToProject = () => {
    if (!selectedComponent) return;
    if (!effectiveBoard) {
      notify({
        tone: 'warning',
        title: 'Select a real board first',
        detail: 'A project component must have an explicit board identity before it can enter PCB placement.',
      });
      return;
    }

    const component = addProjectComponentFromLibrary(
      selectedComponent,
      effectiveBoard.id,
      effectiveCircuitBlock?.id,
    );
    setProjectActiveBoard(effectiveBoard.id);
    setContextBoard(effectiveBoard.id);
    setActiveComponentDefinition(selectedComponent.libraryId);
    setActiveComponent(component.id);

    if (component.bomItemId) {
      updateBOMItem(component.bomItemId, {
        componentId: component.id,
        blockName: effectiveCircuitBlock?.name || 'Unassigned',
        status: 'Not Started',
      });
    }

    setIsAddOpen(false);
    notify({
      tone: 'success',
      title: `${component.referenceDesignator} added to ${effectiveBoard.name}`,
      detail: `${selectedComponent.name} now has one canonical project identity linked to a Not Started BOM record. Schematic and PCB placement remain explicit next steps.`,
      durationMs: 7000,
    });
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-50" aria-label="Electronics component library">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-indigo-600">
            <Boxes className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-900">Component library</h1>
              <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {fullLibrary.length} definitions
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Choose reviewed device metadata, then create or focus one canonical project component shared by schematic, PCB, BOM, and validation.</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Plus className="h-3.5 w-3.5" /> Custom definition
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white xl:border-b-0 xl:border-r">
          <div className="space-y-2 border-b border-slate-200 p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search part, package, pin, tag…"
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ElectronicComponentDefinition['category'] | 'All')}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-indigo-500"
              aria-label="Component category"
            >
              <option value="All">All categories</option>
              {COMPONENT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">No component definitions match this filter.</div>
            ) : filtered.map((component) => {
              const isSelected = selectedComponent?.libraryId === component.libraryId;
              const isCustom = customComponents.some((candidate) => candidate.libraryId === component.libraryId);
              return (
                <button
                  key={component.libraryId}
                  type="button"
                  onClick={() => selectDefinition(component.libraryId)}
                  className={`mb-1 w-full border px-3 py-2.5 text-left transition ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-900">{component.name}</div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{component.partNumber || component.libraryId}</div>
                    </div>
                    <span className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{isCustom ? 'Custom' : component.category}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{component.packageName || 'Package unresolved'}</span>
                    <span>·</span>
                    <span>{component.pins.length} pins</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto">
          {!selectedComponent ? (
            <div className="grid h-full min-h-72 place-items-center text-sm text-slate-500">Select a component definition.</div>
          ) : (
            <div className="mx-auto max-w-6xl p-4 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Cpu className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-950">{selectedComponent.name}</h2>
                    <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{selectedComponent.category}</span>
                    {selectedIsCustom && <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">Project-owned</span>}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selectedComponent.description || 'No description is available for this definition.'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedKnowledgeId && (
                    <button type="button" onClick={() => openKnowledgeForComponent(selectedComponent)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <BookOpen className="h-3.5 w-3.5" /> Device guide
                    </button>
                  )}
                  <button type="button" onClick={duplicateSelected} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  {selectedIsCustom && (
                    <button type="button" onClick={openEdit} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                  <button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                    <PackagePlus className="h-3.5 w-3.5" /> Add to project
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-5">
                  <section className="border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700">Definition metadata</div>
                    <dl className="grid gap-px bg-slate-200 sm:grid-cols-2">
                      {[
                        ['Library ID', selectedComponent.libraryId],
                        ['Manufacturer', selectedComponent.manufacturer || 'Unresolved'],
                        ['Part number', selectedComponent.partNumber || 'Unresolved'],
                        ['Value', selectedComponent.value || 'Unresolved'],
                        ['Package', selectedComponent.packageName || 'Unresolved'],
                        ['Footprint', selectedComponent.footprintName || 'Unresolved'],
                        ['Symbol', selectedComponent.symbolName || 'Unresolved'],
                        ['Typical voltage', selectedComponent.electrical.typicalVoltage ? `${selectedComponent.electrical.typicalVoltage} V` : 'Unresolved'],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-white px-4 py-3">
                          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                          <dd className="mt-1 break-words text-xs font-medium text-slate-700">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <section className="border border-slate-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                      <span className="text-xs font-semibold text-slate-700">Pins</span>
                      <span className="text-[10px] text-slate-400">{selectedComponent.pins.length} defined</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[34rem] text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                          <tr><th className="px-4 py-2">Pin</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Electrical type</th><th className="px-4 py-2">Protocol</th><th className="px-4 py-2">Required</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedComponent.pins.map((pin) => (
                            <tr key={`${pin.number}-${pin.name}`}>
                              <td className="px-4 py-2 font-mono font-semibold text-slate-800">{pin.number}</td>
                              <td className="px-4 py-2 text-slate-700">{pin.name}</td>
                              <td className="px-4 py-2 text-slate-600">{pin.electricalType}</td>
                              <td className="px-4 py-2 text-slate-600">{pin.protocol || '—'}</td>
                              <td className="px-4 py-2 text-slate-600">{pin.required ? 'Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <section>
                    <div className="mb-2 text-xs font-semibold text-slate-700">Footprint preview</div>
                    <FootprintPreview component={selectedComponent} />
                  </section>
                  <section className="border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-700">Project usage</div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{projectInstances.length} canonical project instance(s) currently use this definition.</p>
                        {projectInstances.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {projectInstances.map((instance) => {
                              const instanceBoard = boards.find((board) => board.id === instance.boardId);
                              const active = instance.id === activeComponentId;
                              return (
                                <div key={instance.id} className={`border p-2 ${active ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0"><p className="text-[10px] font-semibold text-slate-900">{instance.referenceDesignator} · {instance.componentName}</p><p className="mt-0.5 truncate font-mono text-[9px] text-slate-500">{instanceBoard?.name || instance.boardId} · {instance.id}</p></div>
                                    <button type="button" onClick={() => focusProjectInstance(instance.id)} className="h-7 shrink-0 border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700">{active ? 'Focused' : 'Focus'}</button>
                                  </div>
                                  <div className="mt-2 grid grid-cols-3 gap-1">
                                    <button type="button" onClick={() => focusProjectInstance(instance.id, 'schematic-editor')} className="h-7 border border-slate-200 bg-white text-[9px] font-semibold text-slate-600 hover:bg-slate-100">Schematic</button>
                                    <button type="button" onClick={() => focusProjectInstance(instance.id, 'board-designer')} className="h-7 border border-slate-200 bg-white text-[9px] font-semibold text-slate-600 hover:bg-slate-100">PCB</button>
                                    <button type="button" onClick={() => focusProjectInstance(instance.id, 'bom')} className="h-7 border border-slate-200 bg-white text-[9px] font-semibold text-slate-600 hover:bg-slate-100">BOM</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-900">Add {selectedComponent?.name || 'component'} to project</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs leading-5 text-slate-500">Create one canonical component identity. A real board is required; circuit-block assignment is optional and can stay unresolved.</Dialog.Description>
              </div>
              <Dialog.Close className="grid h-8 w-8 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></Dialog.Close>
            </div>

            {boards.length === 0 ? (
              <div className="mt-5 border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs font-semibold text-amber-900">No physical board exists yet.</div>
                <p className="mt-1 text-xs leading-5 text-amber-800">Hardware Studio will not manufacture a placeholder board ID. Define the actual board first, then return here to add components.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setActiveView('board-settings');
                  }}
                  className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  Open Board settings
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <Field label="Physical board *" htmlFor="component-target-board">
                  <select
                    id="component-target-board"
                    value={effectiveBoard?.id || ''}
                    onChange={(event) => {
                      setSelectedBoardId(event.target.value);
                      setSelectedCircuitBlockId('');
                    }}
                    className={inputClass}
                  >
                    <option value="">Select a board…</option>
                    {boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
                  </select>
                </Field>

                <Field label="Circuit block (optional)" htmlFor="component-target-block">
                  <select id="component-target-block" value={effectiveCircuitBlock?.id || ''} onChange={(event) => setSelectedCircuitBlockId(event.target.value)} className={inputClass} disabled={!effectiveBoard}>
                    <option value="">Unassigned</option>
                    {blocksForBoard.map((block) => <option key={block.id} value={block.id}>{block.name}</option>)}
                  </select>
                </Field>

                {effectiveBoard && blocksForBoard.length === 0 && (
                  <p className="text-xs leading-5 text-slate-500">This board has no circuit blocks yet. That is valid—the component will remain explicitly unassigned at the block level.</p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <Dialog.Close className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</Dialog.Close>
              <button type="button" disabled={!effectiveBoard} onClick={addSelectedToProject} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                <Check className="h-3.5 w-3.5" /> Add canonical component
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-900">{editingId ? 'Edit custom component' : 'Create custom component'}</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-slate-500">Define reusable metadata. Unknown engineering values can remain blank rather than being invented.</Dialog.Description>
              </div>
              <Dialog.Close className="grid h-8 w-8 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></Dialog.Close>
            </div>

            <form onSubmit={saveDefinition} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name *" htmlFor="custom-component-name"><input id="custom-component-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass} /></Field>
                <Field label="Library ID *" htmlFor="custom-component-id"><input id="custom-component-id" value={draft.libraryId} disabled={Boolean(editingId)} onChange={(event) => setDraft((current) => ({ ...current, libraryId: event.target.value }))} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`} /></Field>
                <Field label="Category" htmlFor="custom-component-category"><select id="custom-component-category" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as ElectronicComponentDefinition['category'] }))} className={inputClass}>{COMPONENT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                <Field label="Manufacturer" htmlFor="custom-component-manufacturer"><input id="custom-component-manufacturer" value={draft.manufacturer} onChange={(event) => setDraft((current) => ({ ...current, manufacturer: event.target.value }))} className={inputClass} /></Field>
                <Field label="Part number" htmlFor="custom-component-part"><input id="custom-component-part" value={draft.partNumber} onChange={(event) => setDraft((current) => ({ ...current, partNumber: event.target.value }))} className={inputClass} /></Field>
                <Field label="Value" htmlFor="custom-component-value"><input id="custom-component-value" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} className={inputClass} /></Field>
                <Field label="Package" htmlFor="custom-component-package"><input id="custom-component-package" value={draft.packageName} onChange={(event) => setDraft((current) => ({ ...current, packageName: event.target.value }))} className={inputClass} /></Field>
                <Field label="Footprint" htmlFor="custom-component-footprint"><input id="custom-component-footprint" value={draft.footprintName} onChange={(event) => setDraft((current) => ({ ...current, footprintName: event.target.value }))} className={inputClass} /></Field>
                <Field label="Symbol" htmlFor="custom-component-symbol"><input id="custom-component-symbol" value={draft.symbolName} onChange={(event) => setDraft((current) => ({ ...current, symbolName: event.target.value }))} className={inputClass} /></Field>
                <Field label="Typical voltage (V)" htmlFor="custom-component-voltage"><input id="custom-component-voltage" inputMode="decimal" value={draft.typicalVoltage} onChange={(event) => setDraft((current) => ({ ...current, typicalVoltage: event.target.value }))} className={inputClass} /></Field>
              </div>

              <Field label="Tags (comma separated)" htmlFor="custom-component-tags"><input id="custom-component-tags" value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} className={inputClass} /></Field>
              <Field label="Description" htmlFor="custom-component-description"><textarea id="custom-component-description" rows={3} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></Field>
              <Field label="Pins — number,name,electrical type,required" htmlFor="custom-component-pins"><textarea id="custom-component-pins" rows={8} value={draft.pinsText} onChange={(event) => setDraft((current) => ({ ...current, pinsText: event.target.value }))} className="w-full resize-y rounded-md border border-slate-300 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500" /></Field>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Dialog.Close className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</Dialog.Close>
                <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">{editingId ? 'Save definition' : 'Create definition'}</button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};
