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
  LockKeyhole,
  Network,
  PackageCheck,
  ShieldAlert,
  Sparkles,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

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
    body: 'Projects should remain usable locally, with machine actions mediated by an explicit approval-based bridge.',
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
  'A WebGL product view and initial geometry and collision foundations',
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
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f3f0e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Hardware Studio home">
            <BrandMark className="h-7 w-7" />
            <div>
              <div className="text-[12px] font-semibold tracking-[-0.02em]">Hardware Studio</div>
              <div className="mt-0.5 text-[7px] uppercase tracking-[0.17em] text-black/40">
                Connected engineering workspace
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-[10px] font-medium text-black/55 lg:flex">
            <a href="#vision" className="transition-colors hover:text-black">Vision</a>
            <a href="#workbenches" className="transition-colors hover:text-black">Workbenches</a>
            <a href="#architecture" className="transition-colors hover:text-black">Architecture</a>
            <a href="#status" className="transition-colors hover:text-black">Status</a>
          </nav>

          <Link
            href="/studio"
            className="group inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/55 px-3 py-1.5 text-[10px] font-semibold transition hover:border-black/30 hover:bg-white sm:text-[11px]"
          >
            Development build
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1120px] px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-14 lg:pt-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[340px] w-[650px] max-w-[110vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.78),rgba(255,255,255,0)_68%)]" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10">
          <div className="max-w-[540px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-100/55 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-amber-950 sm:text-[10px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
              Foundation under active construction
            </div>

            <h1 className="max-w-[760px] text-[clamp(2.35rem,4.25vw,4.25rem)] font-semibold leading-[0.93] tracking-[-0.062em]">
              Design the whole product.
              <span className="block text-black/34">Not disconnected files.</span>
            </h1>

            <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-black/60 sm:text-[14px]">
              Hardware Studio is an ambitious attempt to unify product requirements, mechanical design, electronics, PCB, firmware, validation, and manufacturing release around one connected product graph.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/studio"
                className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#11110f] px-4 text-[11px] font-semibold text-[#f3f0e8] shadow-[0_16px_42px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_52px_rgba(0,0,0,0.2)]"
              >
                Explore the development build
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com/Ankit6149/hardware-studio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/15 bg-white/48 px-4 text-[11px] font-semibold transition hover:border-black/30 hover:bg-white"
              >
                View the repository
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="mt-5 flex max-w-[520px] items-start gap-2.5 rounded-xl border border-red-950/15 bg-red-50/55 p-3 text-[11px] leading-5 text-red-950/72 sm:text-[13px] sm:leading-6">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-800" />
              <p>
                <strong className="font-semibold text-red-950">Not ready for production.</strong>{' '}
                The base engineering systems are incomplete. Current output must not be used for fabrication, certification, safety decisions, or production hardware.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -inset-4 rounded-[34px] bg-white/45 blur-3xl" />
            <div className="relative overflow-hidden rounded-[22px] border border-black/12 bg-[#151512] p-2.5 shadow-[0_36px_82px_rgba(24,22,16,0.2)]">
              <div className="flex items-center justify-between border-b border-white/10 px-1 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ee6a5f]" />
                  <span className="h-2 w-2 rounded-full bg-[#f5bd4f]" />
                  <span className="h-2 w-2 rounded-full bg-[#61c454]" />
                </div>
                <div className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/35">
                  product-graph / hardware-studio
                </div>
              </div>

              <div className="relative min-h-[300px] overflow-hidden rounded-[16px] border border-white/8 bg-[#0c0c0b] p-3.5 sm:min-h-[350px] sm:p-4">
                <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-300/20" />
                <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

                <div className="relative z-10 flex min-h-[270px] flex-col justify-between sm:min-h-[310px]">
                  <div className="grid grid-cols-2 gap-2.5">
                    <GraphNode icon={Blocks} eyebrow="PRODUCT" title="Requirements" state="linked" />
                    <GraphNode icon={Box} eyebrow="MECHANICAL" title="Enclosure" state="draft" />
                  </div>

                  <div className="mx-auto my-3 w-[78%] rounded-[18px] border border-emerald-300/30 bg-emerald-300/10 p-3.5 text-center shadow-[0_0_70px_rgba(110,231,183,0.08)] backdrop-blur-sm">
                    <BrandMark className="mx-auto h-9 w-9" />
                    <div className="mt-3 text-[8px] font-semibold uppercase tracking-[0.19em] text-emerald-200/65">
                      Canonical product graph
                    </div>
                    <div className="mt-1.5 text-[15px] font-semibold tracking-[-0.025em] text-white">
                      One product. Every domain.
                    </div>
                    <div className="mt-1.5 font-mono text-[7px] leading-4 text-white/35">
                      requirements → components → geometry → firmware → evidence → release
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
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
        <div className="mx-auto grid max-w-[1120px] gap-7 px-4 py-11 sm:px-6 sm:py-12 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-14">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/38">
              <Sparkles size={13} /> The long-term vision
            </div>
            <h2 className="max-w-[520px] text-[1.75rem] font-semibold leading-[1.04] tracking-[-0.042em] sm:text-3xl">
              An operating environment for complete physical products.
            </h2>
          </div>

          <div className="grid gap-4 text-[13px] leading-6 text-white/58 sm:grid-cols-2 sm:text-[14px] sm:leading-7">
            <p>
              Today, product decisions are fragmented across CAD files, EDA projects, firmware repositories, spreadsheets, test documents, supplier portals, and release folders.
            </p>
            <p>
              Hardware Studio is being designed around a different idea: every engineering representation should describe the same underlying product and remain connected as that product changes.
            </p>
            <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:col-span-2">
              <p className="text-white/75">
                The target is broader than a single CAD or PCB tool: a unified layer inspired by the depth of Fusion, KiCad, Altium, Onshape, PlatformIO, and modern product lifecycle systems—built around one product graph, local-first control, and intent-driven operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workbenches" className="mx-auto max-w-[1120px] px-4 py-11 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mb-7 max-w-[680px]">
          <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
            Shared workbenches
          </div>
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.042em] sm:text-3xl">
            Move through the product, not between disconnected tools.
          </h2>
          <p className="mt-4 max-w-[540px] text-[13px] leading-6 text-black/55 sm:text-[14px] sm:leading-7">
            Each workbench is intended to operate on the same durable product model. The current repository contains early foundations for these areas—not complete replacements for established engineering suites.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workbenches.map(({ icon: Icon, name, description, items }, index) => (
            <article
              key={name}
              className="group rounded-[18px] border border-black/10 bg-white/42 p-4 transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white/72 hover:shadow-[0_20px_48px_rgba(20,18,12,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-[#11110f] text-[#f3f0e8]">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[8px] text-black/25">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.025em]">{name}</h3>
              <p className="mt-2 min-h-[56px] text-[12px] leading-5 text-black/52">{description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span key={item} className="rounded-full border border-black/8 bg-black/[0.035] px-2 py-1 text-[8px] font-medium text-black/52">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="border-y border-black/10 bg-white/38">
        <div className="mx-auto max-w-[1120px] px-4 py-11 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
            <div className="max-w-[500px]">
              <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Design principles
              </div>
              <h2 className="text-[1.75rem] font-semibold tracking-[-0.042em] sm:text-3xl">
                Built around engineering state, not screenshots.
              </h2>
              <p className="mt-4 text-[13px] leading-6 text-black/55 sm:text-[14px] sm:leading-7">
                The central architecture is intended to make every important change explicit, connected, reviewable, and reversible.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-black/10 bg-[#f3f0e8] p-4">
                  <Icon size={16} strokeWidth={1.7} className="text-black/70" />
                  <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-black/52 sm:text-[12px]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[20px] border border-black/10 bg-[#11110f] p-4 text-[#f3f0e8] sm:p-5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[560px]">
                <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Target change propagation
                </div>
                <p className="mt-2.5 text-[14px] leading-6 text-white/76">
                  Replace one component and understand the effects across requirements, pins, schematic nets, PCB footprint, 3D package, clearances, firmware mappings, BOM, tests, and release outputs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[8px] text-white/42">
                {['Component', 'Schematic', 'PCB', '3D', 'Firmware', 'Validation', 'Release'].map((item, index, all) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5">{item}</span>
                    {index < all.length - 1 && <ArrowRight size={9} className="text-emerald-300/55" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="status" className="mx-auto max-w-[1120px] px-4 py-11 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mb-7 max-w-[680px]">
          <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
            Current development status
          </div>
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.042em] sm:text-3xl">
            The vision is large. The foundation is still early.
          </h2>
          <p className="mt-4 max-w-[540px] text-[13px] leading-6 text-black/55 sm:text-[14px] sm:leading-7">
            This repository is public so the system can be built in the open. It should be evaluated as an active engineering experiment—not as finished CAD, EDA, PLM, firmware, or manufacturing software.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <StatusCard
            icon={Wrench}
            title="Foundations in the repository"
            subtitle="Real early work, still evolving"
            items={foundations}
            tone="green"
          />
          <StatusCard
            icon={ShieldAlert}
            title="Not ready yet"
            subtitle="Known limitations—not hidden behind release language"
            items={notReady}
            tone="red"
          />
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto max-w-[1120px] px-4 py-11 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="overflow-hidden rounded-[22px] border border-black/12 bg-[#11110f] px-5 py-7 text-[#f3f0e8] shadow-[0_28px_74px_rgba(20,18,12,0.15)] sm:px-7 sm:py-8 lg:px-8">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[700px]">
                <div className="mb-3 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  <Cpu size={12} /> Building in public
                </div>
                <h2 className="text-[1.75rem] font-semibold leading-[1.04] tracking-[-0.042em] sm:text-3xl">
                  Follow the attempt to connect the entire hardware lifecycle.
                </h2>
                <p className="mt-4 max-w-[620px] text-[12px] leading-6 text-white/52 sm:text-[13px]">
                  Explore the development workspace, inspect the architecture, challenge the assumptions, and help turn the early foundations into a truthful engineering platform.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                <Link href="/studio" className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#f3f0e8] px-4 text-[11px] font-semibold text-[#11110f] transition hover:bg-white">
                  Open development build
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-[11px] font-semibold text-white/75 transition hover:border-white/30 hover:text-white">
                  Inspect the source
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-6 text-[10px] text-black/48 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <div>
              <div className="font-semibold text-black/72">Hardware Studio</div>
              <div className="mt-0.5">Built by Ankit Bhardwaj · Active development</div>
            </div>
          </div>
          <div className="max-w-[560px] leading-4 md:text-right">
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
  icon: typeof CircuitBoard;
  eyebrow: string;
  title: string;
  state: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-2.5 backdrop-blur-sm sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <Icon size={12} className="text-white/48" />
        <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.1em] text-white/28">
          {state}
        </span>
      </div>
      <div className="mt-3.5 font-mono text-[6px] tracking-[0.16em] text-white/28">{eyebrow}</div>
      <div className="mt-1 text-[10px] font-medium text-white/72 sm:text-[11px]">{title}</div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  subtitle,
  items,
  tone,
}: {
  icon: typeof Wrench;
  title: string;
  subtitle: string;
  items: string[];
  tone: 'green' | 'red';
}) {
  const isGreen = tone === 'green';

  return (
    <div className={`rounded-[20px] border p-5 sm:p-6 ${isGreen ? 'border-emerald-950/12 bg-emerald-50/55' : 'border-red-950/12 bg-red-50/62'}`}>
      <div className="flex items-center gap-3">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${isGreen ? 'bg-emerald-950 text-emerald-100' : 'bg-red-950 text-red-100'}`}>
          <Icon size={14} />
        </div>
        <div>
          <div className="text-[13px] font-semibold">{title}</div>
          <div className={`mt-0.5 text-[9px] ${isGreen ? 'text-emerald-950/45' : 'text-red-950/45'}`}>{subtitle}</div>
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        {items.map((item) => (
          <div key={item} className={`flex items-start gap-2.5 text-[11px] leading-5 sm:text-[12px] ${isGreen ? 'text-emerald-950/68' : 'text-red-950/68'}`}>
            {isGreen ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-700" />
            ) : (
              <XCircle size={14} className="mt-0.5 shrink-0 text-red-700" />
            )}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
