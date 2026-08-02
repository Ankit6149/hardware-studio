'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ElectronicComponentDefinition } from '../../lib/components/componentLibrary';
import { resolveKnowledgeIdForComponent } from '../../lib/knowledge/deviceKnowledge';
import { KnowledgeDrawer } from './KnowledgeDrawer';

interface KnowledgeContextValue {
  isOpen: boolean;
  openKnowledge: (entryId?: string) => void;
  openKnowledgeForComponent: (
    component: Pick<ElectronicComponentDefinition, 'libraryId' | 'category' | 'name' | 'tags'>,
  ) => void;
  closeKnowledge: () => void;
}

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

export const KnowledgeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestedEntryId, setRequestedEntryId] = useState<string | undefined>();

  const openKnowledge = useCallback((entryId?: string) => {
    setRequestedEntryId(entryId);
    setIsOpen(true);
  }, []);

  const openKnowledgeForComponent = useCallback(
    (component: Pick<ElectronicComponentDefinition, 'libraryId' | 'category' | 'name' | 'tags'>) => {
      setRequestedEntryId(resolveKnowledgeIdForComponent(component));
      setIsOpen(true);
    },
    [],
  );

  const closeKnowledge = useCallback(() => setIsOpen(false), []);

  const value = useMemo<KnowledgeContextValue>(
    () => ({ isOpen, openKnowledge, openKnowledgeForComponent, closeKnowledge }),
    [closeKnowledge, isOpen, openKnowledge, openKnowledgeForComponent],
  );

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
      <KnowledgeDrawer
        key={`${isOpen ? 'open' : 'closed'}:${requestedEntryId ?? 'index'}`}
        isOpen={isOpen}
        requestedEntryId={requestedEntryId}
        onOpenChange={setIsOpen}
      />
    </KnowledgeContext.Provider>
  );
};

export function useKnowledge(): KnowledgeContextValue {
  const context = useContext(KnowledgeContext);
  if (!context) throw new Error('useKnowledge must be used within KnowledgeProvider');
  return context;
}
