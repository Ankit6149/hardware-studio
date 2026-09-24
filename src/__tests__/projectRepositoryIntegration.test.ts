import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('project repository integration boundary', () => {
  it('keeps active project persistence behind the repository instead of localStorage', () => {
    const store = source('../store/projectStore.ts');
    const shell = source('../components/AppShell.tsx');
    const root = source('../components/reliability/StudioRoot.tsx');

    expect(store).toContain('createProjectRepository');
    expect(store).toContain('projectRepository.saveProject');
    expect(store).toContain('hydrateProjectRepository');
    expect(store).not.toContain('window.localStorage.setItem');
    expect(store).not.toContain('getSavedProjects');
    expect(store).not.toContain('saveProjectsToStorage');
    expect(store).not.toContain('loadProjectFromLocalStorage');

    expect(shell).toContain('await hydrateProjectRepository()');
    expect(root).not.toContain('prepareStorageReliability');
  });

  it('keeps legacy localStorage access isolated to the migration adapter', () => {
    const repository = source('../lib/repository/projectRepository.ts');

    expect(repository).toContain('migrateLegacyLocalStorageProjects');
    expect(repository).toContain('LEGACY_PROJECTS_KEY');
    expect(repository).toContain('LEGACY_SINGLE_PROJECT_KEY');
    expect(repository).not.toContain('localStorage.setItem');
    expect(repository).not.toContain('removeItem');
  });
});
