'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Layers, X, Share2, BarChart3, Database, Table2 } from 'lucide-react';
import wardsData from '@/data/wards.json';
import styles from './page.module.css';

interface WardProperties {
  ward_id: number;
  name: string;
  zone: string;
  population: number;
  water_pct: number;
  aqi: number;
  grievances: number;
}

const mapLayers = [
  { id: 'wards', label: 'Ward Boundaries', color: '#0B5FFF', group: 'Base', defaultOn: true },
  { id: 'water', label: 'Water Supply %', color: '#0E9F6E', group: 'Infrastructure', defaultOn: true },
  { id: 'aqi', label: 'Air Quality (AQI)', color: '#F59E0B', group: 'Environment', defaultOn: false },
  { id: 'traffic', label: 'Traffic Density', color: '#DC2626', group: 'Transport', defaultOn: false },
  { id: 'grievances', label: 'Grievance Heatmap', color: '#7C3AED', group: 'Civic Services', defaultOn: false },
  { id: 'sanitation', label: 'Sanitation Points', color: '#0E9F6E', group: 'Infrastructure', defaultOn: false },
];

function getWardColor(waterPct: number): string {
  if (waterPct >= 95) return '#0E9F6E';
  if (waterPct >= 90) return '#10B981';
  if (waterPct >= 85) return '#F59E0B';
  return '#DC2626';
}

export default function MapPage({ mapMode = 'standard' }: { mapMode?: 'standard' | 'satellite' }) {
  const [activeLayers, setActiveLayers] = useState<string[]>(
    mapLayers.filter(l => l.defaultOn).map(l => l.id)
  );
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const container3dRef = useRef<HTMLDivElement>(null);

  // 3D View configuration states
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [extrusionMetric, setExtrusionMetric] = useState<string>('water');
  const [heightScale, setHeightScale] = useState<number>(1.5);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Sync 3D height extrusion metric with the active layer in sidebar
  useEffect(() => {
    if (activeLayers.includes('water')) {
      setExtrusionMetric('water');
    } else if (activeLayers.includes('aqi')) {
      setExtrusionMetric('aqi');
    } else if (activeLayers.includes('grievances')) {
      setExtrusionMetric('grievances');
    } else if (activeLayers.includes('traffic')) {
      setExtrusionMetric('traffic');
    } else {
      setExtrusionMetric('population');
    }
  }, [activeLayers]);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    const url = `${window.location.origin}/map?lat=17.72&lng=83.30&z=12&layers=${activeLayers.join(',')}&view=${viewMode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Draw 2D Canvas Map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== '2d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Compute exact bounding box from actual ward data
    const features = wardsData.features;
    let dataMinLng = Infinity, dataMaxLng = -Infinity;
    let dataMinLat = Infinity, dataMaxLat = -Infinity;
    features.forEach((feature) => {
      feature.geometry.coordinates[0].forEach((pt: number[]) => {
        if (pt[0] < dataMinLng) dataMinLng = pt[0];
        if (pt[0] > dataMaxLng) dataMaxLng = pt[0];
        if (pt[1] < dataMinLat) dataMinLat = pt[1];
        if (pt[1] > dataMaxLat) dataMaxLat = pt[1];
      });
    });

    // We want the bounding box to have the same aspect ratio as the canvas to prevent skewing/shifting by ESRI
    const canvasAspect = rect.width / rect.height;
    
    let lngRange = dataMaxLng - dataMinLng;
    let latRange = dataMaxLat - dataMinLat;
    const centerLng = (dataMinLng + dataMaxLng) / 2;
    const centerLat = (dataMinLat + dataMaxLat) / 2;

    if (lngRange / latRange > canvasAspect) {
      // Bounding box is wider than canvas, expand latitude range
      latRange = lngRange / canvasAspect;
    } else {
      // Bounding box is taller than canvas, expand longitude range
      lngRange = latRange * canvasAspect;
    }

    // Add 16% padding around the adjusted extent for clean visual spacing
    lngRange *= 1.16;
    latRange *= 1.16;

    const minLng = centerLng - lngRange / 2;
    const maxLng = centerLng + lngRange / 2;
    const minLat = centerLat - latRange / 2;
    const maxLat = centerLat + latRange / 2;

    // Load satellite background image from ESRI World Imagery
    // Use the EXACT same bounding box for the satellite image
    const satImg = new Image();
    satImg.crossOrigin = 'anonymous';
    const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
    const imgW = Math.round(rect.width * dpr);
    const imgH = Math.round(rect.height * dpr);
    satImg.src = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&size=${imgW},${imgH}&imageSR=4326&format=png&f=image`;

    // Helper: convert geo coordinate to canvas pixel
    const geoToCanvas = (lng: number, lat: number): [number, number] => {
      const x = ((lng - minLng) / lngRange) * rect.width;
      const y = ((maxLat - lat) / latRange) * rect.height;
      return [x, y];
    };

    const drawMap = (useSatellite: boolean) => {
      // Background
      if (!useSatellite) {
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      // Draw wards
      features.forEach((feature) => {
        const coords = feature.geometry.coordinates[0];
        const props = feature.properties as WardProperties;

        const wardColor = activeLayers.includes('water')
          ? getWardColor(props.water_pct)
          : '#0B5FFF';

        // Map geo coords to canvas using consistent transform
        const canvasCoords = coords.map((pt: number[]) => geoToCanvas(pt[0], pt[1]));

        // Fill with semi-transparent color overlay
        ctx.beginPath();
        ctx.moveTo(canvasCoords[0][0], canvasCoords[0][1]);
        canvasCoords.slice(1).forEach((pt: [number, number]) => ctx.lineTo(pt[0], pt[1]));
        ctx.closePath();
        ctx.fillStyle = wardColor + '35';
        ctx.fill();
        ctx.strokeStyle = wardColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        const cx = canvasCoords.reduce((s: number, c: [number, number]) => s + c[0], 0) / canvasCoords.length;
        const cy = canvasCoords.reduce((s: number, c: [number, number]) => s + c[1], 0) / canvasCoords.length;

        // Label background pill for readability over satellite
        const labelText = props.name;
        ctx.font = '600 11px Inter, sans-serif';
        const textW = ctx.measureText(labelText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(cx - textW / 2 - 4, cy - 14, textW + 8, 18, 3);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, cx, cy - 1);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`W${props.ward_id}`, cx, cy + 12);

        // AQI dot overlay
        if (activeLayers.includes('aqi')) {
          const aqiColor = props.aqi > 100 ? '#DC2626' : props.aqi > 75 ? '#F59E0B' : '#0E9F6E';
          ctx.beginPath();
          ctx.arc(cx + 15, cy - 8, 6, 0, Math.PI * 2);
          ctx.fillStyle = aqiColor;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Grievance indicators
        if (activeLayers.includes('grievances')) {
          const intensity = Math.min(props.grievances / 100, 1);
          ctx.beginPath();
          ctx.arc(cx, cy + 18, 4 + intensity * 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${0.2 + intensity * 0.4})`;
          ctx.fill();
        }
      });

      // City label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(rect.width * 0.03, rect.height * 0.92, 180, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📍 Visakhapatnam', rect.width * 0.05, rect.height * 0.96);

      // Satellite badge
      ctx.fillStyle = 'rgba(11, 95, 255, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rect.width - 140, 12, 128, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛰️ Satellite View', rect.width - 76, 28);
    };

    // Try to load satellite image first
    satImg.onload = () => {
      ctx.drawImage(satImg, 0, 0, rect.width, rect.height);
      drawMap(true);
    };

    satImg.onerror = () => {
      drawMap(false);
    };

    // Draw fallback immediately (will be overwritten when satellite loads)
    drawMap(false);

    // Click handler for 2D Canvas
    const handleClick = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      for (const feature of features) {
        const coords = feature.geometry.coordinates[0];
        const canvasCoords = coords.map((pt: number[]) => geoToCanvas(pt[0], pt[1]));

        // Point-in-polygon test
        let inside = false;
        for (let i = 0, j = canvasCoords.length - 1; i < canvasCoords.length; j = i++) {
          const [xi, yi] = canvasCoords[i];
          const [xj, yj] = canvasCoords[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
          }
        }
        if (inside) {
          setSelectedWard(feature.properties as WardProperties);
          return;
        }
      }
      setSelectedWard(null);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [activeLayers, viewMode, mapMode]);

  // 3D Three.js Map Rendering
  useEffect(() => {
    if (viewMode !== '3d') return;

    let active = true;
    let renderer: any;
    let scene: any;
    let camera: any;
    let controls: any;
    let animationFrameId: number;
    let wardGroup: any;

    const setupScene = async () => {
      // Dynamic imports to prevent SSR issues
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      if (!active || !container3dRef.current) return;

      const container = container3dRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 1. Scene Setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(mapMode === 'satellite' ? '#000000' : '#090c15');

      // 2. Camera Setup
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 32, 48); // Nice overhead angled view

      // 3. Renderer Setup
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below floor
      controls.minDistance = 15;
      controls.maxDistance = 120;

      // 5. Lights — brighter to show satellite texture
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
      dirLight.position.set(30, 65, 30);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
      scene.add(dirLight);

      // Point light for center grid neon glow
      const neonLight = new THREE.PointLight(0x0b5fff, 1.2, 70);
      neonLight.position.set(0, 6, 0);
      scene.add(neonLight);

      // 6. Compute bounding box from actual ward data for perfect alignment
      const features3d = wardsData.features;
      let dMinLng = Infinity, dMaxLng = -Infinity;
      let dMinLat = Infinity, dMaxLat = -Infinity;
      features3d.forEach((feature) => {
        feature.geometry.coordinates[0].forEach((pt: number[]) => {
          if (pt[0] < dMinLng) dMinLng = pt[0];
          if (pt[0] > dMaxLng) dMaxLng = pt[0];
          if (pt[1] < dMinLat) dMinLat = pt[1];
          if (pt[1] > dMaxLat) dMaxLat = pt[1];
        });
      });

      // To prevent stretching and ensure perfect alignment in Three.js,
      // we make the 3D bounding box exactly square (aspect ratio 1.0)
      // to match the requested square texture size (2048x2048).
      const dLngRange = dMaxLng - dMinLng;
      const dLatRange = dMaxLat - dMinLat;
      const dCenterLng = (dMinLng + dMaxLng) / 2;
      const dCenterLat = (dMinLat + dMaxLat) / 2;

      // Expand to square and add 12% padding
      const maxRange = Math.max(dLngRange, dLatRange) * 1.24;
      
      const minLng3d = dCenterLng - maxRange / 2;
      const maxLng3d = dCenterLng + maxRange / 2;
      const minLat3d = dCenterLat - maxRange / 2;
      const maxLat3d = dCenterLat + maxRange / 2;

      // Ward coordinate mapping: centered, then scaled
      const centerLng = dCenterLng;
      const centerLat = dCenterLat;
      const scaleX = 140;
      const scaleY = 140;

      // Since the bounding box is square, the floor plane in 3D units must also be square
      // to match the 2048x2048 texture without stretching.
      const floorW = maxRange * scaleX;
      const floorH = maxRange * scaleY;

      // Semi-transparent grid overlay (thin lines for context)
      const gridHelper = new THREE.GridHelper(Math.max(floorW, floorH), 40, 0x1f293d44, 0x11182744);
      gridHelper.position.y = 0.01;
      (gridHelper.material as THREE.Material).transparent = true;
      (gridHelper.material as THREE.Material).opacity = 0.15;
      scene.add(gridHelper);

      // Load satellite texture using the EXACT same bounding box
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous'); // Enable CORS to prevent WebGL security exceptions
      const satUrl3d = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${minLng3d},${minLat3d},${maxLng3d},${maxLat3d}&bboxSR=4326&size=2048,2048&imageSR=4326&format=png&f=image&v=3d`;

      // Floor geometry sized to match ward coordinate extent
      const floorGeo = new THREE.PlaneGeometry(floorW, floorH);

      // Create floor with satellite texture — centered at origin to match ward shapes
      textureLoader.load(
        satUrl3d,
        (texture) => {
          if (!active) return;
          texture.colorSpace = THREE.SRGBColorSpace;
          const floorMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.05,
          });
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = -0.15;
          floor.receiveShadow = true;
          scene.add(floor);
        },
        undefined,
        () => {
          // Fallback to dark floor if texture fails
          const floorMat = new THREE.MeshStandardMaterial({
            color: 0x07090e,
            roughness: 0.85,
            metalness: 0.25,
          });
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = -0.15;
          floor.receiveShadow = true;
          scene.add(floor);
        }
      );

      // Outer dark floor extending beyond the satellite region
      const outerFloorGeo = new THREE.PlaneGeometry(200, 200);
      const outerFloorMat = new THREE.MeshStandardMaterial({
        color: 0x050810,
        roughness: 0.9,
        metalness: 0.1,
      });
      const outerFloor = new THREE.Mesh(outerFloorGeo, outerFloorMat);
      outerFloor.rotation.x = -Math.PI / 2;
      outerFloor.position.y = -0.2;
      outerFloor.receiveShadow = true;
      scene.add(outerFloor);

      // 7. Draw & Extrude Wards
      wardGroup = new THREE.Group();
      scene.add(wardGroup);

      const features = wardsData.features;

      features.forEach((feature) => {
        const coords = feature.geometry.coordinates[0];
        const props = feature.properties as WardProperties;

        // Fetch value based on selection
        let val = 0;
        if (extrusionMetric === 'water') val = props.water_pct;
        else if (extrusionMetric === 'aqi') val = props.aqi;
        else if (extrusionMetric === 'grievances') val = props.grievances;
        else if (extrusionMetric === 'traffic') val = props.aqi * 0.8; // mock traffic index
        else val = props.population;

        // Calculate 3D height scale
        let depth = 1.0;
        if (extrusionMetric === 'water') {
          depth = Math.max(0.5, (val - 75) * 0.3) * heightScale;
        } else if (extrusionMetric === 'aqi') {
          depth = (val / 15) * heightScale;
        } else if (extrusionMetric === 'grievances') {
          depth = (val / 10) * heightScale;
        } else if (extrusionMetric === 'traffic') {
          depth = (val / 15) * heightScale;
        } else {
          depth = (val / 5000) * heightScale;
        }

        // Color based on value
        let colorStr = '#0b5fff';
        if (extrusionMetric === 'water') {
          colorStr = getWardColor(props.water_pct);
        } else if (extrusionMetric === 'aqi') {
          colorStr = props.aqi > 100 ? '#dc2626' : props.aqi > 75 ? '#f59e0b' : '#0e9f6e';
        } else if (extrusionMetric === 'grievances') {
          const ratio = Math.min(props.grievances / 100, 1);
          colorStr = ratio > 0.7 ? '#7c3aed' : ratio > 0.4 ? '#a78bfa' : '#c084fc';
        } else if (extrusionMetric === 'traffic') {
          colorStr = props.aqi > 90 ? '#dc2626' : props.aqi > 65 ? '#f59e0b' : '#10b981';
        } else {
          colorStr = props.population > 40000 ? '#f59e0b' : props.population > 30000 ? '#3b82f6' : '#60a5fa';
        }

        // Create shape
        const shape = new THREE.Shape();
        const startX = (coords[0][0] - centerLng) * scaleX;
        const startY = (coords[0][1] - centerLat) * scaleY;
        shape.moveTo(startX, startY);

        for (let i = 1; i < coords.length; i++) {
          const px = (coords[i][0] - centerLng) * scaleX;
          const py = (coords[i][1] - centerLat) * scaleY;
          shape.lineTo(px, py);
        }
        shape.closePath();

        const extrudeSettings = {
          depth: depth,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.08,
          bevelThickness: 0.08
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorStr),
          roughness: 0.25,
          metalness: 0.15,
          transparent: true,
          opacity: 0.85
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // lay flat on floor
        mesh.rotation.x = -Math.PI / 2;
        mesh.userData = { properties: props, baseColor: colorStr };

        // Tech glow edges
        const edges = new THREE.EdgesGeometry(geometry);
        const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
          color: new THREE.Color(colorStr).multiplyScalar(1.7),
          linewidth: 1
        }));
        mesh.add(outline);

        wardGroup.add(mesh);
      });

      // 9. Raycasting and Click handlers
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let currentHovered: any = null;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        // Set recursive to false to only intersect top-level ward meshes, not LineSegments outlines
        const intersects = raycaster.intersectObjects(wardGroup.children, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          if (hit !== currentHovered) {
            if (currentHovered) {
              const oldMat = currentHovered.material as THREE.MeshStandardMaterial;
              if (oldMat && 'emissive' in oldMat && oldMat.emissive) {
                oldMat.emissive.setHex(0x000000);
              }
            }
            currentHovered = hit;
            const newMat = currentHovered.material as THREE.MeshStandardMaterial;
            if (newMat && 'emissive' in newMat && newMat.emissive) {
              newMat.emissive.setHex(0x2c2c2c); // emissive highlight glow
            }
            document.body.style.cursor = 'pointer';
          }
        } else {
          if (currentHovered) {
            const oldMat = currentHovered.material as THREE.MeshStandardMaterial;
            if (oldMat && 'emissive' in oldMat && oldMat.emissive) {
              oldMat.emissive.setHex(0x000000);
            }
            currentHovered = null;
            document.body.style.cursor = 'auto';
          }
        }
      };

      const handleMouseClick = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(wardGroup.children, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          if (hit.userData && hit.userData.properties) {
            setSelectedWard(hit.userData.properties);
          }
        } else {
          setSelectedWard(null);
        }
      };

      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('click', handleMouseClick);

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // 10. Frame Loop
      const animate = () => {
        if (!active) return;
        animationFrameId = requestAnimationFrame(animate);

        if (autoRotate && controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.0;
        } else if (controls) {
          controls.autoRotate = false;
        }

        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
      };
      animate();

      return () => {
        active = false;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        if (renderer && renderer.domElement) {
          renderer.domElement.removeEventListener('mousemove', handleMouseMove);
          renderer.domElement.removeEventListener('click', handleMouseClick);
        }
        if (renderer) renderer.dispose();
      };
    };

    const cleanupPromise = setupScene();
    return () => {
      active = false;
      cleanupPromise.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [viewMode, extrusionMetric, heightScale, autoRotate, mapMode]);

  const groups = [...new Set(mapLayers.map(l => l.group))];

  return (
    <div className={styles.page}>
      {/* 2D Map Container */}
      <div className={styles.mapContainer} style={{ display: viewMode === '2d' ? 'block' : 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          role="application"
          aria-label="Interactive city map of Visakhapatnam showing ward boundaries and civic data layers"
        />
      </div>

      {/* 3D Map Container */}
      <div
        ref={container3dRef}
        className={styles.mapContainer}
        style={{ display: viewMode === '3d' ? 'block' : 'none', background: '#090c15' }}
        role="application"
        aria-label="3D smart city map visualization of Visakhapatnam"
      />

      {/* Sleek 2D/3D View Switcher */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${viewMode === '2d' ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode('2d')}
        >
          2D Map
        </button>
        <button
          className={`${styles.toggleBtn} ${viewMode === '3d' ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode('3d')}
        >
          3D Smart City
        </button>
      </div>

      {/* Layer Panel */}
      <div className={styles.layerPanel}>
        <div className={styles.layerTitle}><Layers size={16} /> Map Layers</div>
        {groups.map(group => (
          <div key={group} className={styles.layerGroup}>
            <div className={styles.layerGroupTitle}>{group}</div>
            {mapLayers.filter(l => l.group === group).map(layer => (
              <label key={layer.id} className={styles.layerOption}>
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span className={styles.layerDot} style={{ background: layer.color }} />
                {layer.label}
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* 3D Controls Panel */}
      {viewMode === '3d' && (
        <div className={styles.controls3dPanel}>
          <div className={styles.controls3dTitle}>3D Visualization</div>
          
          <div className={styles.controlRow}>
            <label className={styles.controlLabel}>
              <span>Extrusion Metric</span>
            </label>
            <select
              value={extrusionMetric}
              onChange={(e) => setExtrusionMetric(e.target.value)}
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                padding: '6px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <option value="water">Water Coverage %</option>
              <option value="aqi">Air Quality (AQI)</option>
              <option value="grievances">Grievances</option>
              <option value="traffic">Traffic Density</option>
              <option value="population">Population</option>
            </select>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlLabel}>
              <span>Block Height</span>
              <span>{heightScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={heightScale}
              onChange={(e) => setHeightScale(parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.controlRow}>
            <label className={styles.controlRowCheckbox}>
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
              />
              <span>Auto Rotate</span>
            </label>
          </div>

          <div className={styles.helpText}>
            🖱️ <b>Drag</b> to Rotate Camera<br />
            🖱️ <b>Right-click drag</b> to Pan<br />
            🔍 <b>Scroll</b> to Zoom in/out<br />
            📍 <b>Click ward</b> to show details
          </div>
        </div>
      )}

      {/* Share */}
      <button className={styles.shareBtn} onClick={handleShare}>
        <Share2 size={14} /> {copied ? 'Copied!' : 'Share'}
      </button>

      {/* Legend */}
      {activeLayers.includes('water') && (
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Water Supply Coverage</div>
          <div className={styles.legendBar} />
          <div className={styles.legendLabels}>
            <span>&lt;85%</span><span>90%</span><span>&gt;95%</span>
          </div>
        </div>
      )}

      {/* Table toggle */}
      <button className={styles.tableToggle} onClick={() => setShowTable(!showTable)}>
        <Table2 size={14} /> {showTable ? 'Show Map' : 'Accessible Table View'}
      </button>

      {/* Accessible table */}
      {showTable && (
        <div className={styles.accessibleTable}>
          <h2>Ward Data (Tabular View)</h2>
          <button onClick={() => setShowTable(false)} style={{ marginBottom: '16px', padding: '8px 16px', cursor: 'pointer' }}>← Back to Map</button>
          <table>
            <thead>
              <tr>
                <th scope="col">Ward</th>
                <th scope="col">Name</th>
                <th scope="col">Zone</th>
                <th scope="col">Population</th>
                <th scope="col">Water %</th>
                <th scope="col">AQI</th>
                <th scope="col">Grievances</th>
              </tr>
            </thead>
            <tbody>
              {wardsData.features.map(f => {
                const p = f.properties as WardProperties;
                return (
                  <tr key={p.ward_id}>
                    <td>{p.ward_id}</td>
                    <td>{p.name}</td>
                    <td>{p.zone}</td>
                    <td>{p.population.toLocaleString()}</td>
                    <td>{p.water_pct}%</td>
                    <td>{p.aqi}</td>
                    <td>{p.grievances}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ward Popup */}
      {selectedWard && (
        <div className={styles.popup}>
          <button className={styles.popupClose} onClick={() => setSelectedWard(null)} aria-label="Close">
            <X size={16} />
          </button>
          <div className={styles.popupTitle}>Ward {selectedWard.ward_id} — {selectedWard.name}</div>
          <div className={styles.popupZone}>{selectedWard.zone} Zone · Pop. {selectedWard.population.toLocaleString()}</div>
          <div className={styles.popupStats}>
            <div className={styles.popupStat}>
              <div className={styles.popupStatValue} style={{ color: getWardColor(selectedWard.water_pct) }}>{selectedWard.water_pct}%</div>
              <div className={styles.popupStatLabel}>Water Supply</div>
            </div>
            <div className={styles.popupStat}>
              <div className={styles.popupStatValue} style={{ color: selectedWard.aqi > 100 ? '#DC2626' : selectedWard.aqi > 75 ? '#F59E0B' : '#0E9F6E' }}>{selectedWard.aqi}</div>
              <div className={styles.popupStatLabel}>AQI</div>
            </div>
            <div className={styles.popupStat}>
              <div className={styles.popupStatValue}>{selectedWard.grievances}</div>
              <div className={styles.popupStatLabel}>Grievances</div>
            </div>
            <div className={styles.popupStat}>
              <div className={styles.popupStatValue}>{selectedWard.population.toLocaleString()}</div>
              <div className={styles.popupStatLabel}>Population</div>
            </div>
          </div>
          <div className={styles.popupActions}>
            <Link href="/analytics" className={styles.popupAction}><BarChart3 size={12} /> Analytics</Link>
            <Link href="/datasets" className={styles.popupAction}><Database size={12} /> Datasets</Link>
          </div>
        </div>
      )}
    </div>
  );
}

