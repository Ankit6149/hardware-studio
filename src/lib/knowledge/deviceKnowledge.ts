import type { ElectronicComponentDefinition } from '../components/componentLibrary';

export const DEVICE_KNOWLEDGE_CATEGORIES = [
  'Controllers',
  'Power',
  'Inputs',
  'Outputs',
  'Sensors',
  'Interfaces',
  'Passives',
  'Debug',
] as const;

export type DeviceKnowledgeCategory = (typeof DEVICE_KNOWLEDGE_CATEGORIES)[number];
export type KnowledgeQualification = 'generic-reviewed' | 'conceptual';

export interface KnowledgeWorkbenchLink {
  viewId: string;
  label: string;
  action: string;
}

export interface KnowledgePrerequisites {
  electrical: string[];
  mechanical: string[];
  firmware: string[];
}

export interface KnowledgeConnectionGuide {
  portsAndPins: string[];
  protocols: string[];
  operatingEnvelope: string[];
  orientationAndPolarity: string[];
  steps: string[];
}

export interface KnowledgeProvenance {
  qualification: KnowledgeQualification;
  reviewedOn: string;
  summary: string;
  references: Array<{
    label: string;
    url: string;
  }>;
}

export interface DeviceKnowledgeEntry {
  id: string;
  category: DeviceKnowledgeCategory;
  name: string;
  commonNames: string[];
  aliases: string[];
  keywords: string[];
  summary: string;
  useCases: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  prerequisites: KnowledgePrerequisites;
  connection: KnowledgeConnectionGuide;
  commonMistakes: string[];
  safetyNotes: string[];
  validationSuggestions: string[];
  relatedIds: string[];
  alternatives: string[];
  workbenches: KnowledgeWorkbenchLink[];
  nextActions: string[];
  provenance: KnowledgeProvenance;
}

export interface KnowledgeSearchOptions {
  query?: string;
  category?: DeviceKnowledgeCategory | 'All';
}

function flattenEntry(entry: DeviceKnowledgeEntry): string[] {
  return [
    entry.id,
    entry.category,
    entry.name,
    ...entry.commonNames,
    ...entry.aliases,
    ...entry.keywords,
    entry.summary,
    ...entry.useCases,
    ...entry.whenToUse,
    ...entry.whenNotToUse,
    ...entry.prerequisites.electrical,
    ...entry.prerequisites.mechanical,
    ...entry.prerequisites.firmware,
    ...entry.connection.portsAndPins,
    ...entry.connection.protocols,
    ...entry.connection.operatingEnvelope,
    ...entry.connection.orientationAndPolarity,
    ...entry.connection.steps,
    ...entry.commonMistakes,
    ...entry.safetyNotes,
    ...entry.validationSuggestions,
    ...entry.alternatives,
    ...entry.workbenches.flatMap((workbench) => [workbench.label, workbench.action, workbench.viewId]),
    ...entry.nextActions,
  ];
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+.#-]+/g, ' ').trim();
}

export function searchKnowledgeEntries(
  entries: readonly DeviceKnowledgeEntry[],
  options: KnowledgeSearchOptions = {},
): DeviceKnowledgeEntry[] {
  const category = options.category ?? 'All';
  const queryTokens = normalize(options.query ?? '').split(/\s+/).filter(Boolean);

  return entries
    .filter((entry) => category === 'All' || entry.category === category)
    .map((entry) => {
      const searchText = normalize(flattenEntry(entry).join(' '));
      const exactName = normalize(entry.name);
      const aliases = entry.aliases.map(normalize);
      const matches = queryTokens.every((token) => searchText.includes(token));
      const score = queryTokens.reduce((total, token) => {
        if (exactName.includes(token)) return total + 6;
        if (aliases.some((alias) => alias.includes(token))) return total + 4;
        if (normalize(entry.category).includes(token)) return total + 3;
        if (entry.connection.protocols.some((protocol) => normalize(protocol).includes(token))) return total + 3;
        return searchText.includes(token) ? total + 1 : total;
      }, 0);
      return { entry, matches, score };
    })
    .filter(({ matches }) => queryTokens.length === 0 || matches)
    .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name))
    .map(({ entry }) => entry);
}

const explicitComponentMappings: Record<string, string> = {
  'mcu-generic': 'microcontroller',
  'mcu-esp32c3': 'microcontroller',
  'mcu-nrf52840': 'microcontroller',
  'ldo-ap2112': 'voltage-regulator',
  'usb-c-connector': 'usb-c-connector',
  'usb-c-receptacle': 'usb-c-connector',
  'debug-swd': 'debug-connector',
};

const categoryMappings: Partial<Record<ElectronicComponentDefinition['category'], string>> = {
  MCU: 'microcontroller',
  Processor: 'microcontroller',
  Power: 'voltage-regulator',
  Regulator: 'voltage-regulator',
  Charger: 'battery',
  Protection: 'protection-device',
  Resistor: 'resistor',
  Capacitor: 'capacitor',
  Diode: 'protection-device',
  LED: 'led',
  Sensor: 'environmental-sensor',
  Connector: 'usb-c-connector',
  Button: 'push-button',
  Touch: 'push-button',
  Motor: 'motor-actuator',
  Haptic: 'motor-actuator',
  Debug: 'debug-connector',
  Battery: 'battery',
};

export function resolveKnowledgeIdForComponent(
  component: Pick<ElectronicComponentDefinition, 'libraryId' | 'category' | 'name' | 'tags'>,
): string | undefined {
  const explicit = explicitComponentMappings[component.libraryId];
  if (explicit) return explicit;

  const normalizedText = normalize([component.name, ...component.tags].join(' '));
  if (normalizedText.includes('i2c') || normalizedText.includes('i²c')) return 'i2c-sensor';
  if (normalizedText.includes('display') || normalizedText.includes('oled') || normalizedText.includes('lcd')) return 'display';
  if (normalizedText.includes('environment') || normalizedText.includes('temperature') || normalizedText.includes('humidity')) {
    return 'environmental-sensor';
  }
  if (normalizedText.includes('usb c') || normalizedText.includes('type c')) return 'usb-c-connector';
  if (normalizedText.includes('swd') || normalizedText.includes('jtag') || normalizedText.includes('programming')) {
    return 'debug-connector';
  }

  return categoryMappings[component.category];
}

export function knowledgeEntryCompleteness(entry: DeviceKnowledgeEntry): string[] {
  const missing: string[] = [];
  const requiredCollections: Array<[string, readonly unknown[]]> = [
    ['commonNames', entry.commonNames],
    ['keywords', entry.keywords],
    ['useCases', entry.useCases],
    ['whenToUse', entry.whenToUse],
    ['whenNotToUse', entry.whenNotToUse],
    ['prerequisites.electrical', entry.prerequisites.electrical],
    ['prerequisites.mechanical', entry.prerequisites.mechanical],
    ['prerequisites.firmware', entry.prerequisites.firmware],
    ['connection.portsAndPins', entry.connection.portsAndPins],
    ['connection.steps', entry.connection.steps],
    ['commonMistakes', entry.commonMistakes],
    ['safetyNotes', entry.safetyNotes],
    ['validationSuggestions', entry.validationSuggestions],
    ['workbenches', entry.workbenches],
    ['nextActions', entry.nextActions],
    ['provenance.references', entry.provenance.references],
  ];

  if (!entry.id.trim()) missing.push('id');
  if (!entry.name.trim()) missing.push('name');
  if (!entry.summary.trim()) missing.push('summary');
  requiredCollections.forEach(([label, value]) => {
    if (value.length === 0) missing.push(label);
  });
  return missing;
}
