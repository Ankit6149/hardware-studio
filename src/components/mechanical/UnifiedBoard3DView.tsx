'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  AlertTriangle,
  Boxes,
  CircuitBoard,
  Eye,
  Focus,
  Gauge,
  Layers3,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';

export type Board3DQuality = 'low' | 'balanced' | 'high';

const pixelRatioByQuality: Record<Board3DQuality, number> = {
  low: 1,
  balanced: 1.3,
  high: 1.7,
};

interface BoardOutlineSize {
  width: number;
  height: number;
  minX: number;
  minY: number;
}

function outlineSize(outline: { points?: { x: number; y: number }[]; width?: number; height?: number } | undefined): BoardOutlineSize | null {
  if (outline?.points && outline.points.length >= 2) {
    const xs = outline.points.map((point) => point.x);
    const ys = outline.points.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return {
        width,
        height,
        minX: Math.min(...xs),
        minY: Math.min(...ys),
      };
    }
  }
  if (
    outline?.width != null
    && outline?.height != null
    && Number.isFinite(outline.width)
    && Number.isFinite(outline.height)
    && outline.width > 0
    && outline.height > 0
  ) {
    return { width: outline.width, height: outline.height, minX: 0, minY: 0 };
  }
  return null;
}

function positiveDimensions(dimensions: { widthMm: number; heightMm: number; heightZMm: number } | undefined) {
  return Boolean(
    dimensions
    && Number.isFinite(dimensions.widthMm)
    && Number.isFinite(dimensions.heightMm)
    && Number.isFinite(dimensions.heightZMm)
    && dimensions.widthMm > 0
    && dimensions.heightMm > 0
    && dimensions.heightZMm > 0,
  );
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export const UnifiedBoard3DView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const store = useProjectStore();
  const {
    boards = [],
    boardOutlines = [],
    boardComponents = [],
    mechanicalObjects = [],
    setActiveView,
  } = store;
  const {
    activeBoardId,
    activeComponentId,
    setActiveComponent,
  } = useStudioContextStore();
  const [quality, setQuality] = useState<Board3DQuality>('balanced');
  const [showEnclosure, setShowEnclosure] = useState(true);

  const board = boards.find((candidate) => candidate.id === activeBoardId);
  const boardId = board?.id || '';
  const outline = boardOutlines.find((candidate) => candidate.boardId === boardId);
  const size = useMemo(() => outlineSize(outline), [outline]);
  const components = useMemo(
    () => boardComponents.filter((component) => component.boardId === boardId),
    [boardComponents, boardId],
  );
  const selectedComponent = components.find((component) => component.id === activeComponentId);
  const componentRepresentations = useMemo(() => components.map((component) => {
    const xMm = component.pcb?.xMm ?? component.placementX;
    const yMm = component.pcb?.yMm ?? component.placementY;
    const hasPlacement = xMm != null && yMm != null && Number.isFinite(xMm) && Number.isFinite(yMm);
    const hasDimensions = positiveDimensions(component.packageDimensions);
    return {
      component,
      xMm,
      yMm,
      hasPlacement,
      hasDimensions,
      renderable: hasPlacement && hasDimensions,
    };
  }), [components]);
  const renderableComponents = componentRepresentations.filter((representation) => representation.renderable);
  const unresolvedDimensions = componentRepresentations.filter((representation) => representation.hasPlacement && !representation.hasDimensions);
  const unplaced = componentRepresentations.filter((representation) => !representation.hasPlacement);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !board || !size) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: quality !== 'low',
        alpha: false,
        powerPreference: 'low-power',
        preserveDrawingBuffer: false,
      });
    } catch {
      mount.replaceChildren();
      const message = document.createElement('div');
      message.className = 'absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-300';
      message.textContent = 'WebGL is unavailable in this browser session. Board and component context is still preserved.';
      mount.appendChild(message);
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000);
    const extent = Math.max(size.width, size.height, 20);
    camera.position.set(extent * 1.05, extent * 0.82, extent * 1.2);
    camera.lookAt(0, 0, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioByQuality[quality]));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(extent, extent * 1.5, extent);
    scene.add(keyLight);

    const group = new THREE.Group();
    group.rotation.x = -0.08;

    // Board thickness is not available in the canonical project model here, so render only the
    // authoritative 2D outline as a plane rather than inventing a common PCB thickness.
    const boardGeometry = new THREE.PlaneGeometry(size.width, size.height);
    boardGeometry.rotateX(-Math.PI / 2);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.48, metalness: 0.04, side: THREE.DoubleSide });
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
    boardMesh.position.set(0, 0, 0);
    group.add(boardMesh);

    const edgeLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(boardGeometry),
      new THREE.LineBasicMaterial({ color: 0x6ee7b7 }),
    );
    edgeLines.position.copy(boardMesh.position);
    group.add(edgeLines);

    renderableComponents.forEach(({ component, xMm, yMm }) => {
      const dimensions = component.packageDimensions!;
      const x = xMm! - size.minX - size.width / 2;
      const z = yMm! - size.minY - size.height / 2;
      const selected = component.id === activeComponentId;
      const material = new THREE.MeshStandardMaterial({
        color: selected ? 0xf59e0b : 0x1e293b,
        roughness: 0.4,
        metalness: selected ? 0.18 : 0.08,
        emissive: selected ? 0x78350f : 0x000000,
        emissiveIntensity: selected ? 0.35 : 0,
      });
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.widthMm, dimensions.heightZMm, dimensions.heightMm),
        material,
      );
      mesh.position.set(x, dimensions.heightZMm / 2, z);
      mesh.userData.componentId = component.id;
      group.add(mesh);

      if (selected) {
        const selectedEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({ color: 0xfde68a }),
        );
        selectedEdges.position.copy(mesh.position);
        group.add(selectedEdges);
      }
    });

    if (showEnclosure) {
      mechanicalObjects.forEach((obj) => {
        if (obj.type === 'Mounting Point' && obj.radiusMm != null && obj.radiusMm > 0 && obj.depthMm != null && obj.depthMm > 0) {
          const bossMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(obj.radiusMm, obj.radiusMm, obj.depthMm, 16),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.6 }),
          );
          bossMesh.position.set(obj.xMm - size.width / 2, obj.depthMm / 2, obj.yMm - size.height / 2);
          group.add(bossMesh);
        } else if (
          obj.type === 'Outer Profile'
          && obj.widthMm != null && obj.widthMm > 0
          && obj.heightMm != null && obj.heightMm > 0
          && obj.depthMm != null && obj.depthMm > 0
        ) {
          const geometry = new THREE.BoxGeometry(obj.widthMm, obj.depthMm, obj.heightMm);
          const material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.25,
            roughness: 0.1,
            metalness: 0.1,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            obj.xMm - size.minX - size.width / 2 + obj.widthMm / 2,
            obj.depthMm / 2,
            obj.yMm - size.minY - size.height / 2 + obj.heightMm / 2,
          );
          group.add(mesh);

          const casingEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: 0x0284c7 }),
          );
          casingEdges.position.copy(mesh.position);
          group.add(casingEdges);
        } else if (
          obj.type === 'Battery Cavity'
          && obj.widthMm != null && obj.widthMm > 0
          && obj.heightMm != null && obj.heightMm > 0
          && obj.depthMm != null && obj.depthMm > 0
        ) {
          const battMesh = new THREE.Mesh(
            new THREE.BoxGeometry(obj.widthMm, obj.depthMm, obj.heightMm),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.2 }),
          );
          battMesh.position.set(
            obj.xMm - size.minX - size.width / 2 + obj.widthMm / 2,
            obj.depthMm / 2,
            obj.yMm - size.minY - size.height / 2 + obj.heightMm / 2,
          );
          group.add(battMesh);
        }
      });
    }

    scene.add(group);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.minDistance = Math.max(5, extent * 0.35);
    controls.maxDistance = extent * 6;
    controls.target.set(0, 0, 0);

    let visible = true;
    const render = () => {
      if (!visible) return;
      renderer.render(scene, camera);
    };
    controls.addEventListener('change', render);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) render();
    });
    intersectionObserver.observe(mount);

    resize();

    return () => {
      controls.removeEventListener('change', render);
      controls.dispose();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disposeObject(group);
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [activeComponentId, board, mechanicalObjects, quality, renderableComponents, showEnclosure, size]);

  if (!board) {
    return (
      <div className="grid h-full place-items-center bg-slate-950 p-6 text-center text-slate-300">
        <div><CircuitBoard className="mx-auto h-8 w-8 text-slate-500" /><h2 className="mt-3 text-lg font-bold text-white">No board selected</h2><p className="mt-2 text-sm text-slate-400">Select an explicit project board before opening the connected 3D view. Hardware Studio will not substitute the first board.</p><button type="button" onClick={() => setActiveView('board-settings')} className="mt-4 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400">Open board settings</button></div>
      </div>
    );
  }

  if (!size) {
    return (
      <div className="grid h-full place-items-center bg-slate-950 p-6 text-center text-slate-300">
        <div><AlertTriangle className="mx-auto h-8 w-8 text-amber-400" /><h2 className="mt-3 text-lg font-bold text-white">Board outline is unresolved</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">The 3D representation needs explicit board geometry. No 50 × 30 mm preview envelope or other guessed outline will be created.</p><button type="button" onClick={() => setActiveView('board-settings')} className="mt-4 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400">Define board outline</button></div>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-slate-200" aria-label="Connected lightweight board 3D view">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-300">Evidence-backed board-context 3D</p><h1 className="truncate text-sm font-bold text-white">{board.name} · {selectedComponent ? `${selectedComponent.referenceDesignator} selected` : 'board overview'}</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-[10px] font-semibold text-slate-300"><Gauge className="h-3.5 w-3.5" /> Quality<select value={quality} onChange={(event) => setQuality(event.target.value as Board3DQuality)} className="bg-transparent text-white outline-none"><option value="low">Low</option><option value="balanced">Balanced</option><option value="high">High</option></select></label>
          <button type="button" onClick={() => setShowEnclosure((value) => !value)} aria-pressed={showEnclosure} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-[10px] font-semibold text-slate-300 hover:bg-slate-700"><Eye className="h-3.5 w-3.5" /> {showEnclosure ? 'Hide mechanical evidence' : 'Show mechanical evidence'}</button>
          <button type="button" onClick={() => setActiveView('board-designer')} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-500 px-2.5 text-[10px] font-bold text-white hover:bg-indigo-400"><CircuitBoard className="h-3.5 w-3.5" /> Back to PCB</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1"><div ref={mountRef} className="absolute inset-0" /></div>
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-indigo-400" /><h2 className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Representation evidence</h2></div>
          <dl className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs"><div><dt className="text-[9px] uppercase text-slate-500">Board outline</dt><dd className="mt-0.5 font-semibold text-slate-200">{size.width.toFixed(1)} × {size.height.toFixed(1)} mm{board.layerCount ? ` · ${board.layerCount} layers recorded` : ' · layer count unresolved'}</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Renderable components</dt><dd className="mt-0.5 text-slate-300">{renderableComponents.length} of {components.length}</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Selected object</dt><dd className="mt-0.5 text-slate-300">{selectedComponent ? `${selectedComponent.referenceDesignator} · ${selectedComponent.componentName}` : 'None'}</dd></div></dl>

          <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-500">Components on this board</p>
          <div className="mt-2 space-y-1.5">{componentRepresentations.map(({ component, hasPlacement, hasDimensions, renderable }) => <button key={component.id} type="button" onClick={() => setActiveComponent(component.id)} className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${component.id === activeComponentId ? 'border-amber-500 bg-amber-950/50' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}><Boxes className="h-3.5 w-3.5 shrink-0 text-slate-500" /><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-slate-200">{component.referenceDesignator}</span><span className="block truncate text-[9px] text-slate-500">{renderable ? 'Placement + package dimensions available' : !hasPlacement ? 'Placement unresolved' : !hasDimensions ? 'Package dimensions unresolved' : 'Representation unresolved'}</span></span><Focus className="h-3.5 w-3.5 text-slate-500" /></button>)}</div>

          {(unresolvedDimensions.length > 0 || unplaced.length > 0) && <div className="mt-4 rounded-xl border border-amber-700/60 bg-amber-950/50 p-3 text-[10px] leading-5 text-amber-200"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><div><p className="font-bold text-amber-300">Unresolved representation data</p>{unresolvedDimensions.length > 0 && <p>{unresolvedDimensions.length} placed component(s) are not rendered because exact positive package dimensions are missing.</p>}{unplaced.length > 0 && <p>{unplaced.length} component(s) are not rendered because explicit PCB coordinates are missing.</p>}</div></div></div>}

          <div className="mt-4 rounded-xl border border-sky-800 bg-sky-950/40 p-3 text-[10px] leading-5 text-sky-200">Only recorded outline, placement, package dimensions, and mechanical feature dimensions are visualized. This is still a recognition/context preview, not STEP/B-Rep geometry and not manufacturing clearance evidence.</div>
        </aside>
      </div>
    </section>
  );
};
