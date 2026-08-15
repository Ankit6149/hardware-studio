import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('brand-aligned visual system baseline', () => {
  it('keeps shared UI aligned to the black and warm-ivory Hardware Studio identity', () => {
    const css = source('../app/globals.css');
    const button = source('../ui/Button.tsx');
    const topBar = source('../components/TopBar.tsx');
    const sidebar = source('../components/Sidebar.tsx');
    const subnav = source('../components/ContextSubnav.tsx');
    const context = source('../components/studio/EngineeringContextBar.tsx');

    expect(css).toContain('--background: #f3f0e8');
    expect(css).toContain('--foreground: #11110f');
    expect(css).toContain('--color-indigo-500: #806c4f');
    expect(css).toContain('.hs-app span.rounded-full[class*="px-"]');
    expect(css).toContain('[class~="text-[7px]"]');

    expect(button).toContain("primary: 'border border-slate-950 bg-slate-950 text-white");
    expect(button).not.toContain('font-mono font-medium');
    expect(button).not.toContain('active:scale-95');

    expect(topBar).toContain('bg-[#f8f5ee]');
    expect(sidebar).toContain('bg-[#11110f]');
    expect(subnav).toContain('bg-[#f6f2e9]');
    expect(context).toContain('Evidence');

    expect(topBar).not.toContain('text-indigo-');
    expect(sidebar).not.toContain('ring-indigo-');
    expect(subnav).not.toContain('text-indigo-');
    expect(context).not.toContain('text-indigo-');
  });
});
