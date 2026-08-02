import { create } from 'zustand';
import {
  createPreferenceFromProfile,
  DEFAULT_WORKFLOW_PREFERENCE,
  inferProfileId,
  normalizeWorkflowPreference,
  toggleWorkflowDomain,
  type WorkflowDomainId,
  type WorkflowPreference,
  type WorkflowProfileId,
} from '../lib/workflowProfiles';

export const WORKFLOW_PREFERENCES_STORAGE_KEY = 'hardware-studio:workflow-preferences:v1';

interface WorkflowPreferencesState extends WorkflowPreference {
  hydrated: boolean;
  isSetupOpen: boolean;
  hydrate: () => void;
  openSetup: () => void;
  closeSetup: () => void;
  applyProfile: (profileId: WorkflowProfileId) => void;
  replaceDomains: (domainIds: readonly WorkflowDomainId[]) => void;
  toggleDomain: (domainId: WorkflowDomainId) => void;
  setShowAllDomains: (showAll: boolean) => void;
  completeSetup: () => void;
  resetPreferences: () => void;
}

function persist(preference: WorkflowPreference): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKFLOW_PREFERENCES_STORAGE_KEY, JSON.stringify(preference));
  } catch {
    // Workflow preferences are non-canonical UI state. The app remains usable in memory.
  }
}

function preferenceFromState(state: WorkflowPreferencesState): WorkflowPreference {
  return {
    version: 1,
    profileId: state.profileId,
    enabledDomains: [...state.enabledDomains],
    showAllDomains: state.showAllDomains,
    hasCompletedSetup: state.hasCompletedSetup,
  };
}

export const useWorkflowPreferencesStore = create<WorkflowPreferencesState>((set, get) => ({
  ...DEFAULT_WORKFLOW_PREFERENCE,
  enabledDomains: [...DEFAULT_WORKFLOW_PREFERENCE.enabledDomains],
  hydrated: false,
  isSetupOpen: false,

  hydrate: () => {
    if (get().hydrated) return;
    let preference = normalizeWorkflowPreference(DEFAULT_WORKFLOW_PREFERENCE);

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(WORKFLOW_PREFERENCES_STORAGE_KEY);
        if (raw) preference = normalizeWorkflowPreference(JSON.parse(raw));
      } catch {
        preference = normalizeWorkflowPreference(DEFAULT_WORKFLOW_PREFERENCE);
      }
    }

    set({
      ...preference,
      enabledDomains: [...preference.enabledDomains],
      hydrated: true,
      isSetupOpen: !preference.hasCompletedSetup,
    });
  },

  openSetup: () => set({ isSetupOpen: true }),
  closeSetup: () => set({ isSetupOpen: false }),

  applyProfile: (profileId) => {
    const current = get();
    const preference = createPreferenceFromProfile(profileId, current);
    set({ ...preference, enabledDomains: [...preference.enabledDomains] });
    persist(preference);
  },

  replaceDomains: (domainIds) => {
    const normalized = normalizeWorkflowPreference({
      ...preferenceFromState(get()),
      enabledDomains: [...domainIds],
      profileId: inferProfileId(domainIds),
    });
    set({ ...normalized, enabledDomains: [...normalized.enabledDomains] });
    persist(normalized);
  },

  toggleDomain: (domainId) => {
    const current = get();
    const enabledDomains = toggleWorkflowDomain(current.enabledDomains, domainId);
    const preference: WorkflowPreference = {
      ...preferenceFromState(current),
      profileId: inferProfileId(enabledDomains),
      enabledDomains,
    };
    set({ ...preference, enabledDomains: [...enabledDomains] });
    persist(preference);
  },

  setShowAllDomains: (showAllDomains) => {
    const preference = { ...preferenceFromState(get()), showAllDomains };
    set({ showAllDomains });
    persist(preference);
  },

  completeSetup: () => {
    const preference = { ...preferenceFromState(get()), hasCompletedSetup: true };
    set({ hasCompletedSetup: true, isSetupOpen: false });
    persist(preference);
  },

  resetPreferences: () => {
    const preference = normalizeWorkflowPreference(DEFAULT_WORKFLOW_PREFERENCE);
    set({ ...preference, enabledDomains: [...preference.enabledDomains], isSetupOpen: true });
    persist(preference);
  },
}));
