export const REPRESENTATION_KINDS = [
  'architecture',
  'schematic',
  'pictorial',
  'footprint',
  'package',
  'render3d',
  'exact3d',
  'photo',
] as const;

export type RepresentationKind = (typeof REPRESENTATION_KINDS)[number];

export type RepresentationStatus = 'available' | 'provisional' | 'unresolved' | 'unavailable';
export type RepresentationTrust = 'semantic' | 'educational' | 'preview' | 'authoritative';
export type ArchitecturePortKind =
  | 'power'
  | 'ground'
  | 'data'
  | 'control'
  | 'analog'
  | 'wireless'
  | 'mechanical'
  | 'thermal'
  | 'dependency';

export type ArchitecturePortDirection = 'input' | 'output' | 'bidirectional';

export type VisualFamilyId =
  | 'resistor'
  | 'capacitor'
  | 'led'
  | 'push-button'
  | 'microcontroller'
  | 'sensor'
  | 'voltage-regulator'
  | 'battery'
  | 'usb-c'
  | 'motor-actuator'
  | 'display'
  | 'debug-connector'
  | 'protection-device'
  | 'enclosure'
  | 'pcb-assembly'
  | 'firmware-state'
  | 'software-service'
  | 'validation'
  | 'product-system'
  | 'generic-function';

export interface ArchitecturePort {
  id: string;
  label: string;
  kind: ArchitecturePortKind;
  direction: ArchitecturePortDirection;
  description: string;
}

export interface RepresentationAvailability {
  kind: RepresentationKind;
  status: RepresentationStatus;
  trust: RepresentationTrust;
  label: string;
  description: string;
  authoritativeFor: string[];
  source: string;
  license: string;
  qualification: string;
}

export interface VisualFamilyDefinition {
  id: VisualFamilyId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  accent: string;
  knowledgeId?: string;
  keywords: string[];
  ports: ArchitecturePort[];
  representations: Record<RepresentationKind, RepresentationAvailability>;
}

export interface VisualNodeLike {
  name?: string;
  category?: string;
  description?: string;
  candidateComponents?: string;
  tags?: string[];
}

const internalSource = 'Hardware Studio authored semantic vector system';
const internalLicense = 'Repository license; no third-party raster asset embedded';

function representation(
  kind: RepresentationKind,
  status: RepresentationStatus,
  trust: RepresentationTrust,
  label: string,
  description: string,
  authoritativeFor: string[] = [],
): RepresentationAvailability {
  return {
    kind,
    status,
    trust,
    label,
    description,
    authoritativeFor,
    source: internalSource,
    license: internalLicense,
    qualification:
      status === 'available'
        ? 'Reviewed internal representation contract'
        : status === 'provisional'
          ? 'Visualization only; exact selected-part data is still required'
          : status === 'unresolved'
            ? 'Required source data is missing and no guessed engineering geometry is substituted'
            : 'This representation is not applicable or has not been licensed/qualified',
  };
}

function representationSet(options: {
  schematic?: boolean;
  footprint?: boolean;
  physical?: boolean;
  pictorial?: boolean;
  render3d?: boolean;
}): Record<RepresentationKind, RepresentationAvailability> {
  return {
    architecture: representation(
      'architecture',
      'available',
      'semantic',
      'Architecture visual',
      'Recognizable functional silhouette with typed connection ports. It communicates system intent, not exact electrical or physical geometry.',
      ['system architecture communication'],
    ),
    schematic: options.schematic
      ? representation(
          'schematic',
          'provisional',
          'preview',
          'Schematic-symbol preview',
          'Vector convention preview. A selected component revision must provide the exact symbol pins, numbers, units, and electrical roles.',
        )
      : representation(
          'schematic',
          'unavailable',
          'semantic',
          'No schematic symbol',
          'This family is not itself an electrical schematic component.',
        ),
    pictorial: options.pictorial === false
      ? representation(
          'pictorial',
          'unavailable',
          'educational',
          'No pictorial asset',
          'No licensed or internally authored educational illustration is attached.',
        )
      : representation(
          'pictorial',
          'available',
          'educational',
          'Educational illustration',
          'Internally authored recognizable illustration for onboarding and identification. It is not dimensionally authoritative.',
          ['recognition and learning'],
        ),
    footprint: options.footprint
      ? representation(
          'footprint',
          'provisional',
          'preview',
          'Footprint-family preview',
          'Vector pad-layout preview for recognition. The exact package footprint, pads, drills, courtyard, paste, mask, and origin come from the selected component revision.',
        )
      : representation(
          'footprint',
          'unresolved',
          'preview',
          'Footprint not selected',
          'No exact PCB footprint is available for this concept. Choose a real component/package before PCB placement.',
        ),
    package: options.physical
      ? representation(
          'package',
          'unresolved',
          'preview',
          'Mechanical package unresolved',
          'The family has a physical form, but exact dimensions, tolerances, mounting features, origin, and height require the selected part.',
        )
      : representation(
          'package',
          'unavailable',
          'preview',
          'No physical package',
          'This concept does not have a direct physical package representation.',
        ),
    render3d: options.render3d || options.physical
      ? representation(
          'render3d',
          'provisional',
          'preview',
          'Lightweight 3D silhouette',
          'On-demand low-power Three.js visualization. It is intentionally simple and cannot be used for clearance, interference, mass, or manufacturing checks.',
        )
      : representation(
          'render3d',
          'unavailable',
          'preview',
          'No 3D visualization',
          'A 3D visualization is not applicable to this non-physical concept.',
        ),
    exact3d: options.physical
      ? representation(
          'exact3d',
          'unresolved',
          'authoritative',
          'Exact CAD model missing',
          'Attach and qualify STEP/B-Rep geometry with units, origin, orientation, version, hash, and provenance before authoritative assembly checks.',
          ['assembly and interference only after qualification'],
        )
      : representation(
          'exact3d',
          'unavailable',
          'authoritative',
          'Exact CAD not applicable',
          'This non-physical concept has no exact CAD representation.',
        ),
    photo: representation(
      'photo',
      'unavailable',
      'educational',
      'Licensed photo not attached',
      'Hardware Studio does not ship random web images. A manufacturer or project image needs explicit source and usage rights.',
    ),
  };
}

const port = (
  id: string,
  label: string,
  kind: ArchitecturePortKind,
  direction: ArchitecturePortDirection,
  description: string,
): ArchitecturePort => ({ id, label, kind, direction, description });

export const visualFamilyRegistry: readonly VisualFamilyDefinition[] = [
  {
    id: 'resistor', label: 'Resistor', shortLabel: 'R', description: 'Current limiting, bias, sensing, division, or termination.',
    color: '#b45309', accent: '#fef3c7', knowledgeId: 'resistor', keywords: ['resistor', 'ohm', 'pull-up', 'pull down', 'termination'],
    ports: [port('a', 'A', 'analog', 'bidirectional', 'First passive terminal'), port('b', 'B', 'analog', 'bidirectional', 'Second passive terminal')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'capacitor', label: 'Capacitor', shortLabel: 'C', description: 'Decoupling, filtering, timing, coupling, or energy buffering.',
    color: '#0369a1', accent: '#e0f2fe', knowledgeId: 'capacitor', keywords: ['capacitor', 'decoupling', 'bypass', 'filter', 'bulk'],
    ports: [port('a', 'A', 'analog', 'bidirectional', 'First terminal'), port('b', 'B', 'analog', 'bidirectional', 'Second terminal')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'led', label: 'LED Indicator', shortLabel: 'LED', description: 'Visible product status or illumination output.',
    color: '#be123c', accent: '#ffe4e6', knowledgeId: 'led', keywords: ['led', 'indicator', 'rgb', 'light', 'status light'],
    ports: [port('anode', 'Anode', 'power', 'input', 'Positive LED terminal'), port('cathode', 'Cathode', 'ground', 'output', 'Return terminal'), port('control', 'PWM', 'control', 'input', 'Optional brightness or color control')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'push-button', label: 'Push Button', shortLabel: 'SW', description: 'Physical momentary or maintained user input.',
    color: '#7c3aed', accent: '#ede9fe', knowledgeId: 'push-button', keywords: ['button', 'switch', 'push', 'touch', 'momentary'],
    ports: [port('contact-a', 'Contact A', 'control', 'bidirectional', 'First switch contact'), port('contact-b', 'Contact B', 'control', 'bidirectional', 'Second switch contact'), port('mechanical', 'Press', 'mechanical', 'input', 'Human mechanical actuation')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'microcontroller', label: 'Microcontroller', shortLabel: 'MCU', description: 'Programmable controller coordinating product behavior and peripherals.',
    color: '#0f766e', accent: '#ccfbf1', knowledgeId: 'microcontroller', keywords: ['mcu', 'microcontroller', 'controller', 'processor', 'esp32', 'nrf', 'stm32', 'ble'],
    ports: [port('power', 'Power', 'power', 'input', 'Controller supply domain'), port('ground', 'Ground', 'ground', 'input', 'Electrical reference'), port('gpio', 'GPIO', 'control', 'bidirectional', 'General-purpose control and status'), port('bus', 'Data buses', 'data', 'bidirectional', 'I2C, SPI, UART, USB, or similar'), port('debug', 'Debug', 'dependency', 'bidirectional', 'Programming and debug access'), port('wireless', 'Wireless', 'wireless', 'bidirectional', 'Optional RF interface')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'sensor', label: 'Sensor', shortLabel: 'SNS', description: 'Converts a physical condition into electrical or digital information.',
    color: '#047857', accent: '#d1fae5', knowledgeId: 'environmental-sensor', keywords: ['sensor', 'imu', 'temperature', 'humidity', 'pressure', 'microphone', 'motion', 'i2c'],
    ports: [port('power', 'Power', 'power', 'input', 'Sensor supply'), port('ground', 'Ground', 'ground', 'input', 'Electrical reference'), port('environment', 'Physical input', 'mechanical', 'input', 'Measured physical phenomenon'), port('data', 'Measurement', 'data', 'output', 'Digital bus or measured signal'), port('interrupt', 'Interrupt', 'control', 'output', 'Optional event or data-ready output')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'voltage-regulator', label: 'Voltage Regulator', shortLabel: 'PWR', description: 'Converts and controls a product power rail.',
    color: '#a16207', accent: '#fef9c3', knowledgeId: 'voltage-regulator', keywords: ['regulator', 'ldo', 'buck', 'boost', 'dc-dc', 'power converter'],
    ports: [port('vin', 'VIN', 'power', 'input', 'Input power rail'), port('ground', 'Ground', 'ground', 'input', 'Electrical reference'), port('enable', 'Enable', 'control', 'input', 'Optional rail control'), port('vout', 'VOUT', 'power', 'output', 'Controlled output rail'), port('status', 'Power good', 'control', 'output', 'Optional rail-status output')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'battery', label: 'Battery', shortLabel: 'BAT', description: 'Stored energy source with chemistry, protection, and charging constraints.',
    color: '#15803d', accent: '#dcfce7', knowledgeId: 'battery', keywords: ['battery', 'cell', 'lipo', 'li-ion', 'power source'],
    ports: [port('positive', 'Positive', 'power', 'output', 'Battery positive terminal'), port('negative', 'Negative', 'ground', 'output', 'Battery return terminal'), port('temperature', 'Temperature', 'analog', 'output', 'Optional pack-temperature sensing'), port('mechanical', 'Envelope', 'mechanical', 'bidirectional', 'Retention, swelling, and service interface')],
    representations: representationSet({ schematic: true, footprint: false, physical: true }),
  },
  {
    id: 'usb-c', label: 'USB-C Connector', shortLabel: 'USB-C', description: 'Reversible external power and/or data interface.',
    color: '#1d4ed8', accent: '#dbeafe', knowledgeId: 'usb-c-connector', keywords: ['usb', 'usb-c', 'type-c', 'connector', 'vbus', 'cc1', 'cc2'],
    ports: [port('cable', 'Cable', 'mechanical', 'bidirectional', 'External plug interface'), port('vbus', 'VBUS', 'power', 'bidirectional', 'USB power path'), port('usb-data', 'USB data', 'data', 'bidirectional', 'D+/D− or high-speed pairs'), port('cc', 'CC', 'control', 'bidirectional', 'Role and current configuration'), port('shield', 'Shield', 'ground', 'bidirectional', 'Shield or chassis connection')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'motor-actuator', label: 'Motor / Actuator', shortLabel: 'ACT', description: 'Electrical-to-mechanical motion, force, vibration, or airflow.',
    color: '#c2410c', accent: '#ffedd5', knowledgeId: 'motor-actuator', keywords: ['motor', 'haptic', 'actuator', 'vibration', 'fan', 'solenoid'],
    ports: [port('power', 'Drive power', 'power', 'input', 'Actuator power path'), port('control', 'Drive control', 'control', 'input', 'PWM, phase, or driver control'), port('feedback', 'Feedback', 'data', 'output', 'Optional position, current, or fault feedback'), port('motion', 'Motion', 'mechanical', 'output', 'Mechanical output')],
    representations: representationSet({ schematic: true, footprint: false, physical: true }),
  },
  {
    id: 'display', label: 'Display', shortLabel: 'DSP', description: 'Visual information output with electrical, optical, and mechanical interfaces.',
    color: '#4338ca', accent: '#e0e7ff', knowledgeId: 'display', keywords: ['display', 'oled', 'lcd', 'screen', 'panel'],
    ports: [port('power', 'Power', 'power', 'input', 'Panel and optional backlight power'), port('data', 'Display data', 'data', 'input', 'SPI, I2C, parallel, MIPI, or other interface'), port('control', 'Control', 'control', 'input', 'Reset, chip select, command, and backlight control'), port('visual', 'Visual output', 'mechanical', 'output', 'Visible active-area output')],
    representations: representationSet({ schematic: true, footprint: false, physical: true }),
  },
  {
    id: 'debug-connector', label: 'Programming / Debug', shortLabel: 'DBG', description: 'Programming, recovery, debug, logging, or factory-test access.',
    color: '#475569', accent: '#e2e8f0', knowledgeId: 'debug-connector', keywords: ['debug', 'swd', 'jtag', 'uart header', 'programming', 'test pads', 'pogo'],
    ports: [port('target-power', 'Target voltage', 'power', 'input', 'Target voltage reference'), port('ground', 'Ground', 'ground', 'bidirectional', 'Common reference'), port('debug-data', 'Debug data', 'data', 'bidirectional', 'SWDIO, JTAG data, UART, or protocol data'), port('debug-clock', 'Clock', 'control', 'input', 'Debug/programming clock'), port('reset', 'Reset', 'control', 'bidirectional', 'Optional target reset')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'protection-device', label: 'Protection Device', shortLabel: 'PROT', description: 'Limits damage from abnormal voltage, current, polarity, or transients.',
    color: '#b91c1c', accent: '#fee2e2', knowledgeId: 'protection-device', keywords: ['protection', 'esd', 'tvs', 'fuse', 'reverse polarity', 'surge', 'flyback'],
    ports: [port('exposed', 'Exposed side', 'power', 'bidirectional', 'Connector or fault-facing node'), port('protected', 'Protected side', 'power', 'bidirectional', 'Protected circuit node'), port('return', 'Return', 'ground', 'output', 'Transient or fault-current return')],
    representations: representationSet({ schematic: true, footprint: true, physical: true }),
  },
  {
    id: 'enclosure', label: 'Enclosure', shortLabel: 'ENC', description: 'Physical shell, openings, mounting, protection, and product touch surfaces.',
    color: '#57534e', accent: '#e7e5e4', keywords: ['enclosure', 'casing', 'shell', 'housing', 'mechanical', 'outer body'],
    ports: [port('assembly', 'Assembly', 'mechanical', 'bidirectional', 'Internal mounting and mating interfaces'), port('environment', 'Environment', 'mechanical', 'bidirectional', 'External physical environment'), port('thermal', 'Thermal path', 'thermal', 'bidirectional', 'Heat flow through or around the enclosure'), port('user', 'User interface', 'mechanical', 'bidirectional', 'Buttons, displays, openings, and touch surfaces')],
    representations: representationSet({ schematic: false, footprint: false, physical: true }),
  },
  {
    id: 'pcb-assembly', label: 'PCB Assembly', shortLabel: 'PCBA', description: 'Board, stackup, footprints, copper, and placed component assembly.',
    color: '#047857', accent: '#d1fae5', keywords: ['pcb', 'board', 'pcba', 'circuit board', 'assembly'],
    ports: [port('power', 'Power', 'power', 'bidirectional', 'Board power interfaces'), port('data', 'Data', 'data', 'bidirectional', 'Board communication interfaces'), port('mechanical', 'Mounting', 'mechanical', 'bidirectional', 'Board mounting and connector geometry'), port('thermal', 'Thermal', 'thermal', 'bidirectional', 'Board and component heat paths')],
    representations: representationSet({ schematic: false, footprint: false, physical: true, render3d: true }),
  },
  {
    id: 'firmware-state', label: 'Firmware State', shortLabel: 'STATE', description: 'A software mode with events, transitions, and actions.',
    color: '#6d28d9', accent: '#ede9fe', keywords: ['firmware', 'state', 'boot', 'idle', 'sleep', 'handler', 'driver', 'watchdog'],
    ports: [port('events', 'Events', 'control', 'input', 'Events that enter or affect the state'), port('actions', 'Actions', 'control', 'output', 'Commands and effects produced by the state'), port('dependencies', 'Dependencies', 'dependency', 'bidirectional', 'Required modules, hardware, and services')],
    representations: representationSet({ schematic: false, footprint: false, physical: false, pictorial: true }),
  },
  {
    id: 'software-service', label: 'Software Service', shortLabel: 'SVC', description: 'Application, cloud, host, or external software capability.',
    color: '#0369a1', accent: '#e0f2fe', keywords: ['software', 'app', 'cloud', 'api', 'service', 'host'],
    ports: [port('api', 'API', 'data', 'bidirectional', 'Structured software interface'), port('events', 'Events', 'control', 'bidirectional', 'Commands, notifications, and lifecycle events'), port('dependency', 'Dependency', 'dependency', 'bidirectional', 'Required or provided software dependency')],
    representations: representationSet({ schematic: false, footprint: false, physical: false }),
  },
  {
    id: 'validation', label: 'Validation Activity', shortLabel: 'TEST', description: 'Test, inspection, evidence, or acceptance activity.',
    color: '#be123c', accent: '#ffe4e6', keywords: ['test', 'testing', 'validation', 'verification', 'qa', 'review'],
    ports: [port('subject', 'Subject', 'dependency', 'input', 'Design, requirement, build, or device under test'), port('evidence', 'Evidence', 'data', 'output', 'Measurements, observations, logs, or reports'), port('decision', 'Result', 'control', 'output', 'Pass, fail, blocker, or review outcome')],
    representations: representationSet({ schematic: false, footprint: false, physical: false }),
  },
  {
    id: 'product-system', label: 'Product / System', shortLabel: 'SYS', description: 'Top-level product or subsystem boundary and intent.',
    color: '#0f172a', accent: '#e2e8f0', keywords: ['product', 'system', 'container', 'subsystem', 'architecture'],
    ports: [port('interfaces', 'Interfaces', 'data', 'bidirectional', 'External and internal product interfaces'), port('power', 'Power', 'power', 'input', 'Product power boundary'), port('mechanical', 'Physical', 'mechanical', 'bidirectional', 'Physical boundary and environment'), port('requirements', 'Requirements', 'dependency', 'input', 'Intent, constraints, and acceptance criteria')],
    representations: representationSet({ schematic: false, footprint: false, physical: true }),
  },
  {
    id: 'generic-function', label: 'Functional Block', shortLabel: 'FUNC', description: 'A semantic product function without a qualified device representation.',
    color: '#334155', accent: '#f1f5f9', keywords: [],
    ports: [port('inputs', 'Inputs', 'data', 'input', 'Information, energy, or dependencies consumed by the function'), port('outputs', 'Outputs', 'data', 'output', 'Information, energy, or effects produced by the function')],
    representations: representationSet({ schematic: false, footprint: false, physical: false }),
  },
] as const;

const familyById = new Map<VisualFamilyId, VisualFamilyDefinition>(
  visualFamilyRegistry.map((family) => [family.id, family]),
);

export function getVisualFamily(id: VisualFamilyId): VisualFamilyDefinition {
  return familyById.get(id) ?? familyById.get('generic-function')!;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+.#-]+/g, ' ').trim();
}

export function resolveVisualFamilyId(node: VisualNodeLike): VisualFamilyId {
  const text = normalize([
    node.name,
    node.category,
    node.description,
    node.candidateComponents,
    ...(node.tags ?? []),
  ].filter(Boolean).join(' '));

  const exactPriority: Array<[VisualFamilyId, string[]]> = [
    ['usb-c', ['usb-c', 'usb c', 'type-c', 'type c']],
    ['debug-connector', ['debug', 'swd', 'jtag', 'programming', 'uart header', 'test pad', 'pogo']],
    ['voltage-regulator', ['regulator', 'ldo', 'buck converter', 'boost converter', 'dc-dc']],
    ['protection-device', ['protection', 'esd', 'tvs', 'fuse', 'flyback', 'reverse polarity']],
    ['microcontroller', ['microcontroller', 'mcu', 'esp32', 'nrf52', 'nrf', 'stm32', 'controller', 'processor']],
    ['motor-actuator', ['motor', 'haptic', 'actuator', 'vibration', 'solenoid', 'fan']],
    ['push-button', ['push button', 'pushbutton', 'button', 'momentary switch', 'touch surface']],
    ['display', ['display', 'oled', 'lcd', 'screen', 'panel']],
    ['battery', ['battery', 'lipo', 'li-ion', 'cell', 'energy source']],
    ['sensor', ['sensor', 'imu', 'temperature', 'humidity', 'pressure', 'microphone', 'motion']],
    ['resistor', ['resistor', 'pull-up', 'pull down', 'ohm']],
    ['capacitor', ['capacitor', 'decoupling', 'bypass', 'bulk cap']],
    ['led', ['rgb led', 'led indicator', 'light indicator', 'status light']],
    ['pcb-assembly', ['pcb assembly', 'pcba', 'circuit board', 'board assembly', 'pcb zone']],
    ['enclosure', ['enclosure', 'casing', 'housing', 'outer shell', 'outer body', 'mechanical shell']],
    ['validation', ['validation', 'verification', 'testing', 'test activity', 'factory qa']],
    ['software-service', ['software', 'cloud', 'api', 'service', 'mobile app', 'host app']],
    ['firmware-state', ['firmware', 'boot state', 'idle state', 'sleep state', 'handler', 'watchdog', 'driver']],
    ['product-system', ['product container', 'hardware product', 'system boundary', 'subsystem']],
  ];

  for (const [familyId, terms] of exactPriority) {
    if (terms.some((term) => text.includes(term))) return familyId;
  }

  const category = normalize(node.category ?? '');
  if (category.includes('firmware')) return 'firmware-state';
  if (category.includes('mechanical')) return 'enclosure';
  if (category.includes('testing')) return 'validation';
  if (category.includes('software')) return 'software-service';
  if (category.includes('product')) return 'product-system';
  return 'generic-function';
}

export function resolveVisualFamily(node: VisualNodeLike): VisualFamilyDefinition {
  return getVisualFamily(resolveVisualFamilyId(node));
}

export const portKindStyles: Record<ArchitecturePortKind, { color: string; label: string; dash?: string }> = {
  power: { color: '#dc2626', label: 'Power' },
  ground: { color: '#475569', label: 'Ground' },
  data: { color: '#2563eb', label: 'Data' },
  control: { color: '#7c3aed', label: 'Control' },
  analog: { color: '#ea580c', label: 'Analog' },
  wireless: { color: '#0891b2', label: 'Wireless', dash: '5 4' },
  mechanical: { color: '#78716c', label: 'Mechanical', dash: '8 4' },
  thermal: { color: '#d97706', label: 'Thermal', dash: '2 4' },
  dependency: { color: '#64748b', label: 'Dependency', dash: '3 3' },
};

export function portHandleId(port: ArchitecturePort): string {
  return `visual-port:${port.kind}:${port.id}`;
}

export function portKindFromHandleId(handleId?: string | null): ArchitecturePortKind | undefined {
  if (!handleId?.startsWith('visual-port:')) return undefined;
  const kind = handleId.split(':')[1] as ArchitecturePortKind;
  return kind in portKindStyles ? kind : undefined;
}

export function representationStatusCounts(family: VisualFamilyDefinition): Record<RepresentationStatus, number> {
  return REPRESENTATION_KINDS.reduce<Record<RepresentationStatus, number>>(
    (counts, kind) => {
      counts[family.representations[kind].status] += 1;
      return counts;
    },
    { available: 0, provisional: 0, unresolved: 0, unavailable: 0 },
  );
}
