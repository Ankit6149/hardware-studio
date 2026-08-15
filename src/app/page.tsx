import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  Box,
  Check,
  ChevronRight,
  CircuitBoard,
  Code2,
  Cpu,
  GitBranch,
  LockKeyhole,
  Network,
  PackageCheck,
  ShieldAlert,
  Workflow,
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
  { icon: Blocks, name: 'Product', description: 'Requirements, architecture, interfaces, decisions, and product hierarchy.', detail: 'Product → assembly → part → evidence' },
  { icon: CircuitBoard, name: 'Electronics', description: 'Components, symbols, connectivity, footprints, placement, routing, and DRC.', detail: 'Symbol → pin → net → pad → copper' },
  { icon: Box, name: 'Mechanical', description: 'Physical features, dimensions, tolerances, packaging, assemblies, and CAD references.', detail: 'Feature → dimension → assembly → model' },
  { icon: Code2, name: 'Firmware', description: 'Source, behavior, hardware mappings, build records, and device observations.', detail: 'Module → pin → source → build → device' },
  { icon: PackageCheck, name: 'Validation', description: 'Procedures, measurements, evidence, retests, and requirement coverage.', detail: 'Requirement → procedure → run → evidence' },
  { icon: GitBranch, name: 'Release', description: 'Versions, reviews, manufacturing packages, and traceable release state.', detail: 'Version → review → package → release' },
] as const;

const truths = [
  'The product is under active development and is not production-qualified.',
  'Mechanical modeling is not yet a complete parametric CAD kernel.',
  'PCB routing and DRC are not yet equivalent to mature commercial ECAD.',
  'Firmware source editing exists, while filesystem/build/debug integration is still incomplete.',
  'Generated manufacturing artifacts require independent engineering review.',
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#efede7] text-[#11110f] selection:bg-[#11110f] selection:text-[#f4f1e9]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#efede7]/95 backdrop-blur-md">
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
            <a href="#scale" className="transition-colors hover:text-black">Scale</a>
            <a href="#status" className="transition-colors hover:text-black">Status</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="hidden h-9 items-center px-3 text-[10px] font-semibold text-black/56 transition hover:bg-black/[0.04] hover:text-black sm:inline-flex">GitHub</a>
            <Link href="/studio" className="group inline-flex h-9 items-center gap-2 bg-[#11110f] px-3.5 text-[10px] font-semibold text-[#f4f1e9] transition hover:bg-black">
              Open Studio <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-black/10 bg-[#efede7]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12 lg:px-8 lg:py-20">
          <div className="max-w-[590px]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/42">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> Engineering platform in active development
            </div>
            <h1 className="mt-5 text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              Build the hardware.
              <span className="block text-black/36">Keep the whole product connected.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[14px] leading-7 text-black/58 sm:text-[15px]">
              Product architecture, electronics, PCB, mechanical design, firmware, validation, and release should describe the same physical product—not become separate islands of files and context.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Link href="/studio" className="group inline-flex h-11 items-center justify-center gap-2 bg-[#11110f] px-5 text-[11px] font-semibold text-[#f4f1e9] transition hover:bg-black">
                Enter development workspace <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#system" className="inline-flex h-11 items-center justify-center gap-2 border border-black/16 bg-white/45 px-5 text-[11px] font-semibold transition hover:bg-white/75">
                See the connected model <ChevronRight size={14} />
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 border-y border-black/10">
              <HeroMetric value="1" label="product identity" />
              <HeroMetric value="6" label="engineering domains" bordered />
              <HeroMetric value="∞" label="linked representations" />
            </div>
          </div>

          <ProductTechnicalHero />
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 border-x border-t border-black/10 bg-white/35 sm:grid-cols-5">
          {lifecycle.map(([number, title, detail], index) => (
            <div key={title} className={`px-4 py-3.5 ${index > 0 ? 'border-t border-black/10 sm:border-l sm:border-t-0' : ''}`}>
              <div className="flex items-center gap-2"><span className="font-mono text-[8px] text-black/28">{number}</span><span className="text-[10px] font-semibold text-black/76">{title}</span></div>
              <p className="mt-1 text-[9px] leading-4 text-black/42">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="system" className="bg-[#11110f] text-[#f4f1e9]">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-14">
            <div className="max-w-[500px]">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35"><Network size={13} /> One underlying object</div>
              <h2 className="mt-4 text-[2rem] font-semibold leading-[1] tracking-[-0.052em] sm:text-[2.7rem]">A component is not a rectangle. It has different real representations.</h2>
              <p className="mt-5 text-[13px] leading-6 text-white/52 sm:text-[14px] sm:leading-7">
                Architecture, schematic symbol, PCB footprint, mechanical package, source mapping, and validation evidence have different jobs and trust levels. Hardware Studio links them without pretending one representation can replace the others.
              </p>
            </div>
            <RepresentationChain />
          </div>
        </div>
      </section>

      <section id="workbenches" className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[700px]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38">Engineering workbenches</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">Recognizable engineering documents. One application grammar.</h2>
          </div>
          <p className="max-w-[480px] text-[12px] leading-6 text-black/50 sm:text-[13px]">The canvas changes with the discipline. Browser, command surface, inspector, selection and status behavior stay predictable.</p>
        </div>

        <div className="mt-9 grid border border-black/10 bg-[#171614] lg:grid-cols-3">
          <WorkbenchPreview type="schematic" />
          <WorkbenchPreview type="mechanical" />
          <WorkbenchPreview type="firmware" />
        </div>

        <div className="mt-5 grid border border-black/10 bg-white/45 md:grid-cols-2 xl:grid-cols-3">
          {connectedDomains.map(({ icon: Icon, name, description, detail }, index) => (
            <article key={name} className={`min-h-[176px] p-5 sm:p-6 ${index > 0 ? 'border-t border-black/10 md:border-t-0' : ''} ${index % 2 === 1 ? 'md:border-l md:border-black/10' : ''} ${index >= 2 ? 'md:border-t md:border-black/10' : ''} ${index % 3 !== 0 ? 'xl:border-l xl:border-black/10' : 'xl:border-l-0'} ${index >= 3 ? 'xl:border-t xl:border-black/10' : 'xl:border-t-0'}`}>
              <div className="flex items-center justify-between"><div className="grid h-8 w-8 place-items-center border border-black/12 bg-[#11110f] text-[#f4f1e9]"><Icon size={15} strokeWidth={1.7} /></div><span className="font-mono text-[8px] text-black/25">0{index + 1}</span></div>
              <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.025em]">{name}</h3>
              <p className="mt-2 text-[11px] leading-5 text-black/52">{description}</p>
              <div className="mt-4 font-mono text-[8px] text-black/34">{detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="scale" className="border-y border-black/10 bg-[#ded9cc]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="max-w-[520px]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38">Product scale</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">A tiny PCB and a machine use the same hierarchy, not the same flat canvas.</h2>
            <p className="mt-5 text-[13px] leading-6 text-black/54 sm:text-[14px] sm:leading-7">Small projects stay simple. Larger hardware expands into subsystems, assemblies, boards, mechanical parts and implementations without losing traceability.</p>
          </div>
          <ScaleDiagram />
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.16fr_0.84fr] lg:items-center lg:gap-14">
          <ChangeImpactVisual />
          <div className="max-w-[520px]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38"><Workflow size={13} /> Connected change</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[2.7rem]">A serious product tells you what a change will affect.</h2>
            <p className="mt-5 text-[13px] leading-6 text-black/54 sm:text-[14px] sm:leading-7">Replacing one sensor should expose consequences across symbol, footprint, enclosure clearance, firmware mapping, validation and release evidence before the change is accepted.</p>
            <div className="mt-6 grid border border-black/10 bg-white/45 sm:grid-cols-2">
              <Principle icon={Network} title="Cross-domain identity" body="The same component remains recognizable across every representation." />
              <Principle icon={LockKeyhole} title="Explicit approval" body="High-impact changes are proposed and reviewed rather than silently applied." bordered />
              <Principle icon={GitBranch} title="Version-aware evidence" body="Evidence stays tied to the exact product state that produced it." top />
              <Principle icon={ShieldAlert} title="Truth boundaries" body="Missing physical facts remain unresolved instead of being guessed." bordered top />
            </div>
          </div>
        </div>
      </section>

      <section id="status" className="border-y border-black/10 bg-white/42">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38"><ShieldAlert size={13} /> Current reality</div>
            <h2 className="mt-3 text-[1.8rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[2.25rem]">Commercial presentation cannot substitute for engineering depth.</h2>
            <p className="mt-4 text-[12px] leading-6 text-black/52 sm:text-[13px]">The visual system is being made professional, but readiness will only be claimed when the underlying workflows are independently proven.</p>
          </div>
          <div className="border border-black/10 bg-[#f5f2ea]">
            {truths.map((truth, index) => <div key={truth} className={`flex gap-3 px-4 py-3.5 text-[11px] leading-5 text-black/58 sm:px-5 sm:text-[12px] ${index > 0 ? 'border-t border-black/10' : ''}`}><ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-700" /><span>{truth}</span></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#d9d4c7]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="bg-[#11110f] px-5 py-8 text-[#f4f1e9] sm:px-7 lg:px-9 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[760px]">
                <div className="text-[8px] font-semibold uppercase tracking-[0.17em] text-white/32">Hardware Studio</div>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-[2.7rem]">Build the physical product without losing the system around it.</h2>
                <p className="mt-4 max-w-[660px] text-[12px] leading-6 text-white/48 sm:text-[13px]">Inspect the current development workspace. Expect an evolving engineering platform—not a production-qualified release yet.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link href="/studio" className="group inline-flex h-11 items-center justify-center gap-2 bg-[#f4f1e9] px-5 text-[11px] font-semibold text-[#11110f] transition hover:bg-white">Open Studio <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
                <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 border border-white/15 px-5 text-[11px] font-semibold text-white/66 transition hover:border-white/28 hover:text-white">Inspect repository <ChevronRight size={14} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-6 text-[10px] text-black/46 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2.5"><BrandMark className="h-7 w-7" /><div><div className="font-semibold text-black/70">Hardware Studio</div><div className="mt-0.5">Connected engineering platform · active development</div></div></div>
          <div className="max-w-[620px] leading-4 md:text-right">Experimental software. Current outputs require independent engineering review and must not be used directly for fabrication, certification, or safety-critical decisions.</div>
        </div>
      </footer>
    </main>
  );
}

function HeroMetric({ value, label, bordered = false }: { value: string; label: string; bordered?: boolean }) {
  return <div className={`py-3 ${bordered ? 'border-x border-black/10 px-3' : ''}`}><div className="font-mono text-[13px] font-semibold text-black/72">{value}</div><div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-black/35">{label}</div></div>;
}

function ProductTechnicalHero() {
  return (
    <div className="border border-black/18 bg-[#171614] text-[#f4f1e9] shadow-[0_28px_70px_rgba(20,18,12,0.16)]">
      <div className="flex h-10 items-center border-b border-white/10 px-3.5">
        <div><div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">Physical product / ENV-01</div><div className="mt-0.5 text-[9px] font-semibold text-white/70">Environmental monitor · main controller assembly</div></div>
        <span className="ml-auto border border-emerald-300/18 bg-emerald-300/[0.05] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-emerald-200/58">connected</span>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_176px]">
        <div className="relative min-h-[430px] border-white/10 bg-[#10100f] md:border-r">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:22px_22px]" />
          <PcbAssemblyDrawing />
        </div>
        <div className="bg-[#1c1a18]">
          <div className="border-b border-white/10 px-3 py-2.5 text-[7px] font-semibold uppercase tracking-[0.13em] text-white/28">Linked representations</div>
          <RepresentationState label="Architecture" detail="Sensor subsystem" state="linked" />
          <RepresentationState label="Schematic" detail="U1 + U3 + power" state="linked" />
          <RepresentationState label="PCB" detail="18 parts · 2 layers" state="active" />
          <RepresentationState label="Mechanical" detail="Board envelope linked" state="linked" />
          <RepresentationState label="Firmware" detail="2 hardware mappings" state="linked" />
          <RepresentationState label="Validation" detail="3 checks need review" state="review" />
          <div className="border-t border-white/10 p-3"><div className="text-[7px] font-semibold uppercase tracking-[0.12em] text-white/24">Selected</div><div className="mt-2 text-[10px] font-semibold text-white/70">U3 · BME280</div><div className="mt-1 font-mono text-[7px] leading-4 text-white/30">LGA-8<br />2.5 × 2.5 mm<br />8 pads · I²C</div></div>
        </div>
      </div>
      <div className="flex h-7 items-center border-t border-white/10 px-3 font-mono text-[7px] text-white/30"><span>Board 64.0 × 38.0 mm</span><span className="mx-2 text-white/12">|</span><span>Top copper</span><span className="ml-auto">U3 selected · physical height unresolved</span></div>
    </div>
  );
}

function PcbAssemblyDrawing() {
  const qfnPins = Array.from({ length: 32 });
  const passives = [
    [31, 33], [36, 33], [31, 38], [36, 38], [58, 22], [62, 22], [66, 22], [58, 56], [62, 56], [66, 56], [44, 70], [49, 70],
  ];
  return (
    <svg viewBox="0 0 720 470" className="absolute inset-0 h-full w-full" role="img" aria-label="Technical PCB assembly drawing with MCU, sensor, USB-C connector, regulator, passives and routed copper">
      <defs>
        <pattern id="pcb-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ffffff" strokeOpacity="0.035" /></pattern>
      </defs>
      <rect width="720" height="470" fill="url(#pcb-grid)" />
      <g transform="translate(82 78)">
        <rect x="0" y="0" width="510" height="300" fill="#183629" stroke="#d9bd74" strokeOpacity="0.7" strokeWidth="2" />
        <rect x="12" y="12" width="486" height="276" fill="none" stroke="#d9bd74" strokeOpacity="0.13" />
        <circle cx="25" cy="25" r="9" fill="#0e1712" stroke="#d9bd74" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="485" cy="25" r="9" fill="#0e1712" stroke="#d9bd74" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="25" cy="275" r="9" fill="#0e1712" stroke="#d9bd74" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="485" cy="275" r="9" fill="#0e1712" stroke="#d9bd74" strokeOpacity="0.55" strokeWidth="3" />

        <g transform="translate(-8 106)">
          <rect x="0" y="0" width="72" height="88" fill="#c1c5c4" stroke="#e7e7e2" strokeOpacity="0.55" />
          <rect x="11" y="17" width="50" height="54" rx="16" fill="#262725" stroke="#8e9390" />
          <rect x="72" y="22" width="14" height="9" fill="#d2b76f" /><rect x="72" y="39" width="14" height="9" fill="#d2b76f" /><rect x="72" y="56" width="14" height="9" fill="#d2b76f" />
        </g>

        <g transform="translate(176 84)">
          <rect x="0" y="0" width="118" height="118" fill="#22231f" stroke="#d6c48c" strokeOpacity="0.48" />
          <rect x="27" y="27" width="64" height="64" fill="#171815" stroke="#50524c" />
          {qfnPins.map((_, index) => {
            const side = Math.floor(index / 8);
            const pos = 12 + (index % 8) * 13.4;
            if (side === 0) return <rect key={index} x={pos} y={-7} width="6" height="13" fill="#d6b96f" />;
            if (side === 1) return <rect key={index} x={112} y={pos} width="13" height="6" fill="#d6b96f" />;
            if (side === 2) return <rect key={index} x={pos} y={112} width="6" height="13" fill="#d6b96f" />;
            return <rect key={index} x={-7} y={pos} width="13" height="6" fill="#d6b96f" />;
          })}
          <circle cx="17" cy="17" r="4" fill="#d8d7cf" />
          <text x="59" y="56" textAnchor="middle" fill="#d6d3ca" fontSize="12" fontWeight="700">U1</text>
          <text x="59" y="72" textAnchor="middle" fill="#8b8b83" fontSize="8">MCU · QFN-32</text>
        </g>

        <g transform="translate(386 54)">
          <rect x="0" y="0" width="66" height="66" fill="#24251f" stroke="#efd792" strokeWidth="2" />
          {[12, 33, 54].map((x) => <React.Fragment key={x}><rect x={x - 5} y={-7} width="10" height="14" fill="#d5ba73" /><rect x={x - 5} y={59} width="10" height="14" fill="#d5ba73" /></React.Fragment>)}
          <rect x={-7} y="27" width="14" height="12" fill="#d5ba73" /><rect x="59" y="27" width="14" height="12" fill="#d5ba73" />
          <circle cx="14" cy="14" r="3.5" fill="#e9e4d7" />
          <text x="33" y="31" textAnchor="middle" fill="#ead9a5" fontSize="10" fontWeight="700">U3</text><text x="33" y="45" textAnchor="middle" fill="#8f8a7e" fontSize="7">BME280</text>
        </g>

        <g transform="translate(94 218)">
          <rect x="0" y="0" width="72" height="44" fill="#262722" stroke="#cfc5aa" strokeOpacity="0.36" />
          <rect x="9" y="-6" width="12" height="10" fill="#d2b56a" /><rect x="30" y="-6" width="12" height="10" fill="#d2b56a" /><rect x="51" y="-6" width="12" height="10" fill="#d2b56a" />
          <rect x="9" y="40" width="12" height="10" fill="#d2b56a" /><rect x="30" y="40" width="12" height="10" fill="#d2b56a" /><rect x="51" y="40" width="12" height="10" fill="#d2b56a" />
          <text x="36" y="20" textAnchor="middle" fill="#d9d5ca" fontSize="9" fontWeight="700">U2</text><text x="36" y="32" textAnchor="middle" fill="#817e76" fontSize="6">REG</text>
        </g>

        <g transform="translate(392 220)">{[0,1,2,3,4].map((i) => <circle key={i} cx={i * 18} cy="0" r="7" fill="#c9aa5e" stroke="#11110f" strokeWidth="2" />)}<text x="36" y="23" textAnchor="middle" fill="#aaa69c" fontSize="7">J2 DEBUG</text></g>

        {passives.map(([x, y], index) => <g key={index} transform={`translate(${x * 5.1} ${y * 3})`}><rect x="0" y="0" width="18" height="8" fill="#d3b66a" opacity="0.72" /><rect x="4" y="1" width="10" height="6" fill="#35352f" /></g>)}

        <g fill="none" stroke="#d6b66c" strokeWidth="2" strokeOpacity="0.72">
          <path d="M78 131H132V115H176" /><path d="M78 148H146V142H176" /><path d="M294 112H338V87H386" /><path d="M294 138H350V103H386" /><path d="M294 164H332V175H416V120" /><path d="M166 240H216V202" /><path d="M130 218V178H176" />
        </g>
        <g fill="none" stroke="#83b198" strokeWidth="1.7" strokeOpacity="0.7">
          <path d="M294 176H350V153H419V120" /><path d="M278 202V246H392" /><path d="M230 84V52H410V54" />
        </g>
        <circle cx="350" cy="153" r="4" fill="#cfb368" stroke="#11110f" strokeWidth="1.5" />
        <circle cx="216" cy="202" r="4" fill="#cfb368" stroke="#11110f" strokeWidth="1.5" />

        <line x1="0" y1="322" x2="510" y2="322" stroke="#d9bd74" strokeOpacity="0.48" /><line x1="0" y1="313" x2="0" y2="331" stroke="#d9bd74" strokeOpacity="0.48" /><line x1="510" y1="313" x2="510" y2="331" stroke="#d9bd74" strokeOpacity="0.48" /><text x="255" y="341" textAnchor="middle" fill="#bca977" fontSize="9">64.00 mm</text>
      </g>

      <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="#d4d0c5">
        <path d="M160 76V42H95" fill="none" stroke="#8f8a7e" /><text x="25" y="39">J1 · USB-C</text><text x="25" y="51" fill="#77736c">power + USB 2.0</text>
        <path d="M320 160V45H350" fill="none" stroke="#8f8a7e" /><text x="357" y="42">U1 · MCU</text><text x="357" y="54" fill="#77736c">QFN-32 · controller</text>
        <path d="M500 131H625V100" fill="none" stroke="#d6b96f" /><text x="632" y="96" fill="#e2c986">U3 · SENSOR</text><text x="632" y="108" fill="#77736c">LGA-8 · I²C</text>
        <path d="M208 331H50V390" fill="none" stroke="#8f8a7e" /><text x="18" y="405">U2 · REGULATOR</text><text x="18" y="417" fill="#77736c">3V3 rail</text>
      </g>
    </svg>
  );
}

function RepresentationState({ label, detail, state }: { label: string; detail: string; state: 'linked' | 'active' | 'review' }) {
  return <div className={`border-b border-white/10 px-3 py-2.5 ${state === 'active' ? 'border-l-2 border-l-[#d6bb7a] bg-white/[0.055]' : ''}`}><div className="flex items-center justify-between gap-2"><span className="text-[8px] font-semibold text-white/58">{label}</span><span className={`h-1.5 w-1.5 rounded-full ${state === 'review' ? 'bg-amber-300/65' : 'bg-emerald-300/52'}`} /></div><div className="mt-1 text-[7px] leading-3 text-white/28">{detail}</div></div>;
}

function RepresentationChain() {
  return (
    <div className="grid border border-white/12 bg-[#1b1a17] sm:grid-cols-2 xl:grid-cols-3">
      <RepresentationCell title="Architecture" state="semantic"><ArchitectureSensor /></RepresentationCell>
      <RepresentationCell title="Schematic" state="linked" bordered><SchematicSensor /></RepresentationCell>
      <RepresentationCell title="PCB footprint" state="linked" borderedXl><SensorFootprint /></RepresentationCell>
      <RepresentationCell title="Mechanical package" state="unresolved" top><MechanicalPackage /></RepresentationCell>
      <RepresentationCell title="Firmware" state="linked" top bordered><FirmwareMapping /></RepresentationCell>
      <RepresentationCell title="Validation" state="review" top borderedXl><ValidationEvidence /></RepresentationCell>
    </div>
  );
}

function RepresentationCell({ title, state, children, bordered = false, borderedXl = false, top = false }: { title: string; state: string; children: React.ReactNode; bordered?: boolean; borderedXl?: boolean; top?: boolean }) {
  return <div className={`min-h-[190px] p-3.5 ${top ? 'border-t border-white/10' : ''} ${bordered ? 'sm:border-l sm:border-white/10' : ''} ${borderedXl ? 'xl:border-l xl:border-white/10' : ''}`}><div className="flex items-center justify-between"><span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/30">{title}</span><span className={`text-[7px] ${state === 'linked' || state === 'semantic' ? 'text-emerald-200/48' : state === 'review' ? 'text-amber-200/55' : 'text-white/28'}`}>{state}</span></div><div className="mt-3 h-[132px]">{children}</div></div>;
}

function ArchitectureSensor() {
  return <div className="flex h-full items-center justify-center"><div className="relative flex h-[88px] w-[150px] items-center gap-3 border border-emerald-200/25 bg-emerald-200/[0.035] px-3"><div className="grid h-11 w-11 place-items-center border border-emerald-200/20 text-emerald-100/68"><div className="relative h-6 w-6 border border-current"><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current" /></div></div><div><div className="text-[9px] font-semibold text-white/72">Environment</div><div className="mt-1 text-[7px] text-white/30">Sensor function</div></div>{['PWR','I²C','INT'].map((p, i) => <span key={p} className="absolute -right-7 font-mono text-[6px] text-white/34" style={{ top: 19 + i * 20 }}>{p}</span>)}</div></div>;
}

function SchematicSensor() {
  return <svg viewBox="0 0 240 132" className="h-full w-full"><rect x="55" y="20" width="130" height="92" fill="#f5f2e8" stroke="#d7c78f" strokeWidth="2" /><text x="120" y="61" textAnchor="middle" fill="#201f1b" fontSize="12" fontWeight="700">U3</text><text x="120" y="77" textAnchor="middle" fill="#625f57" fontSize="8">BME280</text>{[['VIN',24],['GND',44],['SDA',68],['SCL',90]].map(([label,y]) => <g key={label}><line x1="20" x2="55" y1={Number(y)} y2={Number(y)} stroke="#d8c47c" /><text x="17" y={Number(y)+3} textAnchor="end" fill="#aaa49a" fontSize="7">{label}</text></g>)}{[['SDO',36],['CSB',60],['INT',86]].map(([label,y]) => <g key={label}><line x1="185" x2="220" y1={Number(y)} y2={Number(y)} stroke="#d8c47c" /><text x="223" y={Number(y)+3} fill="#aaa49a" fontSize="7">{label}</text></g>)}</svg>;
}

function SensorFootprint() {
  const pads = [[82,35],[120,35],[158,35],[82,97],[120,97],[158,97],[62,66],[178,66]];
  return <svg viewBox="0 0 240 132" className="h-full w-full"><rect x="68" y="18" width="104" height="96" fill="none" stroke="#6f6b62" strokeDasharray="4 3" /><rect x="76" y="26" width="88" height="80" fill="#24241f" stroke="#d9c584" />{pads.map(([x,y],i)=><g key={i}><rect x={x-9} y={y-6} width="18" height="12" fill="#cfb168" stroke="#11110f" /><text x={x} y={y+3} textAnchor="middle" fill="#11110f" fontSize="6" fontWeight="700">{i+1}</text></g>)}<circle cx="91" cy="42" r="3" fill="#e9e2cf" /></svg>;
}

function MechanicalPackage() {
  return <svg viewBox="0 0 240 132" className="h-full w-full"><rect x="66" y="38" width="108" height="58" fill="none" stroke="#bbb5aa" /><line x1="66" y1="108" x2="174" y2="108" stroke="#d8c47c" /><line x1="66" y1="101" x2="66" y2="115" stroke="#d8c47c" /><line x1="174" y1="101" x2="174" y2="115" stroke="#d8c47c" /><text x="120" y="126" textAnchor="middle" fill="#baaa7a" fontSize="8">2.50 mm</text><line x1="188" y1="38" x2="188" y2="96" stroke="#706c64" /><text x="196" y="70" fill="#aaa49a" fontSize="7">height ?</text><text x="120" y="67" textAnchor="middle" fill="#d8d3c9" fontSize="9">LGA package</text><text x="120" y="81" textAnchor="middle" fill="#77736b" fontSize="7">exact STEP unresolved</text></svg>;
}

function FirmwareMapping() {
  return <div className="h-full border border-white/10 bg-[#11110f] p-3 font-mono text-[7px] leading-4 text-white/40"><div className="text-white/20">sensor.cpp</div><div className="mt-2 text-[#d7c58d]/70">constexpr auto BME_ADDR = 0x76;</div><div className="text-[#9dc2ac]/65">Wire.begin(SDA_PIN, SCL_PIN);</div><div className="mt-2 text-white/32">read_temperature();</div><div className="text-white/32">read_humidity();</div><div className="mt-3 border-t border-white/10 pt-2 text-white/20">mapped → U3 / I²C</div></div>;
}

function ValidationEvidence() {
  return <div className="h-full border border-white/10"><div className="flex h-8 items-center border-b border-white/10 px-2 text-[8px] text-white/52">DVT-ENV-04 <span className="ml-auto text-amber-200/52">retest</span></div>{['Temperature accuracy','Humidity response','Sleep current'].map((item,i)=><div key={item} className="flex h-8 items-center border-b border-white/[0.07] px-2 text-[7px] text-white/32"><span className={`mr-2 h-1.5 w-1.5 rounded-full ${i < 2 ? 'bg-emerald-300/45' : 'bg-amber-300/55'}`} />{item}</div>)}</div>;
}

function WorkbenchPreview({ type }: { type: 'schematic' | 'mechanical' | 'firmware' }) {
  const meta = { schematic: ['01','Schematic','Electrical connectivity'], mechanical: ['02','Mechanical','Physical geometry + dimensions'], firmware: ['03','Firmware','Implementation + evidence'] }[type];
  return <article className="min-h-[390px] border-white/10 bg-[#171614] text-[#f4f1e9] lg:border-l first:lg:border-l-0"><div className="flex h-10 items-center border-b border-white/10 px-3"><span className="text-[9px] font-semibold text-white/68">{meta[1]}</span><span className="ml-auto font-mono text-[7px] text-white/24">{meta[0]}</span></div><div className="flex h-8 items-center border-b border-white/10 px-2 text-[7px]"><span className="bg-white/[0.07] px-2 py-1 text-white/58">Select</span><span className="px-2 py-1 text-white/28">{type === 'schematic' ? 'Wire' : type === 'mechanical' ? 'Dimension' : 'Save'}</span><span className="px-2 py-1 text-white/28">Inspect</span></div><div className="relative h-[285px] overflow-hidden bg-[#10100f]"><div className="absolute inset-0 opacity-28 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:20px_20px]" />{type === 'schematic' ? <SchematicWorkbenchPreview /> : type === 'mechanical' ? <MechanicalWorkbenchPreview /> : <FirmwareWorkbenchPreview />}</div><div className="border-t border-white/10 px-3 py-2.5 text-[9px] text-white/42">{meta[2]}</div></article>;
}

function SchematicWorkbenchPreview() {
  return <div className="absolute inset-5"><svg viewBox="0 0 300 230" className="h-full w-full"><rect x="25" y="62" width="92" height="102" fill="#1e1e1a" stroke="#c6b47d" /><text x="71" y="105" textAnchor="middle" fill="#ddd7ca" fontSize="10" fontWeight="700">U1</text><text x="71" y="119" textAnchor="middle" fill="#77736a" fontSize="7">MCU</text><rect x="205" y="82" width="62" height="62" fill="#24241f" stroke="#dec98a" strokeWidth="2" /><text x="236" y="111" textAnchor="middle" fill="#ead69d" fontSize="9">U3</text><text x="236" y="124" textAnchor="middle" fill="#77736a" fontSize="6">BME280</text><path d="M117 85H160V96H205M117 106H151V111H205M117 128H167V126H205" fill="none" stroke="#d5b86e" strokeWidth="1.5" /><path d="M117 148H145V165H230V144" fill="none" stroke="#86aa96" strokeWidth="1.5" /><text x="150" y="89" fill="#928d82" fontSize="6">SDA</text><text x="150" y="104" fill="#928d82" fontSize="6">SCL</text></svg></div>;
}

function MechanicalWorkbenchPreview() {
  return <div className="absolute inset-6"><svg viewBox="0 0 300 230" className="h-full w-full"><rect x="46" y="42" width="205" height="137" fill="none" stroke="#aaa59b" /><rect x="67" y="63" width="116" height="78" fill="#d6bc76" fillOpacity="0.04" stroke="#d6bc76" strokeOpacity="0.62" /><circle cx="219" cy="93" r="26" fill="none" stroke="#aaa59b" /><circle cx="77" cy="165" r="6" fill="none" stroke="#aaa59b" /><circle cx="220" cy="165" r="6" fill="none" stroke="#aaa59b" /><line x1="46" y1="28" x2="251" y2="28" stroke="#d6bc76" strokeOpacity="0.6" /><line x1="46" y1="22" x2="46" y2="34" stroke="#d6bc76" /><line x1="251" y1="22" x2="251" y2="34" stroke="#d6bc76" /><text x="148" y="20" textAnchor="middle" fill="#c9b47c" fontSize="7">64.00 mm</text><text x="95" y="80" fill="#c9b47c" fontSize="6">PCB envelope</text><text x="204" y="96" textAnchor="middle" fill="#8e8a81" fontSize="6">Ø12 opening</text></svg></div>;
}

function FirmwareWorkbenchPreview() {
  const lines = ['#include <Wire.h>', '', 'void sensor_init() {', '  Wire.begin();', '  bme.begin(0x76);', '}', '', 'float read_temp() {', '  return bme.readTemperature();', '}'];
  return <div className="absolute inset-0 grid grid-cols-[78px_1fr]"><div className="border-r border-white/10 bg-[#1d1b19] px-1.5 py-2"><div className="mb-2 text-[6px] font-semibold uppercase tracking-[0.1em] text-white/22">Explorer</div>{['src','main.cpp','sensor.cpp','platformio.ini'].map((file,index)=><div key={file} className={`truncate px-1.5 py-1 text-[6px] ${index===2?'bg-white/[0.07] text-white/58':'text-white/26'}`}>{file}</div>)}</div><div><div className="flex h-7 items-center border-b border-white/10 bg-[#1c1a18] px-2 text-[6px] text-white/36">sensor.cpp <span className="ml-auto text-white/18">C++</span></div><div className="grid grid-cols-[25px_1fr] py-2 font-mono text-[6px] leading-[16px]"><div className="border-r border-white/[0.06] pr-2 text-right text-white/16">{lines.map((_,i)=><div key={i}>{i+1}</div>)}</div><div className="pl-2 text-white/46">{lines.map((line,i)=><div key={i} className={line.includes('void')||line.includes('float')||line.includes('return')?'text-[#d6c18a]/68':line.includes('Wire')?'text-[#9dc8b1]/60':''}>{line||' '}</div>)}</div></div></div></div>;
}

function ScaleDiagram() {
  return <div className="border border-black/12 bg-[#f5f2ea]"><ScaleRow level="01" name="Compact sensor" items={['Product','Main PCB','Enclosure','Firmware']} /><ScaleRow level="02" name="Instrument / robot" items={['Product','Control assembly','Power assembly','Mechanical assembly','Firmware']} /><ScaleRow level="03" name="Machine" items={['Machine','Motion subsystem','Control cabinet','Operator interface','Safety system']} last /></div>;
}

function ScaleRow({ level, name, items, last = false }: { level: string; name: string; items: string[]; last?: boolean }) {
  return <div className={`grid gap-4 p-4 sm:grid-cols-[130px_1fr] ${!last ? 'border-b border-black/10' : ''}`}><div><div className="font-mono text-[8px] text-black/25">{level}</div><div className="mt-1 text-[11px] font-semibold text-black/72">{name}</div></div><div className="flex flex-wrap items-center gap-1.5">{items.map((item,index)=><div key={item} className="flex items-center gap-1.5"><span className={`border px-2.5 py-1.5 text-[8px] ${index===0?'border-black/30 bg-[#11110f] text-white':'border-black/12 bg-white/55 text-black/52'}`}>{item}</span>{index<items.length-1&&<ChevronRight size={9} className="text-black/24" />}</div>)}</div></div>;
}

function ChangeImpactVisual() {
  const rows = [['Component definition','changed'],['Schematic symbol','review'],['PCB footprint','compatible'],['Mechanical package','changed'],['Firmware mapping','review'],['Validation evidence','stale']];
  return <div className="border border-black/12 bg-[#171614] text-white"><div className="flex h-10 items-center border-b border-white/10 px-3"><div className="text-[9px] font-semibold text-white/62">Change impact · U3 environmental sensor</div><div className="ml-auto font-mono text-[7px] text-white/24">proposal / review</div></div><div className="grid min-h-[330px] md:grid-cols-[190px_1fr]"><div className="border-b border-white/10 bg-[#1d1b19] p-2.5 md:border-b-0 md:border-r"><div className="px-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-white/24">Affected domains</div>{rows.map(([label,state],i)=><div key={label} className={`mt-1.5 flex h-8 items-center border-l-2 px-2 ${i===0?'border-[#d6bb7a] bg-white/[0.06]':'border-transparent'}`}><span className={`mr-2 h-1.5 w-1.5 rounded-full ${state==='stale'?'bg-amber-300/60':state==='review'?'border border-white/28':'bg-emerald-300/48'}`} /><span className="min-w-0 flex-1 truncate text-[7px] text-white/42">{label}</span><span className="text-[6px] text-white/20">{state}</span></div>)}</div><div className="p-4"><div className="text-[7px] font-semibold uppercase tracking-[0.1em] text-white/24">Review before applying</div><div className="mt-1 text-[14px] font-semibold text-white/78">Replace sensor package revision</div><div className="mt-4 grid gap-2 sm:grid-cols-2"><ImpactDetail title="Electrical" lines={['Pin map unchanged','Supply compatible','I²C unchanged']} /><ImpactDetail title="Physical" lines={['Body height +0.45 mm','Clearance review required']} /><ImpactDetail title="Firmware" lines={['Driver linked','Initialization review']} /><ImpactDetail title="Validation" lines={['DVT-ENV-04 stale','Retest required']} /></div></div></div></div>;
}

function ImpactDetail({ title, lines }: { title: string; lines: string[] }) {
  return <div className="border border-white/10 bg-white/[0.025] p-2.5"><div className="text-[7px] font-semibold uppercase tracking-[0.1em] text-white/24">{title}</div><div className="mt-2 space-y-1">{lines.map(line=><div key={line} className="flex gap-1.5 text-[7px] leading-4 text-white/40"><Check size={8} className="mt-1 shrink-0 text-emerald-200/42" />{line}</div>)}</div></div>;
}

function Principle({ icon: Icon, title, body, bordered = false, top = false }: { icon: typeof Network; title: string; body: string; bordered?: boolean; top?: boolean }) {
  return <div className={`p-3.5 ${bordered ? 'sm:border-l sm:border-black/10' : ''} ${top ? 'border-t border-black/10' : ''}`}><Icon size={14} className="text-black/58" /><div className="mt-3 text-[10px] font-semibold text-black/72">{title}</div><p className="mt-1.5 text-[9px] leading-4 text-black/44">{body}</p></div>;
}
