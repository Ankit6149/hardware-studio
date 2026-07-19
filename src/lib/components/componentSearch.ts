// componentSearch.ts — Part of Phase 3 Real Component Library
import { defaultComponents, ElectronicComponentDefinition } from './componentLibrary';

export function searchComponents(
  query: string,
  category?: string,
  packageName?: string
): ElectronicComponentDefinition[] {
  let list = defaultComponents;

  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }

  if (packageName && packageName !== 'All') {
    list = list.filter(c => c.packageName === packageName);
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.manufacturer && c.manufacturer.toLowerCase().includes(q)) ||
        (c.partNumber && c.partNumber.toLowerCase().includes(q)) ||
        c.packageName.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return list;
}
