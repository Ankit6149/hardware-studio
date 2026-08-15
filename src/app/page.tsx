import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  Box,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Code2,
  Cpu,
  Crosshair,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Network,
  PackageCheck,
  Ruler,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  SquareTerminal,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

const lifecycle = [
  ['01', 'Define', 'Requirements + architecture'],
  ['02', 'Design', 'Electrical + mechanical'],
  ['03', 'Implement', 'PCB + firmware'],
  ['04', 'Verify', 'Checks + evidence'],
  ['05', 'Release', 'Reviewed outputs'],
] as const;

const connectedDomains = [
  {
    icon: Blocks,
    name: 'Product',
    description: 'Requirements, architecture, interfaces, decisions, and the product structure that tells every specialist workbench what it is designing.',
    detail: 'Product → assemblies → parts → evidence',
  },
  {
    icon: CircuitBoard,
    name: 'Electronics',
    description: 'Components, schematic connectivity, footprints, board placement, routing, DRC, and manufacturing intent stay connected to one identity.',
    detail: 'Symbol → pins → nets → pads → copper',
  },
  {
    icon: Box,
    name: 'Mechanical',
    description: 'Physical features, dimensions, tolerances, PCB references, assemblies, and future exact CAD live in the same product context.',
    detail: 'Feature → dimension → assembly → model',
  },
  {
    icon: Code2,
    name: 'Firmware',
    description: 'Source, state behavior, hardware mappings, build records, and device evidence connect software responsibilities back to real hardware.',
    detail: 'Module → pin → source → build → device',
  },
  {
    icon: PackageCheck,
    name: 'Validation',
    description: 'Procedures, measurements, evidence, retests, and requirement coverage are kept as engineering records—not loose checklists.',
    detail: 'Requirement → procedure → run → evidence',
  },
  {
    icon: GitBranch,
    name: 'Release',
    description: 'Versions, reviews, manufacturing packages, and release artifacts should be traceable to the exact engineering state that produced them.',
    detail: 'Version → review → package → release',
  },
];

const scales = [
  {
    label: 'Compact product',
    title: 'A sensor node',
    description: 'One enclosure, one board, a handful of components, one firmware target.',
    tree: ['Product', 'Enclosure', 'Main PCB', 'Firmware'],
  },
  {
    label: 'Integrated device',
    title: 'A robot or instrument',
    description: 'Several boards, mechanisms, sensors, actuators, harnesses, and software responsibilities.',
    tree: ['Product', 'Control assembly', 'Power assembly', 'Mechanical assembly'],
  },
  {
    label: 'System-scale hardware',
    title: 'A machine',
    description: 'Subsystems become assemblies. The hierarchy grows without changing the underlying engineering model.',
    tree: ['Machine', 'Motion subsystem', 'Control cabinet', 'Operator interface'],
  },
];

const truths = [
  'The product is under active development and is not production-qualified.',
  'Current mechanical modeling is not a complete parametric CAD kernel.',
  'PCB routing and DRC are not yet equivalent to mature commercial ECAD.',
  'Firmware source editing is improving, but filesystem/build/debug integration is still incomplete.',
  'Generated manufacturing artifacts require independent review and must not be treated as qualified output.',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#efede7] text-[#11110f] selection:bg-[#11110f] selection:text-[#f4f1e9]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#efede7]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Hardware Studio home">
            <BrandMark className="h-8 w-8" />
            <div>
              <div className="text-[13px] font-semibold tracking-[-0.025em]">Hardware Studio</div>
              <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.15em] text-black/38">Connected product engineering</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-[11px] font-medium text-black/52 lg:flex">
            <a href="#system" className="transition-colors hover:text-black">System</a>
            <a href="#workbenches" className="transition-colors hover:text-black">Workbenches</a>
            <a href="#scale" className="transition-colors hover:text-black">Product scale</a>
            <a href="#status" className="transition-colors hover:text-black">Status</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Ankit6149/hardware-studio"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center rounded-md px-3 text-[10px] font-semibold text-black/56 transition hover:bg-black/[0.05] hover:text-black sm:inline-flex"
            >
              GitHub
            </a>
            <Link
              href="/studio"
              className="group inline-flex h-9 items-center gap-2 rounded-md bg-[#11110f] px-3.5 text-[10px] font-semibold text-[#f4f1e9] shadow-sm transition hover:bg-black"
            >
              Open Studio
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-black/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(255,255,255,0.92),rgba(255,255,255,0)_43%)]" />
        <div className="relative mx-auto max-w-[1320px] px-4 pb-10 pt-11 sm:px-6 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="mx-auto max-w-[1040px] text-center">
            <div className="mx-auto inline-flex items-center gap-2 border border-black/12 bg-white/62 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-black/55 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Engineering platform in active development
            </div>
            <h1 className="mx-auto mt-5 max-w-[960px] text-[clamp(3rem,7vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
              One product.
              <span className="block text-black/35">One engineering system.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[760px] text-[14px] leading-7 text-black/58 sm:text-[16px] sm:leading-8">
              Hardware Studio is being built to connect product architecture, electronics, PCB, mechanical design, firmware, validation, and release around the same physical product—without turning every handoff into another disconnected file.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/studio" className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#11110f] px-5 text-[11px] font-semibold text-[#f4f1e9] shadow-[0_12px_32px_rgba(17,17,15,0.15)] transition hover:-translate-y-0.5 sm:w-auto">
                Enter development workspace
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#system" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white/54 px-5 text-[11px] font-semibold transition hover:bg-white sm:w-auto">
                See how the system connects
                <ChevronRight size={14} />
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-[1180px] lg:mt-12">
            <div className="absolute -inset-x-8 bottom-0 top-20 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(35,31,24,0.15),rgba(35,31,24,0)_66%)] blur-3xl" />
            <HeroWorkbench />
          </div>

          <div className="mx-auto mt-7 grid max-w-[1180px] grid-cols-1 overflow-hidden border border-black/10 bg-white/45 sm:grid-cols-5">
            {lifecycle.map(([number, title, detail], index) => (
              <div key={title} className={`relative px-4 py-3.5 ${index > 0 ? 'border-t border-black/10 sm:border-l sm:border-t-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-black/28">{number}</span>
                  <span className="text-[10px] font-semibold text-black/76">{title}</span>
                </div>
                <p className="mt-1 text-[9px] leading-4 text-black/42">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="bg-[#11110f] text-[#f4f1e9]">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div className="max-w-[480px]">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                <Network size={13} /> One underlying product
              </div>
              <h2 className="mt-4 text-[2rem] font-semibold leading-[1] tracking-[-0.052em] sm:text-[2.7rem]">
                Different disciplines. The same engineering object.
              </h2>
              <p className="mt-5 text-[13px] leading-6 text-white/52 sm:text-[14px] sm:leading-7">
                A component should not become a new disconnected record every time it moves from architecture to schematic, PCB, mechanical packaging, firmware, validation, and release. Its representations should remain linked to one identity.
              </p>
            </div>

            <CrossDomainObject />
          </div>
        </div>
      </section>

      <section id="workbenches" className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[720px]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38">Engineering workbenches</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">The editor changes. The system does not.</h2>
          </div>
          <p className="max-w-[480px] text-[12px] leading-6 text-black/50 sm:text-[13px]">
            Every workbench follows the same product context, browser, command surface, inspector, and status language so switching disciplines feels like moving within one application—not opening another mini-app.
          </p>
        </div>

        <div className="mt-9 grid overflow-hidden border border-black/10 bg-black/10 lg:grid-cols-3">
          <WorkbenchPreview type="schematic" />
          <WorkbenchPreview type="mechanical" />
          <WorkbenchPreview type="firmware" />
        </div>

        <div className="mt-5 grid overflow-hidden border border-black/10 bg-white/55 md:grid-cols-2 xl:grid-cols-3">
          {connectedDomains.map(({ icon: Icon, name, description, detail }, index) => (
            <article key={name} className={`min-h-[190px] p-5 sm:p-6 ${index % 3 !== 0 ? 'xl:border-l xl:border-black/10' : ''} ${index >= 3 ? 'border-t border-black/10' : index >= 2 ? 'md:border-t md:border-black/10 xl:border-t-0' : index >= 1 ? 'md:border-l md:border-black/10 xl:border-l-0' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center bg-[#11110f] text-[#f4f1e9]"><Icon size={16} strokeWidth={1.7} /></div>
                <span className="font-mono text-[8px] text-black/25">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.025em]">{name}</h3>
              <p className="mt-2 text-[11px] leading-5 text-black/52 sm:text-[12px]">{description}</p>
              <div className="mt-4 font-mono text-[8px] text-black/34">{detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="scale" className="border-y border-black/10 bg-[#ded9cc]">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <div className="max-w-[520px]">
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38">Product scale</div>
              <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">A PCB is not the product. A machine is not one giant canvas.</h2>
              <p className="mt-5 text-[13px] leading-6 text-black/54 sm:text-[14px] sm:leading-7">
                Hardware Studio is structured hierarchically. Small products can stay simple. Larger products expand into assemblies and subsystems without forcing every engineer to stare at the entire machine at once.
              </p>
              <div className="mt-6 border-l-2 border-black/70 pl-4 text-[11px] leading-5 text-black/48">
                Product → subsystem / assembly → board or mechanical part → component → implementation + evidence
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {scales.map((scale, index) => (
                <article key={scale.title} className="border border-black/12 bg-[#f5f2ea] p-4 shadow-[0_8px_28px_rgba(24,22,16,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/36">{scale.label}</span>
                    <span className="font-mono text-[8px] text-black/22">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.025em]">{scale.title}</h3>
                  <p className="mt-2 min-h-[58px] text-[10px] leading-5 text-black/50">{scale.description}</p>
                  <div className="mt-5 border border-black/10 bg-white/58 py-1.5">
                    {scale.tree.map((item, itemIndex) => (
                      <div key={item} className={`flex h-8 items-center gap-2.5 px-2.5 text-[9px] ${itemIndex > 0 ? 'border-t border-black/[0.06]' : ''}`}>
                        <span className={`h-1.5 w-1.5 ${itemIndex === 0 ? 'bg-black' : 'border border-black/30 bg-white'}`} />
                        <span className={itemIndex === 0 ? 'font-semibold text-black/78' : 'text-black/48'}>{item}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
          <div className="overflow-hidden border border-black/12 bg-[#171614] shadow-[0_24px_60px_rgba(17,17,15,0.12)]">
            <div className="flex h-10 items-center border-b border-white/10 bg-[#201e1b] px-3">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/18" /><span className="h-2 w-2 rounded-full bg-white/18" /><span className="h-2 w-2 rounded-full bg-white/18" /></div>
              <div className="ml-4 text-[9px] font-semibold text-white/58">Change impact · U3 environmental sensor</div>
              <div className="ml-auto font-mono text-[8px] text-white/28">proposal / review</div>
            </div>
            <div className="grid min-h-[360px] md:grid-cols-[210px_1fr]">
              <div className="border-b border-white/10 bg-[#1d1b19] p-3 md:border-b-0 md:border-r">
                <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30">Affected domains</div>
                <ImpactRow label="Component definition" state="changed" active />
                <ImpactRow label="Schematic symbol" state="review" />
                <ImpactRow label="PCB footprint" state="compatible" />
                <ImpactRow label="Mechanical package" state="changed" />
                <ImpactRow label="Firmware mapping" state="review" />
                <ImpactRow label="Validation" state="stale" />
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/28">Review before applying</div>
                    <h3 className="mt-1 text-[15px] font-semibold text-white/88">Replace sensor package revision</h3>
                  </div>
                  <span className="border border-amber-300/20 bg-amber-200/[0.07] px-2 py-1 text-[8px] font-semibold text-amber-100/62">6 linked effects</span>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <ImpactDetail title="Electrical" lines={['Pin map unchanged', 'Supply range compatible', 'I²C address unchanged']} />
                  <ImpactDetail title="Physical" lines={['Body height +0.45 mm', 'Courtyard unchanged', 'Clearance must be reviewed']} />
                  <ImpactDetail title="Firmware" lines={['Driver still linked', 'Initialization review required', 'No build evidence yet']} />
                  <ImpactDetail title="Validation" lines={['DVT-ENV-04 becomes stale', 'Retest required after change', 'Previous run preserved']} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="text-[9px] leading-4 text-white/34">A connected product should explain what changes before it silently changes six different files.</div>
                  <button type="button" className="ml-4 shrink-0 bg-[#ece8df] px-3 py-2 text-[9px] font-semibold text-[#171614]">Review proposal</button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[520px]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38"><Workflow size={13} /> Connected change</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">A serious product knows what depends on what.</h2>
            <p className="mt-5 text-[13px] leading-6 text-black/54 sm:text-[14px] sm:leading-7">
              The long-term advantage is not simply putting CAD, PCB, code, and testing into one browser. It is preserving the relationships between them so a change can be reviewed across the whole product before it becomes a downstream surprise.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Principle icon={Network} title="Cross-probe identity" body="Select the same component across schematic, PCB, BOM, package, firmware, and validation." />
              <Principle icon={LockKeyhole} title="Explicit approvals" body="High-impact changes should be proposed, reviewed, applied, and recorded—not hidden behind automation." />
              <Principle icon={GitBranch} title="Version-aware evidence" body="Results and outputs should stay tied to the exact product state that produced them." />
              <Principle icon={Sparkles} title="AI with boundaries" body="AI can explain and propose; engineering truth still comes from canonical data, tools, and evidence." />
            </div>
          </div>
        </div>
      </section>

      <section id="status" className="border-y border-black/10 bg-white/45">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-14">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38"><ShieldAlert size={13} /> Current reality</div>
              <h2 className="mt-3 text-[1.8rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[2.25rem]">The interface can improve faster than the engineering engines.</h2>
              <p className="mt-4 text-[12px] leading-6 text-black/52 sm:text-[13px]">
                So this page does not present Hardware Studio as finished CAD/EDA software. The goal is commercial-grade quality, but readiness will only be claimed when the underlying workflows are independently proven.
              </p>
            </div>
            <div className="border border-black/10 bg-[#f5f2ea]">
              {truths.map((truth, index) => (
                <div key={truth} className={`flex gap-3 px-4 py-3.5 text-[11px] leading-5 text-black/58 sm:px-5 sm:text-[12px] ${index > 0 ? 'border-t border-black/10' : ''}`}>
                  <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-700" />
                  <span>{truth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d9d4c7]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="overflow-hidden bg-[#11110f] px-5 py-8 text-[#f4f1e9] shadow-[0_24px_70px_rgba(17,17,15,0.16)] sm:px-7 lg:px-9 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[760px]">
                <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.17em] text-white/32"><Cpu size={12} /> Hardware Studio</div>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-[2.7rem]">Build the physical product without losing the system around it.</h2>
                <p className="mt-4 max-w-[660px] text-[12px] leading-6 text-white/48 sm:text-[13px]">
                  Enter the development workspace to inspect the current implementation. Expect an evolving engineering platform—not a production-qualified release yet.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link href="/studio" className="group inline-flex h-11 items-center justify-center gap-2 bg-[#f4f1e9] px-5 text-[11px] font-semibold text-[#11110f] transition hover:bg-white">
                  Open Studio
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 border border-white/15 px-5 text-[11px] font-semibold text-white/66 transition hover:border-white/28 hover:text-white">
                  Inspect repository
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-6 text-[10px] text-black/46 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <div><div className="font-semibold text-black/70">Hardware Studio</div><div className="mt-0.5">Connected engineering platform · active development</div></div>
          </div>
          <div className="max-w-[620px] leading-4 md:text-right">Experimental software. Current outputs require independent engineering review and must not be used directly for fabrication, certification, or safety-critical decisions.</div>
        </div>
      </footer>
    </main>
  );
}

function HeroWorkbench() {
  return (
    <div className="overflow-hidden border border-black/18 bg-[#171614] shadow-[0_34px_90px_rgba(20,18,12,0.22)]">
      <div className="flex h-11 items-center border-b border-white/10 bg-[#211f1c] px-3 sm:px-4">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/16" /><span className="h-2 w-2 rounded-full bg-white/16" /><span className="h-2 w-2 rounded-full bg-white/16" /></div>
        <div className="ml-4 flex min-w-0 items-center gap-2 text-[9px] text-white/52"><BrandMark className="h-5 w-5 shrink-0" /><span className="truncate font-semibold">Environmental monitor</span><ChevronRight size={10} className="text-white/20" /><span className="hidden text-white/34 sm:inline">Main controller</span><ChevronRight size={10} className="hidden text-white/20 sm:block" /><span className="hidden font-medium text-white/68 sm:inline">PCB Layout</span></div>
        <div className="ml-auto flex items-center gap-1.5"><span className="hidden border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-emerald-200/55 md:inline">Saved locally</span><button type="button" className="grid h-7 w-7 place-items-center text-white/40 hover:bg-white/5"><Search size={13} /></button><button type="button" className="grid h-7 w-7 place-items-center text-white/40 hover:bg-white/5"><Settings2 size={13} /></button></div>
      </div>

      <div className="flex h-9 items-center border-b border-white/10 bg-[#1a1917] px-2 sm:px-3">
        <Tool icon={MousePointer2} label="Select" active shortcut="V" />
        <Tool icon={Crosshair} label="Route" shortcut="X" />
        <Tool icon={Ruler} label="Measure" shortcut="M" />
        <div className="mx-2 h-4 w-px bg-white/10" />
        <span className="hidden text-[8px] font-medium text-white/30 sm:inline">Layer</span>
        <button type="button" className="ml-1 hidden h-6 items-center gap-1.5 border border-white/10 bg-white/[0.035] px-2 text-[8px] text-white/55 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" /> Top Copper <ChevronRight size={9} /></button>
        <div className="ml-auto flex items-center gap-2 text-[8px] text-white/30"><span className="hidden md:inline">Grid 0.25 mm</span><span className="border-l border-white/10 pl-2">2 layers</span></div>
      </div>

      <div className="grid min-h-[430px] grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)_220px] lg:min-h-[520px] lg:grid-cols-[210px_minmax(0,1fr)_248px]">
        <div className="hidden border-r border-white/10 bg-[#1e1c19] md:flex md:flex-col">
          <PanelHeader icon={Layers3} label="Design browser" />
          <div className="px-2 py-2">
            <TreeRow label="Environmental monitor" level={0} open strong />
            <TreeRow label="Main controller" level={1} open />
            <TreeRow label="Schematic" level={2} />
            <TreeRow label="PCB Layout" level={2} active />
            <TreeRow label="Board outline" level={3} />
            <TreeRow label="Components" level={3} open />
            <TreeRow label="U1 · MCU" level={4} />
            <TreeRow label="U3 · Sensor" level={4} selected />
            <TreeRow label="J1 · USB-C" level={4} />
            <TreeRow label="Firmware" level={2} />
            <TreeRow label="Validation" level={2} />
          </div>
          <div className="mt-auto border-t border-white/10 p-2.5">
            <div className="text-[7px] font-semibold uppercase tracking-[0.12em] text-white/24">Design health</div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center"><MiniStat value="18" label="Parts" /><MiniStat value="7" label="Nets" /><MiniStat value="3" label="DRC" /></div>
          </div>
        </div>

        <div className="relative min-h-[430px] overflow-hidden bg-[#0f0f0e] lg:min-h-[520px]">
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute left-3 top-3 z-20 flex gap-1.5 md:hidden"><span className="border border-white/10 bg-black/60 px-2 py-1 text-[7px] font-semibold text-white/50">PCB Layout</span><span className="border border-white/10 bg-black/60 px-2 py-1 text-[7px] text-white/35">U3 selected</span></div>
          <BoardHeroVisual />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border border-white/10 bg-[#171614]/90 px-2.5 py-1.5 backdrop-blur-sm md:hidden"><span className="text-[7px] text-white/38">U3 · BME280 · 2.5 × 2.5 mm</span><span className="text-[7px] font-semibold text-emerald-200/55">canonical footprint</span></div>
        </div>

        <div className="hidden border-l border-white/10 bg-[#1e1c19] md:flex md:flex-col">
          <PanelHeader icon={Settings2} label="Inspector" />
          <div className="border-b border-white/10 px-3 py-3">
            <div className="text-[8px] font-semibold uppercase tracking-[0.11em] text-white/24">Selected object</div>
            <div className="mt-2 flex items-start gap-2.5"><div className="grid h-8 w-8 shrink-0 place-items-center border border-amber-200/20 bg-amber-200/[0.06] text-amber-100/70"><CircuitBoard size={14} /></div><div><div className="text-[10px] font-semibold text-white/75">U3 · BME280</div><div className="mt-0.5 font-mono text-[7px] text-white/30">LGA-8 · 2.5 × 2.5 mm</div></div></div>
          </div>
          <PropertyGroup title="Placement"><Property label="X" value="42.75 mm" /><Property label="Y" value="18.25 mm" /><Property label="Rotation" value="90°" /><Property label="Side" value="Top" /></PropertyGroup>
          <PropertyGroup title="Electrical"><Property label="Net" value="I²C Sensor" /><Property label="Pads" value="8" /><Property label="Unrouted" value="0" /></PropertyGroup>
          <PropertyGroup title="Representation"><Property label="Footprint" value="Qualified" ok /><Property label="3D package" value="Missing" warning /><Property label="Schematic" value="Linked" ok /></PropertyGroup>
          <div className="mt-auto border-t border-white/10 p-3"><button type="button" className="flex h-8 w-full items-center justify-center gap-2 border border-white/12 bg-white/[0.035] text-[8px] font-semibold text-white/52"><Network size={11} /> Show linked representations</button></div>
        </div>
      </div>

      <div className="flex h-7 items-center border-t border-white/10 bg-[#11110f] px-3 font-mono text-[7px] text-white/32"><span className="text-emerald-200/55">Ready</span><span className="mx-2 text-white/12">|</span><span>U3 selected</span><span className="mx-2 text-white/12">|</span><span>Top Copper</span><span className="ml-auto">x 42.75 · y 18.25 mm · zoom 126%</span></div>
    </div>
  );
}

function BoardHeroVisual() {
  const pads = [
    [26, 22], [50, 22], [74, 22], [98, 22], [26, 78], [50, 78], [74, 78], [98, 78],
  ];
  return (
    <div className="absolute inset-[8%_7%_9%_6%] sm:inset-[9%_10%_10%_8%]">
      <div className="absolute inset-0 rotate-[-2deg] border-2 border-[#d7b96f]/55 bg-[#173828] shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-3 border border-[#d8bf7b]/12" />
        <div className="absolute left-[8%] top-[10%] h-[17%] w-[15%] border border-white/18 bg-[#232523]"><div className="absolute inset-[18%] border border-white/8 bg-[#111]" /><span className="absolute -top-4 left-0 font-mono text-[6px] text-white/36">J1 USB-C</span></div>
        <div className="absolute left-[36%] top-[30%] h-[31%] w-[25%] border border-[#d7c48d]/30 bg-[#20221f] shadow-[0_7px_18px_rgba(0,0,0,0.22)]"><span className="absolute -top-4 left-0 font-mono text-[6px] text-white/38">U1 MCU</span>{Array.from({ length: 16 }).map((_, index) => <span key={index} className="absolute h-1 w-2 bg-[#d7b96f]/75" style={{ left: `${index < 8 ? -7 : 100}%`, top: `${8 + (index % 8) * 11}%` }} />)}</div>
        <div className="absolute right-[10%] top-[15%] h-[19%] w-[18%] border-2 border-[#f4d891]/65 bg-[#242621] shadow-[0_0_0_3px_rgba(244,216,145,0.08)]"><span className="absolute -top-4 left-0 font-mono text-[6px] font-semibold text-[#f4d891]/75">U3 SENSOR</span>{pads.map(([x, y], index) => <span key={index} className="absolute h-2.5 w-2.5 rounded-full border border-[#181714] bg-[#d5b96f]" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }} />)}</div>
        <div className="absolute bottom-[13%] left-[12%] h-[13%] w-[19%] border border-white/16 bg-[#242622]"><span className="absolute -top-4 left-0 font-mono text-[6px] text-white/36">U2 REG</span></div>
        <div className="absolute bottom-[12%] right-[12%] flex gap-1">{Array.from({ length: 4 }).map((_, i) => <span key={i} className="h-3 w-3 rounded-full border border-[#171613] bg-[#c7a85f]" />)}<span className="absolute -top-4 left-0 whitespace-nowrap font-mono text-[6px] text-white/36">J2 DEBUG</span></div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M22 18 H31 V38 H36" fill="none" stroke="#d6b36a" strokeWidth="0.8" opacity="0.8" />
          <path d="M23 23 H29 V45 H36" fill="none" stroke="#d6b36a" strokeWidth="0.7" opacity="0.6" />
          <path d="M61 37 H72 V25 H79" fill="none" stroke="#e6c875" strokeWidth="0.8" opacity="0.85" />
          <path d="M61 44 H69 V30 H79" fill="none" stroke="#e6c875" strokeWidth="0.7" opacity="0.7" />
          <path d="M50 61 V72 H26" fill="none" stroke="#8bc1a4" strokeWidth="0.7" opacity="0.68" />
          <path d="M55 61 V78 H78" fill="none" stroke="#8bc1a4" strokeWidth="0.65" opacity="0.62" />
          <path d="M31 75 H45 V61" fill="none" stroke="#d6b36a" strokeWidth="0.7" opacity="0.74" />
          <circle cx="69" cy="44" r="1.3" fill="#c8ad68" stroke="#171613" strokeWidth="0.5" />
          <circle cx="45" cy="72" r="1.3" fill="#c8ad68" stroke="#171613" strokeWidth="0.5" />
        </svg>
        {Array.from({ length: 12 }).map((_, index) => <span key={index} className="absolute h-1.5 w-3 border border-[#d6bb74]/40 bg-[#d6bb74]/18" style={{ left: `${11 + (index % 6) * 14}%`, top: `${38 + Math.floor(index / 6) * 25}%` }} />)}
        <div className="absolute bottom-2 right-2 border border-white/10 bg-black/20 px-2 py-1 font-mono text-[6px] text-white/28">64.0 × 38.0 mm</div>
      </div>
    </div>
  );
}

function Tool({ icon: Icon, label, active = false, shortcut }: { icon: typeof MousePointer2; label: string; active?: boolean; shortcut?: string }) {
  return <button type="button" className={`flex h-7 items-center gap-1.5 px-2 text-[8px] font-medium ${active ? 'bg-white/[0.08] text-white/78' : 'text-white/38 hover:bg-white/[0.04] hover:text-white/60'}`}><Icon size={11} /><span className="hidden sm:inline">{label}</span>{shortcut && <span className="hidden font-mono text-[6px] text-white/20 lg:inline">{shortcut}</span>}</button>;
}

function PanelHeader({ icon: Icon, label }: { icon: typeof Layers3; label: string }) {
  return <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 px-3"><Icon size={12} className="text-white/34" /><span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/38">{label}</span></div>;
}

function TreeRow({ label, level, active = false, selected = false, open = false, strong = false }: { label: string; level: number; active?: boolean; selected?: boolean; open?: boolean; strong?: boolean }) {
  return <div className={`flex h-7 items-center gap-1.5 border-l-2 pr-1 text-[8px] ${active ? 'border-[#d6bb7a] bg-white/[0.06] text-white/72' : selected ? 'border-transparent bg-white/[0.035] text-white/64' : 'border-transparent text-white/38'}`} style={{ paddingLeft: `${7 + level * 8}px` }}><ChevronRight size={8} className={`${open ? 'rotate-90' : ''} ${level > 2 ? 'opacity-0' : 'opacity-50'}`} /><span className={`truncate ${strong ? 'font-semibold text-white/62' : ''}`}>{label}</span></div>;
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return <div className="border border-white/[0.07] bg-white/[0.025] px-1 py-1.5"><div className="font-mono text-[9px] text-white/58">{value}</div><div className="mt-0.5 text-[6px] uppercase tracking-[0.08em] text-white/20">{label}</div></div>;
}

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-b border-white/10 px-3 py-2.5"><div className="mb-2 text-[7px] font-semibold uppercase tracking-[0.12em] text-white/24">{title}</div><div className="space-y-1.5">{children}</div></div>;
}

function Property({ label, value, ok = false, warning = false }: { label: string; value: string; ok?: boolean; warning?: boolean }) {
  return <div className="flex items-center justify-between gap-3 text-[8px]"><span className="text-white/30">{label}</span><span className={`font-mono ${ok ? 'text-emerald-200/55' : warning ? 'text-amber-200/58' : 'text-white/54'}`}>{value}</span></div>;
}

function CrossDomainObject() {
  const representations = [
    ['Architecture', 'Sensor / environment', 'linked'],
    ['Schematic', 'U3 · 8 electrical pins', 'linked'],
    ['PCB', 'LGA-8 · 8 pads', 'linked'],
    ['Mechanical', '2.5 × 2.5 × ? mm', 'missing height'],
    ['Firmware', 'env_sensor module', 'linked'],
    ['Validation', 'DVT-ENV-04', 'stale'],
  ];
  return (
    <div className="overflow-hidden border border-white/12 bg-[#1b1a17] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <div className="flex h-10 items-center border-b border-white/10 px-3.5"><div className="grid h-6 w-6 place-items-center border border-white/10 bg-white/[0.04]"><CircuitBoard size={12} className="text-white/58" /></div><div className="ml-2.5"><div className="text-[9px] font-semibold text-white/70">U3 · Environmental sensor</div><div className="font-mono text-[6px] text-white/25">component-instance / cmp_03</div></div><span className="ml-auto border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-1 text-[7px] font-semibold text-emerald-100/55">5 linked · 1 unresolved</span></div>
      <div className="grid sm:grid-cols-2">
        {representations.map(([name, detail, state], index) => (
          <div key={name} className={`flex min-h-[86px] items-start gap-3 p-3.5 ${index % 2 === 1 ? 'sm:border-l sm:border-white/10' : ''} ${index >= 2 ? 'border-t border-white/10' : ''}`}>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${state === 'linked' ? 'bg-emerald-300/55' : state === 'stale' ? 'bg-amber-300/65' : 'border border-white/28'}`} />
            <div><div className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/28">{name}</div><div className="mt-1.5 text-[10px] font-medium text-white/64">{detail}</div><div className={`mt-1.5 text-[7px] ${state === 'linked' ? 'text-emerald-200/42' : state === 'stale' ? 'text-amber-200/48' : 'text-white/26'}`}>{state}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkbenchPreview({ type }: { type: 'schematic' | 'mechanical' | 'firmware' }) {
  const meta = {
    schematic: { number: '01', label: 'Schematic', icon: CircuitBoard, description: 'Logical connectivity' },
    mechanical: { number: '02', label: 'Mechanical', icon: Box, description: 'Physical intent + dimensions' },
    firmware: { number: '03', label: 'Firmware', icon: Code2, description: 'Implementation + evidence' },
  }[type];
  const Icon = meta.icon;
  return (
    <article className="min-h-[420px] border-black/10 bg-[#171614] text-[#f4f1e9] lg:border-l first:lg:border-l-0">
      <div className="flex h-11 items-center border-b border-white/10 bg-[#211f1c] px-3"><Icon size={13} className="text-white/46" /><span className="ml-2 text-[9px] font-semibold text-white/68">{meta.label}</span><span className="ml-auto font-mono text-[7px] text-white/24">{meta.number}</span></div>
      <div className="flex h-8 items-center border-b border-white/10 px-2"><span className="bg-white/[0.07] px-2 py-1 text-[7px] text-white/58">Select</span><span className="px-2 py-1 text-[7px] text-white/28">{type === 'schematic' ? 'Wire' : type === 'mechanical' ? 'Dimension' : 'Save'}</span><span className="px-2 py-1 text-[7px] text-white/28">Inspect</span></div>
      <div className="relative h-[300px] overflow-hidden bg-[#10100f]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:20px_20px]" />
        {type === 'schematic' && <SchematicPreview />}
        {type === 'mechanical' && <MechanicalPreview />}
        {type === 'firmware' && <FirmwarePreview />}
      </div>
      <div className="border-t border-white/10 px-3 py-3"><div className="text-[10px] font-semibold text-white/64">{meta.description}</div><p className="mt-1 text-[8px] leading-4 text-white/28">Same product context · same browser · same inspector · domain-specific engineering document</p></div>
    </article>
  );
}

function SchematicPreview() {
  return <div className="absolute inset-5">
    <div className="absolute left-[8%] top-[22%] w-[30%] border border-white/24 bg-[#1d1c19] px-3 py-3"><div className="text-center text-[8px] font-semibold text-white/68">U1</div><div className="mt-0.5 text-center font-mono text-[6px] text-white/28">MCU</div>{['3V3','GND','SDA','SCL'].map((pin, index) => <span key={pin} className="absolute font-mono text-[5px] text-white/30" style={{ right: -22, top: 9 + index * 15 }}>{pin}</span>)}</div>
    <div className="absolute right-[8%] top-[31%] w-[29%] border-2 border-[#d8bf7b]/52 bg-[#22211d] px-3 py-3"><div className="text-center text-[8px] font-semibold text-[#ead7a6]/78">U3</div><div className="mt-0.5 text-center font-mono text-[6px] text-white/28">BME280</div></div>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M38 33 H55 V39 H63" fill="none" stroke="#d9bd73" strokeWidth="0.7" /><path d="M38 44 H51 V49 H63" fill="none" stroke="#d9bd73" strokeWidth="0.7" /><path d="M38 54 H48 V61 H63" fill="none" stroke="#8ebba2" strokeWidth="0.7" /></svg>
    <div className="absolute bottom-2 left-[44%] border border-white/10 bg-black/35 px-2 py-1 font-mono text-[5px] text-white/26">I²C bus · 400 kHz</div>
  </div>;
}

function MechanicalPreview() {
  return <div className="absolute inset-[12%_10%]">
    <div className="absolute inset-[8%_7%] border border-white/36 bg-white/[0.025]">
      <div className="absolute left-[8%] top-[14%] h-[58%] w-[42%] border border-[#d8bf7b]/50 bg-[#d8bf7b]/[0.035]" />
      <div className="absolute right-[12%] top-[21%] h-[38%] w-[22%] rounded-full border border-white/28" />
      <div className="absolute bottom-[11%] left-[16%] h-3 w-3 rounded-full border border-white/30" /><div className="absolute bottom-[11%] right-[16%] h-3 w-3 rounded-full border border-white/30" />
      <div className="absolute -top-5 left-[8%] right-[50%] border-t border-[#d8bf7b]/55"><span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10100f] px-1 font-mono text-[6px] text-[#e2ca91]/65">64.00 mm</span></div>
      <div className="absolute bottom-[18%] -right-7 top-[21%] border-l border-white/25"><span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[6px] text-white/34">Ø 12.0</span></div>
    </div>
    <span className="absolute left-[16%] top-[19%] font-mono text-[6px] text-[#dec98e]/60">PCB envelope</span><span className="absolute right-[17%] top-[26%] font-mono text-[6px] text-white/36">sensor opening</span>
  </div>;
}

function FirmwarePreview() {
  const lines = ['#include <Wire.h>', '', 'void sensor_init() {', '  Wire.begin();', '  bme.begin(0x76);', '}', '', 'float read_temp() {', '  return bme.readTemperature();', '}'];
  return <div className="absolute inset-0 grid grid-cols-[82px_1fr]">
    <div className="border-r border-white/10 bg-[#1d1b19] px-1.5 py-2"><div className="mb-2 text-[6px] font-semibold uppercase tracking-[0.1em] text-white/22">Explorer</div>{['src','main.cpp','sensor.cpp','platformio.ini'].map((file, index) => <div key={file} className={`truncate px-1.5 py-1 text-[6px] ${index === 2 ? 'bg-white/[0.07] text-white/58' : 'text-white/26'}`} style={{ paddingLeft: `${6 + (index > 0 ? 7 : 0)}px` }}>{file}</div>)}</div>
    <div className="overflow-hidden"><div className="flex h-7 items-center border-b border-white/10 bg-[#1c1a18] px-2 text-[6px] text-white/36">sensor.cpp <span className="ml-auto text-white/18">C++</span></div><div className="grid grid-cols-[26px_1fr] py-2 font-mono text-[6px] leading-[16px]"><div className="border-r border-white/[0.06] pr-2 text-right text-white/16">{lines.map((_, index) => <div key={index}>{index + 1}</div>)}</div><div className="pl-2 text-white/48">{lines.map((line, index) => <div key={index} className={line.includes('return') || line.includes('void') || line.includes('float') ? 'text-[#d6c18a]/68' : line.includes('Wire') ? 'text-[#9dc8b1]/60' : ''}>{line || ' '}</div>)}</div></div></div>
  </div>;
}

function ImpactRow({ label, state, active = false }: { label: string; state: string; active?: boolean }) {
  return <div className={`mt-1.5 flex min-h-8 items-center gap-2 border-l-2 px-2 ${active ? 'border-[#d6bb7a] bg-white/[0.06]' : 'border-transparent hover:bg-white/[0.025]'}`}><span className={`h-1.5 w-1.5 rounded-full ${state === 'compatible' || state === 'changed' ? 'bg-emerald-300/50' : state === 'stale' ? 'bg-amber-300/65' : 'border border-white/25'}`} /><span className="min-w-0 flex-1 truncate text-[8px] text-white/48">{label}</span><span className="text-[6px] text-white/22">{state}</span></div>;
}

function ImpactDetail({ title, lines }: { title: string; lines: string[] }) {
  return <div className="border border-white/10 bg-white/[0.025] p-3"><div className="text-[7px] font-semibold uppercase tracking-[0.11em] text-white/28">{title}</div><div className="mt-2 space-y-1.5">{lines.map((line) => <div key={line} className="flex gap-2 text-[8px] leading-4 text-white/42"><Check size={9} className="mt-0.5 shrink-0 text-emerald-200/45" /><span>{line}</span></div>)}</div></div>;
}

function Principle({ icon: Icon, title, body }: { icon: typeof Network; title: string; body: string }) {
  return <div className="border border-black/10 bg-white/45 p-3.5"><Icon size={14} className="text-black/58" /><div className="mt-3 text-[10px] font-semibold text-black/72">{title}</div><p className="mt-1.5 text-[9px] leading-4 text-black/44">{body}</p></div>;
}
