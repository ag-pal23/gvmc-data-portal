'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './GlobeIntro.module.css';

const GLOBE_RADIUS = 5;

// Approximate centers from user spec
const TARGETS = {
  idle:   { lat: 10,      lon: 40,     distance: GLOBE_RADIUS * 3.6, fov: 50 },
  india:  { lat: 22.0,    lon: 80.0,   distance: GLOBE_RADIUS * 2.2, fov: 45 },
  ap:     { lat: 15.9129, lon: 79.7400, distance: GLOBE_RADIUS * 1.55, fov: 40 },
  vizag:  { lat: 17.6868, lon: 83.2185, distance: GLOBE_RADIUS * 1.18, fov: 34 },
  closeup:{ lat: 17.6868, lon: 83.2185, distance: GLOBE_RADIUS * 1.03, fov: 24 },
};

const STEP_ORDER: ('idle' | 'india' | 'ap' | 'vizag')[] = ['idle', 'india', 'ap', 'vizag'];
const STEP_LABELS = {
  idle:  ['Earth', 'Scroll to explore'],
  india: ['India', 'Andhra Pradesh next'],
  ap:    ['Andhra Pradesh', 'Zooming toward the coast'],
  vizag: ['Visakhapatnam', 'Click or press Enter to continue'],
};

const STEP_DURATION_MS = 1100;
const SKIP_DURATION_MS = 700;
const CLOSEUP_DURATION_MS = 1000;

const VIZAG_GEOJSON_RING = [
  [82.95, 17.55], [83.05, 17.45], [83.20, 17.42], [83.35, 17.50],
  [83.40, 17.65], [83.35, 17.80], [83.20, 17.88], [83.05, 17.85],
  [82.92, 17.75], [82.90, 17.62], [82.95, 17.55],
];

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function buildDistrictMesh(ring: number[][], opts: { offset?: number } = {}) {
  const surfaceOffset = opts.offset ?? 0.002;
  const radius = GLOBE_RADIUS * (1 + surfaceOffset);

  const points3D = ring.map(([lon, lat]) => latLonToVector3(lat, lon, radius));

  const centroid = points3D.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(points3D.length);
  centroid.setLength(radius);

  const vertices: number[] = [];
  for (let i = 0; i < points3D.length - 1; i++) {
    vertices.push(centroid.x, centroid.y, centroid.z);
    vertices.push(points3D[i].x, points3D[i].y, points3D[i].z);
    vertices.push(points3D[i+1].x, points3D[i+1].y, points3D[i+1].z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return { geometry, points3D };
}

interface GlobeIntroProps {
  onEnter: () => void;
  paused?: boolean;
}

export default function GlobeIntro({ onEnter, paused = false }: GlobeIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [liveText, setLiveText] = useState('');
  
  const pausedRef = useRef(paused);
  const uiEnteredRef = useRef(false);

  // Update pausedRef on every render
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) {
      uiEnteredRef.current = false;
    }
  }, [paused]);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const supportsWebGL = !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!supportsWebGL) {
        setHasWebGL(false);
        return;
      }
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup ThreeJS scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(TARGETS.idle.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7)); // Brighten ambient lighting
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous'); // Fix CORS blocking

    // Earth
    const earthMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
      bumpMap: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'), // Proper grayscale bumpmap
      bumpScale: 0.015,
      roughnessMap: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png'), // Specular water map
      roughness: 0.85,
      metalness: 0.15,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96), earthMat);
    scene.add(earth);

    // Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      alphaMap: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png'), // Reliable unpkg clouds
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64), cloudMat);
    scene.add(clouds);

    // Vizag Boundary
    const { geometry: fillGeo, points3D: vizagPoints } = buildDistrictMesh(VIZAG_GEOJSON_RING, { offset: 0.002 });
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x3ea6ff, transparent: true, opacity: 0.0,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const districtFill = new THREE.Mesh(fillGeo, fillMat);
    scene.add(districtFill);

    // Outline
    const outlinePoints = vizagPoints.map(p => p.clone());
    const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePoints);
    const outlineMat = new THREE.LineBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.0 });
    const districtOutline = new THREE.LineLoop(outlineGeo, outlineMat);
    scene.add(districtOutline);

    // Thicker hit-area mesh for click tracking
    const { geometry: hitGeo } = buildDistrictMesh(VIZAG_GEOJSON_RING, { offset: 0.02 });
    const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
    const districtHitArea = new THREE.Mesh(hitGeo, hitMat);
    scene.add(districtHitArea);

    // Animation & State
    let currentStepIdx = 0;
    let isAnimating = false;
    let idleAutoRotate = true;

    function cameraPositionFor(target: { lat: number; lon: number; distance: number }) {
      const dir = latLonToVector3(target.lat, target.lon, 1);
      return dir.multiplyScalar(target.distance);
    }

    function animateCamera(
      fromTarget: { lat: number; lon: number; distance: number; fov: number },
      toTarget: { lat: number; lon: number; distance: number; fov: number },
      durationMs: number,
      onComplete?: () => void
    ) {
      isAnimating = true;
      const startPos = cameraPositionFor(fromTarget);
      const endPos = cameraPositionFor(toTarget);
      const startFov = fromTarget.fov;
      const endFov = toTarget.fov;
      const startTime = performance.now();

      // Smoothly rotate the Earth to the nearest base coordinates (multiple of 2*PI)
      const startEarthRot = earth.rotation.y;
      const targetEarthRot = idleAutoRotate
        ? startEarthRot
        : Math.round(startEarthRot / (2 * Math.PI)) * (2 * Math.PI);

      const startCloudsRot = clouds.rotation.y;
      const targetCloudsRot = idleAutoRotate
        ? startCloudsRot
        : Math.round(startCloudsRot / (2 * Math.PI)) * (2 * Math.PI);

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? Math.min(200, durationMs) : durationMs;

      function step(now: number) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutCubic(t);
        camera.position.lerpVectors(startPos, endPos, eased);
        camera.fov = THREE.MathUtils.lerp(startFov, endFov, eased);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        if (!idleAutoRotate) {
          earth.rotation.y = THREE.MathUtils.lerp(startEarthRot, targetEarthRot, eased);
          clouds.rotation.y = THREE.MathUtils.lerp(startCloudsRot, targetCloudsRot, eased);
        }

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          isAnimating = false;
          onComplete && onComplete();
        }
      }
      requestAnimationFrame(step);
    }

    function triggerEnter() {
      if (uiEnteredRef.current) return;
      uiEnteredRef.current = true;
      setLiveText('Entering the Open Data Platform.');

      animateCamera(TARGETS.vizag, TARGETS.closeup, CLOSEUP_DURATION_MS, () => {
        onEnter();
      });
    }

    function goToStep(index: number, opts: { skip?: boolean; force?: boolean } = {}) {
      index = THREE.MathUtils.clamp(index, 0, STEP_ORDER.length - 1);
      if (index === currentStepIdx && !opts.force) return;

      const fromKey = STEP_ORDER[currentStepIdx];
      const toKey = STEP_ORDER[index];
      const duration = opts.skip ? SKIP_DURATION_MS : STEP_DURATION_MS;

      idleAutoRotate = toKey === 'idle';

      animateCamera(TARGETS[fromKey], TARGETS[toKey], duration, () => {
        const highlightOn = toKey === 'vizag';
        fillMat.opacity = highlightOn ? 0.35 : 0.0;
        outlineMat.opacity = highlightOn ? 0.9 : 0.0;
      });

      currentStepIdx = index;
      setStepIndex(index);
      const [label, title] = STEP_LABELS[toKey];
      setLiveText(toKey === 'vizag'
        ? 'Focused on Visakhapatnam. Press Enter or click the highlighted district to continue.'
        : `Focused on ${label}. ${title}.`
      );
    }

    // Init camera position
    camera.position.copy(cameraPositionFor(TARGETS.idle));
    camera.lookAt(0, 0, 0);

    // Scroll mapping
    const WHEEL_STEP_THRESHOLD = 60;
    const WHEEL_SKIP_THRESHOLD = 160;
    const WHEEL_COOLDOWN_MS = 120;
    let wheelAccum = 0;
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating || uiEnteredRef.current) return;

      const now = performance.now();
      if (now - lastWheelTime < WHEEL_COOLDOWN_MS) return;

      wheelAccum += e.deltaY;
      const bigJump = Math.abs(e.deltaY) > WHEEL_SKIP_THRESHOLD;

      if (Math.abs(wheelAccum) >= WHEEL_STEP_THRESHOLD) {
        const direction = wheelAccum > 0 ? 1 : -1;
        const delta = bigJump ? direction * 2 : direction;
        goToStep(currentStepIdx + delta, { skip: bigJump });
        wheelAccum = 0;
        lastWheelTime = now;
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Touch support
    let touchStartY: number | null = null;
    let touchLastY: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = touchLastY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchLastY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (touchStartY === null || touchLastY === null || isAnimating || uiEnteredRef.current) return;
      const deltaY = touchStartY - touchLastY;
      const bigJump = Math.abs(deltaY) > 120;
      if (Math.abs(deltaY) > 30) {
        const direction = deltaY > 0 ? 1 : -1;
        goToStep(currentStepIdx + (bigJump ? direction * 2 : direction), { skip: bigJump });
      }
      touchStartY = touchLastY = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating || uiEnteredRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        goToStep(currentStepIdx + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goToStep(currentStepIdx - 1);
      } else if (e.key === 'Enter' && STEP_ORDER[currentStepIdx] === 'vizag') {
        triggerEnter();
      }
    };

    canvas.addEventListener('keydown', handleKeyDown);

    // Raycast Click Detection
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      if (STEP_ORDER[currentStepIdx] !== 'vizag' || isAnimating || uiEnteredRef.current) return;
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObject(districtHitArea, false);
      if (intersects.length > 0) {
        triggerEnter();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    let rafId: number | null = null;
    const renderLoop = () => {
      if (pausedRef.current) {
        rafId = requestAnimationFrame(renderLoop);
        return;
      }
      if (idleAutoRotate && !isAnimating) {
        earth.rotation.y += 0.0006;
        clouds.rotation.y += 0.0009;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // Visibility management
    const handleVisibility = () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !uiEnteredRef.current && !rafId) {
        renderLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    // Expose proxy to vizag button
    const vizagBtn = document.getElementById('vizag-focus-target');
    const handleVizagBtnClick = () => {
      triggerEnter();
    };
    vizagBtn?.addEventListener('click', handleVizagBtnClick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      vizagBtn?.removeEventListener('click', handleVizagBtnClick);
    };
  }, [hasWebGL, onEnter]);

  if (!hasWebGL) {
    return (
      <div className={`${styles.container} ${styles.fallbackActive}`} style={{ background: '#05070d url("/assets/fallback-globe.jpg") center/cover no-repeat' }}>
        <button className={styles.enterFallback} type="button" onClick={onEnter}>
          Enter GVMC Open Data Platform
        </button>
      </div>
    );
  }

  const currentStep = STEP_ORDER[stepIndex];
  const [label, title] = STEP_LABELS[currentStep];

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        tabIndex={0}
        aria-label="Interactive globe. Scroll or press arrow keys to zoom from Earth into India, Andhra Pradesh, then Visakhapatnam."
      />

      <div className={styles.hud} aria-hidden="true">
        <div className={styles.stepLabel}>{label}</div>
        <div className={styles.stepTitle}>{title}</div>
        {currentStep !== 'vizag' && (
          <div className={styles.scrollHint}>Scroll / swipe up to continue</div>
        )}
      </div>

      <button className={styles.skipIntro} type="button" onClick={onEnter}>
        Skip intro
      </button>

      <button
        className={`${styles.vizagFocusTarget} ${currentStep === 'vizag' ? styles.vizagFocusTargetActive : ''}`}
        id="vizag-focus-target"
        type="button"
      >
        Press Enter to explore Visakhapatnam
      </button>

      <div className={styles.srOnly} role="status" aria-live="polite">
        {liveText}
      </div>
    </div>
  );
}
