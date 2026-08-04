'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Eye, Rotate3D, X } from 'lucide-react';
import { useProductDesignStore } from '../../store/productDesignStore';

const views = [
  { label: 'Iso', position: [2.2, 1.8, 2.2] as const },
  { label: 'Front', position: [0, 0, 3] as const },
  { label: 'Top', position: [0, 3, 0.001] as const },
  { label: 'Right', position: [3, 0, 0] as const },
];

export const ProductDesign3DPreview: React.FC = () => {
  const open = useProductDesignStore((state) => state.is3DOpen);
  const setOpen = useProductDesignStore((state) => state.set3DOpen);
  const document = useProductDesignStore((state) => state.document);
  const selectedObjectIds = useProductDesignStore((state) => state.selectedObjectIds);
  const updateObjectById = useProductDesignStore((state) => state.updateObjectById);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const setCameraViewRef = useRef<((position: readonly [number, number, number]) => void) | null>(null);

  const conceptPart = useMemo(() => {
    const selected = document?.objects.find((object) => selectedObjectIds.includes(object.id) && object.type === 'concept-part');
    return selected?.type === 'concept-part' ? selected : document?.objects.find((object) => object.type === 'concept-part');
  }, [document, selectedObjectIds]);

  useEffect(() => {
    if (!open || !conceptPart || !canvasRef.current) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const mount = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      if (disposed || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0xf8fafc, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
      camera.position.set(2.2, 1.8, 2.2);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = false;
      controls.target.set(0, 0, 0);
      controls.minDistance = 0.8;
      controls.maxDistance = 12;

      const ambient = new THREE.HemisphereLight(0xffffff, 0x64748b, 2.1);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xbfd7ff, 1.1);
      fillLight.position.set(-4, 2, -2);
      scene.add(fillLight);

      const scale = 1 / Math.max(conceptPart.width, conceptPart.height, conceptPart.depth, 1);
      const width = Math.max(0.08, conceptPart.width * scale * 1.7);
      const height = Math.max(0.08, conceptPart.depth * scale * 1.7);
      const depth = Math.max(0.08, conceptPart.height * scale * 1.7);
      const geometry = new THREE.BoxGeometry(width, height, depth, 4, 2, 4);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(conceptPart.appearance || '#94a3b8'),
        roughness: 0.55,
        metalness: conceptPart.material.toLowerCase().includes('metal') ? 0.55 : 0.08,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.55 }),
      );
      scene.add(edges);

      const platformGeometry = new THREE.CylinderGeometry(1.35, 1.35, 0.035, 64);
      const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = -height / 2 - 0.04;
      scene.add(platform);

      const grid = new THREE.GridHelper(3.5, 20, 0x94a3b8, 0xcbd5e1);
      grid.position.y = platform.position.y - 0.025;
      scene.add(grid);

      const render = () => renderer.render(scene, camera);
      controls.addEventListener('change', render);

      const resize = () => {
        const parent = canvas.parentElement;
        const widthPx = Math.max(1, parent?.clientWidth || 1);
        const heightPx = Math.max(1, parent?.clientHeight || 1);
        renderer.setSize(widthPx, heightPx, false);
        camera.aspect = widthPx / heightPx;
        camera.updateProjectionMatrix();
        render();
      };
      const observer = new ResizeObserver(resize);
      if (canvas.parentElement) observer.observe(canvas.parentElement);

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') render();
      };
      document.addEventListener('visibilitychange', handleVisibility);

      setCameraViewRef.current = (position) => {
        camera.position.set(...position);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        render();
      };

      resize();

      cleanup = () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', handleVisibility);
        controls.removeEventListener('change', render);
        controls.dispose();
        geometry.dispose();
        material.dispose();
        (edges.geometry as THREE.BufferGeometry).dispose();
        (edges.material as THREE.Material).dispose();
        platformGeometry.dispose();
        platformMaterial.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        setCameraViewRef.current = null;
      };
    };

    void mount();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [conceptPart, open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[180] bg-slate-950/65 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[190] flex h-[min(760px,calc(100vh-2rem))] w-[min(1180px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl outline-none">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Box className="h-4 w-4" /></span>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-sm font-bold text-slate-950">{conceptPart?.name || 'No concept part selected'}</Dialog.Title>
                <Dialog.Description className="mt-0.5 text-[10px] text-amber-700">Concept preview · derived dimensions · not exact CAD</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close 3D concept preview" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </header>

          {conceptPart ? (
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="relative min-h-[320px] min-w-0 flex-1 bg-slate-100">
                <canvas ref={canvasRef} className="h-full w-full" aria-label={`3D preview of ${conceptPart.name}`} />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {views.map((view) => (
                    <button key={view.label} type="button" onClick={() => setCameraViewRef.current?.(view.position)} className="rounded-lg border border-slate-300 bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">{view.label}</button>
                  ))}
                </div>
                <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-slate-300 bg-white/90 px-2.5 py-1.5 text-[10px] text-slate-600 shadow-sm backdrop-blur"><Rotate3D className="h-3.5 w-3.5" /> Drag to orbit · wheel to zoom</div>
              </div>

              <aside className="w-full shrink-0 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:w-80 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2"><Eye className="h-4 w-4 text-indigo-600" /><h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700">Concept properties</h2></div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2"><dt className="text-slate-500">Width</dt><dd className="mt-1 font-mono font-bold text-slate-900">{conceptPart.width}</dd></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2"><dt className="text-slate-500">Height</dt><dd className="mt-1 font-mono font-bold text-slate-900">{conceptPart.height}</dd></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2"><dt className="text-slate-500">Depth</dt><dd className="mt-1 font-mono font-bold text-slate-900">{conceptPart.depth}</dd></div>
                </dl>

                <label className="mt-4 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Depth</label>
                <input type="number" min={1} value={conceptPart.depth} onChange={(event) => updateObjectById(conceptPart.id, { depth: Math.max(1, Number(event.target.value) || 1) } as never, 'Update concept depth')} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500" />

                <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Material intent</label>
                <input value={conceptPart.material} onChange={(event) => updateObjectById(conceptPart.id, { material: event.target.value } as never, 'Update concept material')} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500" />

                <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Finish intent</label>
                <input value={conceptPart.finish} onChange={(event) => updateObjectById(conceptPart.id, { finish: event.target.value } as never, 'Update concept finish')} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500" />

                <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Appearance</label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={conceptPart.appearance} onChange={(event) => updateObjectById(conceptPart.id, { appearance: event.target.value } as never, 'Update concept appearance')} className="h-9 w-12 rounded-lg border border-slate-300 bg-white p-1" />
                  <input value={conceptPart.appearance} onChange={(event) => updateObjectById(conceptPart.id, { appearance: event.target.value } as never, 'Update concept appearance')} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 font-mono text-xs outline-none focus:border-indigo-500" />
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-900">
                  This view communicates form and appearance intent. It does not authorize clearances, mass, tolerances, STEP geometry, tooling, or manufacturing release.
                </div>
              </aside>
            </div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center"><div><Box className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-800">Create or select a concept part first</p><p className="mt-1 text-xs text-slate-500">Select design objects and use “Create concept part” in the Product Design toolbar.</p></div></div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
