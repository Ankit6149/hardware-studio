'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Box, CheckCircle2, Link2, Ruler, Shapes } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useProductDesignStore } from '../../store/productDesignStore';
import type { ProductDesignConceptPart } from '../../lib/product-design/types';
import { useFeedback } from '../feedback/FeedbackProvider';

export const ProductDesignDecisionBar: React.FC = () => {
  const project = useProjectStore();
  const document = useProductDesignStore((state) => state.document);
  const selectedObjectIds = useProductDesignStore((state) => state.selectedObjectIds);
  const missingAssetIds = useProductDesignStore((state) => state.missingAssetIds);
  const setActiveTool = useProductDesignStore((state) => state.setActiveTool);
  const createConceptPartFromSelection = useProductDesignStore((state) => state.createConceptPartFromSelection);
  const updateObjectById = useProductDesignStore((state) => state.updateObjectById);
  const { notify } = useFeedback();

  const requirements = project.requirements || [];
  const objects = document?.objects || [];
  const conceptParts = useMemo(
    () => objects.filter((object): object is ProductDesignConceptPart => object.type === 'concept-part'),
    [objects],
  );
  const dimensions = objects.filter((object) => object.type === 'dimension');
  const selectedConcept = conceptParts.find((part) => selectedObjectIds.includes(part.id));
  const linkTarget = selectedConcept || (conceptParts.length === 1 ? conceptParts[0] : undefined);
  const linkedRequirementIds = new Set(conceptParts.flatMap((part) => part.linkedRequirementIds || []));
  const [requirementId, setRequirementId] = useState('');

  useEffect(() => {
    if (requirements.some((requirement) => requirement.id === requirementId)) return;
    setRequirementId(requirements[0]?.id || '');
  }, [requirementId, requirements]);

  let title = 'Capture the first product-form decision';
  let detail = 'The canvas is empty. Start with the smallest amount of geometry needed to express form or layout intent.';
  let consequence = 'No downstream mechanical claim is created until design intent is made explicit.';
  let actionLabel = 'Start with a shape';
  let action: () => void = () => setActiveTool('rectangle');
  let tone = 'border-indigo-200 bg-indigo-50/70';

  if (objects.length > 0 && conceptParts.length === 0) {
    title = 'Decide what geometry represents one product part';
    detail = selectedObjectIds.length > 0
      ? `${selectedObjectIds.length} selected object${selectedObjectIds.length === 1 ? '' : 's'} can be promoted into one concept part without pretending it is solved CAD.`
      : 'Select the geometry that belongs to one physical concept part, then promote that selection.';
    consequence = 'A concept part becomes the handoff unit for requirement intent and later mechanical review.';
    actionLabel = selectedObjectIds.length > 0 ? 'Create concept part' : 'Select geometry';
    action = selectedObjectIds.length > 0
      ? () => { createConceptPartFromSelection(); }
      : () => setActiveTool('select');
  } else if (conceptParts.length > 0 && requirements.length === 0) {
    title = 'Define the product need this concept serves';
    detail = `${conceptParts.length} concept part${conceptParts.length === 1 ? '' : 's'} exist, but there is no canonical product requirement to justify them.`;
    consequence = 'The concept remains exploration until it is connected to a measurable need.';
    actionLabel = 'Define requirement';
    action = () => project.setActiveView('requirements');
  } else if (conceptParts.length > 0 && linkedRequirementIds.size === 0) {
    title = 'Link design intent to a requirement';
    detail = linkTarget
      ? `Link ${linkTarget.name} to the requirement it exists to satisfy.`
      : 'Select one concept part so its intent can be linked without guessing which part you mean.';
    consequence = 'The product-form decision gains traceability without turning concept geometry into manufacturing geometry.';
    actionLabel = linkTarget ? 'Link requirement' : 'Select one concept part';
    action = () => {
      if (!linkTarget || !requirementId) {
        setActiveTool('select');
        return;
      }
      const nextIds = Array.from(new Set([...(linkTarget.linkedRequirementIds || []), requirementId]));
      updateObjectById(linkTarget.id, { linkedRequirementIds: nextIds }, 'Link concept part to requirement');
      notify({
        tone: 'success',
        title: 'Concept linked to product intent',
        detail: `${linkTarget.name} now references the selected canonical requirement.`,
      });
    };
  } else if (conceptParts.length > 0 && dimensions.length === 0) {
    title = 'Record the dimension intent that constrains the concept';
    detail = 'Concept parts exist, but no dimension intent is recorded on this design document.';
    consequence = 'Mechanical work can see what size matters while still treating the value as intent, not solved CAD.';
    actionLabel = 'Add dimension intent';
    action = () => setActiveTool('dimension');
  } else if (missingAssetIds.length > 0) {
    title = 'Repair missing reference evidence before handoff';
    detail = `${missingAssetIds.length} reference asset${missingAssetIds.length === 1 ? ' is' : 's are'} unavailable in the local design repository.`;
    consequence = 'The concept can still be edited, but visual evidence is incomplete and should not be treated as review-ready.';
    actionLabel = 'Review references';
    action = () => setActiveTool('select');
    tone = 'border-amber-200 bg-amber-50/80';
  } else if (conceptParts.length > 0 && linkedRequirementIds.size > 0 && dimensions.length > 0) {
    title = 'Review product intent for mechanical handoff';
    detail = 'Concept parts, requirement traceability, and dimension intent are present. The next decision is whether the mechanical workspace can satisfy that intent with real geometry.';
    consequence = 'Moving forward does not convert canvas coordinates into physical geometry; Mechanical must establish its own authoritative dimensions and enclosure evidence.';
    actionLabel = 'Open Mechanical';
    action = () => project.setActiveView('mechanical-studio');
    tone = 'border-emerald-200 bg-emerald-50/70';
  }

  return (
    <section className={`shrink-0 border-b px-3 py-2.5 ${tone}`} aria-labelledby="product-design-decision-title">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Current decision</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
              <Shapes className="h-3 w-3" aria-hidden="true" /> Product intent only
            </span>
          </div>
          <h2 id="product-design-decision-title" className="mt-1 text-sm font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-0.5 text-[11px] leading-5 text-slate-600">{detail}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-600"><Box className="h-3.5 w-3.5" aria-hidden="true" /> {conceptParts.length} parts</span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-600"><Ruler className="h-3.5 w-3.5" aria-hidden="true" /> {dimensions.length} dimensions</span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-600"><Link2 className="h-3.5 w-3.5" aria-hidden="true" /> {linkedRequirementIds.size} linked needs</span>

          {conceptParts.length > 0 && linkedRequirementIds.size === 0 && requirements.length > 0 && linkTarget && (
            <label className="sr-only" htmlFor="product-design-requirement-link">Requirement to link</label>
          )}
          {conceptParts.length > 0 && linkedRequirementIds.size === 0 && requirements.length > 0 && linkTarget && (
            <select
              id="product-design-requirement-link"
              value={requirementId}
              onChange={(event) => setRequirementId(event.target.value)}
              className="min-h-10 max-w-52 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {requirements.map((requirement) => <option key={requirement.id} value={requirement.id}>{requirement.title}</option>)}
            </select>
          )}

          <button
            type="button"
            onClick={action}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[10px] font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {actionLabel}
            {title.startsWith('Review product intent') ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <p className="mt-2 border-t border-black/5 pt-2 text-[10px] leading-4 text-slate-500"><strong className="text-slate-700">Consequence:</strong> {consequence}</p>
    </section>
  );
};
