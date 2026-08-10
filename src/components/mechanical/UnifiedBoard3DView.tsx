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

function outlineSize(outline: { points?: { x: number; y: number }[]; width?: number; height?: number } | undefined) {
  if (outline?.points?.length) {
    const xs = outline.points.map((point) => point.x);
    const ys = outline.points.map((point) => point.y);
    return {
      width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
      height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      assumed: false,
    };
  }
  if (outline?.width && outline?.height) {
    return { width: outline.width, height: outline.height, minX: 0, minY: 0, assumed: false };
  }
  return { width: 50, height: 30, minX: 0, minY: 0, assumed: true };
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

  const board = boards.find((candidate) => candidate.id === activeBoardId) || boards[0];
  const boardId = board?.id || activeBoardId || '';
  const outline = boardOutlines.find((candidate) => candidate.boardId === boardId);
  const size = useMemo(() => outlineSize(outline), [outline]);
  const components = useMemo(
    () => boardComponents.filter((component) => component.boardId === boardId),
    [boardComponents, boardId],
  );
  const selectedComponent = components.find((component) => component.id === activeComponentId);
  const placedComponents = components.filter((component) => component.pcb?.placed || component.placementStatus === 'Placed' || component.placementX != null || component.placementY != null);
  const unresolvedDimensions = components.filter((component) => !component.packageDimensions?.widthMm || !component.packageDimensions?.heightMm || !component.packageDimensions?.heightZMm);
  const unplaced = components.filter((component) => !placedComponents.includes(component));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !board) return;

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

    const boardGeometry = new THREE.BoxGeometry(size.width, 1.6, size.height);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.48, metalness: 0.04 });
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
    boardMesh.position.set(0, 0, 0);
    group.add(boardMesh);

    const edgeLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(boardGeometry),
      new THREE.LineBasicMaterial({ color: 0x6ee7b7 }),
    );
    edgeLines.position.copy(boardMesh.position);
    group.add(edgeLines);

    placedComponents.forEach((component, index) => {
      const dimensions = component.packageDimensions;
      const width = dimensions?.widthMm || 6;
      const depth = dimensions?.heightMm || 6;
      const height = dimensions?.heightZMm || 2;
      const x = (component.pcb?.xMm ?? component.placementX ?? size.minX + 6 + index * 7) - size.minX - size.width / 2;
      const z = (component.pcb?.yMm ?? component.placementY ?? size.minY + 6 + index * 5) - size.minY - size.height / 2;
      const selected = component.id === activeComponentId;
      const material = new THREE.MeshStandardMaterial({
        color: selected ? 0xf59e0b : dimensions ? 0x1e293b : 0x94a3b8,
        roughness: 0.4,
        metalness: selected ? 0.18 : 0.08,
        emissive: selected ? 0x78350f : 0x000000,
        emissiveIntensity: selected ? 0.35 : 0,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, 0.8 + height / 2, z);
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
        // A. 3D SCREW STANDOFF BOSS / MOUNTING POINT
        if (obj.type === 'Mounting Point' || obj.name.toLowerCase().includes('boss') || obj.name.toLowerCase().includes('standoff')) {
          const outerR = obj.radiusMm || 3.2;
          const height = obj.depthMm || 8;
          const x = (obj.xMm || 0) - size.width / 2;
          const z = (obj.yMm || 0) - size.height / 2;

          const bossMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(outerR, outerR, height, 16),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.6 })
          );
          bossMesh.position.set(x, height / 2 + 0.8, z);
          group.add(bossMesh);

          // Inner pilot hole
          const holeMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(outerR * 0.45, outerR * 0.45, height + 0.2, 16),
            new THREE.MeshStandardMaterial({ color: 0x0f172a })
          );
          holeMesh.position.set(x, height / 2 + 0.9, z);
          group.add(holeMesh);
        }
        // B. 3D ENCLOSURE CASING SHELL
        else if (obj.type === 'Outer Profile' || obj.layer === 'Enclosure') {
          const w = obj.widthMm || size.width + 10;
          const h = obj.heightMm || size.height + 10;
          const d = obj.depthMm || 22;

          const geometry = new THREE.BoxGeometry(w, d, h);
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
          mesh.position.set(0, d / 2 - 1, 0);
          group.add(mesh);

          const casingEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: 0x0284c7 })
          );
          casingEdges.position.copy(mesh.position);
          group.add(casingEdges);
        }
        // C. 3D BATTERY CAVITY
        else if (obj.type === 'Battery Cavity') {
          const w = obj.widthMm || 40;
          const h = obj.heightMm || 20;
          const d = obj.depthMm || 10;
          const x = (obj.xMm || 0) - size.width / 2 + w / 2;
          const z = (obj.yMm || 0) - size.height / 2 + h / 2;

          const battMesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, d, h),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.2 })
          );
          battMesh.position.set(x, d / 2 + 0.8, z);
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
  }, [activeComponentId, board, mechanicalObjects, placedComponents, quality, showEnclosure, size]);

  if (!board) {
    return (
      <div className="grid h-full place-items-center bg-slate-950 p-6 text-center text-slate-300">
        <div><CircuitBoard className="mx-auto h-8 w-8 text-slate-500" /><h2 className="mt-3 text-lg font-bold text-white">No board selected</h2><p className="mt-2 text-sm text-slate-400">Create a board before opening the connected 3D view.</p><button type="button" onClick={() => setActiveView('board-settings')} className="mt-4 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400">Open board settings</button></div>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-slate-200" aria-label="Connected lightweight board 3D view">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-300">Lightweight board-context 3D</p><h1 className="truncate text-sm font-bold text-white">{board.name} · {selectedComponent ? `${selectedComponent.referenceDesignator} selected` : 'board overview'}</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-[10px] font-semibold text-slate-300"><Gauge className="h-3.5 w-3.5" /> Quality<select value={quality} onChange={(event) => setQuality(event.target.value as Board3DQuality)} className="bg-transparent text-white outline-none"><option value="low">Low</option><option value="balanced">Balanced</option><option value="high">High</option></select></label>
          <button type="button" onClick={() => setShowEnclosure((value) => !value)} aria-pressed={showEnclosure} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-[10px] font-semibold text-slate-300 hover:bg-slate-700"><Eye className="h-3.5 w-3.5" /> {showEnclosure ? 'Hide enclosure' : 'Show enclosure'}</button>
          <button type="button" onClick={() => setActiveView('board-designer')} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-500 px-2.5 text-[10px] font-bold text-white hover:bg-indigo-400"><CircuitBoard className="h-3.5 w-3.5" /> Back to PCB</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1"><div ref={mountRef} className="absolute inset-0" /></div>
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-indigo-400" /><h2 className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Preview context</h2></div>
          <dl className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs"><div><dt className="text-[9px] uppercase text-slate-500">Board</dt><dd className="mt-0.5 font-semibold text-slate-200">{size.width.toFixed(1)} × {size.height.toFixed(1)} mm · {board.layerCount} layers</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Placed components</dt><dd className="mt-0.5 text-slate-300">{placedComponents.length} of {components.length}</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Selected object</dt><dd className="mt-0.5 text-slate-300">{selectedComponent ? `${selectedComponent.referenceDesignator} · ${selectedComponent.componentName}` : 'None'}</dd></div></dl>

          <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-500">Components on this board</p>
          <div className="mt-2 space-y-1.5">{components.map((component) => <button key={component.id} type="button" onClick={() => setActiveComponent(component.id)} className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${component.id === activeComponentId ? 'border-amber-500 bg-amber-950/50' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}><Boxes className="h-3.5 w-3.5 shrink-0 text-slate-500" /><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-slate-200">{component.referenceDesignator}</span><span className="block truncate text-[9px] text-slate-500">{component.componentName}</span></span><Focus className="h-3.5 w-3.5 text-slate-500" /></button>)}</div>

          {(size.assumed || unresolvedDimensions.length > 0 || unplaced.length > 0) && <div className="mt-4 rounded-xl border border-amber-700/60 bg-amber-950/50 p-3 text-[10px] leading-5 text-amber-200"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><div><p className="font-bold text-amber-300">Preview assumptions remain</p>{size.assumed && <p>Board outline is missing; a 50 × 30 mm preview envelope is shown and is not authoritative.</p>}{unresolvedDimensions.length > 0 && <p>{unresolvedDimensions.length} component(s) use provisional 6 × 6 × 2 mm bodies because exact package dimensions are missing.</p>}{unplaced.length > 0 && <p>{unplaced.length} unplaced component(s) are listed but not rendered on the board.</p>}</div></div></div>}

          <div className="mt-4 rounded-xl border border-sky-800 bg-sky-950/40 p-3 text-[10px] leading-5 text-sky-200">This event-driven GL preview is for recognition and assembly context only. It is not exact STEP/B-Rep geometry and cannot authorize clearance, interference, mass, or manufacturing.</div>
        </aside>
      </div>
    </section>
  );
};
