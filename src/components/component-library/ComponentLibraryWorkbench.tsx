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

function referencePrefix(category: ElectronicComponentDefinition['category']): string {
  if (category === 'Resistor') return 'R';
  if (category === 'Capacitor') return 'C';
  if (category === 'Inductor') return 'L';
  if (category === 'Diode') return 'D';
  if (category === 'LED') return 'LED';
  if (category === 'Connector') return 'J';
  if (category === 'Transistor' || category === 'MOSFET') return 'Q';
  if (category === 'Button' || category === 'Touch') return 'SW';
  if (category === 'Test Point') return 'TP';
  if (category === 'Antenna' || category === 'RF') return 'ANT';
  if (category === 'Battery') return 'BT';
  return 'U';
}

const Field: React.FC<React.PropsWithChildren<{ label: string; htmlFor: string }>> = ({ label, htmlFor, children }) => (
  <label className="block" htmlFor={htmlFor}>
    <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
    {children}
  </label>
);

const inputClass = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

function FootprintPreview({ component }: { component: ElectronicComponentDefinition }) {
  const footprint = getFootprint(component.footprintName);
  if (!footprint?.pads?.length) {
    return (
      <div className="grid h-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
        No verified footprint geometry is available for this definition.
      </div>
    );
  }

  const bodyWidth = footprint.bodyWidthMm || 5;
  const bodyHeight = footprint.bodyHeightMm || 5;
  const scale = 130 / (Math.max(bodyWidth, bodyHeight) + 4);
  const center = 80;

  return (
    <svg viewBox="0 0 160 160" className="h-40 w-full rounded-xl border border-slate-200 bg-slate-950" role="img" aria-label={`${component.name} footprint preview`}>
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
  const store = useProjectStore();
  const {
    boardComponents = [],
    boards = [],
    circuitBlocks = [],
    customComponentLibrary = [],
    addBoardComponent,
    addBOMItem,
    addCustomComponentDefinition,
    updateCustomComponentDefinition,
    duplicateComponentDefinition,
  } = store;
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
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id ?? 'board_0');
  const [selectedCircuitBlockId, setSelectedCircuitBlockId] = useState(circuitBlocks[0]?.id ?? 'block_0');

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
      notify({ tone: 'success', title: 'Custom component created', detail: `${definition.name} is available in this local project library.` });
    }
    setSelectedId(definition.libraryId);
    setIsEditorOpen(false);
  };

  const addSelectedToProject = () => {
    if (!selectedComponent) return;
    const prefix = referencePrefix(selectedComponent.category);
    const existing = new Set(boardComponents.map((component) => component.referenceDesignator));
    let index = 1;
    while (existing.has(`${prefix}${index}`)) index += 1;
    const referenceDesignator = `${prefix}${index}`;
    const componentId = `comp_${Date.now()}`;
    const boardId = selectedBoardId || boards[0]?.id || 'board_0';
    const circuitBlockId = selectedCircuitBlockId || circuitBlocks[0]?.id || 'block_0';

    addBoardComponent({
      id: componentId,
      boardId,
      circuitBlockId,
      referenceDesignator,
      componentName: selectedComponent.name,
      componentType: selectedComponent.category,
      value: selectedComponent.value || '',
      packageName: selectedComponent.packageName,
      footprint: selectedComponent.footprintName,
      partNumber: selectedComponent.partNumber || '',
      quantity: 1,
      side: 'Top',
      placementCriticality: 'Medium',
      notes: selectedComponent.description,
      placementStatus: 'Unplaced',
      libraryId: selectedComponent.libraryId,
      manufacturer: selectedComponent.manufacturer,
      status: 'Draft',
      pins: selectedComponent.pins.map((pin) => ({
        id: `pin_${componentId}_${pin.number}`,
        componentId,
        pinNumber: pin.number,
        pinName: pin.name,
        electricalType: pin.electricalType,
        netName: pin.defaultNetName || '',
      })),
      schematic: { placed: false },
      pcb: { placed: false, side: 'Top', locked: false, placementStatus: 'Unplaced' },
    });

    addBOMItem({
      blockName: circuitBlocks.find((block) => block.id === circuitBlockId)?.name || 'Main',
      candidateComponent: selectedComponent.name,
      partNumber: selectedComponent.partNumber,
      stage: 'EVT',
      quantity: 1,
      voltage: selectedComponent.electrical.typicalVoltage ? `${selectedComponent.electrical.typicalVoltage}V` : '',
      currentEstimate: selectedComponent.electrical.currentTypicalMa ? `${selectedComponent.electrical.currentTypicalMa}mA` : '',
      packageSize: selectedComponent.packageName,
      status: 'Sourced',
      notes: selectedComponent.description,
    });

    setIsAddOpen(false);
    notify({
      tone: 'success',
      title: `${referenceDesignator} added to the project`,
      detail: `${selectedComponent.name} is registered in the project component set, PCB placement bin, schematic bin, and BOM. It remains unplaced until those workbenches assign it.`,
      durationMs: 7000,
    });
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-50" aria-label="Electronics component library">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Boxes className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-950">Electronics Component Library</h1>
            <p className="mt-0.5 text-xs text-slate-500">Choose a definition, understand it, then register one linked project instance.</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Create custom
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white xl:border-b-0 xl:border-r">
          <div className="space-y-3 border-b border-slate-200 p-3">
            <label className="relative block">
              <span className="sr-only">Search components</span>
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, MPN, package, tag, pin…" className={`${inputClass} pl-9`} />
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Component category filter">
              {(['All', ...COMPONENT_CATEGORIES] as const).map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${category === item ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map((component) => {
                  const knowledgeId = resolveKnowledgeIdForComponent(component);
                  const active = selectedComponent?.libraryId === component.libraryId;
                  return (
                    <div key={component.libraryId} className={`rounded-xl border p-3 transition ${active ? 'border-indigo-200 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <button type="button" onClick={() => setSelectedId(component.libraryId)} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{component.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{component.description}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{component.category}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">{component.partNumber || component.libraryId}</span>
                          <span>·</span><span>{component.packageName}</span>
                          <span>·</span><span>{component.pins.length} pins</span>
                        </div>
                      </button>
                      {knowledgeId && (
                        <button type="button" onClick={() => openKnowledgeForComponent(component)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Learn this device family
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Search className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-slate-700">No matching component</p>
                <p className="mt-1 text-xs text-slate-500">Clear the search or choose another category.</p>
              </div>
            )}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto bg-slate-50">
          {selectedComponent ? (
            <div className="mx-auto max-w-5xl space-y-4 p-4 pb-10 lg:p-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-700">{selectedComponent.category}</span>
                      {selectedIsCustom && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">Project custom</span>}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedComponent.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedComponent.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedKnowledgeId && (
                      <button type="button" onClick={() => openKnowledgeForComponent(selectedComponent)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <BookOpen className="h-4 w-4" aria-hidden="true" /> Understand before using
                      </button>
                    )}
                    {selectedIsCustom && (
                      <button type="button" onClick={openEdit} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <Edit3 className="h-4 w-4" aria-hidden="true" /> Edit
                      </button>
                    )}
                    <button type="button" onClick={() => duplicateComponentDefinition(selectedComponent.libraryId)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500">
                      <Copy className="h-4 w-4" aria-hidden="true" /> Duplicate
                    </button>
                    <button type="button" onClick={() => setIsAddOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                      <PackagePlus className="h-4 w-4" aria-hidden="true" /> Add to project
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
                <div className="space-y-4">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Definition metadata</h3>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ['Manufacturer', selectedComponent.manufacturer || 'Not specified'],
                        ['Part number', selectedComponent.partNumber || 'Not specified'],
                        ['Value', selectedComponent.value || 'Not specified'],
                        ['Package', selectedComponent.packageName],
                        ['Footprint', selectedComponent.footprintName],
                        ['Symbol', selectedComponent.symbolName],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                          <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      <div className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p>Library metadata is not automatically qualified. Verify the exact datasheet, symbol pinout, footprint, package geometry, and sourcing record before release.</p></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Pins and electrical roles</h3>
                      <span className="text-xs text-slate-500">{selectedComponent.pins.length} terminals</span>
                    </div>
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600"><tr><th className="px-3 py-2">Pin</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Electrical type</th><th className="px-3 py-2">Protocol</th><th className="px-3 py-2">Default net</th><th className="px-3 py-2">Required</th></tr></thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {selectedComponent.pins.map((pin) => (
                            <tr key={`${pin.number}-${pin.name}`}><td className="px-3 py-2 font-mono font-bold text-indigo-700">{pin.number}</td><td className="px-3 py-2 font-semibold text-slate-900">{pin.name}</td><td className="px-3 py-2 text-slate-600">{pin.electricalType}</td><td className="px-3 py-2 text-slate-600">{pin.protocol || '—'}</td><td className="px-3 py-2 font-mono text-slate-600">{pin.defaultNetName || '—'}</td><td className="px-3 py-2">{pin.required ? <Check className="h-4 w-4 text-emerald-600" aria-label="Required" /> : '—'}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">PCB footprint preview</h3>
                    <div className="mt-3"><FootprintPreview component={selectedComponent} /></div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Electrical summary</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Operating voltage</dt><dd className="text-right font-semibold text-slate-900">{selectedComponent.electrical.operatingVoltageMin ?? '—'} to {selectedComponent.electrical.operatingVoltageMax ?? '—'} V</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Typical voltage</dt><dd className="font-semibold text-slate-900">{selectedComponent.electrical.typicalVoltage ? `${selectedComponent.electrical.typicalVoltage} V` : '—'}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Typical current</dt><dd className="font-semibold text-slate-900">{selectedComponent.electrical.currentTypicalMa ? `${selectedComponent.electrical.currentTypicalMa} mA` : '—'}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Maximum current</dt><dd className="font-semibold text-slate-900">{selectedComponent.electrical.currentMaxMa ? `${selectedComponent.electrical.currentMaxMa} mA` : '—'}</dd></div>
                    </dl>
                  </section>
                </aside>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500"><Cpu className="mb-2 h-8 w-8 text-slate-300" aria-hidden="true" />Select or create a component definition.</div>
          )}
        </main>
      </div>

      <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[110] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-3"><div><Dialog.Title className="text-base font-bold text-slate-950">Add component instance</Dialog.Title><Dialog.Description className="mt-1 text-sm leading-6 text-slate-500">Register the selected definition in the project component set, schematic bin, PCB placement bin, and BOM.</Dialog.Description></div><Dialog.Close asChild><button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close add component dialog"><X className="h-4 w-4" /></button></Dialog.Close></div>
            <div className="mt-5 space-y-4">
              <Field label="Board" htmlFor="component-board"><select id="component-board" value={selectedBoardId} onChange={(event) => setSelectedBoardId(event.target.value)} className={inputClass}>{boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}{boards.length === 0 && <option value="board_0">Default board</option>}</select></Field>
              <Field label="Circuit block" htmlFor="component-block"><select id="component-block" value={selectedCircuitBlockId} onChange={(event) => setSelectedCircuitBlockId(event.target.value)} className={inputClass}>{circuitBlocks.map((block) => <option key={block.id} value={block.id}>{block.name}</option>)}{circuitBlocks.length === 0 && <option value="block_0">Main</option>}</select></Field>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><strong className="text-slate-900">{selectedComponent?.name}</strong> will be created as an unplaced draft instance. Schematic and PCB placement remain explicit next steps.</div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Dialog.Close asChild><button type="button" className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button></Dialog.Close><button type="button" onClick={addSelectedToProject} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"><PackagePlus className="h-4 w-4" /> Add instance</button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[110] max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-3"><div><Dialog.Title className="text-base font-bold text-slate-950">{editingId ? 'Edit custom component' : 'Create custom component'}</Dialog.Title><Dialog.Description className="mt-1 text-sm leading-6 text-slate-500">Define reusable metadata and exact pins. This remains a local project definition until independently reviewed.</Dialog.Description></div><Dialog.Close asChild><button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close component editor"><X className="h-4 w-4" /></button></Dialog.Close></div>
            <form onSubmit={saveDefinition} className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Component name" htmlFor="custom-name"><input id="custom-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass} required /></Field>
                <Field label="Library ID" htmlFor="custom-id"><input id="custom-id" value={draft.libraryId} onChange={(event) => setDraft((current) => ({ ...current, libraryId: event.target.value }))} className={inputClass} disabled={Boolean(editingId)} required /></Field>
                <Field label="Category" htmlFor="custom-category"><select id="custom-category" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as ElectronicComponentDefinition['category'] }))} className={inputClass}>{COMPONENT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                <Field label="Manufacturer" htmlFor="custom-manufacturer"><input id="custom-manufacturer" value={draft.manufacturer} onChange={(event) => setDraft((current) => ({ ...current, manufacturer: event.target.value }))} className={inputClass} /></Field>
                <Field label="Part number" htmlFor="custom-part"><input id="custom-part" value={draft.partNumber} onChange={(event) => setDraft((current) => ({ ...current, partNumber: event.target.value }))} className={inputClass} /></Field>
                <Field label="Value" htmlFor="custom-value"><input id="custom-value" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} className={inputClass} /></Field>
                <Field label="Package" htmlFor="custom-package"><input id="custom-package" value={draft.packageName} onChange={(event) => setDraft((current) => ({ ...current, packageName: event.target.value }))} className={inputClass} required /></Field>
                <Field label="Footprint" htmlFor="custom-footprint"><input id="custom-footprint" value={draft.footprintName} onChange={(event) => setDraft((current) => ({ ...current, footprintName: event.target.value }))} className={inputClass} required /></Field>
                <Field label="Symbol" htmlFor="custom-symbol"><input id="custom-symbol" value={draft.symbolName} onChange={(event) => setDraft((current) => ({ ...current, symbolName: event.target.value }))} className={inputClass} required /></Field>
                <Field label="Typical voltage (V)" htmlFor="custom-voltage"><input id="custom-voltage" inputMode="decimal" value={draft.typicalVoltage} onChange={(event) => setDraft((current) => ({ ...current, typicalVoltage: event.target.value }))} className={inputClass} /></Field>
                <Field label="Tags, comma separated" htmlFor="custom-tags"><input id="custom-tags" value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} className={inputClass} /></Field>
              </div>
              <Field label="Description" htmlFor="custom-description"><textarea id="custom-description" rows={3} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" required /></Field>
              <Field label="Pins: number,name,electrical type,required" htmlFor="custom-pins"><textarea id="custom-pins" rows={8} value={draft.pinsText} onChange={(event) => setDraft((current) => ({ ...current, pinsText: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-slate-950 px-3 py-2 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" spellCheck={false} /></Field>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Allowed electrical types: {PIN_TYPES.join(', ')}. A custom definition is provisional until its symbol, footprint, pin mapping, package, and source documentation are reviewed.</div>
              <div className="flex justify-end gap-2"><Dialog.Close asChild><button type="button" className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button></Dialog.Close><button type="submit" className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"><Check className="h-4 w-4" /> Save definition</button></div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};
