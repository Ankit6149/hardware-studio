import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useStudioContextStore } from '../store/studioContextStore';
import { BoardItem } from '../types';
import { Button } from '../ui/Button';
import { Box, Cpu, Edit2, Layers, Sparkles, Trash2 } from 'lucide-react';

type BoardTab = 'boards' | 'components';

export const BoardStudio: React.FC = () => {
  const {
    boards = [],
    boardComponents = [],
    addBoard,
    updateBoard,
    deleteBoard,
    deleteBoardComponent,
    generateBoardPlanFromProduct,
    generateBoardComponentsFromBOM,
    activeView,
    setActiveView,
  } = useProjectStore();

  const { activeBoardId, setActiveBoard } = useStudioContextStore();
  const activeTab: BoardTab = activeView === 'board-components' ? 'components' : 'boards';

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState('');
  const [boardType, setBoardType] = useState<BoardItem['boardType']>('Main PCB');
  const [substrate, setSubstrate] = useState<BoardItem['substrate']>('FR4');
  const [layerCount, setLayerCount] = useState(2);
  const [dimensionsMm, setDimensionsMm] = useState('');
  const [placement, setPlacement] = useState<BoardItem['placement']>('Internal');
  const [purpose, setPurpose] = useState('');

  const clearBoardForm = () => {
    setEditingBoardId(null);
    setBoardName('');
    setBoardType('Main PCB');
    setSubstrate('FR4');
    setLayerCount(2);
    setDimensionsMm('');
    setPlacement('Internal');
    setPurpose('');
  };

  const handleSaveBoard = (event: React.FormEvent) => {
    event.preventDefault();
    const name = boardName.trim();
    if (!name) return;

    const boardData = {
      name,
      boardType,
      substrate,
      layerCount,
      dimensionsMm: dimensionsMm.trim() || undefined,
      placement,
      purpose: purpose.trim() || undefined,
    };

    if (editingBoardId) {
      updateBoard(editingBoardId, boardData);
    } else {
      const board = addBoard(boardData);
      setActiveBoard(board.id);
    }

    clearBoardForm();
  };

  const handleStartEditBoard = (board: BoardItem) => {
    setEditingBoardId(board.id);
    setBoardName(board.name);
    setBoardType(board.boardType || 'Main PCB');
    setSubstrate(board.substrate || 'FR4');
    setLayerCount(board.layerCount || 2);
    setDimensionsMm(board.dimensionsMm || '');
    setPlacement(board.placement || 'Internal');
    setPurpose(board.purpose || '');
  };

  const openTab = (tab: BoardTab) => {
    setActiveView(tab === 'components' ? 'board-components' : 'board-studio');
  };

  const boardNameById = new Map(boards.map((board) => [board.id, board.name]));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-900">Boards & stackup</h1>
              <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                PCB setup
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Define board identity and physical setup before placement, routing, DRC, or manufacturing output.
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5" role="tablist" aria-label="Board Studio sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'boards'}
            onClick={() => openTab('boards')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'boards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Boards {boards.length}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'components'}
            onClick={() => openTab('components')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'components'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Placements {boardComponents.length}
          </button>
        </div>
      </header>

      {activeTab === 'boards' ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Box className="h-4 w-4 text-slate-500" />
                Physical boards
              </div>
              <button
                type="button"
                onClick={generateBoardPlanFromProduct}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Draft from architecture
              </button>
            </div>

            <div className="space-y-2 p-4">
              {boards.length === 0 ? (
                <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No board has been defined yet.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add the real board details you know. Unknown dimensions can stay unresolved.
                  </p>
                </div>
              ) : (
                boards.map((board) => {
                  const isSelected = board.id === activeBoardId;
                  const componentCount = boardComponents.filter((component) => component.boardId === board.id).length;

                  return (
                    <article
                      key={board.id}
                      className={`border transition ${
                        isSelected
                          ? 'border-slate-400 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveBoard(board.id)}
                        className="w-full px-4 py-3 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{board.name}</span>
                              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                {board.boardType}
                              </span>
                              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                                {board.substrate || 'Substrate unresolved'} · {board.layerCount || '—'} layers
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {board.purpose || 'Purpose not documented yet.'}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Active
                            </span>
                          )}
                        </div>

                        <dl className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-xs sm:grid-cols-3">
                          <div>
                            <dt className="text-slate-400">Dimensions</dt>
                            <dd className="mt-0.5 font-medium text-slate-700">
                              {board.dimensionsMm ? `${board.dimensionsMm} mm` : 'Unresolved'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-400">Placement</dt>
                            <dd className="mt-0.5 font-medium text-slate-700">{board.placement || 'Unresolved'}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-400">Components</dt>
                            <dd className="mt-0.5 font-medium text-slate-700">{componentCount}</dd>
                          </div>
                        </dl>
                      </button>

                      <div className="flex justify-end gap-1 border-t border-slate-200 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditBoard(board)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBoard(board.id)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <form onSubmit={handleSaveBoard} className="bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingBoardId ? 'Edit board' : 'Add board'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Only enter engineering data that is actually known.</p>
              </div>
              {editingBoardId && (
                <button type="button" onClick={clearBoardForm} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <label className="block">
                <span className="mb-1 block font-medium text-slate-700">Board name *</span>
                <input
                  type="text"
                  required
                  placeholder="Main controller PCB"
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block font-medium text-slate-700">Board type</span>
                  <select
                    value={boardType}
                    onChange={(event) => setBoardType(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                  >
                    <option value="Main PCB">Main PCB</option>
                    <option value="Rigid PCB">Rigid PCB</option>
                    <option value="Flex PCB">Flex PCB</option>
                    <option value="Rigid-Flex">Rigid-Flex</option>
                    <option value="Daughterboard">Daughterboard</option>
                    <option value="Sensor Board">Sensor Board</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block font-medium text-slate-700">Substrate</span>
                  <select
                    value={substrate}
                    onChange={(event) => setSubstrate(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                  >
                    <option value="FR4">FR4</option>
                    <option value="Polyimide Flex">Polyimide Flex</option>
                    <option value="Rigid-Flex">Rigid-Flex</option>
                    <option value="Ceramic">Ceramic</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block font-medium text-slate-700">Layers</span>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={layerCount}
                    onChange={(event) => setLayerCount(Number.parseInt(event.target.value, 10) || 2)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block font-medium text-slate-700">Dimensions (mm)</span>
                  <input
                    type="text"
                    placeholder="e.g. 68.6 × 53.4"
                    value={dimensionsMm}
                    onChange={(event) => setDimensionsMm(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block font-medium text-slate-700">Placement</span>
                <select
                  value={placement}
                  onChange={(event) => setPlacement(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                >
                  <option value="Internal">Internal</option>
                  <option value="Outer">Outer</option>
                  <option value="Dock">Dock</option>
                  <option value="Strap">Strap</option>
                  <option value="Ring Arc">Ring Arc</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-medium text-slate-700">Purpose</span>
                <textarea
                  rows={3}
                  placeholder="What this board is responsible for..."
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                />
              </label>

              <Button type="submit" variant="primary" className="w-full justify-center">
                {editingBoardId ? 'Save board' : 'Create board'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <section className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Cpu className="h-4 w-4 text-slate-500" />
                Board component placements
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Placement records are derived from project components; detailed geometry belongs in the PCB workbench.
              </p>
            </div>
            <button
              type="button"
              onClick={generateBoardComponentsFromBOM}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sync from BOM
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {boardComponents.length === 0 ? (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">No board component placements exist.</p>
                <p className="mt-1 text-xs text-slate-500">Sync project components only after a real board has been defined.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200">
                <div className="grid grid-cols-[5rem_minmax(10rem,1fr)_minmax(9rem,0.8fr)_8rem_8rem_3rem] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <span>Ref</span>
                  <span>Component</span>
                  <span>Board</span>
                  <span>Footprint</span>
                  <span>Status</span>
                  <span className="sr-only">Actions</span>
                </div>
                {boardComponents.map((component) => (
                  <div
                    key={component.id}
                    className="grid grid-cols-[5rem_minmax(10rem,1fr)_minmax(9rem,0.8fr)_8rem_8rem_3rem] items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-xs last:border-b-0"
                  >
                    <span className="font-mono font-semibold text-slate-800">{component.referenceDesignator}</span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800">{component.componentName}</div>
                      <div className="truncate text-[10px] text-slate-400">{component.partNumber || component.value || 'Part details unresolved'}</div>
                    </div>
                    <span className="truncate text-slate-600">{boardNameById.get(component.boardId) || 'Board unresolved'}</span>
                    <span className="truncate font-mono text-[11px] text-slate-600">{component.footprint || 'Unresolved'}</span>
                    <span className="text-[11px] font-medium text-slate-600">
                      {component.pcb?.placed ? 'Placed' : 'Unplaced'}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteBoardComponent(component.id)}
                      className="grid h-7 w-7 place-items-center rounded text-rose-600 hover:bg-rose-50"
                      aria-label={`Delete ${component.referenceDesignator}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
