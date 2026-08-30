import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('clean URL navigation baseline', () => {
  it('keeps landing section controls from mutating the URL with hash fragments', () => {
    const landing = source('../app/page.tsx');
    const sectionLink = source('../components/landing/LandingSectionLink.tsx');

    expect(landing).not.toContain('href="#system"');
    expect(landing).not.toContain('href="#workflow"');
    expect(landing).not.toContain('href="#truth"');
    expect(landing).toContain('targetId="system"');
    expect(landing).toContain('targetId="workflow"');
    expect(landing).toContain('targetId="truth"');
    expect(sectionLink).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' })");
  });

  it('serves Studio from an optional catch-all page so nested workbench URLs survive refresh', () => {
    const routePage = source('../app/studio/[[...path]]/page.tsx');
    const shell = source('../components/AppShell.tsx');

    expect(routePage).toContain("import('../../../components/reliability/StudioRoot')");
    expect(shell).toContain('getStudioViewForPath(window.location.pathname)');
    expect(shell).toContain("window.addEventListener('popstate', handlePopState)");
    expect(shell).toContain('window.history.pushState');
    expect(shell).toContain('window.history.replaceState');
  });
});
