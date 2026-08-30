import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('brand-aligned visual system baseline', () => {
  it('keeps landing and studio aligned to the black and warm-ivory sharp-surface identity', () => {
    const css = source('../app/globals.css');
    const button = source('../ui/Button.tsx');
    const topBar = source('../components/TopBar.tsx');
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const landing = source('../app/page.tsx');

    expect(css).toContain('--background: #f3f0e8');
    expect(css).toContain('--foreground: #11110f');
    expect(css).toContain('--color-indigo-500: #806c4f');
    expect(css).toContain('--radius-md: 0rem');
    expect(css).toContain('--radius-2xl: 0rem');
    expect(css).toContain('.hs-app span.rounded-full[class*="px-"]');
    expect(css).toContain('border-radius: 0 !important');
    expect(css).toContain('[class~="text-[7px]"]');

    expect(button).toContain("primary: 'border border-slate-950 bg-slate-950 text-white");
    expect(button).not.toContain('font-mono font-medium');
    expect(button).not.toContain('active:scale-95');

    expect(topBar).toContain('bg-[#f8f5ee]');
    expect(navigation).toContain('bg-[#f4f0e7]');
    expect(navigation).toContain('bg-[#f7f3eb]');
    expect(navigation).toContain('bg-slate-950 text-white');

    expect(landing).toContain('fixed inset-x-0 top-0 z-50');
    expect(landing).toContain('One physical product.');
    expect(landing).toContain('Every discipline connected.');
    expect(landing).toContain('<TechnicalBoard />');
    expect(landing).toContain('<RepresentationPanel />');
    expect(landing).toContain('Technical PCB assembly illustration');
    expect(landing).not.toContain('Build the hardware.');

    expect(topBar).not.toContain('text-indigo-');
    expect(navigation).not.toContain('ring-indigo-');
    expect(navigation).not.toContain('text-indigo-');
  });
});
