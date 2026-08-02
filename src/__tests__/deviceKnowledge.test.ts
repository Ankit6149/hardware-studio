import { describe, expect, it } from 'vitest';
import { defaultComponents } from '../lib/components/componentLibrary';
import {
  knowledgeEntryCompleteness,
  resolveKnowledgeIdForComponent,
  searchKnowledgeEntries,
} from '../lib/knowledge/deviceKnowledge';
import { starterDeviceKnowledge } from '../lib/knowledge/starterDeviceKnowledge';

describe('device knowledge library', () => {
  it('ships a complete starter library with unique IDs', () => {
    expect(starterDeviceKnowledge.length).toBeGreaterThanOrEqual(12);

    const ids = starterDeviceKnowledge.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of starterDeviceKnowledge) {
      expect(knowledgeEntryCompleteness(entry), entry.id).toEqual([]);
      expect(entry.provenance.qualification).toBe('generic-reviewed');
      expect(entry.provenance.summary.toLowerCase()).toMatch(/generic|guidance|selected|exact/);
    }
  });

  it('searches names, aliases, categories, protocols, and use cases', () => {
    expect(searchKnowledgeEntries(starterDeviceKnowledge, { query: 'pushbutton' })[0]?.id).toBe('push-button');
    expect(searchKnowledgeEntries(starterDeviceKnowledge, { query: 'I2C address pull-up' })[0]?.id).toBe('i2c-sensor');
    expect(searchKnowledgeEntries(starterDeviceKnowledge, { query: 'portable runtime' })[0]?.id).toBe('battery');

    const powerEntries = searchKnowledgeEntries(starterDeviceKnowledge, { category: 'Power' });
    expect(powerEntries.length).toBeGreaterThanOrEqual(3);
    expect(powerEntries.every((entry) => entry.category === 'Power')).toBe(true);
  });

  it('supports multi-token searches without returning partial matches', () => {
    const results = searchKnowledgeEntries(starterDeviceKnowledge, { query: 'usb reversible connector' });
    expect(results.map((entry) => entry.id)).toContain('usb-c-connector');

    expect(searchKnowledgeEntries(starterDeviceKnowledge, { query: 'usb thermocouple' })).toEqual([]);
  });

  it('maps production component definitions to relevant device-family guidance', () => {
    const esp32 = defaultComponents.find((component) => component.libraryId === 'mcu-esp32c3');
    const regulator = defaultComponents.find((component) => component.libraryId === 'ldo-ap2112');

    expect(esp32).toBeDefined();
    expect(regulator).toBeDefined();
    expect(resolveKnowledgeIdForComponent(esp32!)).toBe('microcontroller');
    expect(resolveKnowledgeIdForComponent(regulator!)).toBe('voltage-regulator');

    expect(resolveKnowledgeIdForComponent({
      libraryId: 'custom-environment-node',
      category: 'Sensor',
      name: 'Humidity I2C Sensor',
      tags: ['humidity', 'i2c'],
    })).toBe('i2c-sensor');
  });

  it('does not invent a contextual mapping for unrelated custom definitions', () => {
    expect(resolveKnowledgeIdForComponent({
      libraryId: 'custom-unknown',
      category: 'Custom',
      name: 'Experimental Module',
      tags: ['experimental'],
    })).toBeUndefined();
  });
});
