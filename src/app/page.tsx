import Link from 'next/link';
import {
  ArrowRight,
  Box,
  Check,
  CircuitBoard,
  Code2,
  Cpu,
  GitBranch,
  Network,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

const disciplines = [
  { icon: Network, label: 'Product', detail: 'Requirements + architecture' },
  { icon: Cpu, label: 'Electronics', detail: 'Parts + schematic' },
  { icon: CircuitBoard, label: 'PCB', detail: 'Placement + routing' },
  { icon: Box, label: 'Mechanical', detail: 'Geometry + assembly' },
  { icon: Code2, label: 'Firmware', detail: 'Mapping + source' },
  { icon: PackageCheck, label: 'Validation', detail: 'Evidence + release' },
] as const;

const chain = [
  ['Architecture', 'Environmental sensing function', 'semantic role'],
  ['Schematic', 'U3 · BME280 · I²C', 'electrical symbol'],
  ['PCB', 'U3 · LGA-8 · 8 pads', 'physical footprint'],
  ['Mechanical', '2.5 × 2.5 mm package', 'physical envelope'],
  ['Firmware', 'env_sensor / i2c0', 'implementation mapping'],
  ['Validation', 'DVT-ENV-04', 'measured evidence'],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#efede7] pt-14 text-[#11110f] selection:bg-[#11110f] selection:text-[#f4f1e9]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[#efede7]/96 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Hardware Studio home">
            <BrandMark className="h-8 w-8" />
            <div>
              <div className="text-[13px] font-semibold tracking-[-0.025em]">Hardware Studio</div>
              <div className="mt-0.5 hidden text-[8px] font-medium uppercase tracking-[0.15em] text-black/38 sm:block">Connected product engineering</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[11px] font-medium text-black/50 lg:flex" aria-label="Landing navigation">
            <a href="#system" className="transition-colors hover:text-black">System</a>
            <a href="#workflow" className="transition-colors hover:text-black">Workflow</a>
            <a href="#truth" className="transition-colors hover:text-black">Engineering truth</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <a href="https://github.com/Ankit6149/hardware-studio" target="_blank" rel="noreferrer" className="hidden h-9 items-center px-3 text-[10px] font-semibold text-black/54 transition hover:bg-black/[0.04] hover:text-black sm:inline-flex">GitHub</a>
            <Link href="/studio" className="group inline-flex h-9 items-center gap-2 bg-[#11110f] px-3.5 text-[10px] font-semibold text-[#f4f1e9] transition hover:bg-black">
              Open Studio <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1380px] px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="max-w-[980px]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-black/42">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> Engineering platform in active development
            </div>
            <h1 className="mt-5 max-w-[980px] text-[clamp(3.25rem,7.2vw,7.4rem)] font-semibold leading-[0.9] tracking-[-0.062em]">
              One physical product.
              <span className="block text-black/34">Every discipline connected.</span>
            </h1>
            <p className="mt-7 max-w-[760px] text-[15px] leading-7 text-black/58 sm:text-[17px] sm:leading-8">
              Hardware Studio connects product architecture, electronics, PCB, mechanical design, firmware, validation, and release around the same engineering objects instead of turning each discipline into another disconnected file.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Link href="/studio" className="group inline-flex h-11 items-center justify-center gap-2 bg-[#11110f] px-5 text-[11px] font-semibold text-[#f4f1e9] transition hover:bg-black">
                Enter Studio <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#system" className="inline-flex h-11 items-center justify-center border border-black/16 bg-white/38 px-5 text-[11px] font-semibold transition hover:bg-white/70">See the connected model</a>
            </div>
          </div>

          <div className="mt-12 border border-black/14 bg-[#161513] text-[#f4f1e9] shadow-[0_30px_90px_rgba(17,17,15,0.16)] lg:mt-14">
            <div className="grid min-h-[520px] lg:grid-cols-[1.28fr_0.72fr]">
              <TechnicalBoard />
              <RepresentationPanel />
            </div>
          </div>

          <div className="grid border-x border-b border-black/10 bg-white/35 sm:grid-cols-3 lg:grid-cols-6">
            {disciplines.map(({ icon: Icon, label, detail }, index) => (
              <div key={label} className={`flex min-h-[84px] items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-black/10 sm:border-t-0 sm:border-l' : ''} ${index >= 3 ? 'sm:border-t lg:border-t-0' : ''}`}>
                <Icon className="h-4 w-4 shrink-0 text-black/55" strokeWidth={1.7} />
                <div><div className="text-[10px] font-semibold text-black/76">{label}</div><div className="mt-1 text-[8px] leading-3.5 text-black/40">{detail}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="bg-[#11110f] text-[#f4f1e9]">
        <div className="mx-auto grid max-w-[1380px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-20">
          <div className="max-w-[500px]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/34">One canonical engineering object</div>
            <h2 className="mt-4 text-[2.25rem] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[3rem]">A component should look right for the job you are doing.</h2>
            <p className="mt-5 text-[13px] leading-7 text-white/50 sm:text-[14px]">The architecture role, schematic symbol, PCB footprint, mechanical package, firmware mapping, and validation record are different representations of the same thing. Hardware Studio keeps their identity connected without pretending they are interchangeable.</p>
          </div>
          <div className="grid border border-white/12 bg-[#191816] sm:grid-cols-2">
            {chain.map(([name, detail, kind], index) => (
              <div key={name} className={`min-h-[116px] p-4 ${index % 2 ? 'sm:border-l sm:border-white/10' : ''} ${index >= 2 ? 'border-t border-white/10' : ''}`}>
                <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-white/28">{name}</div>
                <div className="mt-3 text-[12px] font-semibold text-white/72">{detail}</div>
                <div className="mt-2 font-mono text-[8px] text-white/30">{kind}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="max-w-[540px]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/38">Development workflow</div>
            <h2 className="mt-3 text-[2.2rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-[2.8rem]">The product grows. The mental model stays stable.</h2>
            <p className="mt-5 text-[13px] leading-7 text-black/52">A sensor node can stay shallow. A robot or machine can expand into subsystems and assemblies. The same hierarchy scales without forcing the whole product onto one giant canvas.</p>
          </div>
          <ProductHierarchy />
        </div>
      </section>

      <section id="truth" className="border-y border-black/10 bg-[#ded9cc]">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-16">
          <div className="max-w-[520px]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/40"><ShieldCheck size={13} /> Engineering truth</div>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.048em] sm:text-[2.5rem]">Connected does not mean guessed.</h2>
          </div>
          <div className="border border-black/12 bg-[#f4f1e9]">
            {[
              'Unknown physical geometry stays unresolved instead of becoming fabricated dimensions.',
              'Generated content is a proposal until it has evidence, review, or authoritative source data.',
              'Manufacturing outputs remain blocked when required board, package, layer, or placement truth is missing.',
              'AI may explain and propose; canonical engineering data still determines what is real.',
            ].map((truth, index) => (
              <div key={truth} className={`flex gap-3 px-4 py-4 text-[11px] leading-5 text-black/58 sm:px-5 sm:text-[12px] ${index ? 'border-t border-black/10' : ''}`}><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black/55" /><span>{truth}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#11110f] text-[#f4f1e9]">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
          <div className="max-w-[700px]"><div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">Hardware Studio</div><h2 className="mt-3 text-[2rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-[2.6rem]">Build one engineering system around the product.</h2></div>
          <Link href="/studio" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#f4f1e9] px-5 text-[11px] font-semibold text-[#11110f]">Open Studio <ArrowRight size={14} /></Link>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#d9d4c7]">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-4 py-6 text-[10px] leading-4 text-black/45 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2.5"><BrandMark className="h-7 w-7" /><div><div className="font-semibold text-black/68">Hardware Studio</div><div>Connected product engineering · active development</div></div></div>
          <div className="max-w-[650px] md:text-right">Experimental software. Current outputs require independent engineering review before fabrication, certification, or safety-critical use.</div>
        </div>
      </footer>
    </main>
  );
}

function TechnicalBoard() {
  return (
    <div className="relative min-h-[520px] overflow-hidden border-b border-white/10 bg-[#0f0f0e] lg:border-b-0 lg:border-r">
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:22px_22px]" />
      <svg viewBox="0 0 760 520" className="absolute inset-0 h-full w-full" role="img" aria-label="Technical PCB assembly illustration">
        <g transform="translate(78 52)">
          <rect x="0" y="0" width="560" height="390" rx="10" fill="#26352b" stroke="#8ca08f" strokeWidth="2" />
          {[ [30,30],[530,30],[30,360],[530,360] ].map(([x,y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="11" fill="#0f0f0e" stroke="#c8c0b2" /><circle cx={x} cy={y} r="4" fill="#c8c0b2" /></g>)}

          <g transform="translate(210 112)">
            <rect width="136" height="136" fill="#171714" stroke="#d8c48f" strokeWidth="2" />
            {Array.from({ length: 10 }).map((_, index) => <g key={index}><rect x={7 + index * 12} y="-8" width="5" height="10" fill="#d8c48f" /><rect x={7 + index * 12} y="134" width="5" height="10" fill="#d8c48f" /></g>)}
            {Array.from({ length: 10 }).map((_, index) => <g key={index}><rect x="-8" y={7 + index * 12} width="10" height="5" fill="#d8c48f" /><rect x="134" y={7 + index * 12} width="10" height="5" fill="#d8c48f" /></g>)}
            <circle cx="19" cy="19" r="5" fill="#d8c48f" /><text x="68" y="62" textAnchor="middle" fill="#f3f0e8" fontSize="14" fontWeight="700">U1</text><text x="68" y="82" textAnchor="middle" fill="#9d9a91" fontSize="10">MCU</text>
          </g>

          <g transform="translate(405 100)"><rect width="72" height="72" fill="#1a1a17" stroke="#d8c48f" strokeWidth="2" /><circle cx="15" cy="15" r="4" fill="#d8c48f" /><text x="36" y="34" textAnchor="middle" fill="#f3f0e8" fontSize="12" fontWeight="700">U3</text><text x="36" y="50" textAnchor="middle" fill="#96928a" fontSize="8">SENSOR</text>{[8,22,36,50].map((v) => <React.Fragment key={v}><rect x={v} y="-5" width="6" height="7" fill="#c9b37c" /><rect x={v} y="70" width="6" height="7" fill="#c9b37c" /></React.Fragment>)}</g>

          <g transform="translate(-8 146)"><rect width="94" height="58" rx="16" fill="#b6b2aa" stroke="#ebe7dc" strokeWidth="2" /><rect x="14" y="12" width="66" height="34" rx="12" fill="#262522" /><text x="47" y="78" textAnchor="middle" fill="#bdb8ae" fontSize="9">J1 · USB-C</text></g>
          <g transform="translate(400 266)"><rect width="78" height="48" fill="#1a1a17" stroke="#c8c0b2" /><text x="39" y="22" textAnchor="middle" fill="#f3f0e8" fontSize="10" fontWeight="700">U5</text><text x="39" y="36" textAnchor="middle" fill="#99958d" fontSize="8">3V3 REG</text></g>
          {[[112,110,'R1'],[112,140,'C4'],[112,170,'C5'],[364,120,'R8'],[364,152,'C9'],[350,288,'R12'],[350,314,'C12']].map(([x,y,label]) => <g key={String(label)} transform={`translate(${x} ${y})`}><rect width="34" height="13" fill="#c9b37c" /><rect x="9" width="16" height="13" fill="#4b4437" /><text x="17" y="27" textAnchor="middle" fill="#aaa59a" fontSize="7">{label}</text></g>)}
          <g transform="translate(170 315)">{Array.from({length:6}).map((_,i)=><circle key={i} cx={i*20} cy="0" r="5" fill="#d5b96e" stroke="#f3f0e8" strokeWidth="1" />)}<text x="50" y="24" textAnchor="middle" fill="#aaa59a" fontSize="8">SWD</text></g>

          <path d="M86 176H150V130H202M346 146H397M346 186H392V136H405M345 222H420V266M478 290H520V230H545M146 116H176V84H430V100M160 322H90V255H20" fill="none" stroke="#d9b85f" strokeWidth="3" />
          <path d="M86 188H168V262H210M346 204H375V300H400M478 300H520V350H298V248" fill="none" stroke="#7db098" strokeWidth="2.4" />
          {[ [150,130],[392,136],[420,266],[168,262],[375,300],[520,350] ].map(([x,y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="5" fill="#d9b85f" stroke="#0f0f0e" strokeWidth="2" /></g>)}

          <path d="M0 420H560M0 413v14M560 413v14" stroke="#bdb8ae" strokeWidth="1" /><text x="280" y="446" textAnchor="middle" fill="#bdb8ae" fontSize="10">84.00 mm</text>
          <path d="M590 0V390M583 0h14M583 390h14" stroke="#bdb8ae" strokeWidth="1" /><text x="612" y="202" fill="#bdb8ae" fontSize="10" transform="rotate(90 612 202)">58.00 mm</text>
        </g>
      </svg>
      <div className="absolute left-5 top-5 border border-white/12 bg-black/55 px-3 py-2 backdrop-blur-sm"><div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-white/32">Main controller PCB</div><div className="mt-1 text-[11px] font-semibold text-white/72">Environmental monitor / Rev A</div></div>
      <div className="absolute bottom-5 left-5 flex gap-2 text-[8px] text-white/38"><span className="border border-white/12 bg-black/50 px-2 py-1">18 components</span><span className="border border-white/12 bg-black/50 px-2 py-1">7 nets</span><span className="border border-amber-300/20 bg-amber-300/[0.06] px-2 py-1 text-amber-100/60">3 DRC findings</span></div>
    </div>
  );
}

function RepresentationPanel() {
  return (
    <div className="flex min-h-[520px] flex-col bg-[#1b1a17]">
      <div className="border-b border-white/10 px-4 py-4"><div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">Selected engineering object</div><div className="mt-2 flex items-center justify-between gap-3"><div><div className="text-[12px] font-semibold text-white/78">U3 · Environmental sensor</div><div className="mt-1 font-mono text-[8px] text-white/28">component-instance / cmp_03</div></div><span className="border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-1 text-[7px] font-semibold text-emerald-100/58">5 linked</span></div></div>
      <div className="flex-1">
        {chain.map(([name, detail, kind], index) => <div key={name} className={`flex min-h-[67px] items-center gap-3 px-4 ${index ? 'border-t border-white/10' : ''}`}><span className={`h-2 w-2 shrink-0 rounded-full ${index === 3 ? 'border border-amber-200/40' : 'bg-emerald-300/55'}`} /><div className="min-w-0 flex-1"><div className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/28">{name}</div><div className="mt-1 truncate text-[10px] font-medium text-white/65">{detail}</div></div><div className="text-right font-mono text-[7px] text-white/22">{kind}</div></div>)}
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-[9px] leading-4 text-white/34">One identity. Different representations. Missing physical truth remains unresolved rather than fabricated.</div>
    </div>
  );
}

function ProductHierarchy() {
  const rows = [
    ['Product', 'Environmental monitoring instrument'],
    ['Assembly', 'Main electronics assembly'],
    ['Board', 'Main controller PCB'],
    ['Components', 'MCU · sensor · power · connectors'],
    ['Firmware', 'control + sensing modules'],
    ['Evidence', 'ERC · DRC · measurements · release'],
  ] as const;
  return <div className="border border-black/12 bg-[#f6f3eb]">{rows.map(([type,label], index)=><div key={type} className={`grid min-h-[68px] grid-cols-[98px_1fr] items-center gap-4 px-4 ${index ? 'border-t border-black/10' : ''}`} style={{ paddingLeft: `${16 + index * 18}px` }}><div className="font-mono text-[8px] uppercase tracking-[0.1em] text-black/32">{type}</div><div className="text-[11px] font-semibold text-black/68">{label}</div></div>)}</div>;
}
