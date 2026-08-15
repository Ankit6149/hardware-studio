'use client';

import React from 'react';
import {
  ChevronDown,
  Copy,
  Globe,
  Link2,
  Tag,
  Trash2,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useFeedback } from './feedback/FeedbackProvider';

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100';
const textAreaClass = `${inputClass} resize-y font-sans leading-5`;

const Section: React.FC<React.PropsWithChildren<{ title: string; count?: number; open?: boolean }>> = ({
  title,
  count,
  open = false,
  children,
}) => (
  <details open={open} className="group border-b border-slate-200 last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
      <span>{title}{typeof count === 'number' ? ` · ${count}` : ''}</span>
      <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
    </summary>
    <div className="space-y-3 px-4 pb-4">{children}</div>
  </details>
);

const Field: React.FC<React.PropsWithChildren<{ label: string; htmlFor: string }>> = ({ label, htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="mb-1 block text-[10px] font-semibold text-slate-600">{label}</span>
    {children}
  </label>
);

export const PropertiesPanel: React.FC = () => {
  const {
    selectedNodeId,
    nodes,
    edges,
    updateNode,
    deleteNode,
    addNode,
    setSelectedNodeId,
  } = useProjectStore();
  const { confirm, notify } = useFeedback();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // The inspector is contextual UI, not permanent workspace chrome. When no
  // blueprint object is selected the canvas keeps the width instead of showing
  // an empty global rail.
  if (!selectedNode) return null;

  const data = selectedNode.data;
  const isBoundary = selectedNode.type === 'boundaryNode';
  const inbound = edges.filter((edge) => edge.target === selectedNodeId);
  const outbound = edges.filter((edge) => edge.source === selectedNodeId);
  const connectionCount = inbound.length + outbound.length;

  const handleFieldChange = (key: string, value: string | string[]) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  const handleDelete = async () => {
    const approved = await confirm({
      title: `Delete “${data.name}”?`,
      description: connectionCount > 0
        ? `This blueprint block has ${connectionCount} connected ${connectionCount === 1 ? 'edge' : 'edges'}. Deleting the block will also remove relationships owned by this node.`
        : 'This removes the blueprint block from the current project graph.',
      variant: 'destructive',
      confirmLabel: 'Delete block',
      cancelLabel: 'Keep block',
    });
    if (!approved) return;

    deleteNode(selectedNode.id);
    notify({
      tone: 'success',
      title: 'Blueprint block deleted',
      detail: `${data.name} was removed from the project graph.`,
    });
  };

  const handleDuplicate = () => {
    addNode({
      type: selectedNode.type,
      position: { x: selectedNode.position.x + 30, y: selectedNode.position.y + 30 },
      width: selectedNode.width,
      height: selectedNode.height,
      data: {
        ...data,
        name: `${data.name} (Copy)`,
      },
    });
    notify({
      tone: 'success',
      title: 'Blueprint block duplicated',
      detail: `${data.name} was copied as a separate project-graph node.`,
    });
  };

  const handleToggleView = (viewId: string) => {
    const currentViews = data.views || [];
    if (currentViews.includes(viewId) && currentViews.length <= 1) {
      notify({
        tone: 'warning',
        title: 'Keep at least one visible view',
        detail: 'A blueprint block cannot be hidden from every configured view.',
      });
      return;
    }

    handleFieldChange(
      'views',
      currentViews.includes(viewId)
        ? currentViews.filter((id) => id !== viewId)
        : [...currentViews, viewId],
    );
  };

  const viewDefinitions = [
    { id: 'master', label: 'Master' },
    { id: 'outer', label: 'Outer design' },
    { id: 'internal', label: 'Internal layout' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'firmware', label: 'Firmware' },
    { id: 'power', label: 'Power system' },
    { id: 'hardware-studio', label: 'Hardware Studio' },
  ];

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white" aria-label={`Properties for ${data.name}`}>
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">Selection</p>
          <h2 className="mt-0.5 truncate text-sm font-semibold text-slate-900">{data.name}</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">{data.category || selectedNode.type || 'Blueprint block'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleDuplicate}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label={`Duplicate ${data.name}`}
            title="Duplicate block"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label={`Delete ${data.name}`}
            title="Delete block"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="General" open>
          <Field label="Block name" htmlFor={`prop-name-${selectedNode.id}`}>
            <input
              id={`prop-name-${selectedNode.id}`}
              type="text"
              value={data.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Category" htmlFor={`prop-category-${selectedNode.id}`}>
              <select
                id={`prop-category-${selectedNode.id}`}
                value={data.category}
                onChange={(event) => handleFieldChange('category', event.target.value)}
                className={inputClass}
              >
                {['Product', 'Interaction', 'Electronics', 'Firmware', 'Mechanical', 'Power', 'Software', 'Testing', 'Manufacturing', 'Safety'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </Field>
            <Field label="Status" htmlFor={`prop-status-${selectedNode.id}`}>
              <select
                id={`prop-status-${selectedNode.id}`}
                value={data.status}
                onChange={(event) => handleFieldChange('status', event.target.value)}
                className={inputClass}
              >
                <option value="MVP">MVP now</option>
                <option value="Later">Later phase</option>
                <option value="Future">Future context</option>
                <option value="External">External</option>
                <option value="Risk">Critical risk</option>
                <option value="Complete">Complete</option>
              </select>
            </Field>
          </div>

          <Field label="Description" htmlFor={`prop-description-${selectedNode.id}`}>
            <textarea
              id={`prop-description-${selectedNode.id}`}
              rows={3}
              value={data.description || ''}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              className={textAreaClass}
              placeholder="What this block does…"
            />
          </Field>

          <Field label="Purpose / decision" htmlFor={`prop-purpose-${selectedNode.id}`}>
            <textarea
              id={`prop-purpose-${selectedNode.id}`}
              rows={2}
              value={data.purpose || ''}
              onChange={(event) => handleFieldChange('purpose', event.target.value)}
              className={textAreaClass}
              placeholder="Why this block exists…"
            />
          </Field>

          <Field label="Functional requirements" htmlFor={`prop-requirements-${selectedNode.id}`}>
            <textarea
              id={`prop-requirements-${selectedNode.id}`}
              rows={3}
              value={data.requirements || ''}
              onChange={(event) => handleFieldChange('requirements', event.target.value)}
              className={textAreaClass}
              placeholder="Known constraints and acceptance requirements…"
            />
          </Field>
        </Section>

        {!isBoundary && (
          <Section title="Engineering" open>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Candidate" htmlFor={`prop-candidate-${selectedNode.id}`}>
                <input
                  id={`prop-candidate-${selectedNode.id}`}
                  type="text"
                  value={data.candidateComponents || ''}
                  onChange={(event) => handleFieldChange('candidateComponents', event.target.value)}
                  className={inputClass}
                  placeholder="e.g. nRF52840"
                />
              </Field>
              <Field label="Priority" htmlFor={`prop-priority-${selectedNode.id}`}>
                <select
                  id={`prop-priority-${selectedNode.id}`}
                  value={data.priority || 'Medium'}
                  onChange={(event) => handleFieldChange('priority', event.target.value)}
                  className={inputClass}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </Field>
            </div>

            <Field label="Electrical" htmlFor={`prop-electrical-${selectedNode.id}`}>
              <textarea
                id={`prop-electrical-${selectedNode.id}`}
                rows={3}
                value={data.electricalNotes || ''}
                onChange={(event) => handleFieldChange('electricalNotes', event.target.value)}
                className={textAreaClass}
                placeholder="Pins, rails, decoupling, interfaces…"
              />
            </Field>
            <Field label="Mechanical" htmlFor={`prop-mechanical-${selectedNode.id}`}>
              <textarea
                id={`prop-mechanical-${selectedNode.id}`}
                rows={3}
                value={data.mechanicalNotes || ''}
                onChange={(event) => handleFieldChange('mechanicalNotes', event.target.value)}
                className={textAreaClass}
                placeholder="Clearance, height, shielding, enclosure…"
              />
            </Field>
            <Field label="Firmware" htmlFor={`prop-firmware-${selectedNode.id}`}>
              <textarea
                id={`prop-firmware-${selectedNode.id}`}
                rows={3}
                value={data.firmwareNotes || ''}
                onChange={(event) => handleFieldChange('firmwareNotes', event.target.value)}
                className={textAreaClass}
                placeholder="Drivers, states, timing, interrupts…"
              />
            </Field>

            <Field label="Datasheet URL" htmlFor={`prop-datasheet-${selectedNode.id}`}>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <input
                  id={`prop-datasheet-${selectedNode.id}`}
                  type="url"
                  value={data.datasheetUrl || ''}
                  onChange={(event) => handleFieldChange('datasheetUrl', event.target.value)}
                  className={`${inputClass} pl-8`}
                  placeholder="https://…"
                />
              </div>
            </Field>
            <Field label="Supplier URL" htmlFor={`prop-supplier-${selectedNode.id}`}>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <input
                  id={`prop-supplier-${selectedNode.id}`}
                  type="url"
                  value={data.supplierUrl || ''}
                  onChange={(event) => handleFieldChange('supplierUrl', event.target.value)}
                  className={`${inputClass} pl-8`}
                  placeholder="https://…"
                />
              </div>
            </Field>
            <Field label="Tags" htmlFor={`prop-tags-${selectedNode.id}`}>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <input
                  id={`prop-tags-${selectedNode.id}`}
                  type="text"
                  value={data.tags ? data.tags.join(', ') : ''}
                  onChange={(event) => handleFieldChange('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                  className={`${inputClass} pl-8`}
                  placeholder="sensor, i2c, high-power"
                />
              </div>
            </Field>
          </Section>
        )}

        <Section title="Risks & open decisions">
          <Field label="Potential failure modes" htmlFor={`prop-risks-${selectedNode.id}`}>
            <textarea
              id={`prop-risks-${selectedNode.id}`}
              rows={3}
              value={data.risks || ''}
              onChange={(event) => handleFieldChange('risks', event.target.value)}
              className={textAreaClass}
              placeholder="What could fail or invalidate this decision?"
            />
          </Field>
          <Field label="Mitigation" htmlFor={`prop-mitigation-${selectedNode.id}`}>
            <textarea
              id={`prop-mitigation-${selectedNode.id}`}
              rows={3}
              value={data.mitigation || ''}
              onChange={(event) => handleFieldChange('mitigation', event.target.value)}
              className={textAreaClass}
              placeholder="How will the risk be reduced or detected?"
            />
          </Field>
          <Field label="Open questions" htmlFor={`prop-questions-${selectedNode.id}`}>
            <textarea
              id={`prop-questions-${selectedNode.id}`}
              rows={3}
              value={data.openQuestions || ''}
              onChange={(event) => handleFieldChange('openQuestions', event.target.value)}
              className={textAreaClass}
              placeholder="What still needs a decision or evidence?"
            />
          </Field>
        </Section>

        <Section title="Visible in">
          <p className="text-[10px] leading-4 text-slate-500">These are representations of the same project node, not separate copies.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {viewDefinitions.map((view) => {
              const checked = (data.views || []).includes(view.id);
              return (
                <label key={view.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleView(view.id)}
                    className="rounded border-slate-300"
                  />
                  <span>{view.label}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section title="Connections" count={connectionCount}>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Link2 className="h-3 w-3 rotate-45" aria-hidden="true" /> Inbound · {inbound.length}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inbound.length === 0 && <span className="text-[10px] text-slate-400">No inbound relationships.</span>}
              {inbound.map((edge) => {
                const sourceNode = nodes.find((node) => node.id === edge.source);
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => setSelectedNodeId(edge.source)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                    title={edge.label ? `via ${edge.label}` : 'Direct relationship'}
                  >
                    {sourceNode?.data?.name || edge.source}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Link2 className="h-3 w-3 -rotate-45" aria-hidden="true" /> Outbound · {outbound.length}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outbound.length === 0 && <span className="text-[10px] text-slate-400">No outbound relationships.</span>}
              {outbound.map((edge) => {
                const targetNode = nodes.find((node) => node.id === edge.target);
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => setSelectedNodeId(edge.target)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                    title={edge.label ? `via ${edge.label}` : 'Direct relationship'}
                  >
                    {targetNode?.data?.name || edge.target}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>
      </div>
    </aside>
  );
};
