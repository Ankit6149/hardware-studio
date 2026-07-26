import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  Box,
  Braces,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Code2,
  Cpu,
  GitBranch,
  Layers3,
  LockKeyhole,
  Network,
  PackageCheck,
  ShieldAlert,
  Sparkles,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react';

const workbenches = [
  {
    icon: Blocks,
    name: 'Product',
    description: 'Requirements, architecture, interfaces, risks, and decisions in one traceable system.',
    items: ['Requirements', 'Architecture', 'Interfaces', 'Risk register'],
  },
  {
    icon: Box,
    name: 'Mechanical',
    description: '2D layouts, enclosure intent, assemblies, clearances, dimensions, and future parametric geometry.',
    items: ['Sketch & layout', 'Enclosure', 'Assembly', '3D checks'],
  },
  {
    icon: CircuitBoard,
    name: 'Electronics',
    description: 'Component definitions, schematic connectivity, board layout, rules, and manufacturing drafts.',
    items: ['Components', 'Schematic', 'PCB', 'DRC / ERC'],
  },
  {
    icon: Code2,
    name: 'Firmware',
    description: 'Hardware mappings, state machines, source files, builds, upload workflows, and device logs.',
    items: ['Source workspace', 'State machines', 'Builds', 'Hardware map'],
  },
  {
    icon: PackageCheck,
    name: 'Validate',
    description: 'Evidence-backed EVT, DVT, PVT, factory QA, retests, and requirement coverage.',
    items: ['Test plans', 'Measurements', 'Evidence', 'Retest history'],
  },
  {
    icon: GitBranch,
    name: 'Release',
    description: 'Revisions, branches, approvals, blueprints, manufacturing packages, and immutable releases.',
    items: ['Versions', 'Branches', 'Blueprints', 'Factory handoff'],
  },
];

const principles = [
  {
    icon: Network,
    title: 'One product graph',
    body: 'A component should connect its requirement, symbol, pins, footprint, package, firmware mapping, tests, BOM, and release state.',
  },
  {
    icon: LockKeyhole,
    title: 'Local-first direction',
    body: 'Projects should remain usable locally, with machine actions mediated by an explicit, approval-based local bridge.',
  },
  {
    icon: Workflow,
    title: 'Intent-driven workflows',
    body: 'Engineering operations should be expressed as meaningful commands—not fragile mouse automation or disconnected form edits.',
  },
  {
    icon: GitBranch,
    title: 'Reversible by default',
    body: 'Changes should be versioned, reviewable, undoable, traceable, and safe to apply through both the UI and MCP tools.',
  },
];

const foundations = [
  'A multi-workbench product workspace and canonical project model',
  'Early product, mechanical, schematic, PCB, firmware, validation, and release surfaces',
  'A WebGL product view and initial geometry/collision foundations',
  'Local PlatformIO bridge foundations with explicit approval concepts',
  'MCP server foundations for future direct engineering operations',
  'Blueprint, manufacturing-draft, readiness, and project export foundations',
];

const notReady = [
  'The base engineering engines are not complete or fully integrated',
  'PCB routing, connectivity, DRC, and manufacturing isolation need substantial work',
  'Mechanical tools are not a production parametric CAD system',
  'MCP does not yet safely control the complete live project workflow',
  'Revision, release, validation, and firmware workflows are still under construction',
  'Generated fabrication files must not be treated as production-ready outputs',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f0e8] text-[#11110f] selection:bg-[#11110f] selection:text-[#f3f0e8]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f3f0e8]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="Hardware Studio home">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/15 bg-[#11110f] text-[#f3f0e8] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <CircuitBoard size={17} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[-0.02em]">Hardware Studio</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">by System Alpha</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-medium text-black/58 md:flex">
            <a href="#vision" className="transition-colors hover:text-black">Vision</a>
            <a href="#workbenches" className="transition-colors hover:text-black">Workbenches</a>
            <a href="#status" className="transition-colors hover:text-black">Status</a>
            <a href="#architecture" className="transition-colors hover:text-black">Architecture</a>
          </nav>

          <Link
            href="/studio"
            className="group inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/55 px-4 py-2 text-xs font-semibold transition-all hover:border-black/30 hover:bg-white"
          >
            Development build
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8),rgba(255,255,255,0)_68%)]" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-100/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-950">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
              Foundation under active construction
            </div>

            <h1 className="max-w-4xl text-[clamp(3rem,7vw,6.9rem)] font-semibold leading-[0.91] tracking-[-0.068em]">
              Design the whole product.
              <span className="block text-black/34">Not disconnected files.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-black/62 sm:text-lg sm:leading-8">
              Hardware Studio is an ambitious attempt to unify product requirements, mechanical design, electronics, PCB, firmware, validation, and manufacturing release around one connected product graph.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/studio"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#11110f] px-6 text-sm font-semibold text-[#f3f0e8] shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.22)]"
              >
                Explore the development build
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com/Ankit6149/hardware-studio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white/48 px-6 text-sm font-semibold transition-all hover:border-black/30 hover:bg-white"
              >
                View the repository
                <ChevronRight size={15} />
              </a>
            </div>

            <div className="mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-red-950/15 bg-red-50/55 p-4 text-sm leading-6 text-red-950/75">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-800" />
              <p>
                <strong className="font-semibold text-red-950">Not ready for production.</strong>{' '}
                The base engineering systems are still incomplete. Do not use current outputs for fabrication, safety decisions, certification, or production hardware.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[670px]">
            <div className="absolute -inset-8 rounded-[48px] bg-white/45 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-black/12 bg-[#151512] p-3 shadow-[0_45px_100px_rgba(24,22,16,0.22)] sm:p-4">
              <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ee6a5f]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f5bd4f]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">product-graph / system-alpha</div>
              </div>

              <div className="relative min-h-[470px] overflow-hidden rounded-[20px] border border-white/8 bg-[#0c0c0b] p-5 sm:min-h-[540px] sm:p-7">
                <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-300/20" />
                <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

                <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between sm:min-h-[480px]">
                  <div className="grid grid-cols-2 gap-3">
                    <GraphNode icon={Blocks} eyebrow="PRODUCT" title="Requirements" state="linked" />
                    <GraphNode icon={Box} eyebrow="MECHANICAL" title="Enclosure" state="draft" />
                  </div>

                  <div className="mx-auto my-5 w-[74%] rounded-[24px] border border-emerald-300/30 bg-emerald-300/10 p-5 text-center shadow-[0_0_80px_rgba(110,231,183,0.09)] backdrop-blur-sm">
                    <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-200 text-emerald-950">
                      <Network size={20} />
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/65">Canonical product graph</div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white">One product. Every domain.</div>
                    <div className="mt-2 font-mono text-[9px] leading-5 text-white/35">requirements → components → geometry → firmware → evidence → release</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <GraphNode icon={CircuitBoard} eyebrow="ELECTRONICS" title="PCB + Schematic" state="in progress" />
                    <GraphNode icon={Braces} eyebrow="SOFTWARE" title="Firmware" state="in progress" />
                    <GraphNode icon={PackageCheck} eyebrow="VALIDATE" title="Evidence" state="foundation" />
                    <GraphNode icon={GitBranch} eyebrow="RELEASE" title="Factory package" state="future" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="border-y border-black/10 bg-[#11110f] text-[#f3f0e8]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-28">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
              <Sparkles size={14} /> The long-term vision
            </div>
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              An operating environment for complete physical products.
            </h2>
          </div>

          <div className="grid gap-6 text-base leading-7 text-white/58 sm:grid-cols-2">
            <p>
              Today, product decisions are fragmented across CAD files, EDA projects, firmware repositories, spreadsheets, test documents, supplier portals, and release folders.
            </p>
            <p>
              Hardware Studio is being designed around a different idea: every engineering representation should describe the same underlying product and remain connected as that product changes.
            </p>
            <div className="sm:col-span-2 mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-white/75">
                The target is broader than a single CAD or PCB tool: a unified layer inspired by the depth of Fusion, KiCad, Altium, Onshape, PlatformIO, and modern product lifecycle systems—built around one product graph, local-first control, and intent-driven operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workbenches" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Shared workbenches</div>
          <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Move through the product, not between disconnected tools.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
            Each workbench is intended to operate on the same durable product model. The current repository contains early foundations for these areas—not complete replacements for established engineering suites.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workbenches.map(({ icon: Icon, name, description, items }, index) => (
            <article key={name} className="group rounded-[24px] border border-black/10 bg-white/42 p-6 transition-all hover:-translate-y-1 hover:border-black/20 hover:bg-white/72 hover:shadow-[0_24px_60px_rgba(20,18,12,0.08)]">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-[#11110f] text-[#f3f0e8]">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] text-black/25">0{index + 1}</span>
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em]">{name}</h3>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-black/52">{description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full border border-black/8 bg-black/[0.035] px-2.5 py-1 text-[10px] font-medium text-black/52">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="border-y border-black/10 bg-white/38">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="max-w-xl">
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Design principles</div>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Built around engineering state, not screenshots.</h2>
              <p className="mt-5 text-base leading-7 text-black/55">
                The central architecture is intended to make every important change explicit, connected, reviewable, and reversible.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-black/10 bg-[#f3f0e8] p-5">
                  <Icon size={18} strokeWidth={1.7} className="text-black/70" />
                  <h3 className="mt-5 font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/52">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-[28px] border border-black/10 bg-[#11110f] p-5 text-[#f3f0e8] sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Target change propagation</div>
                <p className="mt-3 text-lg leading-7 text-white/76">
                  Replace one component and understand the effects across requirements, pins, schematic nets, PCB footprint, 3D package, clearances, firmware mappings, BOM, tests, and release outputs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/42">
                {['Component', 'Schematic', 'PCB', '3D', 'Firmware', 'Validation', 'Release'].map((item, index, all) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">{item}</span>
                    {index < all.length - 1 && <ArrowRight size={11} className="text-emerald-300/55" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="status" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Current development status</div>
          <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">The vision is large. The foundation is still early.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
            This repository is public so the system can be built in the open. It should be evaluated as an active engineering experiment—not as finished CAD, EDA, PLM, firmware, or manufacturing software.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-emerald-950/12 bg-emerald-50/55 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-950 text-emerald-100">
                <Wrench size={16} />
              </div>
              <div>
                <div className="font-semibold">Foundations in the repository</div>
                <div className="text-xs text-emerald-950/45">Real early work, still evolving</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {foundations.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-emerald-950/68">
                  <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-red-950/12 bg-red-50/62 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-950 text-red-100">
                <ShieldAlert size={16} />
              </div>
              <div>
                <div className="font-semibold">Not ready yet</div>
                <div className="text-xs text-red-950/45">Known limitations—not hidden behind release language</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {notReady.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-red-950/68">
                  <XCircle size={16} className="mt-1 shrink-0 text-red-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="overflow-hidden rounded-[30px] border border-black/12 bg-[#11110f] px-6 py-10 text-[#f3f0e8] shadow-[0_35px_90px_rgba(20,18,12,0.16)] sm:px-10 sm:py-14 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  <Cpu size={13} /> Building in public
                </div>
                <h2 className="text-4xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-5xl">
                  Follow the attempt to connect the entire hardware lifecycle.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/52 sm:text-base">
                  Explore the development workspace, inspect the architecture, challenge the assumptions, and help turn the early foundations into a truthful engineering platform.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/studio" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f3f0e8] px-6 text-sm font-semibold text-[#11110f] transition-all hover:bg-white">
                  Open development build
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white/75 transition-all hover:border-white/30 hover:text-white">
                  Inspect the source
                  <ChevronRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 text-xs text-black/48 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#11110f] text-[#f3f0e8]">
              <CircuitBoard size={14} />
            </div>
            <div>
              <div className="font-semibold text-black/72">Hardware Studio</div>
              <div>Built by System Alpha · Active development</div>
            </div>
          </div>
          <div className="max-w-xl leading-5 md:text-right">
            Experimental software. Current outputs require independent engineering review and must not be used directly for fabrication or safety-critical decisions.
          </div>
        </div>
      </footer>
    </main>
  );
}

function GraphNode({
  icon: Icon,
  eyebrow,
  title,
  state,
}: {
  icon: typeof Layers3;
  eyebrow: string;
  title: string;
  state: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <Icon size={14} className="text-white/48" />
        <span className="rounded-full border border-white/8 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/28">{state}</span>
      </div>
      <div className="mt-5 font-mono text-[8px] tracking-[0.18em] text-white/28">{eyebrow}</div>
      <div className="mt-1 text-xs font-medium text-white/72 sm:text-sm">{title}</div>
    </div>
  );
}
