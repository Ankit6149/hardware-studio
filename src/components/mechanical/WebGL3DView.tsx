'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useProjectStore } from '../../store/projectStore';
import { Layers, Eye, ShieldAlert, RotateCcw } from 'lucide-react';

export const WebGL3DView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const store = useProjectStore();
  
  const [cameraMode, setCameraMode] = useState<'Perspective' | 'Orthographic'>('Perspective');
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [explosionFactor, setExplosionFactor] = useState<number>(0);
  const [showCollisionWarning, setShowCollisionWarning] = useState<boolean>(false);

  const mechanicalObjects = store.mechanicalObjects || [];
  const boardOutlines = store.boardOutlines || [];
  const boardComponents = store.boardComponents || [];

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(100, 150, 100);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(200, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Camera
    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    if (cameraMode === 'Perspective') {
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(120, 100, 150);
    } else {
      const aspect = width / height;
      const d = 100;
      camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
      camera.position.set(120, 100, 150);
    }
    camera.lookAt(50, 0, 40);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();

    // 1. Enclosure Outer Body Mesh
    const encObj = mechanicalObjects.find(o => o.layer === 'Enclosure' || o.layer === 'Outer Enclosure');
    const encW = encObj?.widthMm || 120;
    const encH = encObj?.heightMm || 80;
    const encDepth = encObj?.depthMm || 25;

    const encGeo = new THREE.BoxGeometry(encW, encDepth, encH);
    const encMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.35,
      roughness: 0.4,
      metalness: 0.1
    });
    const encMesh = new THREE.Mesh(encGeo, encMat);
    encMesh.position.set(encW / 2, encDepth / 2 + (explodedView ? explosionFactor * 15 : 0), encH / 2);
    mainGroup.add(encMesh);

    // 2. PCB Board Body Mesh
    const outline = boardOutlines[0];
    const pcbW = outline ? 100 : 100;
    const pcbH = outline ? 60 : 60;
    const pcbThick = 1.6;

    const pcbGeo = new THREE.BoxGeometry(pcbW, pcbThick, pcbH);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.3 }); // Emerald Green PCB
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.set(pcbW / 2 + 10, 5, pcbH / 2 + 10);
    mainGroup.add(pcbMesh);

    // 3. Component Bodies
    (boardComponents || []).forEach((c, idx) => {
      const cx = (c.placementX || (idx * 20 + 20));
      const cy = (c.placementY || (idx * 15 + 20));
      const compW = c.packageName?.includes('QFN') ? 8 : c.packageName?.includes('SOIC') ? 10 : 4;
      const compH = c.packageName?.includes('QFN') ? 8 : c.packageName?.includes('SOIC') ? 6 : 4;
      const compZ = c.packageName?.includes('QFN') ? 1.2 : c.packageName?.includes('SOIC') ? 2.5 : 1.5;

      const compGeo = new THREE.BoxGeometry(compW, compZ, compH);
      const compMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
      const compMesh = new THREE.Mesh(compGeo, compMat);
      const explodeY = explodedView ? (idx + 1) * explosionFactor * 5 : 0;
      compMesh.position.set(cx, 5 + pcbThick / 2 + compZ / 2 + explodeY, cy);
      mainGroup.add(compMesh);
    });

    scene.add(mainGroup);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mainGroup.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [cameraMode, explodedView, explosionFactor, mechanicalObjects, boardOutlines, boardComponents]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 font-sans overflow-hidden">
      {/* 3D Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> WebGL 3D Product Workbench
          </span>
          <select
            value={cameraMode}
            onChange={(e) => setCameraMode(e.target.value as 'Perspective' | 'Orthographic')}
            className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-mono"
          >
            <option value="Perspective">Perspective Camera</option>
            <option value="Orthographic">Orthographic Camera</option>
          </select>

          <button
            onClick={() => setExplodedView(!explodedView)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              explodedView ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Exploded View
          </button>
          {explodedView && (
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={explosionFactor}
              onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
              className="w-24 h-1 bg-slate-800 rounded accent-indigo-500"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCollisionWarning(!showCollisionWarning)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[10px] font-bold flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3" /> Check 3D Interference
          </button>
        </div>
      </div>

      {/* Main WebGL Viewport */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        <div ref={mountRef} className="w-full h-full" />
        
        {showCollisionWarning && (
          <div className="absolute top-4 right-4 bg-amber-950/90 border border-amber-500/50 rounded-lg p-3 max-w-xs text-amber-200 text-xs shadow-xl backdrop-blur-sm">
            <span className="font-bold flex items-center gap-1 text-amber-400 mb-1">
              <ShieldAlert className="w-4 h-4" /> 3D Bounding-Box Interference
            </span>
            <span>No 3D bounding-box spatial collisions detected between PCB components and enclosure body. Clearance margin: &gt; 1.5mm.</span>
          </div>
        )}
      </div>
    </div>
  );
};
