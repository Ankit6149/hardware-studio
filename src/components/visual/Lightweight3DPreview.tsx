'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { VisualFamilyId } from '../../lib/visual/representationRegistry';

export type VisualQualityProfile = 'low' | 'balanced' | 'high';

interface Lightweight3DPreviewProps {
  familyId: VisualFamilyId;
  quality?: VisualQualityProfile;
  className?: string;
}

const qualityPixelRatio: Record<VisualQualityProfile, number> = {
  low: 1,
  balanced: 1.35,
  high: 1.8,
};

function material(color: number, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, ...options });
}

function addBox(
  group: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  color: number,
  options?: Partial<THREE.MeshStandardMaterialParameters>,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, options));
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function addCylinder(
  group: THREE.Group,
  radius: number,
  height: number,
  position: [number, number, number],
  color: number,
  rotation: [number, number, number] = [0, 0, 0],
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24), material(color));
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

function addPins(group: THREE.Group, count: number, axis: 'x' | 'z', extent: number) {
  const pinGeometry = new THREE.BoxGeometry(0.18, 0.12, 0.7);
  const pinMaterial = material(0xcbd5e1, { metalness: 0.75, roughness: 0.22 });
  const pairCount = Math.max(2, Math.ceil(count / 2));
  for (let index = 0; index < pairCount; index += 1) {
    const offset = pairCount === 1 ? 0 : -extent / 2 + (extent * index) / (pairCount - 1);
    for (const side of [-1, 1]) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      if (axis === 'x') {
        pin.position.set(side * 2.2, 0, offset);
        pin.rotation.y = Math.PI / 2;
      } else {
        pin.position.set(offset, 0, side * 2.2);
      }
      group.add(pin);
    }
  }
}

function buildFamilyModel(familyId: VisualFamilyId): THREE.Group {
  const group = new THREE.Group();

  switch (familyId) {
    case 'resistor': {
      addCylinder(group, 0.65, 3.2, [0, 0, 0], 0xd6a85f, [0, 0, Math.PI / 2]);
      addCylinder(group, 0.11, 2.2, [-2.65, 0, 0], 0xb8c2cc, [0, 0, Math.PI / 2]);
      addCylinder(group, 0.11, 2.2, [2.65, 0, 0], 0xb8c2cc, [0, 0, Math.PI / 2]);
      [0x7c2d12, 0x111827, 0xdc2626, 0xd97706].forEach((color, index) => {
        const band = addCylinder(group, 0.69, 0.18, [-0.75 + index * 0.5, 0, 0], color, [0, 0, Math.PI / 2]);
        band.material = material(color, { roughness: 0.35 });
      });
      break;
    }
    case 'capacitor': {
      addCylinder(group, 1.25, 3.1, [0, 0.4, 0], 0x1d4ed8);
      addCylinder(group, 1.28, 0.18, [0, 1.98, 0], 0xcbd5e1);
      addCylinder(group, 0.1, 1.8, [-0.4, -1.9, 0], 0xcbd5e1);
      addCylinder(group, 0.1, 1.8, [0.4, -1.9, 0], 0xcbd5e1);
      break;
    }
    case 'led': {
      addCylinder(group, 1.1, 2.1, [0, 0.45, 0], 0xef4444);
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        material(0xf87171, { transparent: true, opacity: 0.75 }),
      );
      dome.position.y = 1.5;
      group.add(dome);
      addCylinder(group, 0.09, 2.4, [-0.35, -1.75, 0], 0xcbd5e1);
      addCylinder(group, 0.09, 2.8, [0.35, -1.95, 0], 0xcbd5e1);
      break;
    }
    case 'push-button': {
      addBox(group, [4.6, 1.5, 4.2], [0, 0, 0], 0x475569);
      addBox(group, [2.2, 0.9, 2.2], [0, 1.2, 0], 0x94a3b8);
      addPins(group, 4, 'x', 2.5);
      break;
    }
    case 'microcontroller': {
      addBox(group, [5.3, 0.9, 5.3], [0, 0, 0], 0x111827, { roughness: 0.38 });
      addPins(group, 16, 'x', 4.4);
      addPins(group, 16, 'z', 4.4);
      addBox(group, [1.4, 0.05, 0.35], [0, 0.48, 0], 0x334155);
      break;
    }
    case 'sensor': {
      addBox(group, [6.2, 0.45, 4.2], [0, -0.25, 0], 0x047857);
      addBox(group, [2.5, 0.75, 2.5], [0, 0.35, 0], 0x1f2937);
      addBox(group, [0.8, 0.35, 0.8], [-2.1, 0.18, 1.15], 0xd1d5db, { metalness: 0.55 });
      for (let index = 0; index < 4; index += 1) {
        addCylinder(group, 0.17, 0.3, [-2.2 + index * 1.45, -0.25, 1.7], 0xd4af37, [Math.PI / 2, 0, 0]);
      }
      break;
    }
    case 'voltage-regulator': {
      addBox(group, [4.6, 0.8, 3.6], [0, 0, 0], 0x1f2937);
      addPins(group, 6, 'x', 2.4);
      addBox(group, [1.7, 0.12, 1.5], [0, 0.46, 0], 0x334155);
      break;
    }
    case 'battery': {
      addBox(group, [6.4, 2.2, 4.4], [0, 0, 0], 0x94a3b8, { metalness: 0.35, roughness: 0.4 });
      addBox(group, [0.8, 0.3, 0.8], [-1.15, 1.25, 0], 0xdc2626, { metalness: 0.6 });
      addBox(group, [0.8, 0.3, 0.8], [1.15, 1.25, 0], 0x111827, { metalness: 0.6 });
      break;
    }
    case 'usb-c': {
      addBox(group, [6.3, 2.3, 4.6], [0, 0, 0], 0x94a3b8, { metalness: 0.8, roughness: 0.2 });
      addBox(group, [4.9, 1.25, 3.8], [0, 0, 0.45], 0x111827);
      addBox(group, [3.7, 0.45, 2.5], [0, 0, 1.5], 0xd1d5db, { metalness: 0.55 });
      break;
    }
    case 'motor-actuator': {
      addCylinder(group, 2.4, 2.2, [0, 0, 0], 0x64748b, [Math.PI / 2, 0, 0]);
      addCylinder(group, 0.45, 4.2, [0, 0, 3.1], 0xcbd5e1, [Math.PI / 2, 0, 0]);
      addBox(group, [1.1, 0.3, 0.7], [-0.75, -1.3, -0.5], 0xdc2626);
      addBox(group, [1.1, 0.3, 0.7], [0.75, -1.3, -0.5], 0x111827);
      break;
    }
    case 'display': {
      addBox(group, [7.4, 0.75, 5.2], [0, 0, 0], 0x111827);
      addBox(group, [6.4, 0.08, 4.2], [0, 0.43, 0], 0x0ea5e9, { emissive: 0x082f49, emissiveIntensity: 0.45 });
      addBox(group, [3.2, 0.18, 1.1], [0, -0.48, -3.05], 0xd97706, { metalness: 0.65 });
      break;
    }
    case 'debug-connector': {
      addBox(group, [6.2, 0.45, 3.2], [0, -0.25, 0], 0x1f2937);
      for (let row = 0; row < 2; row += 1) {
        for (let column = 0; column < 5; column += 1) {
          addBox(group, [0.34, 2.2, 0.34], [-2.2 + column * 1.1, 0.95, -0.65 + row * 1.3], 0xd4af37, { metalness: 0.8, roughness: 0.2 });
        }
      }
      break;
    }
    case 'protection-device': {
      addBox(group, [3.4, 0.7, 2.5], [0, 0, 0], 0x1f2937);
      addPins(group, 4, 'x', 1.4);
      addBox(group, [1.1, 0.05, 0.18], [0, 0.38, 0], 0xef4444);
      break;
    }
    case 'enclosure': {
      const outer = addBox(group, [8.5, 4.6, 6.2], [0, 0, 0], 0x64748b, {
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      outer.material.depthWrite = false;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(outer.geometry),
        new THREE.LineBasicMaterial({ color: 0xcbd5e1 }),
      );
      edges.position.copy(outer.position);
      group.add(edges);
      addBox(group, [6.7, 0.4, 4.5], [0, -1.1, 0], 0x047857);
      break;
    }
    case 'pcb-assembly': {
      addBox(group, [9.2, 0.45, 6.2], [0, -0.3, 0], 0x047857);
      addBox(group, [3.2, 0.85, 3.2], [-1.1, 0.35, 0.3], 0x111827);
      addBox(group, [2.3, 1.25, 1.7], [2.7, 0.55, -1.4], 0x334155);
      addCylinder(group, 0.75, 1.3, [2.8, 0.45, 1.6], 0x1d4ed8);
      for (const x of [-3.8, 3.8]) {
        for (const z of [-2.3, 2.3]) {
          addCylinder(group, 0.22, 0.55, [x, -0.3, z], 0xd4af37, [Math.PI / 2, 0, 0]);
        }
      }
      break;
    }
    case 'product-system': {
      const outer = addBox(group, [8, 4.8, 6], [0, 0, 0], 0x334155, {
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      outer.material.depthWrite = false;
      addBox(group, [5.8, 0.4, 3.8], [0, -1, 0], 0x047857);
      addBox(group, [2.4, 1, 2.4], [0, -0.2, 0], 0x111827);
      break;
    }
    default:
      addBox(group, [5.2, 2.2, 4.2], [0, 0, 0], 0x64748b);
      break;
  }

  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);
  group.rotation.x = -0.2;
  group.rotation.y = 0.45;
  return group;
}

function renderWebGLUnavailable(mount: HTMLDivElement) {
  const message = document.createElement('div');
  message.className = 'absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-300';
  message.textContent = 'WebGL is unavailable on this device or browser session.';
  mount.replaceChildren(message);
}

export const Lightweight3DPreview: React.FC<Lightweight3DPreviewProps> = ({
  familyId,
  quality = 'balanced',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: quality !== 'low',
        alpha: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: false,
      });
    } catch {
      renderWebGLUnavailable(mount);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    renderer.setClearColor(0x0f172a, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, qualityPixelRatio[quality]));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', 'Interactive visualization-only 3D family preview');
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.3);
    fillLight.position.set(-10, 5, -6);
    scene.add(fillLight);

    const model = buildFamilyModel(familyId);
    scene.add(model);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 28;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);

    let animationFrame: number | null = null;
    let isVisible = true;

    const render = () => {
      animationFrame = null;
      if (!isVisible) return;
      renderer.render(scene, camera);
    };

    const scheduleRender = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    controls.addEventListener('change', scheduleRender);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      scheduleRender();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
      if (isVisible) scheduleRender();
    });
    intersectionObserver.observe(mount);

    resize();
    scheduleRender();

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      controls.removeEventListener('change', scheduleRender);
      controls.dispose();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((entry) => entry.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [familyId, quality]);

  return (
    <div className={`relative min-h-[260px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-slate-700 bg-slate-950/85 px-2 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur-sm">
        Visualization only · drag to orbit · wheel to zoom · no continuous animation
      </div>
    </div>
  );
};
