'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronRight, HelpCircle, Layers3, X } from 'lucide-react';

interface GuideStep {
  title: string;
  detail: string;
}

interface WorkspaceGuide {
  title: string;
  purpose: string;
  objectModel: string;
  steps: GuideStep[];
  next: string;
}

const PRODUCT_MODEL = 'Product → assemblies / subsystems → boards + mechanical parts → components → firmware → validation + release evidence';

const guides: Record<string, WorkspaceGuide> = {
  'product-studio': {
    title: 'Product workspace',
    purpose: 'Define what you are building before choosing how each discipline implements it.',
    objectModel: PRODUCT_MODEL,
    steps: [
      { title: 'Define the product boundary', detail: 'Name the complete thing a customer or operator experiences: a sensor node, robot, machine, instrument, wearable, etc.' },
      { title: 'Break it into assemblies', detail: 'Large machines become subsystems and assemblies. Small products may have only one enclosure, one PCB and one firmware target.' },
      { title: 'Capture requirements', detail: 'Write measurable needs before committing to components, geometry or code.' },
      { title: 'Connect architecture', detail: 'Map functions and interfaces to the assemblies that will implement them.' },
    ],
    next: 'Start with Product Design for form/intent or Requirements if the product is already understood.',
  },
  'product-design': {
    title: 'Product design',
    purpose: 'Explore the product form and intent without pretending concept geometry is manufacturing geometry.',
    objectModel: PRODUCT_MODEL,
    steps: [
      { title: 'Establish product scale', detail: 'Decide whether the concept represents the whole product, one assembly, or one enclosure.' },
      { title: 'Add references and concept parts', detail: 'Use visual layers to communicate form, packaging and relative arrangement.' },
      { title: 'Capture intent dimensions', detail: 'Record the dimensions that matter so Mechanical can turn them into physical constraints.' },
      { title: 'Hand off deliberately', detail: 'Move only confirmed intent into Mechanical, Electronics or Requirements.' },
    ],
    next: 'Do not try to manufacture from this canvas; move confirmed physical intent into Mechanical.',
  },
  requirements: {
    title: 'Requirements',
    purpose: 'Turn product intent into measurable engineering decisions.',
    objectModel: PRODUCT_MODEL,
    steps: [
      { title: 'Write one measurable need', detail: 'Prefer “operate for 8 h at 25 °C” over “good battery life”.' },
      { title: 'Define acceptance', detail: 'State how a test or review can prove the requirement.' },
      { title: 'Link the responsible system', detail: 'Connect the requirement to the assembly, board, component, firmware module or validation work that owns it.' },
    ],
    next: 'A requirement is useful only when someone can tell how it will be verified.',
  },
  'product-architecture': {
    title: 'Product architecture',
    purpose: 'Describe functions, subsystems and interfaces before detailed implementation.',
    objectModel: PRODUCT_MODEL,
    steps: [
      { title: 'Create functional blocks', detail: 'Represent real responsibilities such as sensing, power, motion, compute, enclosure or communications.' },
      { title: 'Connect interfaces', detail: 'Show energy, data, mechanical and human interfaces between blocks.' },
      { title: 'Allocate implementation', detail: 'Decide which blocks become PCBs, mechanical assemblies, firmware modules or purchased parts.' },
    ],
    next: 'Use architecture to decide where detailed work belongs; do not duplicate the same object in multiple editors.',
  },
  'schematic-editor': {
    title: 'Schematic editor',
    purpose: 'Describe the logical electrical circuit: symbols, pins and nets.',
    objectModel: 'Component definition → schematic symbol / pins → net connectivity → PCB footprint / pads',
    steps: [
      { title: 'Choose a real component', detail: 'Open Browser and choose an unplaced component that already belongs to the project.' },
      { title: 'Place its symbol', detail: 'Press Place, then click the sheet where the symbol should live. Esc cancels the active tool.' },
      { title: 'Wire pins', detail: 'Use Wire (W), click a real source pin, route the connection, then finish on the matching destination pin.' },
      { title: 'Inspect ERC', detail: 'Use Inspector to review missing or conflicting electrical connections before moving to PCB.' },
    ],
    next: 'If you are unsure what to place, start in Component Library rather than drawing generic blocks.',
  },
  'board-designer': {
    title: 'PCB layout',
    purpose: 'Turn the schematic’s connectivity into physical footprints, copper and manufacturing geometry.',
    objectModel: 'Board outline → footprints / pads → nets → traces / vias → DRC → manufacturing outputs',
    steps: [
      { title: 'Confirm the board outline', detail: 'PCB editing stays blocked until a real board and physical outline exist.' },
      { title: 'Place footprints', detail: 'Open Browser and drag project components onto the board. Their footprints and pads are the routing anchors.' },
      { title: 'Choose a net and route', detail: 'Open Inspector → Nets, select a net, then start Route from a real pad, via or trace endpoint.' },
      { title: 'Run DRC', detail: 'Resolve clearance, placement and connectivity findings before treating the layout as releasable.' },
    ],
    next: 'Do not start by drawing copper in empty space; route from an assigned electrical anchor.',
  },
  'mechanical-studio': {
    title: 'Mechanical layout',
    purpose: 'Define physical features, clearances and dimensions for the product or selected assembly.',
    objectModel: 'Product / assembly → physical features → dimensions + tolerances → assembly / 3D review',
    steps: [
      { title: 'Choose the physical scope', detail: 'Decide whether this workspace represents the whole enclosure or one assembly inside a larger machine.' },
      { title: 'Link PCB reference when relevant', detail: 'Bring in the authoritative board envelope so connectors and clearances reference real PCB geometry.' },
      { title: 'Create named physical features', detail: 'Use Outer Profile, Connector Opening, Mounting Point, Battery Cavity, keepouts, etc.—not anonymous rectangles.' },
      { title: 'Dimension and tolerance', detail: 'Select a feature, then add the dimensions that manufacturing or assembly actually depends on.' },
    ],
    next: 'If a shape has no engineering meaning, name its purpose before adding more geometry.',
  },
  'assembly-stack': {
    title: 'Assembly',
    purpose: 'Describe physical build order, materials, fastening and inspection for one product assembly.',
    objectModel: 'Assembly → ordered parts / layers → material + fastening → inspection evidence',
    steps: [
      { title: 'Add real physical parts', detail: 'Each row should represent something that exists in the physical build.' },
      { title: 'Record material and fastening', detail: 'Capture how the part is made and how it joins the surrounding assembly.' },
      { title: 'Add inspection intent', detail: 'State what needs checking during prototype or production assembly.' },
    ],
    next: 'Treat assembly order as build evidence, not a decorative layer stack.',
  },
  'firmware-studio': {
    title: 'Firmware modules',
    purpose: 'Break software behavior into responsibilities that are linked to real hardware and evidence.',
    objectModel: 'Firmware target → modules → states / behavior → hardware mappings → source → build + device evidence',
    steps: [
      { title: 'Create responsibilities', detail: 'A module should own a clear job such as sensor driver, motor control, communications or power management.' },
      { title: 'Map hardware', detail: 'Link each module to the components, pins and nets it actually controls or observes.' },
      { title: 'Implement in Source', detail: 'Create or import real source files and link them to modules. Generated starter files are not evidence by themselves.' },
      { title: 'Record build and device evidence', detail: 'Verification requires a successful build record plus a passing observation on real or authoritative hardware.' },
    ],
    next: 'Start with one module that maps to one real hardware responsibility.',
  },
  'state-machines': {
    title: 'Firmware behavior',
    purpose: 'Describe modes, events and transitions before scattering behavior across source files.',
    objectModel: 'State → event / guard → transition → action → implementation evidence',
    steps: [
      { title: 'Create meaningful states', detail: 'Use product modes such as Boot, Idle, Measuring, Charging or Fault—not arbitrary boxes.' },
      { title: 'Add transitions', detail: 'Every transition should have a real event or condition that causes it.' },
      { title: 'Validate unreachable or ambiguous behavior', detail: 'Use warnings before treating the diagram as implementation-ready.' },
    ],
    next: 'A state machine explains behavior; source code implements it.',
  },
  'hardware-mapping': {
    title: 'Firmware hardware mapping',
    purpose: 'Connect software responsibilities to the physical electronics they depend on.',
    objectModel: 'Module → component → pin → net / bus',
    steps: [
      { title: 'Select a module', detail: 'Choose the software responsibility you are implementing.' },
      { title: 'Link physical components', detail: 'Map the exact sensors, controllers, drivers or interfaces used by that module.' },
      { title: 'Map pins and nets', detail: 'Capture the concrete electrical contract the source code must honor.' },
    ],
    next: 'Do this before coding drivers so source does not invent pin assignments.',
  },
  'source-skeleton': {
    title: 'Firmware source',
    purpose: 'Edit real project source files while keeping implementation and verification evidence distinct.',
    objectModel: 'Source file → linked firmware module → external build record → device observation',
    steps: [
      { title: 'Create or import a source file', detail: 'Opening Source never generates or modifies files automatically.' },
      { title: 'Edit and save', detail: 'Use the Explorer to switch files. Ctrl/Cmd + S saves the active file.' },
      { title: 'Link source to a module', detail: 'A file becomes useful evidence when its responsibility is connected to the module it implements.' },
      { title: 'Build outside the browser', detail: 'Record the real toolchain result and artifact in Build & Device Evidence.' },
    ],
    next: 'Source is implementation; successful build + device observation is verification.',
  },
  'validation-studio': {
    title: 'Validation',
    purpose: 'Prove requirements with explicit procedures, measurements and evidence.',
    objectModel: 'Requirement → test definition → run → measurement / evidence → verdict',
    steps: [
      { title: 'Choose what you are proving', detail: 'A test should link to a requirement, interface or known risk.' },
      { title: 'Write the procedure', detail: 'Describe setup, steps, expected result and measurement tolerance.' },
      { title: 'Run and record evidence', detail: 'A manual observation does not become Pass unless you explicitly record the verdict.' },
    ],
    next: 'Start from a requirement, not from a generic test form.',
  },
};

const aliases: Record<string, string> = {
  'risks-interfaces': 'product-architecture',
  'blueprint-editor': 'product-studio',
  'board-settings': 'board-designer',
  'pcb-constraints': 'board-designer',
  'pcb-drc': 'board-designer',
  'component-library': 'schematic-editor',
  'power-tree': 'schematic-editor',
  'pin-map': 'schematic-editor',
  bom: 'schematic-editor',
  'firmware-evidence': 'firmware-studio',
  'requirement-coverage': 'validation-studio',
  'factory-qa': 'validation-studio',
};

function resolveGuide(viewId: string): WorkspaceGuide | null {
  return guides[viewId] || guides[aliases[viewId]] || null;
}

export const WorkspaceCoach: React.FC<{ viewId: string }> = ({ viewId }) => {
  const guide = useMemo(() => resolveGuide(viewId), [viewId]);
  const storageKey = `hardware-studio:coach:${viewId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!guide) return;
    try {
      setOpen(window.localStorage.getItem(storageKey) !== 'dismissed');
    } catch {
      setOpen(false);
    }
  }, [guide, storageKey]);

  if (!guide) return null;

  const dismiss = () => {
    setOpen(false);
    try { window.localStorage.setItem(storageKey, 'dismissed'); } catch { /* local storage may be unavailable */ }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-9 right-3 z-40 inline-flex h-9 items-center gap-2 border border-slate-300 bg-[#fbfaf6] px-3 text-[11px] font-semibold text-slate-700 shadow-[0_8px_22px_rgba(17,17,15,0.10)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label={`Open ${guide.title} guide`}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" /> Guide
      </button>
    );
  }

  return (
    <aside className="absolute bottom-9 right-3 z-40 w-[360px] max-w-[calc(100%-1.5rem)] overflow-hidden border border-slate-300 bg-[#fbfaf6] shadow-[0_18px_48px_rgba(17,17,15,0.16)]" aria-label={`${guide.title} guide`}>
      <div className="flex items-start gap-3 border-b border-slate-300 bg-[#f2efe7] px-4 py-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center bg-slate-950 text-white"><BookOpen className="h-4 w-4" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">How this workspace works</p>
          <h2 className="mt-0.5 text-[14px] font-semibold tracking-tight text-slate-950">{guide.title}</h2>
        </div>
        <button type="button" onClick={dismiss} className="grid h-7 w-7 place-items-center text-slate-500 hover:bg-slate-200 hover:text-slate-950" aria-label="Dismiss workspace guide"><X className="h-4 w-4" /></button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
        <p className="text-[12px] leading-5 text-slate-700">{guide.purpose}</p>

        <div className="mt-3 border border-slate-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500"><Layers3 className="h-3.5 w-3.5" /> Mental model</div>
          <p className="mt-1.5 text-[11px] leading-5 text-slate-700">{guide.objectModel}</p>
        </div>

        <ol className="mt-3 space-y-2">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 place-items-center border border-slate-300 bg-white text-[9px] font-semibold tabular-nums text-slate-700">{index + 1}</span>
              <div><p className="text-[11px] font-semibold text-slate-900">{step.title}</p><p className="mt-0.5 text-[10px] leading-4 text-slate-500">{step.detail}</p></div>
            </li>
          ))}
        </ol>

        <div className="mt-3 flex items-start gap-2 border-t border-slate-200 pt-3">
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <p className="text-[10px] leading-4 text-slate-600"><strong className="font-semibold text-slate-900">Next:</strong> {guide.next}</p>
        </div>
      </div>
    </aside>
  );
};
