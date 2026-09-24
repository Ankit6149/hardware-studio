import { create } from 'zustand';
import {
  StorageHealth,
  classifyStorageError,
  idleStorageHealth,
  memoryFallbackStorageHealth,
  savedStorageHealth,
  savingStorageHealth,
} from '../lib/reliability';

interface StorageHealthState {
  health: StorageHealth;
  setHealth: (health: StorageHealth) => void;
}

export const useStorageHealthStore = create<StorageHealthState>((set) => ({
  health: idleStorageHealth(),
  setHealth: (health) => set({ health }),
}));

function setHealth(health: StorageHealth): void {
  useStorageHealthStore.getState().setHealth(health);
}

export function markRepositorySaving(): void {
  setHealth(savingStorageHealth(useStorageHealthStore.getState().health));
}

export function markRepositorySaved(lastSavedAt?: string): void {
  setHealth(savedStorageHealth(lastSavedAt));
}

export function markRepositoryFailure(error: unknown): void {
  const health = classifyStorageError(error);
  setHealth(
    health.status === 'failed' || health.status === 'unavailable'
      ? health
      : memoryFallbackStorageHealth(health.message),
  );
}
