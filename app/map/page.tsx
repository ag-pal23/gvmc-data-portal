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

export default function MapPage() {
  const [activeLayers, setActiveLayers] = useState<string[]>(
    mapLayers.filter(l => l.defaultOn).map(l => l.id)
  );
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    const url = `${window.location.origin}/map?lat=17.72&lng=83.30&z=12&layers=${activeLayers.join(',')}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Draw simple map visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#E8F4FD';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw ocean/bay
    ctx.fillStyle = '#B3D9F2';
    ctx.beginPath();
    ctx.moveTo(rect.width * 0.7, 0);
    ctx.lineTo(rect.width, 0);
    ctx.lineTo(rect.width, rect.height);
    ctx.lineTo(rect.width * 0.6, rect.height);
    ctx.quadraticCurveTo(rect.width * 0.75, rect.height * 0.5, rect.width * 0.7, 0);
    ctx.fill();

    // Bay of Bengal label
    ctx.fillStyle = '#7AAFCF';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Bay of Bengal', rect.width * 0.78, rect.height * 0.4);

    // Draw wards
    const features = wardsData.features;
    const minLng = 83.16, maxLng = 83.40, minLat = 17.66, maxLat = 17.78;
    const lngRange = maxLng - minLng;
    const latRange = maxLat - minLat;

    features.forEach((feature) => {
      const coords = feature.geometry.coordinates[0];
      const props = feature.properties as WardProperties;

      const wardColor = activeLayers.includes('water')
        ? getWardColor(props.water_pct)
        : '#0B5FFF';

      // Map geo coords to canvas
      const canvasCoords = coords.map((pt: number[]) => [
        ((pt[0] - minLng) / lngRange) * rect.width * 0.65 + rect.width * 0.05,
        ((maxLat - pt[1]) / latRange) * rect.height * 0.85 + rect.height * 0.08,
      ]);

      // Fill
      ctx.beginPath();
      ctx.moveTo(canvasCoords[0][0], canvasCoords[0][1]);
      canvasCoords.slice(1).forEach((pt: number[]) => ctx.lineTo(pt[0], pt[1]));
      ctx.closePath();
      ctx.fillStyle = wardColor + '60';
      ctx.fill();
      ctx.strokeStyle = wardColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const cx = canvasCoords.reduce((s: number, c: number[]) => s + c[0], 0) / canvasCoords.length;
      const cy = canvasCoords.reduce((s: number, c: number[]) => s + c[1], 0) / canvasCoords.length;
      ctx.fillStyle = '#1A1D21';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(props.name, cx, cy - 4);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#5B6472';
      ctx.fillText(`W${props.ward_id}`, cx, cy + 10);

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
    ctx.fillStyle = '#1A1D21';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Visakhapatnam', rect.width * 0.05, rect.height * 0.96);

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      for (const feature of features) {
        const coords = feature.geometry.coordinates[0];
        const canvasCoords = coords.map((pt: number[]) => [
          ((pt[0] - minLng) / lngRange) * rect.width * 0.65 + rect.width * 0.05,
          ((maxLat - pt[1]) / latRange) * rect.height * 0.85 + rect.height * 0.08,
        ]);

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
  }, [activeLayers]);

  const groups = [...new Set(mapLayers.map(l => l.group))];

  return (
    <div className={styles.page}>
      <div className={styles.mapContainer}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          role="application"
          aria-label="Interactive city map of Visakhapatnam showing ward boundaries and civic data layers"
        />
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
